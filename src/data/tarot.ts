import type { Suit, TarotCard, Theme } from '../types'

const cardImage = `${import.meta.env.BASE_URL}assets/celestial-card-back.png`

type MajorSeed = [string, string, string[], string, string]

const majors: MajorSeed[] = [
  ['愚人', 'The Fool', ['开始', '自由', '信任'], '你正站在新旅程的门口。经验尚未形成边界，直觉与好奇心因此比周密计划更重要。它邀请你带着清醒的天真迈出第一步，同时保留对风险的基本觉察。', '冲动或对未知的恐惧正在左右选择。你可能没有评估现实，也可能因为害怕犯错而迟迟不动。先辨认真正的风险，再决定前进或暂缓。'],
  ['魔术师', 'The Magician', ['创造', '专注', '资源'], '意图、能力与现实条件已经能够连接。把分散的资源放到同一个目标上，清楚表达需求，并用连续行动证明你的选择。', '能量被分散，或有人只展示技巧却没有承担责任。检查承诺与行动是否一致，也要避免用控制代替真正的影响力。'],
  ['女祭司', 'The High Priestess', ['直觉', '静默', '内在'], '答案尚未完全浮出表面。降低外界噪音，留意梦境、身体感受和未被说出的信息，让理解在安静中成熟。', '你可能忽略了直觉，或把猜测误当成事实。暂时不要强行下结论，先区分恐惧、投射与真正的内在知道。'],
  ['皇后', 'The Empress', ['丰盛', '滋养', '创造'], '生命力正在增长。照顾身体、关系与创作，让成果通过耐心滋养自然成形。接受支持也是成熟的一部分。', '过度给予、依赖认可或忽略自身需要，会让丰盛变成耗竭。重新建立照顾自己与照顾他人的边界。'],
  ['皇帝', 'The Emperor', ['秩序', '边界', '责任'], '清晰结构能保护真正重要的事。制定规则、确认责任并稳定执行，在可控范围内建立长期秩序。', '僵化、控制或对权威的抗拒正在制造压力。权力需要服务于目标，而不是维护面子或恐惧。'],
  ['教皇', 'The Hierophant', ['传统', '学习', '信念'], '成熟的体系、导师或共同价值观能提供方向。理解规则背后的经验，再决定如何诚实地加入或传承。', '旧规则已经不完全适用。你需要检视继承来的信念，并为自己的价值选择承担责任，而非仅为反叛而反叛。'],
  ['恋人', 'The Lovers', ['选择', '连结', '一致'], '真正的亲密来自价值一致与主动选择。它不仅谈感情，也要求你让欲望、承诺和行动彼此对齐。', '关系或选择中存在分裂。吸引力无法代替共同价值，回避决定也会成为一种决定。'],
  ['战车', 'The Chariot', ['意志', '方向', '推进'], '相反力量可以被同一目标驾驭。明确方向、收拢情绪与行动，你有能力穿过竞争和阻力。', '急于证明、方向混乱或压抑情绪会导致失控。先重新掌舵，而不是继续加速。'],
  ['力量', 'Strength', ['勇气', '温柔', '自持'], '真正的力量不是压制，而是带着耐心接近本能与恐惧。温柔而坚定的持续行动，比一次性的强势更有力量。', '自我怀疑或被情绪牵引，使力量无法稳定流动。承认脆弱，减少内耗，再从一个可完成的动作开始。'],
  ['隐者', 'The Hermit', ['独处', '探寻', '智慧'], '向内退一步能看清方向。独处不是逃避，而是暂时离开集体声音，提炼真正属于你的经验。', '封闭过久会让反思变成孤立。你可能需要可信任的回应，或结束无止境的寻找，带着答案回到生活。'],
  ['命运之轮', 'Wheel of Fortune', ['周期', '转机', '变化'], '局势正在转动。你无法控制全部变量，却可以识别周期、把握时机，并在变化中调整位置。', '旧模式反复出现，或你抗拒不可避免的变化。观察循环由何处开始，改变那个仍在你掌握中的环节。'],
  ['正义', 'Justice', ['真相', '因果', '平衡'], '事实、责任和长期后果需要被放在同一张桌面上衡量。诚实面对选择，公平也包括对自己负责。', '偏见、逃避责任或信息不全可能导致失衡。暂缓情绪化判断，补齐证据并修正不对等。'],
  ['倒吊人', 'The Hanged Man', ['暂停', '换位', '臣服'], '主动暂停能带来新的视角。此刻的放下不是失败，而是停止用旧方法逼迫尚未成熟的结果。', '拖延、无效牺牲或执着于受害位置让停滞失去意义。确认你在等待什么，以及这份等待是否仍有价值。'],
  ['死神', 'Death', ['结束', '蜕变', '更新'], '一个阶段已经完成。允许旧身份、关系方式或计划退场，空出的空间会成为新秩序的入口。', '你正在抓住已经结束的事，变化因此变得更痛苦。温和地完成告别，避免把延迟误认成挽回。'],
  ['节制', 'Temperance', ['调和', '疗愈', '节奏'], '两种不同力量正在寻找新的比例。循序渐进、适量投入并持续校准，能够形成比极端选择更稳固的答案。', '失衡与过量正在消耗你。减少刺激和急迫感，先恢复基本节律，再处理复杂决定。'],
  ['恶魔', 'The Devil', ['束缚', '欲望', '阴影'], '你有机会看见依赖、恐惧或交换条件如何限制自由。诚实命名欲望，才能把无意识的束缚变成有意识的选择。', '束缚正在松动，但仍需实际行动。不要只停留在觉察，建立边界、寻求支持，并减少让旧模式复燃的环境。'],
  ['高塔', 'The Tower', ['揭露', '震荡', '重建'], '不稳固的结构正在被真相击穿。震荡会带来失序，但也结束了继续维持假象的成本。先确保安全，再决定重建什么。', '你已感到裂缝，却试图延缓必要改变。小规模、主动的修正能减少被动崩塌带来的冲击。'],
  ['星星', 'The Star', ['希望', '复原', '真诚'], '经历消耗后，安静的希望正在恢复。保持真诚、接受疗愈，并用小而持续的行动重新建立对未来的信任。', '失望让你暂时看不见方向。不要强迫乐观，先补充身心资源，并寻找一个仍真实存在的微小可能。'],
  ['月亮', 'The Moon', ['潜意识', '迷雾', '感受'], '信息仍在迷雾中，情绪和潜意识正在放大细节。允许不确定存在，同时验证事实，不要在夜色最深时做终局判断。', '迷雾开始散去，隐藏信息逐渐可见。面对曾经回避的感受，并修正由恐惧产生的故事。'],
  ['太阳', 'The Sun', ['清晰', '活力', '喜悦'], '事实趋于明朗，生命力能够自由表达。分享成果、享受连接，并让坦率成为推进事情的力量。', '好消息仍在，但疲惫、自我怀疑或过高期待遮住了它。降低完美标准，重新接触简单而真实的快乐。'],
  ['审判', 'Judgement', ['觉醒', '召唤', '复盘'], '过去经验正在汇成一次清晰召唤。诚实复盘、接受已经改变的自己，并回应那个无法继续忽略的方向。', '自责或害怕评价阻碍更新。承担责任不等于永久惩罚自己，真正的修正需要允许新的行动发生。'],
  ['世界', 'The World', ['完成', '整合', '圆满'], '一个完整周期正在收束。认可成果、整合经验，并带着更成熟的身份进入下一阶段。', '临门一脚尚未完成，或你没有允许自己承认成果。处理遗留事项，定义完成标准，再结束这一章。'],
]

const suits: Array<{ id: Exclude<Suit, 'major'>; name: string; english: string; element: string; focus: string; keywords: string[] }> = [
  { id: 'wands', name: '权杖', english: 'Wands', element: '火', focus: '行动、创造力、热情与个人意志', keywords: ['行动', '灵感', '勇气'] },
  { id: 'cups', name: '圣杯', english: 'Cups', element: '水', focus: '情感、关系、直觉与内在需要', keywords: ['情感', '关系', '直觉'] },
  { id: 'swords', name: '宝剑', english: 'Swords', element: '风', focus: '思想、沟通、冲突与决定', keywords: ['思考', '沟通', '真相'] },
  { id: 'pentacles', name: '星币', english: 'Pentacles', element: '土', focus: '资源、身体、工作与长期安全', keywords: ['现实', '资源', '稳定'] },
]

const ranks = [
  { cn: '王牌', en: 'Ace', key: '种子', up: '一股纯粹的新能量已经出现。先确认它值得投入，再用一个具体动作让潜力进入现实。', rev: '机会被延迟、能量受阻或准备不足。不要急着否定可能性，先清理阻塞并缩小第一步。' },
  { cn: '二', en: 'Two', key: '选择', up: '两种力量需要协调。保留差异，同时作出足以让局面继续前进的选择。', rev: '犹豫、失衡或回避沟通正在扩大分歧。明确优先级，不要让暂缓变成长期停滞。' },
  { cn: '三', en: 'Three', key: '发展', up: '最初投入开始形成回响。协作、拓展视野与及时反馈能让成果继续生长。', rev: '合作不顺、期待落差或基础不足。回到共同目标，修正分工与质量标准。' },
  { cn: '四', en: 'Four', key: '稳定', up: '结构已经形成，适合休整、巩固和确认边界。稳定不是停滞，而是为下一步保存力量。', rev: '过度防守或根基松动带来不安。分辨哪些边界提供保护，哪些只是对变化的抗拒。' },
  { cn: '五', en: 'Five', key: '挑战', up: '冲突或匮乏暴露出真实问题。先照顾损失，再从仍可使用的资源中重建秩序。', rev: '紧张开始缓和，但旧伤仍需处理。避免表面和解，确认真正的问题得到回应。' },
  { cn: '六', en: 'Six', key: '流动', up: '局势进入修复与过渡。接受合理支持，也要保持给予与接受之间的尊重和平衡。', rev: '交换不对等、旧事未清或过渡受阻。检查隐性条件，并重新定义公平。' },
  { cn: '七', en: 'Seven', key: '考验', up: '选择增多，考验也随之出现。守住核心价值，用事实筛选诱惑、压力与短期收益。', rev: '混乱正在逼近决断。减少选项，停止自我欺骗，把注意力放回真正可控的部分。' },
  { cn: '八', en: 'Eight', key: '推进', up: '重复练习与集中投入正在加速进程。保持节奏，把复杂目标拆成可验证的连续步骤。', rev: '忙碌未必等于进展。流程、技能或方向需要修正，先停止无效重复。' },
  { cn: '九', en: 'Nine', key: '成熟', up: '成果接近完成，同时需要维护边界和体力。相信经验，但不要因警觉而拒绝所有支持。', rev: '疲惫、孤立或最后阶段的自我怀疑正在放大。恢复资源，重新判断哪些防御仍有必要。' },
  { cn: '十', en: 'Ten', key: '完成', up: '一个周期达到峰值，成果与责任同时增加。完成交付，也要思考什么应被延续或放下。', rev: '负担过重或结尾拖延。重新分配责任，停止把所有事情都当成必须独自完成。' },
  { cn: '侍从', en: 'Page', key: '讯息', up: '以学习者姿态接近新的讯息。保持好奇，先观察和试验，不必急于证明成熟。', rev: '消息不完整、经验不足或表达幼稚。核实来源，并把冲动转化为可学习的反馈。' },
  { cn: '骑士', en: 'Knight', key: '追寻', up: '能量正在朝目标快速移动。勇敢推进，同时让速度服从方向与承诺。', rev: '急躁、极端或行动反复。暂停加速，检查你追逐的是目标本身还是被认可的感觉。' },
  { cn: '王后', en: 'Queen', key: '掌握', up: '成熟力量以内在稳定呈现。照顾细节、信任经验，并用有边界的支持影响环境。', rev: '情绪耗竭、内在不安或过度照顾他人。先恢复自己的中心，再决定能够给予多少。' },
  { cn: '国王', en: 'King', key: '领导', up: '你被邀请以成熟、负责的方式运用力量。做出清晰决定，并为长期影响承担责任。', rev: '权力失衡、固执或逃避责任。减少控制欲，让权威重新建立在能力与可信度上。' },
]

const themeFocus: Record<Theme, string> = {
  love: '在关系中，这张牌要求你观察彼此真实需要、沟通方式与边界，而不是只依据一时的吸引或不安。',
  career: '在事业中，它强调角色、能力与长期方向的匹配。把抽象期待转化为明确责任与可验证的下一步。',
  wealth: '在财富层面，它提醒你同时看现金流、风险承受度与长期价值，避免由情绪替代审慎判断。',
  life: '在人生议题上，它邀请你把当下经验纳入更长的成长周期，看见正在形成的新能力与新边界。',
  free: '面对你的问题，它建议先区分事实、感受与推测，再把注意力放回能够实际影响的部分。',
}

function majorCard(seed: MajorSeed, index: number): TarotCard {
  const [name, englishName, keywords, upright, reversed] = seed
  const readings = Object.fromEntries((Object.keys(themeFocus) as Theme[]).map(theme => [theme, `${themeFocus[theme]} ${upright}`])) as Record<Theme, string>
  return {
    id: `major-${index}`,
    name,
    englishName,
    category: 'major',
    number: index === 0 ? '0' : String(index),
    keywords,
    image: cardImage,
    upright,
    reversed,
    readings,
    advice: `先用一句话写下你真正想保护或改变的事，再选择一个二十四小时内能够完成的行动。${keywords[0]}需要通过现实反馈，而不只是停留在理解中。`,
  }
}

function minorCard(suit: typeof suits[number], rank: typeof ranks[number], index: number): TarotCard {
  const name = `${suit.name}${rank.cn}`
  const context = `${suit.name}对应${suit.element}元素，关乎${suit.focus}。`
  const readings = Object.fromEntries((Object.keys(themeFocus) as Theme[]).map(theme => [theme, `${themeFocus[theme]} ${context}${rank.up}`])) as Record<Theme, string>
  return {
    id: `${suit.id}-${index + 1}`,
    name,
    englishName: `${rank.en} of ${suit.english}`,
    category: suit.id,
    number: String(index + 1),
    keywords: [rank.key, ...suit.keywords.slice(0, 2)],
    image: cardImage,
    upright: `${context}${rank.up} 此牌的核心不是追求立刻确定，而是让${suit.focus}在合适的节奏中逐步显现。`,
    reversed: `${context}${rank.rev} 逆位并非单纯的坏消息，它更像是能量向内、过度或不足的提醒。`,
    readings,
    advice: `围绕“${rank.key}”列出一个可观察事实和一个真实感受，再完成最小的现实动作。让${suit.keywords[0]}拥有边界和节奏。`,
  }
}

export const tarotDeck: TarotCard[] = [
  ...majors.map(majorCard),
  ...suits.flatMap(suit => ranks.map((rank, index) => minorCard(suit, rank, index))),
]

export const categoryNames: Record<Suit, string> = {
  major: '大阿卡纳',
  wands: '权杖',
  cups: '圣杯',
  swords: '宝剑',
  pentacles: '星币',
}

export const themeNames: Record<Theme, string> = {
  love: '爱情',
  career: '事业',
  wealth: '财富',
  life: '人生',
  free: '自由问题',
}

export const spreads = {
  single: { name: '单牌指引', positions: ['今日指引'], description: '用一张牌照亮此刻最重要的讯息' },
  three: { name: '时间之流', positions: ['过去', '现在', '未来'], description: '看见问题如何形成，以及能量将向何处流动' },
  love: { name: '关系镜像', positions: ['自己', '对方', '关系发展'], description: '理解双方状态与关系中的共同课题' },
  career: { name: '事业罗盘', positions: ['当前状态', '阻碍', '建议'], description: '辨认工作局势、关键阻力与可行行动' },
} as const

export function assertCompleteDeck() {
  const ids = new Set(tarotDeck.map(card => card.id))
  return tarotDeck.length === 78 && ids.size === 78 && tarotDeck.every(card =>
    card.name && card.englishName && card.keywords.length >= 3 && card.upright && card.reversed && card.advice && card.image,
  )
}
