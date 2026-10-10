export function advanceQueue(queue, correct) {
  if (!queue.length) throw new Error('復習キューが空です');
  return correct ? queue.slice(1) : [...queue.slice(1), queue[0]];
}
