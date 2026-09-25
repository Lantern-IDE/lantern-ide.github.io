<script setup lang="ts">
// 페이지 뒤의 장면: Lantern 저장소 자체의 코드 지도 (app/data/lantern-map.json, `lantern graph`로 뽑은 실제 데이터).
// 스크롤 단계(stage)가 바뀌면 지도의 색·고리·카메라가 그 단계의 목표로 부드럽게 옮겨 간다.
// 앱의 지도(app/src/map.ts)와 같은 말을 쓴다: 청록 = AI에 보낸 맥락, 점선 고리 = 읽음, 남색 = 수정, 빨강·주황 = 영향 반경.
import map from "~/data/lantern-map.json";

const props = defineProps<{ stage: number; workspaceLabel: string }>();
const canvas = ref<HTMLCanvasElement | null>(null);

// 단계 번호 (LandingPage의 절 순서와 같다)
const S = { hero: 0, request: 1, context: 2, read: 3, impact: 4, isolate: 5, commit: 6 } as const;

type Rgb = [number, number, number];
const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// 모듈별 탁한 색 (앱 지도와 같은 결: 채도를 낮춰 강조색과 부딪히지 않게)
const GROUP: Rgb[] = ["#7a6aa6", "#8c7552", "#4f8a6e", "#96606b", "#55809e", "#76884c", "#8a649a", "#5f75a3"].map(hex);
const TEAL = hex("#2cc6e0");
const INDIGO = hex("#6a71f0");
const RED = hex("#f2656a");
const AMBER = hex("#dcae3a");
const LABEL = "rgba(213, 216, 224, 0.95)";

interface N { i: number; x: number; y: number; r: number; label: string; path: string; group: number }
const nodes: N[] = map.nodes.map((n, i) => ({ i, x: n.x, y: n.y, r: 3.4 + Math.sqrt(n.weight) * 0.95, label: n.label, path: n.path, group: n.group }));
const byPath = new Map(nodes.map((n) => [n.path, n]));
const task = map.task;
const ctxFiles = task.context.files.map((f) => byPath.get(f.path)).filter((n): n is N => !!n);
const ctxSet = new Set(ctxFiles.map((n) => n.i));
const ctxLabeled = new Set(ctxFiles.slice(0, 5).map((n) => n.i));
const readNodes = task.read.map((p) => byPath.get(p)).filter((n): n is N => !!n);
const edit = byPath.get(task.edit.path);
const depth = new Map<number, number>();
for (const [p, d] of Object.entries(task.impact.depthByPath)) {
  const n = byPath.get(p);
  if (n) depth.set(n.i, d as number);
}
// 모듈 이름을 붙일 자리 (모듈 노드의 무게 중심)
const groupCenters = map.groups.map((name, g) => {
  const ns = nodes.filter((n) => n.group === g);
  return { name, x: ns.reduce((s, n) => s + n.x, 0) / ns.length, y: Math.min(...ns.map((n) => n.y)) - 0.035, count: ns.length };
}).filter((g) => g.count >= 3);

const centroid = (ns: N[]) => ({ x: ns.reduce((s, n) => s + n.x, 0) / ns.length, y: ns.reduce((s, n) => s + n.y, 0) / ns.length });
// 본체의 크기 (가운데 92%). 배율과 격리 틀은 이것에 맞춘다
const quant = (vs: number[], p: number) => [...vs].sort((a, b) => a - b)[Math.floor((vs.length - 1) * p)]!;
const body = {
  x0: quant(nodes.map((n) => n.x), 0.04), x1: quant(nodes.map((n) => n.x), 0.96),
  y0: quant(nodes.map((n) => n.y), 0.04), y1: quant(nodes.map((n) => n.y), 0.96),
};

/** 노드 하나의 목표 모습 */
interface Look { a: number; fill: Rgb; ring: number; ringColor: Rgb; dashed: number; label: number; big: number }
function target(n: N, stage: number): Look {
  const base: Look = { a: 0.8, fill: GROUP[n.group % GROUP.length]!, ring: 0, ringColor: TEAL, dashed: 0, label: 0, big: 0 };
  const isEdit = n === edit;
  const d = depth.get(n.i);
  switch (stage) {
    case S.hero:
      return base;
    case S.request:
      return { ...base, a: 0.5 };
    case S.context:
      return ctxSet.has(n.i) ? { ...base, a: 1, fill: TEAL, ring: 0.55, label: ctxLabeled.has(n.i) ? 1 : 0 } : { ...base, a: 0.18 };
    case S.read:
      if (readNodes.includes(n)) return { ...base, a: 1, fill: TEAL, ring: 1, dashed: 1, label: 1 };
      if (isEdit) return { ...base, a: 1, fill: TEAL, ring: 0.5, label: 1 };
      return ctxSet.has(n.i) ? { ...base, a: 0.55, fill: TEAL } : { ...base, a: 0.14 };
    case S.impact:
      if (isEdit) return { ...base, a: 1, fill: INDIGO, ring: 1, ringColor: INDIGO, label: 1, big: 1 };
      if (d === 1) return { ...base, a: 1, ring: 1, ringColor: RED, label: 1 };
      if (d === 2) return { ...base, a: 0.9, ring: 0.8, ringColor: AMBER };
      return { ...base, a: 0.1 };
    case S.isolate:
      if (isEdit) return { ...base, a: 1, fill: INDIGO, ring: 1, ringColor: INDIGO, label: 1, big: 1 };
      if (d !== undefined) return { ...base, a: 0.65, ring: 0.35, ringColor: d === 1 ? RED : AMBER };
      return { ...base, a: 0.3 };
    case S.commit:
      if (isEdit) return { ...base, a: 1, fill: INDIGO, ring: 0.6, ringColor: INDIGO, label: 1 };
      return { ...base, a: ctxSet.has(n.i) ? 0.75 : 0.6 };
    default:
      return { ...base, a: 0.3 };
  }
}

/** 단계마다 카메라 (지도 좌표 중심, 배율) */
function cameraFor(stage: number) {
  const all = { x: 0, y: 0, z: 1 };
  if (stage === S.context) return { ...centroid(ctxFiles), z: 1.12 };
  if (stage === S.read && edit) return { ...centroid([...readNodes, edit]), z: 1.55 };
  if (stage === S.impact && edit) {
    const ns = nodes.filter((n) => (depth.get(n.i) ?? 9) <= 1);
    const c = centroid(ns);
    return { x: (c.x + edit.x) / 2, y: (c.y + edit.y) / 2, z: 1.3 };
  }
  if (stage === S.isolate) return { x: 0, y: 0, z: 0.9 };
  if (stage === S.request) return { x: 0, y: 0, z: 1.04 };
  if (stage > S.commit) return { x: 0, y: 0, z: 0.92 };
  return all;
}

// ── 그리기 ──
// 전환 중에 색을 바꿔 가므로 팔레트 배열을 복사해 둔다 (공용 색이 바뀌지 않게)
const cur: Look[] = nodes.map((n) => {
  const t = target(n, S.hero);
  return { ...t, fill: [...t.fill] as Rgb, ringColor: [...t.ringColor] as Rgb };
});
const cam = { ...cameraFor(S.hero) };
let frame = 0;
let last = 0;
let reduced = false;
let groupLabelA = 1;
let frameA = 0;
let rippleT = 0;

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rgba = (c: Rgb, a: number) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;

function kick() {
  if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(step);
  }
}

function step(now: number) {
  frame = 0;
  const dt = Math.min(64, now - last);
  last = now;
  const k = reduced ? 1 : 1 - Math.exp(-dt / 170);
  let moving = false;
  nodes.forEach((n, i) => {
    const t = target(n, props.stage);
    const c = cur[i]!;
    for (const key of ["a", "ring", "dashed", "label", "big"] as const) {
      c[key] = mix(c[key], t[key], k);
      if (Math.abs(c[key] - t[key]) > 0.004) moving = true;
    }
    for (let j = 0; j < 3; j++) {
      const f = mix(c.fill[j]!, t.fill[j]!, k);
      c.fill[j] = f;
      c.ringColor[j] = mix(c.ringColor[j]!, t.ringColor[j]!, k);
      if (Math.abs(f - t.fill[j]!) > 0.5) moving = true;
    }
  });
  const tc = cameraFor(props.stage);
  for (const key of ["x", "y", "z"] as const) {
    cam[key] = mix(cam[key], tc[key], reduced ? 1 : 1 - Math.exp(-dt / 260));
    if (Math.abs(cam[key] - tc[key]) > 0.0005) moving = true;
  }
  const wantGroups = props.stage <= S.request || props.stage === S.commit ? 1 : 0;
  groupLabelA = mix(groupLabelA, wantGroups, k);
  frameA = mix(frameA, props.stage === S.isolate ? 1 : 0, k);
  if (Math.abs(groupLabelA - wantGroups) > 0.01 || Math.abs(frameA - (props.stage === S.isolate ? 1 : 0)) > 0.01) moving = true;
  const rippling = props.stage === S.impact && !reduced;
  if (rippling) rippleT = (rippleT + dt / 2400) % 1;
  draw();
  if (moving || rippling) frame = requestAnimationFrame(step);
}

let ctx2d: CanvasRenderingContext2D | null = null;
let W = 0;
let H = 0;
let dpr = 1;

function draw() {
  const c = ctx2d;
  if (!c) return;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, W, H);
  const wide = W > 900;
  // 본체가 지도 쪽 면(데스크톱: 글 열 오른쪽, 모바일: 위 띠)을 채우도록
  const bw = body.x1 - body.x0;
  const bh = body.y1 - body.y0;
  const fitW = wide ? W * 0.44 : W * 0.86;
  const fitH = wide ? H * 0.74 : H * 0.8;
  const scale = Math.min(fitW / bw, fitH / bh) * cam.z;
  const ox = wide ? W * 0.72 : W * 0.5;
  const oy = wide ? H * 0.56 : H * 0.52;
  const sx = (x: number) => ox + (x - cam.x) * scale;
  const sy = (y: number) => oy + (y - cam.y) * scale;
  const size = Math.max(0.75, Math.min(1.5, scale / 700));

  // 연결선: 두 끝의 투명도를 따라간다
  c.lineWidth = 1;
  for (const [s, t, kind] of map.edges as [number, number, number][]) {
    const ns = nodes[s]!;
    const nt = nodes[t]!;
    const a = Math.min(cur[s]!.a, cur[t]!.a);
    if (a < 0.05) continue;
    const hot = props.stage >= S.impact && props.stage <= S.isolate && edit && (s === edit.i || t === edit.i) && (depth.has(s) || depth.has(t));
    c.strokeStyle = hot ? rgba(RED, 0.5 * a) : `rgba(160, 168, 200, ${(kind ? 0.05 : 0.1) * a})`;
    c.beginPath();
    c.moveTo(sx(ns.x), sy(ns.y));
    c.lineTo(sx(nt.x), sy(nt.y));
    c.stroke();
  }

  // 영향 반경 파문
  if (edit && props.stage === S.impact && !reduced) {
    for (let w = 0; w < 3; w++) {
      const p = (rippleT + w / 3) % 1;
      c.strokeStyle = rgba(RED, 0.4 * (1 - p));
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(sx(edit.x), sy(edit.y), edit.r * size + p * 0.28 * scale, 0, Math.PI * 2);
      c.stroke();
    }
  }

  // 노드: 앱 지도의 파일 노드처럼 둥근 사각형
  nodes.forEach((n, i) => {
    const l = cur[i]!;
    if (l.a < 0.02) return;
    const r = n.r * size * (1 + l.big * 0.45);
    const x = sx(n.x);
    const y = sy(n.y);
    c.fillStyle = rgba(l.fill, l.a * 0.92);
    c.beginPath();
    c.roundRect(x - r, y - r, r * 2, r * 2, Math.max(2, r * 0.32));
    c.fill();
    c.strokeStyle = `rgba(240, 241, 245, ${0.16 * l.a})`;
    c.lineWidth = 1;
    c.stroke();
    if (l.ring > 0.02) {
      c.strokeStyle = rgba(l.ringColor, l.ring * Math.max(l.a, 0.5));
      c.lineWidth = 1.8;
      c.setLineDash(l.dashed > 0.5 ? [4, 3] : []);
      c.beginPath();
      c.roundRect(x - r - 5, y - r - 5, r * 2 + 10, r * 2 + 10, Math.max(3, r * 0.4));
      c.stroke();
      c.setLineDash([]);
    }
  });

  // 파일 이름표: 겹치면 중요한 것(수정 → 읽음 → 직접 영향 → 맥락 순)만 남긴다
  c.font = "600 12px 'Pretendard Variable', Pretendard, sans-serif";
  c.textBaseline = "middle";
  const placed: [number, number, number, number][] = [];
  const rank = (n: N) => (n === edit ? 0 : readNodes.includes(n) ? 1 : depth.get(n.i) === 1 ? 2 : 3);
  const order = nodes.filter((_, i) => cur[i]!.label >= 0.05).sort((a, b) => rank(a) - rank(b));
  order.forEach((n) => {
    const i = n.i;
    const l = cur[i]!;
    const r = n.r * size * (1 + l.big * 0.45);
    const x = sx(n.x) + r + 9;
    const y = sy(n.y);
    const w = c.measureText(n.label).width + 12;
    const box: [number, number, number, number] = [x - 2, y - 11, x - 2 + w, y + 11];
    if (placed.some((p) => box[0] < p[2] && p[0] < box[2] && box[1] < p[3] && p[1] < box[3])) return;
    placed.push(box);
    c.fillStyle = `rgba(19, 20, 25, ${0.88 * l.label})`;
    c.beginPath();
    c.roundRect(x - 2, y - 10, w, 20, 4);
    c.fill();
    c.fillStyle = LABEL.replace("0.95", String(0.95 * l.label));
    c.fillText(n.label, x + 4, y + 0.5);
  });

  // 모듈 이름
  if (groupLabelA > 0.02) {
    c.font = "500 12.5px 'Pretendard Variable', Pretendard, sans-serif";
    c.textAlign = "center";
    const taken: [number, number, number, number][] = [];
    for (const g of groupCenters) {
      const w = c.measureText(g.name).width;
      const box: [number, number, number, number] = [sx(g.x) - w / 2 - 4, sy(g.y) - 9, sx(g.x) + w / 2 + 4, sy(g.y) + 9];
      if (taken.some((p) => box[0] < p[2] && p[0] < box[2] && box[1] < p[3] && p[1] < box[3])) continue;
      taken.push(box);
      c.fillStyle = `rgba(155, 161, 176, ${0.9 * groupLabelA})`;
      c.fillText(g.name, sx(g.x), sy(g.y));
    }
    c.textAlign = "start";
  }

  // 격리: 작업 공간 틀
  if (frameA > 0.02) {
    const pad = 30;
    const x0 = sx(body.x0) - pad, y0 = sy(body.y0) - pad - 14, x1 = sx(body.x1) + pad, y1 = sy(body.y1) + pad;
    c.strokeStyle = `rgba(124, 131, 255, ${0.7 * frameA})`;
    c.lineWidth = 1.5;
    c.setLineDash([7, 5]);
    c.beginPath();
    c.roundRect(x0, y0, x1 - x0, y1 - y0, 12);
    c.stroke();
    c.setLineDash([]);
    c.font = "600 12.5px 'Pretendard Variable', Pretendard, sans-serif";
    const text = props.workspaceLabel;
    const w = c.measureText(text).width + 16;
    c.fillStyle = `rgba(22, 23, 28, ${frameA})`;
    c.fillRect(x0 + 16, y0 - 11, w, 22);
    c.fillStyle = `rgba(154, 163, 255, ${frameA})`;
    c.fillText(text, x0 + 24, y0 + 0.5);
  }
}

function resize() {
  const el = canvas.value;
  if (!el) return;
  const box = el.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = box.width;
  H = box.height;
  el.width = Math.round(W * dpr);
  el.height = Math.round(H * dpr);
  draw();
}

watch(() => props.stage, kick);

onMounted(() => {
  ctx2d = canvas.value?.getContext("2d") ?? null;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced = motion.matches;
  motion.addEventListener("change", (e) => {
    reduced = e.matches;
    kick();
  });
  const ro = new ResizeObserver(resize);
  if (canvas.value) ro.observe(canvas.value);
  resize();
  // 이름표 글꼴이 늦게 오면 다시 그린다
  document.fonts?.ready.then(() => draw());
  kick();
  onBeforeUnmount(() => {
    ro.disconnect();
    cancelAnimationFrame(frame);
  });
});
</script>

<template>
  <div class="scene" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>
