export type Line = {
  model: string
  dir: string
  branch: string | null
  tokIn: number
  tokOut: number
  ctxPct: number | null
  cost: number | null
  h5: number | null
  d7: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'status-band': { line: Line }
  }
}
