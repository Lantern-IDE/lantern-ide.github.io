// 화면 검증: 만든 사이트(.output/public)를 띄워 데스크톱·모바일에서 절마다 화면을 찍고,
// 글자 대비(본문 4.5:1, 큰 글자 3:1)를 렌더된 색으로 잰다. 눈으로 판정하지 않는다.
// 사용: npm run build && npm run verify [-- --lang en] [-- --out <폴더>]
// 브라우저는 설치된 Chrome/Edge를 쓴다 (puppeteer-core). CHROME_PATH로 바꿀 수 있다.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const LANG = opt("lang", "ko");
const OUT = path.resolve(opt("out", path.join(ROOT, ".impeccable", "review")));
const PORT = 3120 + Math.floor(Math.random() * 50);
const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const BROWSER = CANDIDATES.find((p) => fs.existsSync(p));
if (!BROWSER) throw new Error("Chrome이나 Edge를 찾지 못했습니다. CHROME_PATH를 지정하세요");

// 만든 파일을 그대로 내주는 작은 서버 (GitHub Pages처럼 폴더면 index.html)
const PUBLIC = path.join(ROOT, ".output", "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const server = http.createServer((req, res) => {
  let p = path.join(PUBLIC, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!p.startsWith(PUBLIC) || !fs.existsSync(p)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] ?? "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true, args: ["--hide-scrollbars"] });
const report = [];
try {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`http://127.0.0.1:${PORT}${LANG === "ko" ? "/" : "/en/"}`, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const stages = await page.$$eval("[data-stage]", (els) => els.map((e) => Number(e.dataset.stage)));
    for (const s of stages) {
      await page.evaluate((s) => {
        const el = document.querySelector(`[data-stage="${s}"]`);
        const r = el.getBoundingClientRect();
        // 절의 가운데가 화면 가운데에 오게 (장면 단계가 그 절로 바뀐다)
        window.scrollTo({ top: window.scrollY + r.top + Math.min(r.height, window.innerHeight * 1.2) / 2 - window.innerHeight / 2, behavior: "instant" });
      }, s);
      await sleep(1600); // 장면 전환이 끝날 때까지
      const file = path.join(OUT, `${vp.name}-${LANG}-${s}.png`);
      await page.screenshot({ path: file });
    }
    // 글자 대비: 보이는 글자마다 글자색과 그 뒤의 실제 배경(겹친 불투명 배경까지)을 비교
    const low = await page.evaluate(() => {
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const blend = (top, bottom) => {
        const a = top[3] ?? 1;
        return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a));
      };
      const bgOf = (el) => {
        const layers = [];
        for (let e = el; e; e = e.parentElement) {
          const c = parse(getComputedStyle(e).backgroundColor);
          if (c.length >= 3 && (c[3] ?? 1) > 0) layers.push(c);
          if ((c[3] ?? 1) >= 1 && c.length >= 3) break;
        }
        let out = [22, 23, 28];
        for (let i = layers.length - 1; i >= 0; i--) out = blend(layers[i], out);
        return out;
      };
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement;
        if (!n.data.trim() || !el || !el.offsetParent || el.closest("[aria-hidden=true]")) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
        const fg = blend(parse(cs.color), bgOf(el));
        const L1 = lum(fg), L2 = lum(bgOf(el));
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize);
        const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) out.push(`${ratio.toFixed(2)} ${size}px "${n.data.trim().slice(0, 40)}"`);
      }
      return [...new Set(out)];
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    report.push({ viewport: vp.name, stages: stages.length, errors, lowContrast: low, horizontalOverflow: overflow });
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(report, null, 2));
console.log(`화면: ${OUT}`);
