/**
 * [INPUT]: (answers: Object, questions: Array, axes: Array, types: Array)
 * [OUTPUT]: (Object) — axisScores, code, type
 * [POS]: 评分引擎 — 纯函数，无 DOM 依赖
 * [PROTOCOL]: 只做数学运算，禁止引用 DOM 或 config
 */

export function calcAxisScores(answers, questions) {
  const scores = {}
  for (const q of questions) {
    if (answers[q.id] == null) continue
    scores[q.axis] = (scores[q.axis] || 0) + answers[q.id]
  }
  return scores
}

export function scoresToCode(axisScores, axes) {
  let code = ''
  for (const axis of axes) {
    const score = axisScores[axis.key] || 0
    code += score <= 0 ? axis.left : axis.right
  }
  return code
}

export function lookupType(code, types) {
  return types.find((t) => t.code === code) || null
}
