import { getPoems } from './sqliteDb'

export interface Mingju {
  id: string
  content: string
  poemId: string
  poemTitle: string
  author: string
  dynasty: string
}

export function getMingjuList(page: number = 1, limit: number = 30): Mingju[] {
  const allPoems = getPoems(1, 500)
  const mingjuList: Mingju[] = []

  for (const poem of allPoems) {
    const paragraphs = poem.content.split('\n').filter((p: string) => p.trim())
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim()
      if (para.length >= 5 && para.length <= 30) {
        mingjuList.push({
          id: `${poem.id}-${i}`,
          content: para,
          poemId: poem.id,
          poemTitle: poem.title,
          author: poem.author,
          dynasty: poem.dynasty,
        })
      }
    }
  }

  const shuffled = mingjuList.sort(() => Math.random() - 0.5)
  const start = (page - 1) * limit
  return shuffled.slice(start, start + limit)
}

export function searchMingju(keyword: string, limit: number = 50): Mingju[] {
  const allPoems = getPoems(1, 500)
  const mingjuList: Mingju[] = []

  for (const poem of allPoems) {
    if (
      poem.title.includes(keyword) ||
      poem.author.includes(keyword) ||
      poem.content.includes(keyword)
    ) {
      const paragraphs = poem.content.split('\n').filter((p: string) => p.trim())
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].trim()
        if (para.length >= 5 && para.length <= 30) {
          mingjuList.push({
            id: `${poem.id}-${i}`,
            content: para,
            poemId: poem.id,
            poemTitle: poem.title,
            author: poem.author,
            dynasty: poem.dynasty,
          })
        }
      }
    }
  }

  return mingjuList.slice(0, limit)
}

export function getMingjuCount(): number {
  return 1000
}
