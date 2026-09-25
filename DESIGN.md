---
name: Lantern IDE 소개 사이트
description: 에이전트 작업 하나를 따라가며, Lantern 자신의 실제 코드 지도 위에 맥락·발자취·영향 반경을 켜는 소개 페이지
colors:
  ide-ground: "#16171c"
  ide-sunken: "#131419"
  ide-elevated: "#202128"
  code-well: "#1b1c22"
  rule: "#2a2c35"
  rule-strong: "#3a3d49"
  ink: "#d5d8e0"
  ink-strong: "#f0f1f5"
  ink-muted: "#9ba1b0"
  ink-dim: "#7d8394"
  action-indigo: "#5b62e6"
  action-indigo-hover: "#6a71f0"
  focus-indigo: "#7c83ff"
  link-periwinkle: "#9aa3ff"
  context-teal: "#2cc6e0"
  impact-red: "#f2656a"
  impact-amber: "#dcae3a"
  ok-green: "#45bd86"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.3rem, 4.4vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "clamp(1.7rem, 2.9vw, 2.45rem)"
    fontWeight: 700
    lineHeight: 1.24
    letterSpacing: "-0.03em"
  lede:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "clamp(1.06rem, 1.35vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.72
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
  code:
    fontFamily: "Cascadia Code, JetBrains Mono, Consolas, ui-monospace, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "12px"
spacing:
  s1: "6px"
  s2: "10px"
  s3: "16px"
  s4: "24px"
  s5: "36px"
  s6: "56px"
  s7: "88px"
  s8: "132px"
components:
  button-primary:
    backgroundColor: "{colors.action-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.action-indigo-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "34px"
  chip-term:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 9px"
    height: "24px"
  chip-term-expanded:
    backgroundColor: "rgba(44, 198, 224, 0.12)"
    textColor: "{colors.context-teal}"
  app-panel:
    backgroundColor: "{colors.ide-elevated}"
    rounded: "{rounded.lg}"
---

# Design System: Lantern IDE 소개 사이트

## Overview

**Creative North Star: "The Working Map"**

이 사이트는 광고지가 아니라 **일하는 중인 IDE 화면**처럼 보인다. 바탕은 앱과 같은 어두운 편집기 바닥이고, 그 위에 Lantern 저장소 자체의 코드 지도가 깔려 있다. 스크롤이 에이전트 작업 하나(요청 → 맥락 → 읽기 → 영향 → 격리 → 커밋)를 진행시키고, 진행에 맞춰 지도 위에 청록(맥락), 점선 고리(읽음), 남색(수정), 빨강·주황 고리(영향 반경)가 켜진다. 색은 장식이 아니라 앱의 지도와 같은 의미를 가진다.

글은 왼쪽 한 열(최대 34rem)에 모이고, 지도는 오른쪽 넓은 면을 차지한다. 구조는 카드 격자가 아니라 규칙선과 행이다. 앱의 부품(작업 머리글, 입력창, 승인 카드, 소스 제어 목록)을 그대로 옮겨 와서, 사이트에서 본 인상과 앱을 열었을 때의 인상이 같게 한다. 수치는 실제로 계산한 값이고, 설명용으로 만든 것은 '예시'로 표시한다.

**Key Characteristics:**
- 앱과 같은 어두운 바닥(#16171c)과 앱 토큰 그대로
- 뒤 장면은 실제 데이터(`lantern graph`)로 그린 캔버스 지도
- 규칙선과 행, 표. 카드 격자와 제목 위 머리말 없음
- 색 = 의미: 청록은 AI에 보낸 맥락, 남색은 행동·수정, 빨강·주황은 영향
- Pretendard 한 벌, 코드와 숫자만 코드 서체·표 숫자

## Colors

어두운 IDE 바닥 위에 의미를 가진 강조색 네 개(청록, 남색, 빨강, 주황)만 쓴다.

### Primary
- **Action Indigo** (#5b62e6): 받기 버튼, 승인 카드의 '적용', 지도의 수정된 파일. 페이지에서 '행동'을 뜻하는 유일한 색. 마우스를 올리면 한 단계 밝게(#6a71f0).
- **Context Teal** (#2cc6e0): AI에 보낸 맥락. 지도의 맥락 파일, 토큰 예산 막대, 사전이 넓힌 검색어, 진행 표시의 현재 단계.

### Secondary
- **Impact Red** (#f2656a): 영향 반경의 직접 호출과 위험도 높음, diff의 삭제 줄.
- **Impact Amber** (#dcae3a): 간접 영향, 승인 대기 표시, 경고('테스트 없음'), '못 하는 것'의 항목 이름.

### Neutral
- **IDE Ground** (#16171c): 페이지 바닥. 지도 뒤 가림막도 이 색에서 투명으로 번진다.
- **Elevated Panel** (#202128): 앱 부품(입력창, 승인 카드, 저장소 목록)의 면.
- **Code Well** (#1b1c22): diff와 코드 줄의 바닥.
- **Rule** (#2a2c35) / **Rule Strong** (#3a3d49): 행 구분선, 부품 테두리.
- **Ink** (#d5d8e0) / **Ink Strong** (#f0f1f5): 본문 / 제목·강조.
- **Ink Muted** (#9ba1b0): 보조 글. 앱의 #9298a8보다 한 단계 밝다. 장면 위 작은 글자에서도 4.5:1을 넘기기 위해서다.
- **Link Periwinkle** (#9aa3ff): 링크, 작업 공간 이름.

### Named Rules
**The Map Legend Rule.** 청록·남색·빨강·주황은 앱 지도의 범례와 같은 뜻으로만 쓴다. 아무 뜻 없이 강조하려고 쓰지 않는다.

**The Measured Contrast Rule.** 모든 글자는 렌더된 색으로 잰다(`npm run verify`). 본문 4.5:1, 큰 글자 3:1 미만이면 배포하지 않는다.

## Typography

**Display Font:** Pretendard Variable (Pretendard, 시스템 산세리프로 대체)
**Body Font:** Pretendard Variable
**Label/Mono Font:** Cascadia Code, JetBrains Mono, Consolas (코드와 경로에만)

**Character:** 앱과 같은 서체 한 벌. 제목은 굵기(700)와 좁은 자간으로만 세운다. 코드 서체는 "기술적으로 보이려고" 쓰지 않고, 실제 코드·경로에만 쓴다.

### Hierarchy
- **Display** (700, clamp(2.3rem, 4.4vw, 3.9rem), 1.16, -0.035em): 첫 화면 제목 한 곳. 한 줄씩 끊어 쓴다.
- **Headline** (700, clamp(1.7rem, 2.9vw, 2.45rem), 1.24, -0.03em): 각 절의 제목.
- **Lede** (400, clamp(1.06rem, 1.35vw, 1.2rem), 1.72): 첫 화면 소개 문단. 최대 31em.
- **Body** (400, 17px, 1.75): 본문. 최대 36em.
- **Label** (600, 12px): 작업 머리글의 칩, 지도 이름표, 진행 단계.
- **Code** (400, 12.5px, 1.7): diff, 경로, 명령.

### Named Rules
**The Hangul Leading Rule.** 한글은 글자가 상자를 꽉 채워 행간을 라틴 기준보다 넉넉히 둔다. 여러 줄 제목일수록 더 푼다. `word-break: keep-all`로 음절 단위로 끊지 않는다.

**The Tabular Numbers Rule.** 토큰 수, 호출 수, 버전, 크기 같은 숫자는 서체를 바꾸지 않고 `tabular-nums`로 자릿수만 맞춘다.

## Layout

데스크톱은 두 겹이다. 뒤에는 화면 전체를 덮는 고정 캔버스(지도)가 있고, 지도 본체는 가로 72% 지점을 중심으로 오른쪽 면을 채운다. 앞에는 왼쪽 글 열(`min(34rem, 40vw)`, 좌우 여백 `clamp(20px, 4vw, 64px)`)이 있다. 글 열 뒤는 바닥색에서 투명으로 번지는 가림막이 덮어 대비를 지킨다. 각 절은 최소 화면 높이이고 세로 가운데 정렬이다. 화면 가운데를 지나는 절이 지도의 단계를 정한다.

간격은 한 척도만 쓴다 (6 · 10 · 16 · 24 · 36 · 56 · 88 · 132px). 제목 아래 24px, 본문과 부품 사이 36px.

900px 이하에서는 지도가 위 46svh 띠로 올라가고, 글은 그 아래 바닥색 면에 놓인다. 작업 머리글은 단계 표시 줄을 빼고 작아진다.

## Elevation & Depth

평평한 바닥 위에 앱 부품만 떠 있다. 그림자는 모두 부드럽게 퍼지고 아래로 내려앉는다(오프셋과 흐림이 함께 있음). 색 광채나 딱딱한 오프셋 그림자는 쓰지 않는다.

### Shadow Vocabulary
- **Panel Lift** (`box-shadow: 0 14px 36px rgba(0,0,0,0.38)`): 승인 카드, 앱 화면 캡처.
- **Floating Header** (`box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.3)`): 작업 머리글.
- **Action Glow** (`box-shadow: 0 8px 22px rgba(91,98,230,0.32), 0 1px 2px rgba(0,0,0,0.4)`): 받기 버튼 한 곳.

## Shapes

앱과 같은 작은 모서리. 버튼·부품 6px, 앱 패널 8px, 작은 버튼 4px, 칩·배지는 알약 모양(10~12px). 격리된 작업 공간만 점선 테두리(1.5px dashed)로 구분한다. 지도 노드는 앱 지도의 파일 노드처럼 둥근 사각형이다.

## Components

### Buttons
- **Shape:** 부드러운 모서리 (6px)
- **Primary:** Action Indigo 바탕, 흰 글자, 높이 48px, 좌우 22px. 아이콘 + 동작 이름 + 버전·크기. 페이지에 하나(첫 화면), 닫는 절에서는 방문자 운영체제의 줄만 채운다.
- **Hover / Focus:** 한 단계 밝아지고 1px 떠오름. 포커스는 2px Focus Indigo 윤곽.
- **Outline:** 투명 바탕, Rule Strong 테두리, 높이 34px. 운영체제별 받기.

### Chips
- **Style:** 알약 모양 테두리 칩. 질문에 쓴 말은 중립, 사전이 넓힌 말은 청록 테두리·옅은 청록 바탕.
- **State:** 작업 머리글의 칩은 단계가 지날 때 하나씩 붙는다 (맥락 → 읽음 → 위험도 → 수정).

### App Panels (signature)
앱에서 그대로 옮긴 부품. Elevated Panel 면, 8px 모서리, Rule 테두리.
- **작업 머리글:** 작업 제목 + 칩 + 여섯 단계 진행 줄(현재 단계는 청록 윗줄).
- **승인 카드:** 주황 테두리, 파일 수정 머리, 줄 번호가 붙은 diff(삭제 빨강·추가 초록 바탕), 빨강 테두리의 영향 반경 상자, 적용·거절.
- **저장소 목록:** 저장소마다 브랜치·동기화·변경 수 배지. 선택된 줄은 배경으로만 표시한다.

### Code Map (signature)
캔버스 2D. 모듈별 탁한 색(보라, 황토, 초록, 장미, 청회색 등 8색)의 둥근 사각형 노드와 가는 연결선. 단계마다 목표 모습으로 지수 감쇠(170ms, 카메라 260ms)로 다가가고, 도착하면 그리기를 멈춘다. 영향 단계에서만 수정 파일에서 빨간 파문이 퍼진다(2.4초 주기). 움직임 줄이기 설정에서는 전환과 파문 없이 바로 바뀐다. 이름표는 겹치면 중요한 것(수정 → 읽음 → 직접 영향 → 맥락)만 남긴다.

### Rows & Ledger
행 사이는 1px Rule 선. 경로는 폴더를 흐리게, 파일 이름을 굵게. 비교 표는 두 값을 나란히 두고 Lantern 쪽 값만 굵게와 청록 막대로 표시한다.

## Do's and Don'ts

### Do:
- **Do** 앱 토큰을 원본으로 둔다. 값을 바꿀 때는 앱(`Lantern-IDE/lantern` `app/src/styles.css`)을 먼저 본다.
- **Do** 지도와 수치를 `npm run export-map`으로 다시 뽑는다. 손으로 고친 수치는 쓰지 않는다.
- **Do** 설명용으로 만든 데이터(작업 공간 이름, 예시 작업 폴더, 예시 수정)에는 '예시'를 붙인다.
- **Do** 새 글자를 넣으면 `npm run verify`로 대비와 가로 넘침을 확인한다.

### Don't:
- **Don't** 제목 위에 작은 머리말(kicker)을 달지 않는다.
- **Don't** 그라데이션 글자를 쓰지 않는다. 강조는 굵기와 크기로 한다.
- **Don't** 목록·카드에 1px보다 굵은 색 세로줄을 두지 않는다. 선택은 배경으로 표시한다.
- **Don't** 아이콘 카드 3단 격자로 기능을 나열하지 않는다. 장면과 행으로 보여준다.
- **Don't** 네온 광채나 게임 같은 효과를 넣지 않는다.
