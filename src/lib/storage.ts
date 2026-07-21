import type { Settings } from '../types'
import { tarotDeck } from '../data/tarot'

const KEYS = {
  favorites: 'luna-tarot-favorites-v1',
  settings: 'luna-tarot-settings-v1',
}
const LEGACY_READING_KEYS = ['luna-tarot-journal-v1', 'luna-tarot-favorite-readings-v1']
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
  favorites: () => stringArray(read(KEYS.favorites)).filter(id => tarotById.has(id)),
  saveFavorites: (ids: string[]) => write(KEYS.favorites, ids),
  settings: () => safeSettings(read(KEYS.settings)),
  saveSettings: (settings: Settings) => write(KEYS.settings, settings),
  clearReadingHistory: () => {
    try {
      LEGACY_READING_KEYS.forEach(key => localStorage.removeItem(key))
    } catch {
      // Reading history is already inaccessible when storage is blocked.
    }
  },
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
