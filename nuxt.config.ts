// 정적 사이트. 서버가 할 일이 없어 `nuxt generate`로 .output/public 을 만들어 GitHub Pages에 올린다.
// 저장소 이름이 조직 페이지(lantern-ide.github.io)라 하위 경로(baseURL)가 필요 없다.
export default defineNuxtConfig({
  compatibilityDate: "2026-09-01",
  devtools: { enabled: false },
  css: [
    // 앱과 같은 서체·아이콘 (앱: app/src/main.ts)
    "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css",
    "@vscode/codicons/dist/codicon.css",
    "~/assets/css/main.css",
  ],
  // 방향 계약 주석(app.vue)을 빌드 결과에 남긴다
  vue: { compilerOptions: { comments: true } },
  app: {
    head: {
      htmlAttrs: { lang: "ko" },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#16171c" },
        { name: "color-scheme", content: "dark" },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  nitro: { prerender: { routes: ["/", "/en/"], crawlLinks: false } },
  runtimeConfig: { public: { siteUrl: "https://lantern-ide.github.io" } },
  typescript: { strict: true },
});
