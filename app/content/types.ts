// 페이지 문구. 한국어(ko.ts)가 원본이고 영어(en.ts)는 같은 모양을 채운다.
// 수치(파일 수, 토큰, 호출자 수)는 문구에 적지 않고 지도 데이터(app/data/lantern-map.json)에서 넣는다.

export type Os = "windows" | "mac" | "linux";

export interface Row {
  term: string;
  text: string;
}

export interface Copy {
  lang: "ko" | "en";
  meta: { title: string; description: string };
  nav: { github: string; download: string; other: string; otherHref: string; skip: string };
  steps: { request: string; context: string; read: string; impact: string; isolate: string; commit: string };
  chips: { context: string; read: string; edited: string; risk: Record<string, string> };
  hero: {
    title: string[];
    lede: string;
    downloadFor: Record<Os, string>;
    releases: string;
    otherOs: string;
    github: string;
    note: string;
  };
  source: (files: number, edges: number, commit: string) => string;
  request: { title: string; body: string; label: string; asked: string; expanded: string };
  context: {
    title: string;
    body: string;
    files: (n: number) => string;
    more: (n: number) => string;
    budget: (used: string, budget: string, ms: string) => string;
    evidenceTitle: string;
    evidence: { label: string; grep: string; lantern: string }[];
    grep: string;
    lantern: string;
    condition: string;
  };
  read: { title: string; body: string; legend: { context: string; read: string; edited: string }; log: { read: string; edit: string } };
  impact: {
    title: string;
    body: string;
    card: string;
    sample: string;
    head: string;
    direct: string;
    indirect: string;
    files: string;
    noTests: string;
    tests: (n: number) => string;
    apply: string;
    deny: string;
    noTestsNote: string;
    shot: string;
  };
  isolate: { title: string; body: string; space: string; sample: string; changed: string; apply: string; discard: string };
  commit: { title: string; body: string; sample: string; repos: { name: string; branch: string; sync: string; changes: number }[]; actions: string[] };
  models: { title: string; body: string; rows: Row[]; plain: string[] };
  cannot: { title: string; body: string; rows: Row[] };
  close: {
    title: string;
    body: string;
    os: { os: Os; name: string; detail: string; status: string; tested: boolean }[];
    github: string;
    feedback: string;
    untested: string;
  };
  footer: { license: string; made: string; lang: string; langHref: string };
}
