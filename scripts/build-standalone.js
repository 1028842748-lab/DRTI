/**
 * [INPUT]: data/*.json + public/pic/*.png
 * [OUTPUT]: drti-v3-standalone.html
 * [POS]: 打包脚本 — 按 v2 UI 生成可直接 drop 的单文件 HTML
 * [PROTOCOL]: 只读不改，所有资源内联
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJSON = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'))
const readImg = (p) => {
  const buf = readFileSync(resolve(ROOT, 'public', p))
  const ext = p.endsWith('.jpg') || p.endsWith('.jpeg') ? 'jpeg' : 'png'
  return `data:image/${ext};base64,${buf.toString('base64')}`
}

const questions = readJSON('data/questions.json')
const dimensions = readJSON('data/dimensions.json')
const types = readJSON('data/types.json')
const config = readJSON('data/config.json')

const typesEmbedded = types.map((t) => ({
  ...t,
  image: readImg(t.image),
}))

const qrDataUri = readImg('pic/download.jpg')
const qrTestWebUri = readImg('pic/test_web.png')
const logoUri = readImg('pic/医渡智循.png')

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.display.title}</title>
  <meta name="description" content="${config.display.subtitle}" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🩺</text></svg>" />
  <style>
:root {
  --bg: #faf8f5;
  --card-bg: #ffffff;
  --text: #2c2c2c;
  --text-secondary: #777;
  --accent: #3d5a80;
  --accent-light: #f0f4f8;
  --accent-hover: #2c4a6e;
  --border: #e4e0dc;
  --radius: 14px;
  --shadow: 0 2px 16px rgba(0,0,0,0.06);
  --font: 'PingFang HK', 'PingFang SC', system-ui, -apple-system, 'Segoe UI', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --max-width: 640px;
}
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100dvh; }
#app { max-width: var(--max-width); margin: 0 auto; padding: 16px; min-height: 100dvh; display: flex; align-items: center; justify-content: center; }
.page { display: none; width: 100%; }
.page.active { display: block; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.card { background: var(--card-bg); border-radius: var(--radius); padding: 32px 24px; box-shadow: var(--shadow); }
.intro-card { text-align: center; padding: 56px 24px; }
.intro-title { font-size: 2rem; font-weight: 800; line-height: 1.3; margin-bottom: 12px; color: var(--text); }
.intro-subtitle { font-size: 1rem; color: var(--text-secondary); margin-bottom: 36px; }
.intro-note { margin-top: 16px; font-size: 0.8rem; color: var(--text-secondary); opacity: 0.6; }
.btn { display: inline-block; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--font); }
.btn-primary { background: var(--accent); color: #fff; padding: 14px 48px; }
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-secondary { background: var(--accent-light); color: var(--accent); padding: 12px 36px; }
.btn-secondary:hover { background: var(--border); }
.btn-option { display: block; width: 100%; text-align: left; padding: 14px 18px; margin-bottom: 10px; background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.95rem; font-weight: 400; line-height: 1.5; font-family: var(--font); }
@media (hover: hover) { .btn-option:hover { border-color: var(--accent); background: var(--accent-light); } }
.btn-option--selected { background: var(--accent); color: #fff; border-color: var(--accent); }
@media (hover: hover) { .btn-option--selected:hover { background: var(--accent); color: #fff; border-color: var(--accent); } }
.btn-back { display: block; margin-top: 12px; padding: 6px 2px; background: none; border: none; color: var(--text-secondary); font-size: 0.85rem; font-family: var(--font); cursor: pointer; transition: color 0.2s; }
.btn-back:hover { color: var(--accent); }
.btn-back[hidden] { display: none; }
.quiz-card { padding: 24px 20px; }
.progress-bar { height: 4px; background: var(--accent-light); border-radius: 2px; overflow: hidden; margin-bottom: 8px; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s ease; width: 0%; }
.progress-text { font-size: 0.8rem; color: var(--text-secondary); text-align: right; margin-bottom: 24px; }
.question-area { margin-bottom: 24px; }
.question-text { font-size: 1.05rem; font-weight: 500; line-height: 1.7; color: var(--text); }
.result-card { text-align: center; padding: 32px 60px; }
.result-image-frame { background: var(--accent-light); border-radius: 12px; padding: 14px; margin-bottom: 16px; }
.result-image-inner { background: #fff; border-radius: 10px; padding: 12px; }
.result-image { display: block; width: 100%; height: auto; border-radius: 8px; }
.result-kicker { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; letter-spacing: 0.05em; }
.result-name-row { display: flex; align-items: baseline; justify-content: center; gap: 10px; margin-bottom: 4px; }
.result-name { font-size: 2rem; font-weight: 900; color: var(--accent); letter-spacing: 0.05em; }
.result-badge { font-size: 1.5rem; color: var(--text-secondary); font-weight: 500; }
.result-code { display: inline-block; background: var(--accent-light); color: var(--accent); padding: 6px 20px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.03em; }
.result-desc { font-size: 0.85rem; color: var(--text); text-align: left; line-height: 1.8; margin-bottom: 20px; padding: 14px 16px; background: var(--accent-light); border-radius: 10px; }
.result-desc p { text-indent: 2em; margin: 0; }
.result-desc p + p { margin-top: 10px; }
.section-title { font-size: 1rem; font-weight: 700; color: var(--text); margin: 28px 0 16px; text-align: center; }
.axis-bars { text-align: left; margin-bottom: 28px; padding: 0 4px; }
.axis-row { margin-bottom: 18px; }
.axis-labels { display: flex; justify-content: space-between; margin-bottom: 6px; }
.axis-label-left, .axis-label-right { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
.axis-bar-track { position: relative; height: 8px; background: var(--border); border-radius: 4px; overflow: visible; }
.axis-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
.axis-bar-marker { position: absolute; top: -6px; transform: translateX(-50%); width: 20px; height: 20px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.axis-bar-letter { font-size: 0.65rem; font-weight: 800; color: #fff; }
.result-next-step { margin: 20px 0; padding: 14px 16px; background: var(--accent-light); border-radius: 10px; font-size: 0.88rem; color: var(--text); line-height: 1.7; text-align: left; }
.qr-promo { margin: 28px 0 8px; text-align: center; }
.qr-code { width: 120px; height: 120px; border-radius: 8px; }
.qr-tagline { margin-top: 10px; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; }
.disclaimer { margin-top: 20px; padding: 14px 16px; background: #f5f5f5; border-radius: 8px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; text-align: center; }
.result-actions { margin-top: 24px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
@media (max-width: 480px) {
  .intro-title { font-size: 1.6rem; }
  .card { padding: 24px 16px; }
}
  </style>
</head>
<body>
  <div id="app">
    <section id="page-intro" class="page active">
      <div class="card intro-card">
        <h1 class="intro-title">${config.display.title}</h1>
        <p class="intro-subtitle">${config.display.subtitle}</p>
        <button id="btn-start" class="btn btn-primary">开始测试</button>
        <p class="intro-note">16 题 · 约 2 分钟 · 仅供娱乐</p>
      </div>
    </section>

    <section id="page-quiz" class="page">
      <div class="card quiz-card">
        <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
        <div class="progress-text" id="progress-text">1 / 16</div>
        <div class="question-area"><p class="question-text" id="question-text"></p></div>
        <div id="options"></div>
        <button id="btn-back" class="btn-back" hidden>← 上一题</button>
      </div>
    </section>

    <section id="page-result" class="page">
      <div class="card result-card">
        <div class="result-image-frame"><div class="result-image-inner"><img class="result-image" id="result-image" src="" alt="" /></div></div>
        <div class="result-kicker">你的主类型</div>
        <div class="result-name-row"><span class="result-name" id="result-name"></span><span class="result-badge" id="result-badge"></span></div>
        <div class="result-code" id="result-code"></div>
        <div class="result-desc" id="result-desc"></div>
        <h3 class="section-title">四维评分</h3>
        <div class="axis-bars" id="axis-bars"></div>
        <div class="result-next-step" id="result-next-step"></div>
        <div class="qr-promo">
          <img class="qr-code" src="${qrDataUri}" alt="医渡智循下载二维码" />
          <p class="qr-tagline">医渡智循，专为临床医生、医学研究者打造的医学循证 AI 助手<br>扫描下载，医生认证即送 6 个月免费 VIP！临床问题随时问，最新文献随意搜，个人知识库轻松管！</p>
        </div>
        <div class="disclaimer" id="disclaimer">${config.display.funNote}</div>
        <div class="result-actions">
          <button id="btn-share" class="btn btn-primary">分享此测试</button>
          <button id="btn-download" class="btn btn-primary">保存分享图片</button>
          <button id="btn-restart" class="btn btn-secondary">重新测试</button>
        </div>
      </div>
    </section>
  </div>

  <script>
    var AXES = ${JSON.stringify(dimensions.axes)};
    var QUESTIONS = ${JSON.stringify(questions)};
    var TYPES = ${JSON.stringify(typesEmbedded)};
    var typeMap = Object.fromEntries(TYPES.map(function(t){ return [t.code, t]; }));

    /* -- shuffle -- */
    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }

    /* -- state -- */
    var ADVANCE_DELAY = 150;
    var queue = [];
    var current = 0;
    var answers = {};
    var selectedKeys = {};
    var locked = false;
    var lastType = null;
    var lastAxisScores = null;

    var pages = {
      intro: document.getElementById('page-intro'),
      quiz: document.getElementById('page-quiz'),
      result: document.getElementById('page-result')
    };
    var els = {
      fill: document.getElementById('progress-fill'),
      text: document.getElementById('progress-text'),
      qText: document.getElementById('question-text'),
      options: document.getElementById('options'),
      back: document.getElementById('btn-back')
    };

    els.back.addEventListener('click', function() {
      if (locked || current === 0) return;
      current--;
      renderQuestion();
    });

    function showPage(name) {
      for (var k in pages) pages[k].classList.remove('active');
      pages[name].classList.add('active');
      window.scrollTo(0, 0);
    }

    /* -- quiz -- */
    function renderQuestion() {
      locked = false;
      var q = queue[current];
      els.qText.textContent = q.text;
      els.options.innerHTML = '';
      var step = current + 1;
      var pct = (step / queue.length) * 100;
      els.fill.style.width = pct + '%';
      els.text.textContent = step + ' / ' + queue.length;
      els.back.hidden = current === 0;

      var prevKey = selectedKeys[q.id];
      q.options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'btn btn-option';
        btn.textContent = opt.text;
        if (prevKey === opt.key) btn.classList.add('btn-option--selected');
        btn.addEventListener('click', function() {
          if (locked) return;
          locked = true;
          var sel = els.options.querySelectorAll('.btn-option--selected');
          for (var i = 0; i < sel.length; i++) sel[i].classList.remove('btn-option--selected');
          btn.classList.add('btn-option--selected');
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          answers[q.id] = opt.score;
          selectedKeys[q.id] = opt.key;
          setTimeout(function() {
            current++;
            if (current >= queue.length) {
              els.fill.style.width = '100%';
              els.text.textContent = queue.length + ' / ' + queue.length;
              onComplete();
            } else {
              renderQuestion();
            }
          }, ADVANCE_DELAY);
        });
        els.options.appendChild(btn);
      });
    }

    function startQuiz() {
      queue = QUESTIONS.slice();
      current = 0;
      answers = {};
      selectedKeys = {};
      locked = false;
      renderQuestion();
      showPage('quiz');
    }

    /* -- scoring -- */
    function calcAxisScores() {
      var scores = {};
      QUESTIONS.forEach(function(q) {
        if (answers[q.id] == null) return;
        scores[q.axis] = (scores[q.axis] || 0) + answers[q.id];
      });
      return scores;
    }

    function scoresToCode(axisScores) {
      var code = '';
      AXES.forEach(function(a) {
        var s = axisScores[a.key] || 0;
        code += s <= 0 ? a.left : a.right;
      });
      return code;
    }

    /* -- result -- */
    function onComplete() {
      var axisScores = calcAxisScores();
      var code = scoresToCode(axisScores);
      var type = typeMap[code];
      if (!type) return;

      lastType = type;
      lastAxisScores = axisScores;
      var primary = type.palette[0], accent = type.palette[1], bg = type.palette[2];
      var root = document.documentElement;
      root.style.setProperty('--accent', primary);
      root.style.setProperty('--accent-light', bg);
      root.style.setProperty('--accent-hover', accent);

      document.getElementById('result-image').src = type.image;
      document.getElementById('result-image').alt = type.cn;
      document.getElementById('result-code').textContent = type.code;
      document.getElementById('result-name').textContent = type.cn;
      document.getElementById('result-badge').textContent = type.code_en;
      var descEl = document.getElementById('result-desc');
      var descMid = Math.floor(type.description.length / 2);
      var descSplit = type.description.indexOf('。', descMid);
      if (descSplit > 0 && descSplit < type.description.length - 1) {
        descEl.innerHTML = '<p>' + type.description.slice(0, descSplit + 1) + '</p><p>' + type.description.slice(descSplit + 1) + '</p>';
      } else {
        descEl.innerHTML = '<p>' + type.description + '</p>';
      }
      document.getElementById('result-next-step').innerHTML = type.next_step.replace(
        '医渡智循',
        '<strong style="color:' + primary + ';font-weight:700">医渡智循</strong>'
      );

      var barsEl = document.getElementById('axis-bars');
      barsEl.innerHTML = '';
      AXES.forEach(function(axis) {
        var score = axisScores[axis.key] || 0;
        var pct = ((score + 4) / 8) * 100;
        var row = document.createElement('div');
        row.className = 'axis-row';
        row.innerHTML =
          '<div class="axis-labels">' +
            '<span class="axis-label-left">' + axis.leftLabel + '-' + axis.left + '</span>' +
            '<span class="axis-label-right">' + axis.rightLabel + '-' + axis.right + '</span>' +
          '</div>' +
          '<div class="axis-bar-track">' +
            '<div class="axis-bar-fill" style="width:' + pct + '%;background:' + accent + '"></div>' +
            '<div class="axis-bar-marker" style="left:' + pct + '%">' +
              '<span class="axis-bar-letter">' + (score <= 0 ? axis.left : axis.right) + '</span>' +
            '</div>' +
          '</div>';
        barsEl.appendChild(row);
      });

      showPage('result');
    }

    /* -- events -- */
    document.getElementById('btn-start').addEventListener('click', startQuiz);
    document.getElementById('btn-restart').addEventListener('click', startQuiz);
    document.getElementById('btn-share').addEventListener('click', async function() {
      var isWebUrl = /^https?:$/.test(window.location.protocol);
      var url = isWebUrl
        ? (window.location.origin + window.location.pathname)
        : 'https://github.com/1028842748-lab/DRTI';
      var text = '我刚测了一个医生版 DRTI，测你在医院里是哪种生物。你也来试试。';
      if (navigator.share) {
        try { await navigator.share({ title: '${config.display.title}', text: text, url: url }); return; } catch(_) {}
      }
      try { await navigator.clipboard.writeText(text + '\\n' + url); } catch(_) {}
      var btn = document.getElementById('btn-share');
      btn.textContent = '已复制，去粘贴分享吧';
      setTimeout(function() { btn.textContent = '分享此测试'; }, 2500);
    });

    /* -- share image -- */
    var QR_TEST_WEB = '${qrTestWebUri}';
    var LOGO_URI = '${logoUri}';

    function shareRoundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function shareLoadImage(src) {
      return new Promise(function(resolve, reject) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() { resolve(img); };
        img.onerror = reject;
        img.src = src;
      });
    }

    function shareSplitParagraph(text) {
      var mid = Math.floor(text.length / 2);
      var idx = text.indexOf('。', mid);
      if (idx > 0 && idx < text.length - 1) return [text.slice(0, idx + 1), text.slice(idx + 1)];
      return [text];
    }

    function shareWrapText(ctx, text, maxWidth) {
      var noBrk = '，。、；：！？）》」』】…—~·,.!?;:)\\'\\\"';
      var lines = [], line = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        var test = line + ch;
        if (ctx.measureText(test).width > maxWidth && line) {
          var next = text[i + 1];
          if (next && noBrk.indexOf(next) >= 0) { line = test; continue; }
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    async function generateShareImage(type, axisScores) {
      var primary = type.palette[0], accent = type.palette[1], bg = type.palette[2];
      var dpr = 2, W = 720, padX = 32, cardPadX = 60;
      var contentX = padX + cardPadX, contentW = W - padX * 2 - cardPadX * 2;
      var font = '"PingFang HK", "PingFang SC", system-ui, sans-serif';

      var mCtx = document.createElement('canvas').getContext('2d');
      mCtx.font = '400 14px ' + font;
      var descPad = 16, descTextW = contentW - descPad * 2;
      var descParas = shareSplitParagraph(type.description);
      var descLines = [];
      descParas.forEach(function(para, i) {
        var lines = shareWrapText(mCtx, '\\u3000\\u3000' + para, descTextW);
        if (i > 0) descLines.push('');
        descLines = descLines.concat(lines);
      });
      var framePad = 14, innerPad = 12;
      var img = null, imgFrameH = 0;
      try {
        img = await shareLoadImage(type.image);
        var imgInnerW = contentW - (framePad + innerPad) * 2;
        var imgInnerH = (imgInnerW / img.naturalWidth) * img.naturalHeight;
        imgFrameH = imgInnerH + (framePad + innerPad) * 2;
      } catch(e) {}

      var logoH = 36;
      var logo = null;
      try { logo = await shareLoadImage(LOGO_URI); } catch(e) {}

      var layoutVals = [logo ? logoH + 20 : 0, 40, imgFrameH > 0 ? imgFrameH + 16 : 0, 22 + 36 + 40 + 10,
        descLines.length * 24 + descPad * 2 + 20,
        24 + 80 + 10 + 24, 52, 40];
      var H = padX * 2;
      layoutVals.forEach(function(v) { H += v; });

      var canvas = document.createElement('canvas');
      canvas.width = W * dpr; canvas.height = H * dpr;
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      var cardX = padX, cardY = padX, cardW = W - padX * 2;
      shareRoundRect(ctx, cardX, cardY, cardW, H - padX * 2, 20);
      ctx.fillStyle = '#ffffff'; ctx.fill();

      var y = cardY;

      // logo
      if (logo) {
        var logoW = (logoH / logo.naturalHeight) * logo.naturalWidth;
        ctx.drawImage(logo, cardX + 20, y + 24, logoW, logoH);
        y += logoH + 20;
      }

      y += 40;

      // image frame
      if (img) {
        var frameW = contentW;
        var iiW = frameW - (framePad + innerPad) * 2;
        var iiH = (iiW / img.naturalWidth) * img.naturalHeight;
        var frameH = iiH + (framePad + innerPad) * 2;

        shareRoundRect(ctx, contentX, y, frameW, frameH, 12);
        ctx.fillStyle = bg; ctx.fill();
        shareRoundRect(ctx, contentX + framePad, y + framePad, frameW - framePad * 2, frameH - framePad * 2, 10);
        ctx.fillStyle = '#ffffff'; ctx.fill();

        var imgX = contentX + framePad + innerPad, imgY2 = y + framePad + innerPad;
        ctx.save();
        shareRoundRect(ctx, imgX, imgY2, iiW, iiH, 8); ctx.clip();
        ctx.drawImage(img, imgX, imgY2, iiW, iiH);
        ctx.restore();
        y += frameH + 16;
      }

      // type info
      ctx.textAlign = 'center';
      ctx.font = '400 14px ' + font; ctx.fillStyle = '#777';
      ctx.fillText('你的主类型', W / 2, y + 12); y += 22;

      ctx.font = '900 32px ' + font;
      var cnW = ctx.measureText(type.cn).width;
      ctx.font = '500 24px ' + font;
      var enW = ctx.measureText(type.code_en).width;
      var rowX = (W - cnW - 10 - enW) / 2;

      ctx.font = '900 32px ' + font; ctx.fillStyle = primary; ctx.textAlign = 'left';
      ctx.fillText(type.cn, rowX, y + 28);
      ctx.font = '500 24px ' + font; ctx.fillStyle = '#777';
      ctx.fillText(type.code_en, rowX + cnW + 10, y + 28);
      ctx.textAlign = 'center'; y += 36;

      ctx.font = '600 15px ' + font;
      var bW = ctx.measureText(type.code).width + 40;
      shareRoundRect(ctx, (W - bW) / 2, y, bW, 32, 16);
      ctx.fillStyle = bg; ctx.fill();
      ctx.fillStyle = primary; ctx.fillText(type.code, W / 2, y + 21);
      y += 52;

      // description
      var dBH = descLines.length * 24 + descPad * 2;
      shareRoundRect(ctx, contentX, y, contentW, dBH, 10);
      ctx.fillStyle = bg; ctx.fill();
      ctx.textAlign = 'left'; ctx.font = '400 14px ' + font; ctx.fillStyle = '#2c2c2c';
      var dY = y + descPad + 12;
      descLines.forEach(function(line) { ctx.fillText(line, contentX + descPad, dY); dY += 24; });
      y += dBH + 20;

      // qr
      try {
        var qrImg = await shareLoadImage(QR_TEST_WEB);
        ctx.textAlign = 'center';
        ctx.font = '500 14px ' + font; ctx.fillStyle = '#777';
        ctx.fillText('测一测', W / 2, y + 12); y += 24;
        ctx.drawImage(qrImg, W / 2 - 40, y, 80, 80); y += 90;
        ctx.font = '500 14px ' + font; ctx.fillStyle = '#777';
        ctx.fillText('你在医院里是哪种生物', W / 2, y); y += 24;
      } catch(e) { y += 8; }

      // disclaimer
      ctx.textAlign = 'center';
      shareRoundRect(ctx, contentX, y, contentW, 36, 8);
      ctx.fillStyle = '#f5f5f5'; ctx.fill();
      ctx.font = '400 12px ' + font; ctx.fillStyle = '#aaa';
      ctx.fillText('本测试仅供娱乐，结果不代表任何专业评估。', W / 2, y + 22);

      var dataUrl = canvas.toDataURL('image/png');
      showShareOverlay(dataUrl);
    }

    function showShareOverlay(dataUrl) {
      var existing = document.getElementById('share-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.id = 'share-overlay';
      Object.assign(overlay.style, {
        position: 'fixed', inset: '0', zIndex: '9999',
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px', overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      });

      var tip = document.createElement('p');
      Object.assign(tip.style, {
        color: '#fff', fontSize: '15px',
        marginBottom: '16px', textAlign: 'center', flexShrink: '0'
      });
      tip.textContent = '长按图片保存到相册';

      var img = document.createElement('img');
      Object.assign(img.style, {
        maxWidth: '100%', maxHeight: '75vh',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      });
      img.src = dataUrl;

      var closeBtn = document.createElement('button');
      Object.assign(closeBtn.style, {
        marginTop: '20px', padding: '10px 32px',
        border: '1px solid rgba(255,255,255,0.5)', borderRadius: '20px',
        background: 'transparent', color: '#fff',
        fontSize: '14px', cursor: 'pointer', flexShrink: '0'
      });
      closeBtn.textContent = '关闭';
      closeBtn.addEventListener('click', function() { overlay.remove(); });

      overlay.appendChild(tip);
      overlay.appendChild(img);
      overlay.appendChild(closeBtn);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });

      document.body.appendChild(overlay);
    }

    document.getElementById('btn-download').addEventListener('click', async function(e) {
      if (!lastType) return;
      var btn = e.currentTarget;
      var original = btn.textContent;
      btn.textContent = '生成中…';
      btn.disabled = true;
      try {
        await generateShareImage(lastType, lastAxisScores);
      } catch (err) {
        console.error('generateShareImage failed:', err);
        alert('生成图片失败：' + (err && err.message ? err.message : err));
      } finally {
        btn.textContent = original;
        btn.disabled = false;
        if (btn.blur) btn.blur();
      }
    });
  </script>
</body>
</html>
`

const out = resolve(ROOT, 'drti-v3-standalone.html')
writeFileSync(out, html, 'utf8')
const sizeMB = (html.length / 1024 / 1024).toFixed(2)
console.log('Built: ' + out)
console.log('Size: ' + sizeMB + ' MB')
