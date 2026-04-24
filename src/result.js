/**
 * [INPUT]: (type: Object, axisScores: Object, dimensions: Object, config: Object)
 * [OUTPUT]: DOM 渲染结果页
 * [POS]: 结果页渲染器
 * [PROTOCOL]: 只做 DOM 操作，不做评分计算
 */

import { generateShareImage } from './share.js'

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderResult(type, axisScores, dimensions, config) {
  if (!type) return

  const [primary, accent, bg] = type.palette
  const root = document.documentElement
  root.style.setProperty('--accent', primary)
  root.style.setProperty('--accent-light', bg)
  root.style.setProperty('--accent-hover', accent)

  document.getElementById('result-image').src = type.image
  document.getElementById('result-image').alt = type.cn
  document.getElementById('result-code').textContent = type.code
  document.getElementById('result-name').textContent = type.cn
  document.getElementById('result-badge').textContent = type.code_en

  const descEl = document.getElementById('result-desc')
  const mid = Math.floor(type.description.length / 2)
  const splitIdx = type.description.indexOf('。', mid)
  if (splitIdx > 0 && splitIdx < type.description.length - 1) {
    const p1 = type.description.slice(0, splitIdx + 1)
    const p2 = type.description.slice(splitIdx + 1)
    descEl.innerHTML = `<p>${esc(p1)}</p><p>${esc(p2)}</p>`
  } else {
    descEl.innerHTML = `<p>${esc(type.description)}</p>`
  }

  const nsEl = document.getElementById('result-next-step')
  nsEl.innerHTML = type.next_step.replace(
    '医渡智循',
    `<strong style="color:${primary};font-weight:700">医渡智循</strong>`
  )

  const barsEl = document.getElementById('axis-bars')
  barsEl.innerHTML = ''
  for (const axis of dimensions.axes) {
    const score = axisScores[axis.key] || 0
    const pct = ((score + 10) / 20) * 100

    const row = document.createElement('div')
    row.className = 'axis-row'
    row.innerHTML = `
      <div class="axis-labels">
        <span class="axis-label-left">${axis.leftLabel}-${axis.left}</span>
        <span class="axis-label-right">${axis.rightLabel}-${axis.right}</span>
      </div>
      <div class="axis-bar-track">
        <div class="axis-bar-fill" style="width: ${pct}%; background: ${accent}"></div>
        <div class="axis-bar-marker" style="left: ${pct}%">
          <span class="axis-bar-letter">${score <= 0 ? axis.left : axis.right}</span>
        </div>
      </div>
    `
    barsEl.appendChild(row)
  }

  document.getElementById('disclaimer').textContent = config.display.funNote

  document.getElementById('btn-download').onclick = () => {
    generateShareImage(type, axisScores, dimensions.axes)
  }
}
