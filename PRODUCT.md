# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Nuxt 4, 정적 생성(`nuxt generate`), GitHub Pages(`lantern-ide.github.io`). 사용자가 Nuxt를 골랐다 (Vue 경험, 이후 문서·릴리스 노트로 키울 여지). 저장소는 공개.

## Users

AI 코딩 도구(에이전트)를 매일 쓰는 개인 개발자. 한국 개발자가 먼저이고(GeekNews, OKKY, 디스콰이엇, 링크드인에서 들어옴), 영어권(r/LocalLLaMA, Hacker News)이 다음이다. 여러 모델을 비교하며 자기 API 키나 로컬 모델로 쓰고 싶어 하고, 에이전트가 무엇을 보고 무엇을 바꿨는지 모른 채 승인하는 데 불안을 느낀다.

## Product Purpose

Lantern IDE를 알리는 소개 사이트. 방문자가 Lantern이 무엇이고 다른 AI 편집기와 무엇이 다른지 알고, **설치 파일을 받게** 하는 것이 목적이다. 보조 행동은 GitHub 저장소 보기.

Lantern 자체: 로컬 맥락 엔진이 질문마다 관련 코드를 골라 토큰 예산 안에 붙이고, 에이전트의 수정마다 영향 반경(호출자·테스트·위험도)을 승인 전에 보여주며, 코드 지도 위에 에이전트의 발자취를 남기는 AI 코드 편집기 (Tauri v2, Rust, TypeScript). 오픈소스(Apache-2.0).

## Positioning

"에이전트가 코드를 고치기 전에, 그 수정이 어디까지 닿는지 보여주는 AI IDE." VS Code·Cursor·Windsurf는 파일과 채팅, Orca는 병렬 에이전트가 중심이다. Lantern은 작업과 코드 지도가 중심이다: 일의 단위는 작업이고, 가운데 화면은 편집기와 지도를 오간다.

## Operating Context

- 방문자는 커뮤니티 글이나 링크드인에서 링크를 눌러 들어온다. 대부분 데스크톱, 일부 모바일.
- 설치 파일은 GitHub Releases(`Lantern-IDE/lantern`)에서 받는다. Windows(확인됨), macOS·Linux(실사용 확인 전).
- 앱은 한국어·영어 화면을 지원한다. 사이트도 한국어 기본, 영어 전환.

## Capabilities and Constraints

- 사실만 쓴다. 앱이 하는 일: 맥락 엔진(tree-sitter, SQLite FTS5, git 동시 변경), 에이전트 승인과 영향 반경, 코드 지도·발자취·기억 지도, 작업 저장과 git worktree 격리, 여러 저장소 소스 제어(가져오기·풀·푸시·이력·브랜치), 모델 선택(Anthropic, OpenAI 호환, Ollama, LM Studio), 사용 통계 수집 없음, 한국어·영어.
- 못 하는 것도 정식으로 쓴다: 코드 서명 전(SmartScreen 경고), macOS·Linux 실사용 확인 전, 병합·충돌 해결 화면 없음, 확장 기능 생태계 없음, 혼자 만드는 베타.
- 가격·요금제는 미정. 무료 오픈소스로만 말한다.

## Brand Commitments

- 이름: Lantern IDE (단독 "Lantern"은 흔한 이름이라 "Lantern IDE"로 쓴다).
- 앱과 같은 제품으로 보여야 한다: 육각형 로고, 청록(#22d3ee) → 남색(#6366f1) 계열, 어두운 화면, Pretendard. 값은 앱(`Lantern-IDE/lantern` `app/src/styles.css`)이 원본.
- 사용자의 이전 소개 사이트(CareCode, JellySafe)의 문법을 잇는다: 스크롤 진행이 의미 있는 축이고 그 값이 뒤의 장면을 움직인다. 카드 그리드 대신 규칙선과 행. 눈썹(kicker) 없음. "못 하는 것"을 정식 섹션으로. 대비는 렌더에서 실측.
- 말투: 한국어, 짧고 정확하게. 과장하지 않는다. 피할 인상: 게이밍·네온, 장난감 같은 가벼움.

## Evidence on Hand

- 맥락 적중률: 비공개 프로젝트 하나(코드 파일 1,772개, 질문 20개, 예산 8,000토큰)에서 키워드 검색 24% → Lantern 67%, 하나라도 맞힌 질문 35% → 90%. 조건을 항상 같이 쓴다. 방법: `eval/결과.md`.
- 실제 코드 지도 데이터: `lantern graph overview|neighborhood|impact`로 Lantern 저장소 자체에서 뽑는다 (파일 78개, 연결 977개; `query_terms` 수정 영향 반경: 직접 호출 5, 간접 24, 파일 18, 위험도 high).
- 앱 화면 캡처: `Lantern-IDE/lantern` `docs/images/` (impact, map; ko/en).
- 사용자 후기, 고객, 다운로드 수, 공개 벤치마크는 아직 없다. 만들어 내지 않는다.

## Product Principles

1. 보여주고 맡긴다: 주장보다 실제 화면과 실제 데이터로 증명한다.
2. 숨기지 않는다: 수치는 조건과 함께, 못 하는 것은 정식으로.
3. 앱과 같은 제품: 사이트에서 본 인상과 앱을 연 인상이 같아야 한다.
4. 설치까지 짧게: 첫 화면에서 무엇인지 알고 바로 받을 수 있어야 한다.

## Accessibility & Inclusion

본문 대비 4.5:1(큰 글자 3:1) 이상을 렌더에서 실측. 키보드로 모든 링크·전환 조작. 움직임 줄이기(`prefers-reduced-motion`)에서 장면 애니메이션을 멈춘다. GPU 없는 환경에서는 장면을 정지 이미지로 대신한다.
