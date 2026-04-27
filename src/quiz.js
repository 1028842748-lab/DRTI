/**
 * [INPUT]: (questions: Array, onComplete: Function)
 * [OUTPUT]: quiz controller { start, renderQuestion }
 * [POS]: 答题流程控制器
 * [PROTOCOL]: 只管 DOM 渲染和用户交互，不做评分
 */

const ADVANCE_DELAY = 150

export function createQuiz(questions, onComplete) {
  let queue = questions.slice()
  let current = 0
  let answers = {}
  let selectedKeys = {}
  let locked = false

  const els = {
    fill: document.getElementById('progress-fill'),
    text: document.getElementById('progress-text'),
    qText: document.getElementById('question-text'),
    options: document.getElementById('options'),
    back: document.getElementById('btn-back'),
  }

  els.back.addEventListener('click', goBack)

  function updateProgress() {
    const step = current + 1
    const pct = (step / queue.length) * 100
    els.fill.style.width = pct + '%'
    els.text.textContent = `${step} / ${queue.length}`
  }

  function renderQuestion() {
    locked = false
    const q = queue[current]
    els.qText.textContent = q.text

    els.options.innerHTML = ''
    const prevKey = selectedKeys[q.id]
    q.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'btn btn-option'
      btn.textContent = opt.text
      if (prevKey === opt.key) btn.classList.add('btn-option--selected')
      btn.addEventListener('click', () => selectOption(q, opt, btn))
      els.options.appendChild(btn)
    })

    els.back.hidden = current === 0
    updateProgress()
  }

  function selectOption(question, option, btn) {
    if (locked) return
    locked = true

    els.options.querySelectorAll('.btn-option--selected').forEach((el) => {
      el.classList.remove('btn-option--selected')
    })
    btn.classList.add('btn-option--selected')
    document.activeElement?.blur()

    answers[question.id] = option.score
    selectedKeys[question.id] = option.key

    setTimeout(() => {
      current++
      if (current >= queue.length) {
        els.fill.style.width = '100%'
        els.text.textContent = `${queue.length} / ${queue.length}`
        onComplete(answers)
      } else {
        renderQuestion()
      }
    }, ADVANCE_DELAY)
  }

  function goBack() {
    if (locked || current === 0) return
    current--
    renderQuestion()
  }

  function start() {
    current = 0
    answers = {}
    selectedKeys = {}
    locked = false
    queue = questions.slice()
    renderQuestion()
  }

  return { start, renderQuestion }
}
