/**
 * [INPUT]: (arr: Array)
 * [OUTPUT]: (Array) — 新数组，Fisher-Yates 洗牌
 * [POS]: 通用工具函数
 * [PROTOCOL]: 纯函数，无副作用
 */

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
