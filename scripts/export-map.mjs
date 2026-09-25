// 소개 사이트의 코드 지도 데이터를 만든다: Lantern 저장소 자체를 lantern CLI로 읽어 app/data/lantern-map.json에 쓴다.
// 사이트의 장면은 전부 이 파일에서 온다. 지도, 맥락으로 고른 파일, 영향 반경 수치는 실제로 계산한 값이다.
//
// 사용: node scripts/export-map.mjs --repo ../Khala [--bin <lantern 실행 파일>] [--ref origin/main]
// 작업 폴더의 로컬 변경(추적하지 않는 파일 등)이 섞이지 않게, 지정한 커밋을 임시 worktree로 꺼내서 읽는다.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from "d3-force";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const REPO = path.resolve(opt("repo", path.join(HERE, "..", "..", "Khala")));
const REF = opt("ref", "origin/main");
const BIN = path.resolve(opt("bin", path.join(REPO, "target", "release", process.platform === "win32" ? "lantern.exe" : "lantern")));
const OUT = path.join(HERE, "..", "app", "data", "lantern-map.json");

/** 장면의 작업: 한국어로 물었는데 영어 코드(query_terms)를 찾아야 하는 요청 */
const TASK = {
  question: "한국어 질문을 검색어로 바꾸는 곳에서 중복을 줄여줘",
  editFile: "crates/lantern-context/src/tokenize.rs",
  editSymbol: "query_terms",
  // 에이전트가 수정 전에 호출하는 쪽을 읽는다
  read: ["crates/lantern-context/src/assemble.rs"],
  // 예시 수정: 대소문자만 다른 검색어를 한 번만 넣는다 (사이트에는 '예시 수정'으로 표시)
  find: "if seen.insert(text.clone())",
  replace: "if seen.insert(text.to_lowercase())",
};

if (!fs.existsSync(BIN)) {
  console.error(`lantern CLI가 없습니다: ${BIN}\n앱 저장소에서 cargo build --release -p lantern-context`);
  process.exit(2);
}

const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8" }).trim();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lantern-map-"));
const src = path.join(tmp, "src");
const index = path.join(tmp, "index");
const commit = git("rev-parse", REF);
git("worktree", "add", "--detach", "-q", src, commit);

try {
  const lantern = (...a) => execFileSync(BIN, ["-C", src, ...a], { encoding: "utf8", env: { ...process.env, LANTERN_INDEX_DIR: index }, maxBuffer: 64 * 1024 * 1024 });

  // 1. 전체 구조 (파일 단위)
  const overview = JSON.parse(lantern("graph", "overview", "--max-nodes", "400"));

  // 2. 맥락 조립: 질문 하나에 엔진이 고른 코드
  const ctx = JSON.parse(lantern("context", TASK.question, "--json"));
  const byFile = new Map();
  for (const it of ctx.items) {
    const f = byFile.get(it.path) ?? { path: it.path, tokens: 0, symbols: [] };
    f.tokens += it.tokens;
    if (it.name && !f.symbols.includes(it.name)) f.symbols.push(it.name);
    byFile.set(it.path, f);
  }

  // 3. 영향 반경: query_terms 안의 그 한 줄을 고칠 때
  const text = fs.readFileSync(path.join(src, TASK.editFile), "utf8").split(/\r?\n/);
  const fnAt = text.findIndex((l) => l.includes(`fn ${TASK.editSymbol}(`)) + 1;
  const at = text.findIndex((l, i) => i >= fnAt && l.includes(TASK.find)) + 1;
  if (fnAt <= 0 || at <= 0) throw new Error(`${TASK.editFile}에서 ${TASK.editSymbol} / ${TASK.find}을(를) 찾지 못했습니다`);
  const impact = JSON.parse(lantern("graph", "impact", TASK.editFile, "--lines", String(at)));
  // 승인 카드에 싣는 실제 코드 (함수 설명부터 몇 줄)
  const snippet = text.slice(fnAt - 2, fnAt + 8).map((code, i) => ({ n: fnAt - 1 + i, code }));
  const depthByPath = {};
  for (const n of impact.graph.nodes) {
    if (n.path && n.depth !== undefined) depthByPath[n.path] = Math.min(depthByPath[n.path] ?? 9, n.depth);
  }

  // 4. 배치: 빌드할 때 한 번 계산해 두고, 방문자 브라우저에서는 물리 계산을 돌리지 않는다.
  // d3-force의 초기 배치는 난수를 쓰지 않아 같은 입력이면 같은 그림이 나온다.
  const nodes = overview.nodes.map((n) => ({ id: n.id, label: n.label, path: n.path ?? "", group: n.group, weight: n.weight }));
  const ids = new Set(nodes.map((n) => n.id));
  const links = overview.edges.filter((e) => ids.has(e.source) && ids.has(e.target)).map((e) => ({ source: e.source, target: e.target, kind: e.kind, weight: e.weight }));
  const groups = [...new Set(nodes.map((n) => n.group))].sort();
  // 모듈마다 자리를 정해 두고 끌어당겨, 같은 모듈이 한 덩어리로 보이게 한다 (모듈 이름을 붙일 수 있게)
  const anchor = new Map(groups.map((g, i) => [g, { x: Math.cos((i / groups.length) * Math.PI * 2 - Math.PI / 2) * 300, y: Math.sin((i / groups.length) * Math.PI * 2 - Math.PI / 2) * 210 }]));
  const sim = forceSimulation(nodes)
    .force("link", forceLink(links).id((d) => d.id).distance((l) => (l.kind === "cochange" ? 90 : 60)).strength((l) => (l.kind === "cochange" ? 0.01 : 0.05)))
    .force("charge", forceManyBody().strength(-90).distanceMax(260))
    .force("collide", forceCollide().radius((d) => 9 + Math.sqrt(d.weight) * 1.6))
    .force("x", forceX((d) => anchor.get(d.group).x).strength(0.3))
    .force("y", forceY((d) => anchor.get(d.group).y).strength(0.3))
    .force("center", forceCenter(0, 0))
    .stop();
  for (let i = 0; i < 800; i++) sim.tick();
  // 크기는 본체(가운데 94%) 기준으로 맞춘다. 연결이 적어 멀리 떨어진 몇 개가 전체를 작게 만들지 않게
  const q = (vs, p) => [...vs].sort((a, b) => a - b)[Math.floor((vs.length - 1) * p)];
  const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
  const [minX, maxX, minY, maxY] = [q(xs, 0.03), q(xs, 0.97), q(ys, 0.03), q(ys, 0.97)];
  const span = Math.max(maxX - minX, maxY - minY);
  const round = (v) => Math.round(v * 1000) / 1000;

  const data = {
    generated: { commit: commit.slice(0, 7), date: git("show", "-s", "--format=%cs", commit), repo: "Lantern-IDE/lantern" },
    stats: { files: nodes.length, edges: links.length, groups: groups.length },
    groups,
    // 본체는 -0.5..0.5 안에 들고, 멀리 떨어진 것은 0.62에서 자른다
    nodes: nodes.map((n) => {
      const clamp = (v) => Math.max(-0.62, Math.min(0.62, v));
      return { id: n.id, label: n.label, path: n.path, group: groups.indexOf(n.group), weight: round(n.weight), x: round(clamp((n.x - (minX + maxX) / 2) / span)), y: round(clamp((n.y - (minY + maxY) / 2) / span)) };
    }),
    edges: links.map((l) => [nodes.indexOf(l.source), nodes.indexOf(l.target), l.kind === "cochange" ? 1 : 0]),
    task: {
      question: TASK.question,
      context: { used: ctx.used_tokens, budget: ctx.budget_tokens, ms: Math.round(ctx.elapsed_ms * 10) / 10, terms: ctx.query_terms, files: [...byFile.values()] },
      read: TASK.read,
      edit: { path: TASK.editFile, symbol: TASK.editSymbol, line: at, before: text[at - 1], after: text[at - 1].replace(TASK.find, TASK.replace), snippet },
      impact: { touched: impact.touched, callers: impact.callers, callers2: impact.callers2, files: impact.files, modules: impact.modules, risk: impact.risk, tests: impact.tests, cochanged: impact.cochanged, depthByPath },
    },
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data) + "\n");
  console.log(`${path.relative(process.cwd(), OUT)}: 파일 ${data.stats.files}개, 연결 ${data.stats.edges}개, 맥락 파일 ${byFile.size}개 (${ctx.used_tokens}/${ctx.budget_tokens} 토큰), 영향: 직접 ${impact.callers} · 간접 ${impact.callers2} · 파일 ${impact.files} · ${impact.risk} · 커밋 ${data.generated.commit}`);
} finally {
  git("worktree", "remove", "--force", src);
  fs.rmSync(tmp, { recursive: true, force: true });
}
