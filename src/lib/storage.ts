import type { JournalEntry, Settings } from '../types'

const KEYS = {
  journal: 'luna-tarot-journal-v1',
  favorites: 'luna-tarot-favorites-v1',
  favoriteReadings: 'luna-tarot-favorite-readings-v1',
  settings: 'luna-tarot-settings-v1',
}

export const defaultSettings: Settings = { deck: 'celestial', animations: true, sound: false }

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The app remains usable when storage is unavailable.
  }
}

export const storage = {
  journal: () => read<JournalEntry[]>(KEYS.journal, []),
  saveJournal: (entries: JournalEntry[]) => write(KEYS.journal, entries),
  favorites: () => read<string[]>(KEYS.favorites, []),
  saveFavorites: (ids: string[]) => write(KEYS.favorites, ids),
  favoriteReadings: () => read<string[]>(KEYS.favoriteReadings, []),
  saveFavoriteReadings: (ids: string[]) => write(KEYS.favoriteReadings, ids),
  settings: () => read<Settings>(KEYS.settings, defaultSettings),
  saveSettings: (settings: Settings) => write(KEYS.settings, settings),
}
