/**
 * [INPUT]: (questions: Array, onComplete: Function)
 * [OUTPUT]: quiz controller { start, renderQuestion }
 * [POS]: 答题流程控制器
 * [PROTOCOL]: 只管 DOM 渲染和用户交互，不做评分
 */

import { shuffle } from './utils.js'

export function createQuiz(questions, onComplete) {
  let queue = shuffle(questions)
  let current = 0
  let answers = {}

  const els = {
    fill: document.getElementById('progress-fill'),
    text: document.getElementById('progress-text'),
    qText: document.getElementById('question-text'),
    options: document.getElementById('options'),
  }

  function updateProgress() {
    const pct = (current / queue.length) * 100
    els.fill.style.width = pct + '%'
    els.text.textContent = `${current} / ${queue.length}`
  }

  function renderQuestion() {
    const q = queue[current]
    els.qText.textContent = q.text

    els.options.innerHTML = ''
    q.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'btn btn-option'
      btn.textContent = opt.text
      btn.addEventListener('click', () => selectOption(q, opt))
      els.options.appendChild(btn)
    })

    updateProgress()
  }

  function selectOption(question, option) {
    answers[question.id] = option.score

    current++
    if (current >= queue.length) {
      onComplete(answers)
    } else {
      renderQuestion()
    }
  }

  function start() {
    current = 0
    answers = {}
    queue = shuffle(questions)
    renderQuestion()
  }

  return { start, renderQuestion }
}
