export { usePoetryDB } from '../composables/usePoetryDB'

export function formatPoemContent(paragraphs: string[]): string {
  return paragraphs.join('\n')
}

export function getDynastyLabel(dynasty: string): string {
  const labels: Record<string, string> = {
    唐: '唐代',
    宋: '宋代',
    先秦: '先秦',
    秦: '秦代',
    汉: '汉代',
    魏: '魏代',
    晋: '晋代',
    南北朝: '南北朝',
    隋: '隋代',
    五代: '五代',
    金: '金代',
    元: '元代',
    明: '明代',
    清: '清代',
  }
  return labels[dynasty] || dynasty
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
