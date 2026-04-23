const DB_NAME = 'PoeticRhymeFavorites'
const DB_VERSION = 1
const STORE_NAME = 'favorites'

interface FavoritePoem {
  id: string
  title: string
  author: string
  dynasty: string
  content: string
  rhythmic?: string
  collectedAt: number
}

let db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('collectedAt', 'collectedAt', { unique: false })
        store.createIndex('author', 'author', { unique: false })
        store.createIndex('dynasty', 'dynasty', { unique: false })
      }
    }
  })
}

export async function addToFavorites(poem: Omit<FavoritePoem, 'collectedAt'>): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const favorite: FavoritePoem = {
      ...poem,
      collectedAt: Date.now(),
    }
    const request = store.put(favorite)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function removeFromFavorites(id: string): Promise<void> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function isFavorite(id: string): Promise<boolean> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(!!request.result)
  })
}

export async function getAllFavorites(): Promise<FavoritePoem[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('collectedAt')
    const request = index.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const results = request.result as FavoritePoem[]
      resolve(results.sort((a, b) => b.collectedAt - a.collectedAt))
    }
  })
}

export async function getFavoritesCount(): Promise<number> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.count()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function toggleFavorite(poem: Omit<FavoritePoem, 'collectedAt'>): Promise<boolean> {
  const favorite = await isFavorite(poem.id)
  if (favorite) {
    await removeFromFavorites(poem.id)
    return false
  } else {
    await addToFavorites(poem)
    return true
  }
}

export type { FavoritePoem }