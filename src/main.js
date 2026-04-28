/**
 * [INPUT]: 4 JSON files (questions, dimensions, types, config)
 * [OUTPUT]: 完整的测试流程
 * [POS]: 入口模块 — 加载数据、串联 quiz → engine → result
 * [PROTOCOL]: 所有逻辑委派给子模块，此处只做胶水
 */

import { calcAxisScores, scoresToCode, lookupType } from './engine.js'
import { createQuiz } from './quiz.js'
import { renderResult } from './result.js'
import './style.css'

async function loadJSON(path) {
  const res = await fetch(path)
  return res.json()
}

async function init() {
  const [questions, dimensions, types, config] = await Promise.all([
    loadJSON(new URL('../data/questions.json', import.meta.url).href),
    loadJSON(new URL('../data/dimensions.json', import.meta.url).href),
    loadJSON(new URL('../data/types.json', import.meta.url).href),
    loadJSON(new URL('../data/config.json', import.meta.url).href),
  ])

  const pages = {
    intro: document.getElementById('page-intro'),
    quiz: document.getElementById('page-quiz'),
    result: document.getElementById('page-result'),
  }

  function showPage(name) {
    Object.values(pages).forEach((p) => p.classList.remove('active'))
    pages[name].classList.add('active')
    window.scrollTo(0, 0)
  }

  function onQuizComplete(answers) {
    console.log('[DEBUG] answers:', JSON.stringify(answers))
    const axisScores = calcAxisScores(answers, questions)
    console.log('[DEBUG] axisScores:', JSON.stringify(axisScores))
    const code = scoresToCode(axisScores, dimensions.axes)
    console.log('[DEBUG] code:', code)
    const type = lookupType(code, types)
    console.log('[DEBUG] type:', type?.code, type?.cn)
    showPage('result')
    try {
      renderResult(type, axisScores, dimensions, config)
    } catch (e) {
      console.error('renderResult failed:', e, { code, type, axisScores })
    }
  }

  const quiz = createQuiz(questions, onQuizComplete)

  document.getElementById('btn-start').addEventListener('click', () => {
    quiz.start()
    showPage('quiz')
  })

  document.getElementById('btn-restart').addEventListener('click', () => {
    quiz.start()
    showPage('quiz')
  })

  document.getElementById('btn-share').addEventListener('click', async () => {
    const isWebUrl = /^https?:$/.test(window.location.protocol)
    const url = isWebUrl
      ? window.location.origin + window.location.pathname
      : 'https://github.com/1028842748-lab/DRTI'
    const text = '我刚测了一个医生版 DRTI，测你在医院里是哪种生物。你也来试试。'
    if (navigator.share) {
      try {
        await navigator.share({ title: config.display.title, text, url })
        return
      } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(text + '\n' + url)
    } catch (_) {}
    const btn = document.getElementById('btn-share')
    btn.textContent = '已复制，去粘贴分享吧'
    setTimeout(() => { btn.textContent = '分享此测试' }, 2500)
  })
}

init()
