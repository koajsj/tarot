export type Theme = 'love' | 'career' | 'wealth' | 'life' | 'free'
export type Suit = 'major' | 'cups' | 'wands' | 'swords' | 'pentacles'
export type SpreadId = 'single' | 'three' | 'love' | 'career'

export interface TarotCard {
  id: string
  name: string
  englishName: string
  category: Suit
  number: string
  keywords: string[]
  image: string
  upright: string
  reversed: string
  readings: Record<Theme, string>
  advice: string
}

export interface DrawnCard {
  card: TarotCard
  reversed: boolean
  position: string
}

export interface JournalEntry {
  id: string
  readingId?: string
  createdAt: string
  question: string
  theme: Theme
  spread: SpreadId
  cards: DrawnCard[]
  interpretation: string
  note: string
}

export interface Settings {
  deck: 'celestial' | 'aurora' | 'obsidian'
  animations: boolean
  sound: boolean
}
