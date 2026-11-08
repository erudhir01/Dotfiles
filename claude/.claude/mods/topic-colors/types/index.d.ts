export type Kind = 'critical' | 'warn' | 'question'
export type Item = { kind: Kind; text: string }

declare module 'claude-code' {
  interface PluginState {
    'topic-colors': { items: Item[]; isHidden: boolean }
  }
}
