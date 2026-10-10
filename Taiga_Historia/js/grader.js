export function grade(question, input) {
  const answer = String(input ?? '').trim();
  return { answer: String(input ?? ''), correct: answer !== '' && [question.answer, ...question.acceptedAnswers].includes(answer) };
}
export function gradePassage(master, passage, inputs) {
  return passage.blanks.map(blank => ({sourceId:blank.sourceId, blankId:blank.id, ...grade(master.sourceQuestions.find(q=>q.id===blank.sourceId), inputs[blank.id])}));
}
