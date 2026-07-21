import type { JournalEntry, Settings, SpreadId, Theme } from '../types'
import { spreads, tarotDeck } from '../data/tarot'

const KEYS = {
  journal: 'luna-tarot-journal-v1',
  favorites: 'luna-tarot-favorites-v1',
  favoriteReadings: 'luna-tarot-favorite-readings-v1',
  settings: 'luna-tarot-settings-v1',
}
const tarotById = new Map(tarotDeck.map(card => [card.id, card]))

export const defaultSettings: Settings = { deck: 'celestial', animations: true, sound: false }

function read(key: string): unknown {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  } catch {
    return undefined
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const storage = {
  journal: () => {
    const value = read(KEYS.journal)
    return Array.isArray(value) ? value.map(parseJournalEntry).filter((entry): entry is JournalEntry => Boolean(entry)) : []
  },
  saveJournal: (entries: JournalEntry[]) => write(KEYS.journal, entries.map(compactJournalEntry)),
  favorites: () => stringArray(read(KEYS.favorites)).filter(id => tarotById.has(id)),
  saveFavorites: (ids: string[]) => write(KEYS.favorites, ids),
  favoriteReadings: () => stringArray(read(KEYS.favoriteReadings)),
  saveFavoriteReadings: (ids: string[]) => write(KEYS.favoriteReadings, ids),
  settings: () => safeSettings(read(KEYS.settings)),
  saveSettings: (settings: Settings) => write(KEYS.settings, settings),
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : []
}

function safeSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') return { ...defaultSettings }
  const candidate = value as Partial<Settings>
  const decks: Settings['deck'][] = ['celestial', 'aurora', 'obsidian']
  return {
    deck: candidate.deck && decks.includes(candidate.deck) ? candidate.deck : defaultSettings.deck,
    animations: typeof candidate.animations === 'boolean' ? candidate.animations : defaultSettings.animations,
    sound: typeof candidate.sound === 'boolean' ? candidate.sound : defaultSettings.sound,
  }
}

function compactJournalEntry(entry: JournalEntry) {
  return {
    ...entry,
    cards: entry.cards.map(draw => ({ cardId: draw.card.id, reversed: draw.reversed, position: draw.position })),
  }
}

function parseJournalEntry(value: unknown): JournalEntry | null {
  if (!value || typeof value !== 'object') return null
  const entry = value as Partial<JournalEntry>
  const themes: Theme[] = ['love', 'career', 'wealth', 'life', 'free']
  const spreadIds: SpreadId[] = ['single', 'three', 'love', 'career']
  const validBase = typeof entry.id === 'string'
    && (entry.readingId === undefined || typeof entry.readingId === 'string')
    && typeof entry.createdAt === 'string' && Number.isFinite(Date.parse(entry.createdAt))
    && typeof entry.question === 'string'
    && typeof entry.theme === 'string' && themes.includes(entry.theme as Theme)
    && typeof entry.spread === 'string' && spreadIds.includes(entry.spread as SpreadId)
    && Array.isArray(entry.cards)
    && typeof entry.interpretation === 'string'
    && typeof entry.note === 'string'
  if (!validBase) return null

  const spread = spreads[entry.spread as SpreadId]
  if (entry.cards!.length !== spread.positions.length) return null
  const usedIds = new Set<string>()
  const cards = entry.cards!.map((value, index) => {
    if (!value || typeof value !== 'object') return null
    const draw = value as unknown as { cardId?: unknown; card?: { id?: unknown }; reversed?: unknown }
    const cardId = typeof draw.cardId === 'string' ? draw.cardId : draw.card?.id
    const card = typeof cardId === 'string' ? tarotById.get(cardId) : undefined
    if (!card || typeof draw.reversed !== 'boolean' || usedIds.has(card.id)) return null
    usedIds.add(card.id)
    return { card, reversed: draw.reversed, position: spread.positions[index] }
  })
  if (cards.some(card => !card)) return null

  return {
    id: entry.id!,
    readingId: entry.readingId,
    createdAt: entry.createdAt!,
    question: entry.question!.slice(0, 160),
    theme: entry.theme as Theme,
    spread: entry.spread as SpreadId,
    cards: cards as JournalEntry['cards'],
    interpretation: entry.interpretation!.slice(0, 20_000),
    note: entry.note!.slice(0, 2_000),
  }
}
