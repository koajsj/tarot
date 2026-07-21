import type { JournalEntry, Settings, SpreadId, Theme } from '../types'

const KEYS = {
  journal: 'luna-tarot-journal-v1',
  favorites: 'luna-tarot-favorites-v1',
  favoriteReadings: 'luna-tarot-favorite-readings-v1',
  settings: 'luna-tarot-settings-v1',
}

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
    return Array.isArray(value) ? value.filter(isJournalEntry) : []
  },
  saveJournal: (entries: JournalEntry[]) => write(KEYS.journal, entries),
  favorites: () => stringArray(read(KEYS.favorites)),
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

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<JournalEntry>
  const themes: Theme[] = ['love', 'career', 'wealth', 'life', 'free']
  const spreadIds: SpreadId[] = ['single', 'three', 'love', 'career']
  return typeof entry.id === 'string'
    && (entry.readingId === undefined || typeof entry.readingId === 'string')
    && typeof entry.createdAt === 'string' && Number.isFinite(Date.parse(entry.createdAt))
    && typeof entry.question === 'string'
    && typeof entry.theme === 'string' && themes.includes(entry.theme as Theme)
    && typeof entry.spread === 'string' && spreadIds.includes(entry.spread as SpreadId)
    && Array.isArray(entry.cards) && entry.cards.every(draw => draw && typeof draw === 'object' && typeof draw.position === 'string' && typeof draw.reversed === 'boolean' && typeof draw.card?.id === 'string' && typeof draw.card.name === 'string')
    && typeof entry.interpretation === 'string'
    && typeof entry.note === 'string'
}
