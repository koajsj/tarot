<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import StarField from './components/StarField.vue'
import TarotCard from './components/TarotCard.vue'
import { assertCompleteDeck, categoryNames, spreads, tarotDeck, themeNames } from './data/tarot'
import { composeReading, drawCards } from './lib/reading'
import { storage } from './lib/storage'
import type { DrawnCard, JournalEntry, Settings, SpreadId, TarotCard as TarotCardType, Theme } from './types'

type View = 'home' | 'question' | 'shuffle' | 'draw' | 'result' | 'journal' | 'collection' | 'settings'

const view = ref<View>('home')
const question = ref('')
const theme = ref<Theme>('life')
const spreadId = ref<SpreadId>('single')
const prepared = ref<DrawnCard[]>([])
const deckOrder = ref<TarotCardType[]>([])
const selectedDeckIds = ref<string[]>([])
const interpretation = ref('')
const typedInterpretation = ref('')
const journal = ref<JournalEntry[]>(storage.journal())
const favorites = ref<string[]>(storage.favorites())
const favoriteReadings = ref<string[]>(storage.favoriteReadings())
const settings = ref<Settings>(storage.settings())
const selectedJournal = ref<JournalEntry | null>(null)
const selectedCard = ref<TarotCardType | null>(null)
const drawFanRef = ref<HTMLElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const libraryFilter = ref<'all' | 'favorites'>('all')
const journalFilter = ref<'all' | 'favorites'>('all')
const shuffling = ref(false)
const deckDragging = ref(false)
const note = ref('')
const savedCurrent = ref(false)
const currentJournalId = ref<string | null>(null)
const currentReadingId = ref(crypto.randomUUID())
type StorageScope = 'settings' | 'favorites' | 'favoriteReadings' | 'journal'
const storageFailures = ref<Set<StorageScope>>(new Set())
const reducedMotion = ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const shuffleCards = Array.from({ length: 24 }, (_, index) => index)
let shuffleTimer: number | undefined
let typeTimer: number | undefined
let noteTimer: number | undefined
let dragStartX = 0
let dragStartScroll = 0
let dragDistance = 0
let lastFocusedElement: HTMLElement | null = null

const currentSpread = computed(() => spreads[spreadId.value])
const motionEnabled = computed(() => settings.value.animations && !reducedMotion.value)
const storageIssue = computed(() => storageFailures.value.size > 0)
const visibleCards = computed(() => prepared.value)
const canFinish = computed(() => prepared.value.length === currentSpread.value.positions.length)
const remainingDeck = computed(() => deckOrder.value.filter(card => !selectedDeckIds.value.includes(card.id)))
const filteredDeck = computed(() => libraryFilter.value === 'favorites'
  ? tarotDeck.filter(card => favorites.value.includes(card.id))
  : tarotDeck)
const readingIdFor = (cards: DrawnCard[]) => cards.map(item => `${item.card.id}-${item.reversed}`).join('|')
const filteredJournal = computed(() => journalFilter.value === 'favorites'
  ? journal.value.filter(entry => favoriteReadings.value.includes(entry.readingId ?? readingIdFor(entry.cards)))
  : journal.value)
const todayName = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date()))
const deckIsComplete = assertCompleteDeck()

watch(settings, value => recordStorage('settings', storage.saveSettings(value)), { deep: true })
watch(journalFilter, () => { selectedJournal.value = null })
watch(note, value => {
  if (!savedCurrent.value || !currentJournalId.value) return
  window.clearTimeout(noteTimer)
  noteTimer = window.setTimeout(() => persistCurrentNote(value), 300)
})

function recordStorage(scope: StorageScope, success: boolean) {
  const next = new Set(storageFailures.value)
  if (success) next.delete(scope)
  else next.add(scope)
  storageFailures.value = next
}

function navigate(next: View) {
  clearTimers()
  selectedJournal.value = null
  selectedCard.value = null
  view.value = next
  scrollToTop()
}

function startReading() {
  clearTimers()
  question.value = ''
  theme.value = 'life'
  spreadId.value = 'single'
  prepared.value = []
  deckOrder.value = []
  selectedDeckIds.value = []
  savedCurrent.value = false
  currentJournalId.value = null
  currentReadingId.value = crypto.randomUUID()
  note.value = ''
  navigate('question')
}

function quickDraw() {
  question.value = '此刻我最需要知道什么？'
  theme.value = 'life'
  spreadId.value = 'single'
  prepared.value = []
  deckOrder.value = []
  selectedDeckIds.value = []
  savedCurrent.value = false
  currentJournalId.value = null
  currentReadingId.value = crypto.randomUUID()
  note.value = ''
  beginShuffle()
}

function beginShuffle() {
  if (!question.value.trim()) question.value = '此刻我最需要知道什么？'
  clearTimers()
  prepared.value = []
  deckOrder.value = []
  selectedDeckIds.value = []
  savedCurrent.value = false
  currentJournalId.value = null
  currentReadingId.value = crypto.randomUUID()
  note.value = ''
  interpretation.value = ''
  typedInterpretation.value = ''
  view.value = 'shuffle'
  shuffling.value = true
  scrollToTop()
  const delay = motionEnabled.value ? 2600 : 200
  shuffleTimer = window.setTimeout(() => {
    deckOrder.value = drawCards(tarotDeck, tarotDeck.length)
    shuffling.value = false
  }, delay)
}

function enterDraw() {
  view.value = 'draw'
  scrollToTop()
}

function selectDeckCard(card: TarotCardType, focusTarget: 'deck' | 'random' = 'deck') {
  if (canFinish.value || selectedDeckIds.value.includes(card.id)) return
  const position = currentSpread.value.positions[prepared.value.length]
  selectedDeckIds.value.push(card.id)
  prepared.value.push({ card, position, reversed: Math.random() < 0.35 })
  playTone()
  void nextTick(() => {
    const target = canFinish.value
      ? document.querySelector<HTMLButtonElement>('.draw-complete-button')
      : focusTarget === 'random'
        ? document.querySelector<HTMLButtonElement>('.random-draw-button')
        : document.querySelector<HTMLButtonElement>('.draw-fan button')
    target?.focus({ preventScroll: true })
  })
}

function randomDeckCard() {
  const choices = remainingDeck.value
  if (!choices.length) return
  selectDeckCard(choices[Math.floor(Math.random() * choices.length)], 'random')
}

function scrollDeck(event: WheelEvent) {
  if (!drawFanRef.value) return
  drawFanRef.value.scrollLeft += event.deltaX || event.deltaY
}

function startDeckDrag(event: PointerEvent) {
  if (event.pointerType === 'touch' || !drawFanRef.value) return
  deckDragging.value = true
  dragStartX = event.clientX
  dragStartScroll = drawFanRef.value.scrollLeft
  dragDistance = 0
}

function moveDeckDrag(event: PointerEvent) {
  if (!deckDragging.value || !drawFanRef.value) return
  const distance = event.clientX - dragStartX
  dragDistance = Math.max(dragDistance, Math.abs(distance))
  if (dragDistance >= 8 && !drawFanRef.value.hasPointerCapture(event.pointerId)) {
    drawFanRef.value.setPointerCapture(event.pointerId)
  }
  drawFanRef.value.scrollLeft = dragStartScroll - distance
}

function endDeckDrag(event: PointerEvent) {
  if (!deckDragging.value || !drawFanRef.value) return
  deckDragging.value = false
  if (drawFanRef.value.hasPointerCapture(event.pointerId)) drawFanRef.value.releasePointerCapture(event.pointerId)
}

function chooseDeckCard(card: TarotCardType) {
  if (dragDistance < 8) selectDeckCard(card)
  dragDistance = 0
}

function showResult() {
  interpretation.value = composeReading(question.value, theme.value, prepared.value)
  view.value = 'result'
  runTypewriter()
  scrollToTop()
}

function runTypewriter() {
  window.clearInterval(typeTimer)
  if (!motionEnabled.value) {
    typedInterpretation.value = interpretation.value
    return
  }
  typedInterpretation.value = ''
  let index = 0
  typeTimer = window.setInterval(() => {
    typedInterpretation.value += interpretation.value.slice(index, index + 3)
    index += 3
    if (index >= interpretation.value.length) window.clearInterval(typeTimer)
  }, 20)
}

function saveReading() {
  if (savedCurrent.value) return true
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    readingId: currentReadingId.value,
    createdAt: new Date().toISOString(),
    question: question.value,
    theme: theme.value,
    spread: spreadId.value,
    cards: prepared.value.map(draw => ({ ...draw })),
    interpretation: interpretation.value,
    note: note.value,
  }
  const nextJournal = [entry, ...journal.value]
  const saved = storage.saveJournal(nextJournal)
  recordStorage('journal', saved)
  if (!saved) return false
  journal.value = nextJournal
  currentJournalId.value = entry.id
  savedCurrent.value = true
  return true
}

function updateNote(entry: JournalEntry) {
  const found = journal.value.find(item => item.id === entry.id)
  if (found) found.note = entry.note
  recordStorage('journal', storage.saveJournal(journal.value))
}

function persistCurrentNote(value = note.value) {
  window.clearTimeout(noteTimer)
  noteTimer = undefined
  if (!savedCurrent.value || !currentJournalId.value) return
  const nextJournal = journal.value.map(entry => entry.id === currentJournalId.value ? { ...entry, note: value } : entry)
  const saved = storage.saveJournal(nextJournal)
  recordStorage('journal', saved)
  if (saved) journal.value = nextJournal
}

function removeJournal(id: string) {
  if (!window.confirm('确定删除这条塔罗日记吗？删除后无法恢复。')) return
  const removed = journal.value.find(item => item.id === id)
  const nextJournal = journal.value.filter(item => item.id !== id)
  const saved = storage.saveJournal(nextJournal)
  recordStorage('journal', saved)
  if (!saved) return
  journal.value = nextJournal
  if (removed) {
    const readingId = removed.readingId ?? readingIdFor(removed.cards)
    const nextFavorites = favoriteReadings.value.filter(item => item !== readingId)
    const favoritesSaved = storage.saveFavoriteReadings(nextFavorites)
    recordStorage('favoriteReadings', favoritesSaved)
    if (favoritesSaved) favoriteReadings.value = nextFavorites
  }
  selectedJournal.value = null
}

function selectJournal(entry: JournalEntry) {
  selectedJournal.value = entry
}

function toggleFavorite(id: string) {
  const next = favorites.value.includes(id)
    ? favorites.value.filter(item => item !== id)
    : [...favorites.value, id]
  const saved = storage.saveFavorites(next)
  recordStorage('favorites', saved)
  if (saved) favorites.value = next
}

function toggleReadingFavorite(id: string) {
  if (!favoriteReadings.value.includes(id) && !savedCurrent.value && !saveReading()) return
  const next = favoriteReadings.value.includes(id)
    ? favoriteReadings.value.filter(item => item !== id)
    : [...favoriteReadings.value, id]
  const saved = storage.saveFavoriteReadings(next)
  recordStorage('favoriteReadings', saved)
  if (saved) favoriteReadings.value = next
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function playTone() {
  if (!settings.value.sound) return
  try {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = 528
    gain.gain.setValueAtTime(0.05, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6)
    oscillator.connect(gain).connect(context.destination)
    oscillator.addEventListener('ended', () => void context.close(), { once: true })
    oscillator.start()
    oscillator.stop(context.currentTime + 0.6)
  } catch {
    // Sound is an optional enhancement.
  }
}

async function openCard(card: TarotCardType) {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
  selectedCard.value = card
  await nextTick()
  document.querySelector<HTMLButtonElement>('.modal-close')?.focus()
}

async function closeCard() {
  selectedCard.value = null
  await nextTick()
  lastFocusedElement?.focus()
  lastFocusedElement = null
}

function trapModalFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !modalRef.value) return
  const focusable = [...modalRef.value.querySelectorAll<HTMLElement>('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hasAttribute('disabled'))
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function clearTimers() {
  if (noteTimer) persistCurrentNote()
  window.clearTimeout(shuffleTimer)
  window.clearInterval(typeTimer)
}

function scrollToTop() {
  void nextTick(() => {
    window.scrollTo({ top: 0, behavior: motionEnabled.value ? 'smooth' : 'auto' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
  })
}

function updateReducedMotion(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
}

onMounted(() => reducedMotionQuery.addEventListener('change', updateReducedMotion))

watch(selectedCard, card => {
  document.body.style.overflow = card ? 'hidden' : ''
})

onBeforeUnmount(() => {
  clearTimers()
  reducedMotionQuery.removeEventListener('change', updateReducedMotion)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="app-shell" :class="[{ 'motion-off': !motionEnabled }, `theme-deck-${settings.deck}`]">
    <StarField />

    <a class="skip-link" href="#main-content">跳到主要内容</a>

    <header class="topbar glass">
      <button class="brand" aria-label="返回首页" @click="navigate('home')">
        <span class="brand-mark">✦</span>
        <span>LUNA ARCANA</span>
      </button>
      <nav aria-label="主导航">
        <button :class="{ active: view === 'journal' }" :aria-current="view === 'journal' ? 'page' : undefined" @click="navigate('journal')">日记</button>
        <button :class="{ active: view === 'collection' }" :aria-current="view === 'collection' ? 'page' : undefined" @click="navigate('collection')">牌库</button>
        <button class="icon-button" :class="{ active: view === 'settings' }" :aria-current="view === 'settings' ? 'page' : undefined" aria-label="设置" @click="navigate('settings')">◌</button>
      </nav>
    </header>

    <main id="main-content" tabindex="-1">
      <section v-if="view === 'home'" class="home view-enter">
        <div class="hero-copy">
          <p class="eyebrow">{{ todayName }}</p>
          <h1>在静默中，<span>听见你的答案</span></h1>
          <p class="hero-body">一处只属于你的塔罗空间。让问题沉静下来，再抽出此刻需要看见的牌。</p>
          <div class="hero-actions">
            <button class="primary-button" @click="startReading"><span>开始占卜</span><b>→</b></button>
            <button class="text-button" @click="quickDraw"><span>随机抽一张</span><b>✦</b></button>
          </div>
        </div>
        <div class="hero-ritual" aria-hidden="true">
          <div class="halo halo-outer" />
          <div class="halo halo-inner" />
          <span v-for="n in 8" :key="n" class="orbit-star" :style="{ '--i': n }" />
          <TarotCard facedown :deck="settings.deck" class="hero-card" />
          <p>今日塔罗</p>
        </div>
        <div class="home-stats">
          <span><b>{{ journal.length }}</b> 次私密记录</span>
          <span><b>{{ favorites.length }}</b> 张收藏牌</span>
          <span><b>78</b> 张完整牌库</span>
        </div>
      </section>

      <section v-else-if="view === 'question'" class="form-view view-enter page-narrow">
        <button class="back-button" @click="navigate('home')">← 返回</button>
        <header class="section-heading">
          <h2>把问题交给牌面</h2>
          <p>问题越诚实，镜子越清晰。塔罗提供视角，决定仍然属于你。</p>
        </header>
        <form class="reading-form glass" @submit.prevent="beginShuffle">
          <label for="question">你想询问什么？</label>
          <textarea id="question" v-model="question" rows="4" maxlength="160" aria-describedby="question-limit" placeholder="例如：我该如何看待目前工作中的停滞？" />
          <span id="question-limit" class="helper">{{ question.length }} / 160</span>

          <fieldset>
            <legend>选择主题</legend>
            <div class="choice-grid theme-choices">
              <label v-for="(name, id) in themeNames" :key="id" :class="{ selected: theme === id }">
                <input v-model="theme" type="radio" name="theme" :value="id">
                <span>{{ name }}</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>选择牌阵</legend>
            <div class="spread-grid">
              <label v-for="(spread, id) in spreads" :key="id" :class="{ selected: spreadId === id }">
                <input v-model="spreadId" type="radio" name="spread" :value="id">
                <span class="spread-mini" :class="`cards-${spread.positions.length}`"><i v-for="n in spread.positions.length" :key="n" /></span>
                <strong>{{ spread.name }}</strong>
                <small>{{ spread.description }}</small>
              </label>
            </div>
          </fieldset>
          <button class="primary-button full" type="submit"><span>进入洗牌仪式</span><b>→</b></button>
        </form>
      </section>

      <section v-else-if="view === 'shuffle'" class="ritual-view view-enter">
        <button class="context-back" @click="navigate('question')">← 返回问题</button>
        <div class="ritual-copy" aria-live="polite">
          <p>{{ shuffling ? '请保持呼吸，心中默念你的问题' : '牌已经准备好了' }}</p>
          <h2>{{ shuffling ? '正在洗牌' : '跟随你的直觉' }}</h2>
        </div>
        <div class="shuffle-stage" :class="{ shuffling }" aria-live="polite">
          <TarotCard
            v-for="index in shuffleCards"
            :key="index"
            facedown
            :deck="settings.deck"
            class="shuffle-card"
            :style="{ '--card-index': index }"
          />
          <div class="shuffle-glow" />
        </div>
        <button v-if="!shuffling" class="primary-button" @click="enterDraw"><span>开始抽牌</span><b>→</b></button>
      </section>

      <section v-else-if="view === 'draw'" class="draw-view view-enter">
        <button class="context-back" @click="navigate('question')">← 返回问题</button>
        <div class="ritual-copy" aria-live="polite">
          <p>{{ currentSpread.name }}</p>
          <h2>{{ canFinish ? '牌面已经显现' : `选择第 ${prepared.length + 1} 张牌` }}</h2>
          <small v-if="!canFinish">{{ currentSpread.positions[prepared.length] }}</small>
        </div>

        <div
          v-if="!canFinish"
          ref="drawFanRef"
          class="draw-fan"
          :class="{ 'is-dragging': deckDragging }"
          @wheel.prevent="scrollDeck"
          @pointerdown="startDeckDrag"
          @pointermove="moveDeckDrag"
          @pointerup="endDeckDrag"
          @pointercancel="endDeckDrag"
        >
          <button v-for="(card, index) in remainingDeck" :key="card.id" :aria-label="`选择牌组中的第 ${index + 1} 张牌`" @click.stop="chooseDeckCard(card)">
            <TarotCard facedown :deck="settings.deck" />
          </button>
        </div>

        <p v-if="!canFinish" class="deck-hint">横向滑动，凭直觉从完整 78 张牌中选择</p>

        <button v-if="!canFinish" class="random-draw-button" @click="randomDeckCard"><span>✦</span> 让牌替我选择</button>

        <div class="revealed-row">
          <TarotCard
            v-for="draw in visibleCards"
            :key="draw.position"
            :card="draw.card"
            :reversed="draw.reversed"
            :flipped="true"
            :label="draw.position"
            class="revealed-card"
          />
          <div v-for="position in currentSpread.positions.slice(prepared.length)" :key="position" class="card-placeholder"><span>{{ position }}</span></div>
        </div>
        <button v-if="canFinish" class="primary-button draw-complete-button" @click="showResult"><span>阅读牌意</span><b>→</b></button>
      </section>

      <section v-else-if="view === 'result'" class="result-view view-enter">
        <div class="result-actions"><button class="back-button" @click="navigate('draw')">← 返回牌面</button><button class="back-button" @click="startReading">开始新的占卜</button></div>
        <div class="result-layout">
          <aside class="result-visual glass">
            <p>{{ currentSpread.name }}</p>
            <h2>{{ question }}</h2>
            <div class="result-cards">
              <button v-for="draw in prepared" :key="draw.position" @click="openCard(draw.card)">
                <TarotCard :card="draw.card" :reversed="draw.reversed" :flipped="true" :label="draw.position" />
                <small>{{ draw.reversed ? '逆位' : '正位' }}</small>
              </button>
            </div>
          </aside>
          <article class="interpretation glass">
            <div class="interpretation-head">
              <div><span>本地智能解读</span><h2>牌面讯息</h2></div>
              <button class="favorite-button" :class="{ active: favoriteReadings.includes(currentReadingId) }" @click="toggleReadingFavorite(currentReadingId)" :aria-label="favoriteReadings.includes(currentReadingId) ? '取消收藏解读' : '收藏解读'">♡</button>
            </div>
            <p class="typewriter">{{ typedInterpretation }}</p>
            <div class="note-field">
              <label for="note">我的感悟</label>
              <textarea id="note" v-model="note" rows="4" maxlength="2000" placeholder="记录此刻浮现的想法，只有你能看见。" />
            </div>
            <button class="secondary-button full" :disabled="savedCurrent" @click="saveReading">{{ savedCurrent ? '已保存到塔罗日记' : '保存这次占卜' }}</button>
          </article>
        </div>
      </section>

      <section v-else-if="view === 'journal'" class="page-view view-enter">
        <button class="back-button page-back" @click="navigate('home')">← 返回首页</button>
        <header class="page-heading"><div><p>私人记录</p><h1>塔罗日记</h1></div><div v-if="journal.length" class="segmented" aria-label="日记筛选"><button :class="{ active: journalFilter === 'all' }" @click="journalFilter = 'all'">全部 {{ journal.length }}</button><button :class="{ active: journalFilter === 'favorites' }" @click="journalFilter = 'favorites'">收藏解读</button></div></header>
        <div v-if="journal.length" class="journal-layout" :class="{ 'has-selection': selectedJournal }">
          <div v-if="filteredJournal.length" class="journal-list glass">
            <button v-for="entry in filteredJournal" :key="entry.id" class="journal-item" :class="{ active: selectedJournal?.id === entry.id }" @click="selectJournal(entry)">
              <time>{{ formatDate(entry.createdAt) }}</time>
              <h3>{{ entry.question }}</h3>
              <p>{{ spreads[entry.spread].name }} / {{ themeNames[entry.theme] }}</p>
              <div class="mini-cards"><span v-for="card in entry.cards" :key="card.position">{{ card.card.name }} {{ card.reversed ? '逆' : '正' }}</span></div>
            </button>
          </div>
          <div v-else class="journal-filter-empty glass"><span>♡</span><p>还没有收藏的解读。</p><button class="text-button" @click="journalFilter = 'all'">查看全部记录</button></div>
          <article v-if="selectedJournal" class="journal-detail glass">
            <button class="journal-detail-back" @click="selectedJournal = null">← 返回记录</button>
            <header><div><time>{{ formatDate(selectedJournal.createdAt) }}</time><h2>{{ selectedJournal.question }}</h2></div><button class="danger-button" @click="removeJournal(selectedJournal.id)">删除</button></header>
            <p class="preserve-lines">{{ selectedJournal.interpretation }}</p>
            <label for="journal-note">个人备注</label>
            <textarea id="journal-note" v-model="selectedJournal.note" rows="5" maxlength="2000" placeholder="写下后续发生的事或新的理解。" @change="updateNote(selectedJournal)" />
          </article>
          <div v-else class="journal-detail empty-detail glass"><span>✦</span><p>选择一条记录，重读当时的讯息。</p></div>
        </div>
        <div v-else class="empty-state glass"><span>☾</span><h2>日记还没有内容</h2><p>完成一次占卜并保存，牌面与感悟会留在这里。</p><button class="primary-button" @click="startReading"><span>抽第一张牌</span><b>→</b></button></div>
      </section>

      <section v-else-if="view === 'collection'" class="page-view view-enter">
        <button class="back-button page-back" @click="navigate('home')">← 返回首页</button>
        <header class="page-heading"><div><p>完整 78 张</p><h1>塔罗牌库</h1></div><div class="segmented"><button :class="{ active: libraryFilter === 'all' }" @click="libraryFilter = 'all'">全部</button><button :class="{ active: libraryFilter === 'favorites' }" @click="libraryFilter = 'favorites'">收藏 {{ favorites.length }}</button></div></header>
        <div v-if="filteredDeck.length" class="library-grid">
          <article v-for="card in filteredDeck" :key="card.id" class="library-card">
            <button class="library-card-main" :aria-label="`查看${card.name}详情`" @click="openCard(card)">
              <TarotCard :card="card" :flipped="true" />
              <span><strong>{{ card.name }}</strong><small>{{ categoryNames[card.category] }}</small></span>
            </button>
            <button class="library-favorite" :class="{ active: favorites.includes(card.id) }" :aria-label="favorites.includes(card.id) ? `取消收藏${card.name}` : `收藏${card.name}`" @click="toggleFavorite(card.id)">♡</button>
          </article>
        </div>
        <div v-else class="empty-state glass"><span>♡</span><h2>还没有收藏</h2><p>浏览牌库，收藏与你产生共鸣的牌。</p><button class="secondary-button" @click="libraryFilter = 'all'">浏览完整牌库</button></div>
      </section>

      <section v-else-if="view === 'settings'" class="settings-view view-enter page-narrow">
        <button class="back-button page-back" @click="navigate('home')">← 返回首页</button>
        <header class="section-heading"><h2>设置你的仪式</h2><p>所有选项只保存在当前浏览器中。</p></header>
        <div class="settings-panel glass">
          <fieldset><legend>牌背样式</legend><div class="deck-options">
            <label v-for="deck in ([['celestial', '星图'], ['aurora', '极光'], ['obsidian', '曜石']] as const)" :key="deck[0]" :class="{ selected: settings.deck === deck[0] }">
              <input v-model="settings.deck" type="radio" :value="deck[0]"><TarotCard facedown :deck="deck[0]" /><span>{{ deck[1] }}</span>
            </label>
          </div></fieldset>
          <div class="setting-row"><div><strong>仪式动画</strong><span>洗牌、翻牌与文字逐字显现</span></div><label class="switch"><input v-model="settings.animations" type="checkbox" aria-label="仪式动画"><span /></label></div>
          <div class="setting-row"><div><strong>轻柔音效</strong><span>翻牌时播放短促的冥想音</span></div><label class="switch"><input v-model="settings.sound" type="checkbox" aria-label="轻柔音效"><span /></label></div>
          <div class="privacy-note"><span>⌾</span><p><strong>你的数据只属于你</strong>问题、解读和日记仅存储在本机 LocalStorage。清除浏览器数据会同时删除记录。</p></div>
        </div>
      </section>
    </main>

    <div v-if="selectedCard" ref="modalRef" class="modal-layer" role="dialog" aria-modal="true" :aria-label="selectedCard.name" @click.self="closeCard" @keydown.esc="closeCard" @keydown.tab="trapModalFocus">
      <article class="card-modal glass">
        <button class="modal-close" aria-label="关闭" @click="closeCard">×</button>
        <div class="modal-card-visual"><TarotCard :card="selectedCard" :flipped="true" /><button class="favorite-button" :class="{ active: favorites.includes(selectedCard.id) }" :aria-label="favorites.includes(selectedCard.id) ? `取消收藏${selectedCard.name}` : `收藏${selectedCard.name}`" @click="toggleFavorite(selectedCard.id)">♡</button></div>
        <div class="modal-copy">
          <p>{{ categoryNames[selectedCard.category] }} / {{ selectedCard.number }}</p>
          <h2>{{ selectedCard.name }}</h2><span>{{ selectedCard.englishName }}</span>
          <div class="keyword-row"><i v-for="word in selectedCard.keywords" :key="word">{{ word }}</i></div>
          <section><h3>正位含义</h3><p>{{ selectedCard.upright }}</p></section>
          <section><h3>逆位含义</h3><p>{{ selectedCard.reversed }}</p></section>
          <section><h3>爱情</h3><p>{{ selectedCard.readings.love }}</p></section>
          <section><h3>事业与财富</h3><p>{{ selectedCard.readings.career }} {{ selectedCard.readings.wealth }}</p></section>
          <section><h3>人生建议</h3><p>{{ selectedCard.readings.life }} {{ selectedCard.advice }}</p></section>
        </div>
      </article>
    </div>

    <div v-if="!deckIsComplete" class="data-error" role="alert">牌库数据未完整载入，请刷新页面。</div>
    <div v-else-if="storageIssue" class="data-error" role="alert">浏览器未能保存本地数据，请检查隐私模式或存储空间。</div>
  </div>
</template>
