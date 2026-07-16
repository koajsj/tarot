import type { DrawnCard, Theme } from '../types'
import { themeNames } from '../data/tarot'

const transitions = ['与此同时', '更深一层看', '放回你的问题中', '值得留意的是']

export function composeReading(question: string, theme: Theme, cards: DrawnCard[]) {
  const title = question.trim() || '此刻我最需要知道什么？'
  const sections = cards.map((draw, index) => {
    const meaning = draw.reversed ? draw.card.reversed : draw.card.upright
    const bridge = transitions[index % transitions.length]
    return `${draw.position}｜${draw.card.name}（${draw.reversed ? '逆位' : '正位'}）\n${meaning}\n${bridge}，${draw.card.readings[theme]}`
  })
  const last = cards.at(-1)
  const trend = last
    ? `未来趋势\n局势会沿着“${last.card.keywords.join('、')}”的方向展开。这里显示的是当前能量的延伸，不是不可改变的预言。你的选择、边界和行动仍会改变结果。`
    : ''
  const advice = `行动建议\n${cards.map(item => item.card.advice).join(' ')} 建议在七天后回看这次记录，检查实际发生的变化。`
  return `你的问题\n${title}\n\n${themeNames[theme]}主题解读\n${sections.join('\n\n')}\n\n${trend}\n\n${advice}`
}

export function drawCards<T>(deck: T[], count: number): T[] {
  const copy = [...deck]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}
