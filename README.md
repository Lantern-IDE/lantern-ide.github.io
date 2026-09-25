# Lantern IDE 소개 사이트

[Lantern IDE](https://github.com/Lantern-IDE/lantern)를 알리는 사이트입니다. https://lantern-ide.github.io

## 왜 별도 저장소인가

소개 문구 한 줄을 고치려고 앱을 다시 빌드·릴리스할 이유가 없고, 앱 저장소의 CI(세 운영체제 빌드·E2E)를 거칠 필요도 없습니다. 배포 주기도 다릅니다.

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # .output/public 에 정적 파일 (nuxt generate)
npm run verify       # 데스크톱·모바일 화면 캡처 + 글자 대비·가로 넘침 검사 (Chrome/Edge 필요)
```

서버가 할 일이 없어 정적 파일만 만듭니다. 한국어가 `/`, 영어가 `/en/`입니다.

## 페이지

스크롤이 에이전트 작업 하나(요청 → 맥락 → 읽기 → 영향 → 격리 → 커밋)를 진행시키고, 화면 가운데를 지나는 절이 뒤의 지도 단계를 정합니다. 뒤의 지도는 **Lantern 저장소 자체**를 그린 것입니다.

| 경로 | 내용 |
|---|---|
| `app/components/LandingPage.vue` | 페이지 한 장 (절, 작업 머리글, 받기) |
| `app/components/CodeMap.vue` | 뒤의 코드 지도 (캔버스 2D) |
| `app/content/ko.ts`, `en.ts` | 문구. 수치는 여기 쓰지 않는다 |
| `app/data/lantern-map.json` | 지도·맥락·영향 반경 데이터 (아래 스크립트로 생성) |
| `app/composables/useRelease.ts` | 빌드할 때 최신 릴리스의 설치 파일을 읽는다 |

## 지도 데이터 다시 뽑기

지도, 맥락으로 고른 파일, 영향 반경 수치는 전부 `lantern` CLI로 실제로 계산합니다. 손으로 고치지 않습니다.

```bash
# 앱 저장소(../Khala 등)에서 cargo build --release -p lantern-context 한 뒤
npm run export-map -- --repo ../Khala [--ref origin/main]
```

지정한 커밋을 임시 worktree로 꺼내 읽으므로 앱 저장소의 로컬 변경은 섞이지 않습니다. 장면의 작업(질문, 예시 수정)은 `scripts/export-map.mjs`의 `TASK`에 있습니다.

## 배포

`main`에 올리면 `.github/workflows/deploy.yml`이 만들고 GitHub Pages에 올린 뒤, 페이지와 CSS가 실제로 뜨는지 확인합니다. 받기 버튼의 주소는 빌드할 때 최신 릴리스에서 읽으므로, **앱을 새로 릴리스하면 배포 워크플로를 다시 돌리세요** (Actions → 배포 → Run workflow).

## 디자인

앱과 같은 제품으로 보이게 색·서체는 앱(`Lantern-IDE/lantern` `app/src/styles.css`)을 원본으로 옮겼습니다. 기록은 [DESIGN.md](DESIGN.md), 제품 정의는 [PRODUCT.md](PRODUCT.md). 구조 문법(스크롤 = 의미 있는 축, 규칙선과 행, '못 하는 것' 절)은 CareCode·JellySafe 소개 사이트에서 이어받았습니다.
