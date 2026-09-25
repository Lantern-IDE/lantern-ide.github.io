// 최신 릴리스의 설치 파일. 사이트를 만들 때(nuxt generate) 한 번 읽어 정적 파일에 넣는다.
// 새 버전을 게시하면 사이트를 다시 빌드한다 (배포 워크플로의 수동 실행 또는 앱 릴리스 뒤 호출).
// 게시된 릴리스가 없거나 읽지 못하면 릴리스 목록으로 보낸다.
import type { Os } from "~/content/types";

export const REPO = "Lantern-IDE/lantern";
export const RELEASES = `https://github.com/${REPO}/releases`;

interface Asset { name: string; size: number; browser_download_url: string }
interface Release { tag_name: string; html_url: string; assets: Asset[] }

export interface Download { os: Os; url: string; size: string; file: string }

const PICK: Record<Os, (a: Asset) => boolean> = {
  windows: (a) => a.name.endsWith("-setup.exe"),
  mac: (a) => a.name.endsWith(".dmg"),
  linux: (a) => a.name.endsWith(".AppImage"),
};

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

export function useRelease() {
  return useAsyncData("release", async () => {
    try {
      const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
      // 빌드(서버)에서만 돈다. CI는 GITHUB_TOKEN으로 호출 한도를 넉넉히 받는다
      const token = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.GITHUB_TOKEN;
      if (token) headers.Authorization = `Bearer ${token}`;
      const r = await $fetch<Release>(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
      const downloads: Partial<Record<Os, Download>> = {};
      for (const os of Object.keys(PICK) as Os[]) {
        const a = r.assets.find(PICK[os]);
        if (a) downloads[os] = { os, url: a.browser_download_url, size: mb(a.size), file: a.name };
      }
      return { version: r.tag_name.replace(/^v/, ""), url: r.html_url, downloads };
    } catch {
      return { version: "", url: RELEASES, downloads: {} as Partial<Record<Os, Download>> };
    }
  });
}

/** 방문자의 운영체제 (알 수 없으면 Windows: 확인된 설치 파일이 Windows뿐이다) */
export function detectOs(): Os {
  if (typeof navigator === "undefined") return "windows";
  const p = ((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.userAgent).toLowerCase();
  if (p.includes("mac")) return "mac";
  if (p.includes("linux") && !p.includes("android")) return "linux";
  return "windows";
}
