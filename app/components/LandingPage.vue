<script setup lang="ts">
// 소개 페이지 한 장. 스크롤이 에이전트 작업 하나(요청 → 맥락 → 읽기 → 영향 → 격리 → 커밋)를 진행시키고,
// 화면 가운데를 지나는 절이 뒤의 지도(CodeMap)의 단계를 정한다.
import map from "~/data/lantern-map.json";
import type { Copy, Os } from "~/content/types";
import { RELEASES, detectOs, useRelease } from "~/composables/useRelease";

const props = defineProps<{ t: Copy }>();
const t = computed(() => props.t);
const task = map.task;
const fmt = (n: number) => n.toLocaleString(props.t.lang === "ko" ? "ko-KR" : "en-US");

useHead({
  htmlAttrs: { lang: props.t.lang },
  title: props.t.meta.title,
  link: [
    { rel: "canonical", href: `https://lantern-ide.github.io${props.t.lang === "ko" ? "/" : "/en/"}` },
    { rel: "alternate", hreflang: "ko", href: "https://lantern-ide.github.io/" },
    { rel: "alternate", hreflang: "en", href: "https://lantern-ide.github.io/en/" },
  ],
});
useSeoMeta({
  description: props.t.meta.description,
  ogTitle: props.t.meta.title,
  ogDescription: props.t.meta.description,
  ogType: "website",
  ogImage: `https://lantern-ide.github.io/shots/impact-${props.t.lang}.png`,
  twitterCard: "summary_large_image",
});

// ── 받기 ──
const { data: release } = await useRelease();
const os = ref<Os>("windows");
onMounted(() => (os.value = detectOs()));
const primary = computed(() => release.value?.downloads?.[os.value] ?? null);
const linkFor = (o: Os) => release.value?.downloads?.[o]?.url ?? release.value?.url ?? RELEASES;

// ── 단계: 화면 가운데를 지나는 절 ──
const stage = ref(0);
const STEP_KEYS = ["request", "context", "read", "impact", "isolate", "commit"] as const;
onMounted(() => {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) stage.value = Number((e.target as HTMLElement).dataset.stage);
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-stage]").forEach((el) => io.observe(el));
  onBeforeUnmount(() => io.disconnect());
});

const ctxFiles = task.context.files;
const splitPath = (p: string) => {
  const i = p.lastIndexOf("/");
  return { dir: p.slice(0, i + 1), name: p.slice(i + 1) };
};
const asked = task.context.terms.filter((w) => /[가-힣]/.test(w));
const expanded = task.context.terms.filter((w) => !/[가-힣]/.test(w));
const edit = task.edit;
const impact = task.impact;
const workspace = computed(() => `${t.value.isolate.space} · lantern/tsk-q7m2`);
const sourceLine = computed(() => t.value.source(map.stats.files, map.stats.edges, map.generated.commit));
</script>

<template>
  <a class="skip" href="#main">{{ t.nav.skip }}</a>

  <header class="top">
    <a class="brand" :href="t.lang === 'ko' ? '/' : '/en/'"><HexLogo />Lantern IDE</a>
    <nav>
      <a :href="t.nav.otherHref" :hreflang="t.lang === 'ko' ? 'en' : 'ko'"><i class="codicon codicon-globe" />{{ t.nav.other }}</a>
      <a href="https://github.com/Lantern-IDE/lantern"><i class="codicon codicon-github" /><span class="hide-s">{{ t.nav.github }}</span></a>
      <a :href="linkFor(os)"><i class="codicon codicon-desktop-download" />{{ t.nav.download }}</a>
    </nav>
  </header>

  <CodeMap :stage="stage" :workspace-label="workspace" />

  <!-- 작업 머리글: 앱의 작업 목록 한 줄. 단계가 지날수록 발자취가 붙는다 -->
  <aside class="task" :class="{ off: stage < 1 || stage > 6 }" aria-hidden="true">
    <div class="task-title" :class="{ done: stage >= 6 }">
      <i class="codicon" :class="stage >= 6 ? 'codicon-pass-filled' : stage >= 4 ? 'codicon-bell-dot' : 'codicon-sync'" />
      <span>{{ task.question }}</span>
    </div>
    <div class="task-meta num">
      <span v-if="stage >= 2" class="ctx">{{ t.chips.context }} <b>{{ ctxFiles.length }}</b></span>
      <span v-if="stage >= 3">{{ t.chips.read }} <b>{{ task.read.length }}</b></span>
      <span v-if="stage >= 5">{{ t.chips.edited }} <b>1</b></span>
      <span v-if="stage >= 4" class="risk">{{ t.chips.risk[impact.risk] }}</span>
    </div>
    <ol class="steps">
      <li v-for="(k, i) in STEP_KEYS" :key="k" :class="{ now: stage === i + 1, past: stage > i + 1 }">{{ t.steps[k] }}</li>
    </ol>
  </aside>

  <main id="main">
    <!-- 첫 화면 -->
    <section class="station hero" data-stage="0">
      <div class="inner">
        <h1><span v-for="line in t.hero.title" :key="line">{{ line }}</span></h1>
        <p class="lede">{{ t.hero.lede }}</p>
        <div class="cta">
          <a class="btn" :href="linkFor(os)">
            <i class="codicon codicon-desktop-download" />
            <span>{{ primary ? t.hero.downloadFor[os] : t.hero.releases }}</span>
            <span v-if="primary" class="meta num">{{ release?.version }} · {{ primary.size }}</span>
          </a>
          <div class="links">
            <a href="#get">{{ t.hero.otherOs }}</a>
            <a href="https://github.com/Lantern-IDE/lantern"><i class="codicon codicon-github" />{{ t.hero.github }}</a>
          </div>
        </div>
        <p class="note">{{ t.hero.note }}</p>
      </div>
    </section>

    <!-- 요청 -->
    <section class="station" data-stage="1" aria-labelledby="h-request">
      <div class="inner">
        <h2 id="h-request">{{ t.request.title }}</h2>
        <p>{{ t.request.body }}</p>
        <div class="prompt">
          <div class="who"><HexLogo />{{ t.request.label }}</div>
          {{ task.question }}
        </div>
        <ul class="terms">
          <li v-for="w in asked" :key="w">{{ w }}</li>
          <li v-for="w in expanded" :key="w" class="x">{{ w }}</li>
        </ul>
        <div class="terms-legend"><span><i />{{ t.request.asked }}</span><span><i class="x" />{{ t.request.expanded }}</span></div>
      </div>
    </section>

    <!-- 맥락 -->
    <section class="station" data-stage="2" aria-labelledby="h-context">
      <div class="inner">
        <h2 id="h-context">{{ t.context.title }}</h2>
        <p>{{ t.context.body }}</p>
        <div class="panel">
          <div class="panel-head"><span>{{ t.context.files(ctxFiles.length) }}</span></div>
          <ul class="rows num">
            <li v-for="(f, i) in ctxFiles.slice(0, 6)" :key="f.path" :class="{ hit: i === 0 }">
              <span class="path"><span class="dir">{{ splitPath(f.path).dir }}</span><b>{{ splitPath(f.path).name }}</b></span>
              <span class="val">{{ fmt(f.tokens) }}</span>
            </li>
            <li><span class="path dir">{{ t.context.more(ctxFiles.length - 6) }}</span><span class="val">{{ fmt(ctxFiles.slice(6).reduce((s, f) => s + f.tokens, 0)) }}</span></li>
          </ul>
          <div class="budget"><i :style="{ width: `${(task.context.used / task.context.budget) * 100}%` }" /></div>
          <div class="budget-text num">{{ t.context.budget(fmt(task.context.used), fmt(task.context.budget), String(task.context.ms)) }}</div>
        </div>
        <div class="ledger">
          <h3>{{ t.context.evidenceTitle }}</h3>
          <table class="num">
            <thead><tr><th scope="col"><span class="sr-only">{{ t.context.evidenceTitle }}</span></th><th scope="col">{{ t.context.grep }}</th><th scope="col">{{ t.context.lantern }}</th></tr></thead>
            <tbody>
              <tr v-for="r in t.context.evidence" :key="r.label">
                <th scope="row">{{ r.label }}</th>
                <td><span class="bar" :style="{ width: `${parseInt(r.grep) * 0.6}px` }" />{{ r.grep }}</td>
                <td class="l"><span class="bar" :style="{ width: `${parseInt(r.lantern) * 0.6}px` }" />{{ r.lantern }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="small">{{ t.context.condition }}</p>
      </div>
    </section>

    <!-- 읽기 -->
    <section class="station" data-stage="3" aria-labelledby="h-read">
      <div class="inner">
        <h2 id="h-read">{{ t.read.title }}</h2>
        <p>{{ t.read.body }}</p>
        <ul class="legend">
          <li class="c"><i />{{ t.read.legend.context }}</li>
          <li class="r"><i />{{ t.read.legend.read }}</li>
          <li class="e"><i />{{ t.read.legend.edited }}</li>
        </ul>
        <div class="log">
          <div><i class="codicon codicon-check ok" /><code>read_file {{ task.read[0] }}</code><span class="t">{{ t.read.log.read }}</span></div>
          <div><i class="codicon codicon-edit run" /><code>edit_file {{ edit.path }}</code><span class="t">{{ t.read.log.edit }}</span></div>
        </div>
      </div>
    </section>

    <!-- 영향 반경 -->
    <section class="station" data-stage="4" aria-labelledby="h-impact">
      <div class="inner">
        <h2 id="h-impact">{{ t.impact.title }}</h2>
        <p>{{ t.impact.body }}</p>
        <div class="approval" role="figure" :aria-label="`${t.impact.card}: ${edit.path}`">
          <div class="approval-head"><i class="codicon codicon-edit" /><b>{{ t.impact.card }}</b><code>{{ edit.path }}</code><span class="tag">{{ t.impact.sample }}</span></div>
          <div class="diff" role="presentation">
            <template v-for="l in edit.snippet" :key="l.n">
              <div v-if="l.n === edit.line" class="del"><span class="n">{{ l.n }}</span><span class="s">-</span><span>{{ l.code }}</span></div>
              <div v-if="l.n === edit.line" class="add"><span class="n">{{ l.n }}</span><span class="s">+</span><span>{{ edit.after }}</span></div>
              <div v-else><span class="n">{{ l.n }}</span><span class="s" /><span>{{ l.code }}</span></div>
            </template>
          </div>
          <div class="impact">
            <div class="impact-head"><i class="codicon codicon-pulse" />{{ t.impact.head }}<span class="risk">{{ t.chips.risk[impact.risk] }}</span></div>
            <div class="impact-stats num">
              <span class="sym">{{ impact.touched.join(", ") }}</span>
              <span><b>{{ impact.callers }}</b>{{ t.impact.direct }}</span>
              <span><b>{{ impact.callers2 }}</b>{{ t.impact.indirect }}</span>
              <span><b>{{ impact.files }}</b>{{ t.impact.files }}</span>
              <span :class="{ warn: !impact.tests.length }"><i class="codicon" :class="impact.tests.length ? 'codicon-beaker' : 'codicon-warning'" /> {{ impact.tests.length ? t.impact.tests(impact.tests.length) : t.impact.noTests }}</span>
            </div>
          </div>
          <div class="actions" aria-hidden="true"><span class="apply"><i class="codicon codicon-check" />{{ t.impact.apply }}</span><span class="deny">{{ t.impact.deny }}</span></div>
        </div>
        <p v-if="!impact.tests.length" class="small" style="margin-top: var(--s3)">{{ t.impact.noTestsNote }}</p>
        <figure class="shot">
          <img :src="`/shots/impact-${t.lang}.png`" width="1440" height="880" loading="lazy" :alt="t.impact.shot" />
          <figcaption>{{ t.impact.shot }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- 격리 -->
    <section class="station" data-stage="5" aria-labelledby="h-isolate">
      <div class="inner">
        <h2 id="h-isolate">{{ t.isolate.title }}</h2>
        <p>{{ t.isolate.body }}</p>
        <div class="iso">
          <div class="iso-head"><i class="codicon codicon-git-branch" />{{ t.isolate.space }} <code>lantern/tsk-q7m2</code><span class="tag">{{ t.isolate.sample }}</span></div>
          <div class="iso-row"><i class="codicon codicon-diff" />{{ t.isolate.changed }} · <code>{{ splitPath(edit.path).name }}</code><span class="b apply">{{ t.isolate.apply }}</span><span class="b discard">{{ t.isolate.discard }}</span></div>
        </div>
      </div>
    </section>

    <!-- 커밋 -->
    <section class="station" data-stage="6" aria-labelledby="h-commit">
      <div class="inner">
        <h2 id="h-commit">{{ t.commit.title }}</h2>
        <p>{{ t.commit.body }}</p>
        <div class="repos">
          <div class="repos-head"><span>{{ t.lang === "ko" ? "저장소" : "REPOSITORIES" }}</span><span>{{ t.commit.sample }}</span></div>
          <div v-for="(r, i) in t.commit.repos" :key="r.name" class="repo" :class="{ on: i === 1 }">
            <i class="codicon codicon-repo" />{{ r.name }} <span class="br">{{ r.branch }}</span><span class="sy num">{{ r.sync }}</span>
            <span v-if="r.changes" class="badge num">{{ r.changes }}</span>
          </div>
          <div class="repo-actions"><span v-for="a in t.commit.actions" :key="a">{{ a }}</span></div>
        </div>
      </div>
    </section>

    <!-- 모델 -->
    <section class="station" data-stage="7" aria-labelledby="h-models">
      <div class="inner">
        <h2 id="h-models">{{ t.models.title }}</h2>
        <p>{{ t.models.body }}</p>
        <dl class="defs"><div v-for="r in t.models.rows" :key="r.term"><dt>{{ r.term }}</dt><dd>{{ r.text }}</dd></div></dl>
        <ul class="plain"><li v-for="p in t.models.plain" :key="p"><i class="codicon codicon-check" />{{ p }}</li></ul>
      </div>
    </section>

    <!-- 못 하는 것 -->
    <section class="station cannot" data-stage="8" aria-labelledby="h-cannot">
      <div class="inner">
        <h2 id="h-cannot">{{ t.cannot.title }}</h2>
        <p>{{ t.cannot.body }}</p>
        <dl class="defs"><div v-for="r in t.cannot.rows" :key="r.term"><dt>{{ r.term }}</dt><dd>{{ r.text }}</dd></div></dl>
      </div>
    </section>

    <!-- 받기 -->
    <section id="get" class="station close" data-stage="9" aria-labelledby="h-close">
      <div class="inner">
        <h2 id="h-close">{{ t.close.title }}</h2>
        <p>{{ t.close.body }}</p>
        <ul class="oses">
          <li v-for="o in t.close.os" :key="o.os" :class="{ mine: o.os === os }">
            <span class="os"><i class="codicon" :class="o.os === 'windows' ? 'codicon-window' : o.os === 'mac' ? 'codicon-device-desktop' : 'codicon-terminal-linux'" />{{ o.name }}</span>
            <span class="d">{{ o.detail }}<span class="st" :class="{ ok: o.tested }">{{ o.status }}</span></span>
            <a class="get" :href="linkFor(o.os)"><i class="codicon codicon-desktop-download" />{{ release?.downloads?.[o.os] ? `${release?.version} · ${release?.downloads?.[o.os]?.size}` : t.nav.download }}</a>
          </li>
        </ul>
        <div class="cta">
          <div class="links">
            <a href="https://github.com/Lantern-IDE/lantern"><i class="codicon codicon-github" />{{ t.close.github }}</a>
            <a href="https://github.com/Lantern-IDE/lantern/issues/new?template=beta_feedback.yml"><i class="codicon codicon-comment-discussion" />{{ t.close.feedback }}</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <p class="scene-source" :class="{ hide: stage > 6 }"><i class="codicon codicon-type-hierarchy" />{{ sourceLine }}</p>

  <footer>
    <span class="brand"><HexLogo />{{ t.footer.made }}</span>
    <span>{{ t.footer.license }}</span>
    <a href="https://github.com/Lantern-IDE/lantern">GitHub</a>
    <a :href="t.footer.langHref">{{ t.footer.lang }}</a>
    <span class="src">{{ sourceLine }}</span>
  </footer>
</template>
