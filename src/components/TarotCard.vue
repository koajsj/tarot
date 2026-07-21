<script setup lang="ts">
import { computed } from 'vue'
import type { TarotCard } from '../types'

const props = withDefaults(defineProps<{
  card?: TarotCard
  reversed?: boolean
  facedown?: boolean
  flipped?: boolean
  deck?: 'celestial' | 'aurora' | 'obsidian'
  label?: string
}>(), {
  facedown: false,
  flipped: false,
  reversed: false,
  deck: 'celestial',
  label: '',
})

const suitMark = computed(() => ({
  major: '✦',
  wands: '♧',
  cups: '◡',
  swords: '◇',
  pentacles: '⬡',
}[props.card?.category ?? 'major']))

const frontStyle = computed(() => props.card?.image ? { '--card-artwork': `url("${props.card.image}")` } : undefined)

const celestialCardBack = `${import.meta.env.BASE_URL}assets/celestial-card-back.png`
</script>

<template>
  <div class="tarot-card" :class="[{ 'is-flipped': flipped || !facedown }, `deck-${deck}`]">
    <div class="tarot-card__inner">
      <div class="tarot-card__back" :style="deck === 'celestial' ? { backgroundImage: `url(${celestialCardBack})` } : undefined">
        <span class="back-orbit" aria-hidden="true" />
      </div>
      <div class="tarot-card__front" :class="{ reversed }" :style="frontStyle">
        <div class="card-index">{{ card?.number }}</div>
        <div class="card-illustration" aria-hidden="true">
          <span class="orbit orbit-one" />
          <span class="orbit orbit-two" />
          <span class="card-symbol">{{ suitMark }}</span>
        </div>
        <div class="card-title">
          <strong>{{ card?.name }}</strong>
          <span>{{ card?.englishName }}</span>
        </div>
      </div>
    </div>
    <span v-if="label" class="position-label">{{ label }}</span>
  </div>
</template>
