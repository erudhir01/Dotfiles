import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Item, Kind } from '../types'

const items = atom({ plugin: 'topic-colors', key: 'items' } as const, [] as Item[])
const isHidden = atom({ plugin: 'topic-colors', key: 'isHidden' } as const, false)

const COLOR: Record<Kind, string> = { critical: 'red', warn: 'yellow', question: '#ff5fd7' }
const LABEL: Record<Kind, string> = { critical: 'Crítico', warn: 'Atenção', question: 'Pergunta' }

const MARKERS: readonly { kind: Kind; test: RegExp }[] = [
  { kind: 'critical', test: /^(🔴|(cr[ií]tico|perigo|erro|critical|danger|error)\b)/i },
  { kind: 'warn', test: /^(🟡|⚠️?|(aten[cç][aã]o|importante|aviso|cuidado|warning|important|caution)\b)/i },
  { kind: 'question', test: /^(🔵|(pergunta|question)\b)/i },
]

const kindOf = (block: string): Kind | undefined => {
  const head = block.replace(/^[\s>*_#-]+/, '')
  const m = MARKERS.find(m => m.test.test(head))
  if (m) return m.kind
  const isProse = !/^\s*([-*+]|\d+[.)]|\||```|~~~)/m.test(block)
  const end = block.trimEnd().replace(/[*_`)"'\s]+$/, '')
  return isProse && end.endsWith('?') && block.length < 800 ? 'question' : undefined
}

// Split on blank lines, never inside a code fence.
const blocks = (text: string): string[] => {
  const out: string[] = []
  let cur: string[] = []
  let inFence = false
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (!inFence && line.trim() === '' && cur.length) {
      out.push(cur.join('\n'))
      cur = []
    } else {
      cur.push(line)
    }
  }
  if (cur.length) out.push(cur.join('\n'))
  return out
}

const plain = (s: string) => s.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()

const PROMPT = [
  'Formatting rule from the user: they skim long replies and miss important points.',
  'Open any warning or caveat as its own paragraph starting with "Atenção:" (or "Crítico:" for dangerous or irreversible things).',
  'Put every question you need answered in its own short paragraph, last in the reply, ending with "?".',
  'Never bury a question or warning inside a long paragraph or list.',
].join(' ')

export const register: Register = on => {
  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    return { sections: [...r.sections, { id: 'topic-colors:format', text: PROMPT, scope: 'session' }] }
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, items, () => [])
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const found: Item[] = []
    for (const b of blocks(e.answer)) {
      const kind = kindOf(b)
      if (kind) found.push({ kind, text: plain(b) })
    }
    await update($, items, () => found)
    await update($, isHidden, () => false)
    return next(e)
  })

  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    const parts = blocks(e.props.text)
    if (!parts.some(kindOf)) return next(e)

    const { Box, Text, Markdown } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {parts.map(p => {
          const kind = kindOf(p)
          return kind ? (
            <Text color={COLOR[kind]} bold>{p.replace(/\*\*/g, '')}{'\n'}</Text>
          ) : (
            <Markdown text={p + '\n'} />
          )
        })}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, items)
    if (e.props.hasSurvey || list.length === 0 || (await read($, isHidden))) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const shown = list.slice(-5)

    return (
      <Box flexDirection="column">
        <Box>
          <Text bold>Pendências da última resposta ({list.length}) </Text>
          <Button key="hide" label="Ocultar" onPress={() => update($, isHidden, () => true)} />
        </Box>
        {shown.map(it => (
          <Text color={COLOR[it.kind]} wrap="truncate-end">
            {LABEL[it.kind]}: {it.text}
          </Text>
        ))}
      </Box>
    )
  })
}
