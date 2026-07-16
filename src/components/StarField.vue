<script setup lang="ts">
const stars = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  x: (index * 37 + 11) % 100,
  y: (index * 61 + 7) % 100,
  size: 1 + (index % 3),
  delay: -(index % 11),
  duration: 7 + (index % 8),
}))
</script>

<template>
  <div class="sky" aria-hidden="true">
    <div class="aurora aurora-one" />
    <div class="aurora aurora-two" />
    <span
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`,
        animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s`,
      }"
    />
  </div>
</template>
