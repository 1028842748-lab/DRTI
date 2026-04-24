/**
 * [INPUT]: (type, axisScores, axes)
 * [OUTPUT]: 下载 PNG 分享图
 * [POS]: 分享图生成器 — 图片 + description + 二维码 + disclaimer
 * [PROTOCOL]: 纯 Canvas API，无外部依赖
 */

export async function generateShareImage(type, axisScores, axes) {
  const [primary, accent, bg] = type.palette
  const dpr = 2
  const W = 720
  const padX = 32
  const cardPadX = 60
  const contentX = padX + cardPadX
  const contentW = W - padX * 2 - cardPadX * 2

  const measureCtx = document.createElement('canvas').getContext('2d')

  measureCtx.font = '400 14px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  const descPad = 16
  const descTextW = contentW - descPad * 2
  const descParas = splitParagraph(type.description)
  const descLines = descParas.flatMap((para, i) => {
    const indent = '　　'
    const lines = wrapText(measureCtx, indent + para, descTextW)
    if (i > 0) lines.unshift('')
    return lines
  })
  const framePad = 14
  const innerPad = 12
  let img = null
  let imgFrameH = 0
  try {
    img = await loadImage(type.image)
    const imgInnerW = contentW - (framePad + innerPad) * 2
    const imgInnerH = (imgInnerW / img.naturalWidth) * img.naturalHeight
    imgFrameH = imgInnerH + (framePad + innerPad) * 2
  } catch (e) { /* skip */ }

  let logo = null
  const logoH = 36
  try { logo = await loadImage('pic/医渡智循.png') } catch (e) { /* skip */ }

  const layout = {
    logoH: logo ? logoH + 20 : 0,
    topPad: 40,
    imgH: imgFrameH > 0 ? imgFrameH + 16 : 0,
    typeInfoH: 22 + 36 + 40 + 10,
    descH: descLines.length * 24 + descPad * 2 + 20,
    qrH: 24 + 80 + 10 + 24,
    disclaimerH: 52,
    bottomPad: 40,
  }
  const cardContentH = Object.values(layout).reduce((a, b) => a + b, 0)
  const H = cardContentH + padX * 2

  const canvas = document.createElement('canvas')
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const cardX = padX, cardY = padX, cardW = W - padX * 2, cardH = H - padX * 2
  roundRect(ctx, cardX, cardY, cardW, cardH, 20)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  let y = cardY

  // --- Logo 左上角 ---
  if (logo) {
    const logoW = (logoH / logo.naturalHeight) * logo.naturalWidth
    ctx.drawImage(logo, cardX + 20, y + 24, logoW, logoH)
    y += logoH + 20
  }

  y += layout.topPad

  // --- 图片（accent-light 外框 → 白色内框 → 图片） ---
  if (img) {
    const frameW = contentW
    const imgInnerW = frameW - (framePad + innerPad) * 2
    const imgInnerH = (imgInnerW / img.naturalWidth) * img.naturalHeight
    const frameH = imgInnerH + (framePad + innerPad) * 2
    const frameX = contentX

    roundRect(ctx, frameX, y, frameW, frameH, 12)
    ctx.fillStyle = bg
    ctx.fill()

    roundRect(ctx, frameX + framePad, y + framePad, frameW - framePad * 2, frameH - framePad * 2, 10)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    const imgX = frameX + framePad + innerPad
    const imgY = y + framePad + innerPad
    const imgW = frameW - (framePad + innerPad) * 2
    const imgH = (imgW / img.naturalWidth) * img.naturalHeight
    ctx.save()
    roundRect(ctx, imgX, imgY, imgW, imgH, 8)
    ctx.clip()
    ctx.drawImage(img, imgX, imgY, imgW, imgH)
    ctx.restore()

    y += frameH + 16
  }

  // --- 你的主类型 + 中文名 + 英文名（同一行）+ Code badge ---
  ctx.textAlign = 'center'
  ctx.font = '400 14px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  ctx.fillStyle = '#777'
  ctx.fillText('你的主类型', W / 2, y + 12)
  y += 22

  ctx.font = '900 32px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  const cnW = ctx.measureText(type.cn).width
  ctx.font = '500 24px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  const enW = ctx.measureText(type.code_en).width
  const rowGap = 10
  const rowW = cnW + rowGap + enW
  const rowX = (W - rowW) / 2

  ctx.font = '900 32px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  ctx.fillStyle = primary
  ctx.textAlign = 'left'
  ctx.fillText(type.cn, rowX, y + 28)

  ctx.font = '500 24px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  ctx.fillStyle = '#777'
  ctx.fillText(type.code_en, rowX + cnW + rowGap, y + 28)
  ctx.textAlign = 'center'
  y += 36

  const badgeText = type.code
  ctx.font = '600 15px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  const badgeW = ctx.measureText(badgeText).width + 40
  const badgeH = 32
  const badgeX = (W - badgeW) / 2
  roundRect(ctx, badgeX, y, badgeW, badgeH, 16)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.fillStyle = primary
  ctx.fillText(badgeText, W / 2, y + 21)
  y += 40 + 12

  // --- Description ---
  const descBoxH = descLines.length * 24 + descPad * 2
  roundRect(ctx, contentX, y, contentW, descBoxH, 10)
  ctx.fillStyle = bg
  ctx.fill()

  ctx.textAlign = 'left'
  ctx.font = '400 14px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  ctx.fillStyle = '#2c2c2c'
  let descY = y + descPad + 12
  for (const line of descLines) {
    ctx.fillText(line, contentX + descPad, descY)
    descY += 24
  }
  y += descBoxH + 20

  // --- 二维码 ---
  try {
    const qrImg = await loadImage('pic/test_web.png')
    const qrSize = 80

    ctx.textAlign = 'center'
    ctx.font = '500 14px "PingFang HK", "PingFang SC", system-ui, sans-serif'
    ctx.fillStyle = '#777'
    ctx.fillText('测一测', W / 2, y + 12)
    y += 24

    ctx.drawImage(qrImg, W / 2 - qrSize / 2, y, qrSize, qrSize)
    y += qrSize + 10

    ctx.font = '500 14px "PingFang HK", "PingFang SC", system-ui, sans-serif'
    ctx.fillStyle = '#777'
    ctx.fillText('你在医院里是哪种生物', W / 2, y)
    y += 24
  } catch (e) {
    y += 8
  }

  // --- Disclaimer ---
  ctx.textAlign = 'center'
  roundRect(ctx, contentX, y, contentW, 36, 8)
  ctx.fillStyle = '#f5f5f5'
  ctx.fill()
  ctx.font = '400 12px "PingFang HK", "PingFang SC", system-ui, sans-serif'
  ctx.fillStyle = '#aaa'
  ctx.fillText('本测试仅供娱乐，结果不代表任何专业评估。', W / 2, y + 22)

  const link = document.createElement('a')
  link.download = `DRTI-${type.code}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function splitParagraph(text) {
  const mid = Math.floor(text.length / 2)
  const idx = text.indexOf('。', mid)
  if (idx > 0 && idx < text.length - 1) {
    return [text.slice(0, idx + 1), text.slice(idx + 1)]
  }
  return [text]
}

function wrapText(ctx, text, maxWidth) {
  const noBrk = '，。、；：！？）》」』】…—~·,.!?;:)]\'"'
  const lines = []
  let line = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      const next = text[i + 1]
      if (next && noBrk.includes(next)) {
        line = test
        continue
      }
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
