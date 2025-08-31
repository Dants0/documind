export function splitTextInSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g) || [];
}
