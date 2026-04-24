/**
 * [INPUT]: (canvas, axisScores, axes, palette)
 * [OUTPUT]: Canvas 绘制 4 轴菱形雷达图
 * [POS]: 雷达图渲染器
 * [PROTOCOL]: 纯 Canvas API，无外部依赖
 */

export function drawRadar(canvas, axisScores, axes, palette) {
  const [primary, accent] = palette
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const size = 280
  canvas.width = size * dpr
  canvas.height = size * dpr
  canvas.style.width = size + 'px'
  canvas.style.height = size + 'px'
  ctx.scale(dpr, dpr)

  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 44
  const n = axes.length
  const step = (Math.PI * 2) / n
  const start = -Math.PI / 2

  ctx.clearRect(0, 0, size, size)

  for (let ring = 4; ring >= 1; ring--) {
    const r = (ring / 4) * maxR
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const angle = start + i * step
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = `${primary}${ring === 4 ? '12' : ring === 3 ? '0a' : '06'}`
    ctx.fill()
    ctx.strokeStyle = `${primary}20`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  ctx.font = '11px system-ui, "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < n; i++) {
    const angle = start + i * step
    const x = cx + Math.cos(angle) * maxR
    const y = cy + Math.sin(angle) * maxR

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.strokeStyle = `${primary}18`
    ctx.lineWidth = 0.5
    ctx.stroke()

    const lr = maxR + 28
    const lx = cx + Math.cos(angle) * lr
    const ly = cy + Math.sin(angle) * lr
    ctx.fillStyle = primary
    ctx.globalAlpha = 0.7
    ctx.fillText(axes[i].leftLabel + ' / ' + axes[i].rightLabel, lx, ly)
    ctx.globalAlpha = 1
  }

  const values = axes.map((a) => {
    const score = axisScores[a.key] || 0
    return (score + 10) / 20
  })

  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = start + i * step
    const r = Math.max(0.05, values[i]) * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = `${accent}40`
  ctx.fill()
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  ctx.stroke()

  for (let i = 0; i < n; i++) {
    const angle = start + i * step
    const r = Math.max(0.05, values[i]) * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = accent
    ctx.fill()
  }
}
