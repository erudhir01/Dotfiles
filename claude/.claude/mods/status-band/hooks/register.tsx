import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Line } from '../types'

const EMPTY: Line = {
  model: '?', dir: '', branch: null, tokIn: 0, tokOut: 0,
  ctxPct: null, cost: null, h5: null, d7: null,
}
const line = atom({ plugin: 'status-band', key: 'line' } as const, EMPTY)

// Catppuccin Mocha, as in statusline.py
const C = {
  blue: '#89b4fa', peach: '#fab387', green: '#a6e3a1', yellow: '#f9e2af',
  red: '#f38ba8', teal: '#94e2d5', mauve: '#cba6f7', overlay: '#6c7086',
}
const pctColor = (p: number) => (p < 50 ? C.green : p < 80 ? C.yellow : C.red)

// "claude-sonnet-5-5" -> "Sonnet 5.5"
const prettyModel = (id: string): string => {
  const m = id.match(/^claude-([a-z]+)-(\d+)(?:-(\d+))?/)
  if (!m) return id
  const name = m[1][0].toUpperCase() + m[1].slice(1)
  return `${name} ${m[2]}${m[3] ? '.' + m[3] : ''}`
}

const home = (p: string, h: string) => (h && p.startsWith(h) ? '~' + p.slice(h.length) : p)

async function refresh($: EngineInterface, homeDir: string) {
  const cwd = await $.session.cwd()
  const path = home(cwd, homeDir)
  const dir = path.replace(/\/+$/, '').split('/').pop() || path
  const id = await $.session.model()
  let branch: string | null = null
  try {
    const r = await $.process.run(
      ['git', '--no-optional-locks', '-C', cwd, 'branch', '--show-current'],
      { timeoutMs: 1000 },
    )
    if (r.exitCode === 0) branch = r.stdout.trim() || null
  } catch {}
  const u = await $.session.usage()
  const rl = (k: string) => u.rateLimits.find(x => x.kind === k)?.percentUsed ?? null
  await update($, line, l => ({
    ...l,
    model: prettyModel(id),
    dir,
    branch,
    ctxPct: u.context.percent ?? null,
    cost: u.cost?.usd ?? null,
    h5: rl('five_hour'),
    d7: rl('seven_day'),
  }))
}

export const register: Register = on => {
  let home_ = ''

  on('session.start', async ($, e, next) => {
    try {
      const r = await $.process.run(['sh', '-c', 'printf %s "$HOME"'])
      home_ = r.stdout
    } catch {}
    await refresh($, home_).catch(() => {})
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await refresh($, home_).catch(() => {})
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const u = e.usage
    if (u) {
      await update($, line, l => ({
        ...l,
        tokIn: l.tokIn + u.input_tokens,
        tokOut: l.tokOut + u.output_tokens,
      }))
    }
    await refresh($, home_).catch(() => {})
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const l = await read($, line)
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const parts: [string, string][] = []
    const add = (color: string, text: string) => {
      if (parts.length) parts.push([C.overlay, ' | '])
      parts.push([color, text])
    }
    add(C.blue, l.model)
    add(C.teal, l.dir)
    if (l.branch) add(C.mauve, ` ${l.branch}`)
    add(C.peach, `tok: ${l.tokIn}in/${l.tokOut}out`)
    if (l.ctxPct !== null) {
      const p = Math.round(l.ctxPct)
      parts.push([pctColor(p), ` (${p}% ctx)`])
    }
    if (l.cost !== null) add(C.green, `$${l.cost.toFixed(4)}`)
    const limits: [string, number][] = []
    if (l.h5 !== null) limits.push(['5h', Math.round(l.h5)])
    if (l.d7 !== null) limits.push(['7d', Math.round(l.d7)])
    limits.forEach(([k, p], i) => {
      if (i === 0) add(pctColor(p), `${k}:${p}%`)
      else parts.push([pctColor(p), ` ${k}:${p}%`])
    })

    return (
      <Box>
        {parts.map(([color, text]) => (
          <Text color={color}>{text}</Text>
        ))}
      </Box>
    )
  })
}
