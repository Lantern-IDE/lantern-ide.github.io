<script setup lang="ts">
// 앱의 육각형 표시(app/src/icons.ts hex)와 같은 모양. 그라데이션 id가 페이지에서 겹치지 않게 useId를 쓴다.
const id = useId();
</script>

<template>
  <span class="hex" aria-hidden="true">
    <svg viewBox="0 0 16 16">
      <defs>
        <linearGradient :id="id" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee" />
          <stop offset="1" stop-color="#6366f1" />
        </linearGradient>
      </defs>
      <polygon points="8,1.3 13.8,4.65 13.8,11.35 8,14.7 2.2,11.35 2.2,4.65" fill="none" :stroke="`url(#${id})`" stroke-width="1.6" stroke-linejoin="round" />
      <circle cx="8" cy="8" r="2.1" :fill="`url(#${id})`" />
    </svg>
  </span>
</template>
