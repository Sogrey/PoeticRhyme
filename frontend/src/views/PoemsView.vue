<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePoetryDB } from '../composables/usePoetryDB'
import { initializeDb } from '../services/apiService'
import type { Poem, Author } from '../services/apiService'

const route = useRoute()
const router = useRouter()
const { getPoems, getAuthors, getStats, searchPoems, isDataLoaded } = usePoetryDB()

const poems = ref<Poem[]>([])
const authors = ref<Author[]>([])
const stats = ref<{ dynasties: string[] } | null>(null)
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = 20

const searchKeyword = ref('')
const selectedDynasty = ref('')
const selectedAuthor = ref('')
const searchMode = ref(false)

const dynasties = computed(() => stats.value?.dynasties || [])
const totalPages = computed(() => Math.ceil(total.value / limit))

const loadPoems = async () => {
  if (!isDataLoaded.value) return

  loading.value = true
  try {
    let result
    if (searchMode.value && searchKeyword.value) {
      result = await searchPoems(searchKeyword.value, { limit })
      poems.value = result.data
      total.value = result.total
    } else if (selectedDynasty.value) {
      result = await getPoems({ page: page.value, limit, dynasty: selectedDynasty.value })
      poems.value = result.data
      total.value = result.total
    } else if (selectedAuthor.value) {
      result = await getPoems({ page: page.value, limit, author: selectedAuthor.value })
      poems.value = result.data
      total.value = result.total
    } else {
      result = await getPoems({ page: page.value, limit })
      poems.value = result.data
      total.value = result.total
    }
  } catch (err) {
    console.error('Failed to load poems:', err)
  } finally {
    loading.value = false
  }
}

const loadFilters = async () => {
  if (!isDataLoaded.value) return

  try {
    const [statsData, authorsData] = await Promise.all([
      getStats(),
      getAuthors({ limit: 1000 }),
    ])
    stats.value = statsData
    authors.value = authorsData.data
  } catch (err) {
    console.error('Failed to load filters:', err)
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    searchMode.value = true
    page.value = 1
    router.push({ query: { search: searchKeyword.value.trim() } })
    loadPoems()
  }
}

const handleDynastyChange = (dynasty: string) => {
  selectedDynasty.value = dynasty
  selectedAuthor.value = ''
  searchMode.value = false
  searchKeyword.value = ''
  page.value = 1
  if (dynasty) {
    router.push({ query: { dynasty } })
  } else {
    router.push({ query: {} })
  }
  loadPoems()
}

const handleAuthorChange = (author: string) => {
  selectedAuthor.value = author
  selectedDynasty.value = ''
  searchMode.value = false
  searchKeyword.value = ''
  page.value = 1
  if (author) {
    router.push({ query: { author } })
  } else {
    router.push({ query: {} })
  }
  loadPoems()
}

const clearFilters = () => {
  selectedDynasty.value = ''
  selectedAuthor.value = ''
  searchMode.value = false
  searchKeyword.value = ''
  page.value = 1
  router.push({ query: {} })
  loadPoems()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  loadPoems()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const initFromQuery = () => {
  const { search, dynasty, author } = route.query

  if (search) {
    searchKeyword.value = search as string
    searchMode.value = true
  } else if (dynasty) {
    selectedDynasty.value = dynasty as string
  } else if (author) {
    selectedAuthor.value = author as string
  }

  if (search || dynasty || author) {
    page.value = 1
  }
}

watch(() => route.query, () => {
  initFromQuery()
  loadPoems()
}, { immediate: false })

onMounted(async () => {
  await initializeDb()
  await loadFilters()
  initFromQuery()
  await loadPoems()
})

const formatContent = (content: string) => {
  if (!content) return ''
  return content.split('\n').slice(0, 2).join('\n')
}
</script>

<template>
  <div class="poems-view">
    <header class="page-header">
      <h1 class="page-title">诗词大全</h1>
      <p class="page-subtitle">探索中华诗词，感受古韵之美</p>
    </header>

    <div class="search-section">
      <div class="search-box">
        <input v-model="searchKeyword" type="text" class="search-input" placeholder="搜索诗词、作者..."
          @keyup.enter="handleSearch" />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <span class="filter-label">朝代：</span>
        <div class="filter-tags">
          <button class="filter-tag" :class="{ active: !selectedDynasty && !searchMode }" @click="handleDynastyChange('')">
            全部
          </button>
          <button v-for="dynasty in dynasties" :key="dynasty" class="filter-tag"
            :class="{ active: selectedDynasty === dynasty }" @click="handleDynastyChange(dynasty)">
            {{ dynasty }}
          </button>
        </div>
      </div>

      <div class="filter-group" v-if="selectedDynasty || selectedAuthor || searchMode">
        <span class="filter-label">诗人：</span>
        <select v-model="selectedAuthor" class="author-select" @change="handleAuthorChange(selectedAuthor)">
          <option value="">全部诗人</option>
          <option v-for="author in authors.filter(a => !selectedDynasty || a.dynasty === selectedDynasty)" :key="author.id"
            :value="author.name">
            {{ author.name }} ({{ author.dynasty }})
          </option>
        </select>
      </div>

      <div class="active-filters" v-if="selectedDynasty || selectedAuthor || searchMode">
        <span class="filter-label">当前筛选：</span>
        <span v-if="searchMode" class="filter-badge">
          搜索: {{ searchKeyword }}
          <button class="badge-close" @click="clearFilters">×</button>
        </span>
        <span v-if="selectedDynasty" class="filter-badge">
          {{ selectedDynasty }}
          <button class="badge-close" @click="handleDynastyChange('')">×</button>
        </span>
        <span v-if="selectedAuthor" class="filter-badge">
          {{ selectedAuthor }}
          <button class="badge-close" @click="handleAuthorChange('')">×</button>
        </span>
      </div>
    </div>

    <div class="results-info">
      <span v-if="!loading">共 {{ total }} 首诗词</span>
      <span v-else>加载中...</span>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载诗词...</p>
    </div>

    <div v-else-if="poems.length === 0" class="empty-state">
      <p class="empty-text">暂无诗词</p>
      <button v-if="selectedDynasty || selectedAuthor || searchMode" class="clear-btn" @click="clearFilters">
        清除筛选
      </button>
    </div>

    <div v-else class="poems-grid">
      <router-link v-for="poem in poems" :key="poem.id" :to="`/poems/${poem.id}`" class="poem-card">
        <div class="poem-header">
          <h3 class="poem-title">{{ poem.title }}</h3>
          <span class="poem-dynasty">{{ poem.dynasty }}</span>
        </div>
        <p class="poem-author">{{ poem.author }}</p>
        <p class="poem-content">{{ formatContent(poem.content) }}</p>
        <p v-if="poem.rhythmic" class="poem-rhythmic">词牌：{{ poem.rhythmic }}</p>
      </router-link>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page === 1" @click="handlePageChange(page - 1)">
        上一页
      </button>
      <div class="page-numbers">
        <button v-for="p in Math.min(5, totalPages)" :key="p" class="page-number"
          :class="{ active: p === page || (page <= 5 && p === page) }" @click="handlePageChange(p)">
          {{ p }}
        </button>
        <span v-if="totalPages > 5 && page > 5" class="page-ellipsis">...</span>
        <button v-if="totalPages > 5 && page > 5" class="page-number active" @click="handlePageChange(page)">
          {{ page }}
        </button>
        <span v-if="totalPages > 5 && page < totalPages - 2" class="page-ellipsis">...</span>
        <button v-if="totalPages > 5 && page < totalPages - 2" class="page-number"
          @click="handlePageChange(totalPages)">
          {{ totalPages }}
        </button>
      </div>
      <button class="page-btn" :disabled="page === totalPages" @click="handlePageChange(page + 1)">
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.poems-view {
  min-height: 100%;
  padding: 0 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 48px 0 32px;
}

.page-title {
  font-family: var(--font-title);
  font-size: 36px;
  color: var(--color-primary);
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--color-text-light);
  margin: 0;
}

.search-section {
  max-width: 600px;
  margin: 0 auto 32px;
}

.search-box {
  display: flex;
  background: rgba(var(--color-surface-rgb), 0.9);
  border-radius: 48px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 24px;
  font-size: 16px;
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-light);
}

.search-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 40px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.3);
}

.filters-section {
  background: rgba(var(--color-surface-rgb), 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 14px;
  color: var(--color-text-light);
  margin-bottom: 8px;
  display: block;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  padding: 8px 16px;
  border: 1px solid rgba(var(--color-text-rgb), 0.2);
  border-radius: 20px;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tag:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-tag.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.author-select {
  width: 100%;
  max-width: 300px;
  padding: 10px 16px;
  border: 1px solid rgba(var(--color-text-rgb), 0.2);
  border-radius: 8px;
  background: rgba(var(--color-surface-rgb), 0.9);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--color-text-rgb), 0.1);
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 16px;
  font-size: 13px;
  color: var(--color-primary);
}

.badge-close {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}

.results-info {
  text-align: center;
  color: var(--color-text-light);
  font-size: 14px;
  margin-bottom: 24px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-text {
  color: var(--color-text-light);
  font-size: 16px;
  margin-bottom: 16px;
}

.clear-btn {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: 20px;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--color-primary);
  color: white;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.poem-card {
  padding: 24px;
  background: rgba(var(--color-surface-rgb), 0.8);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.poem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.poem-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.poem-title {
  font-family: var(--font-title);
  font-size: 20px;
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.poem-dynasty {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-radius: 4px;
}

.poem-author {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 12px 0;
}

.poem-content {
  font-family: var(--font-poetry);
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.8;
  margin: 0;
  white-space: pre-line;
}

.poem-rhythmic {
  font-size: 12px;
  color: var(--color-text-light);
  margin: 8px 0 0 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
}

.page-btn {
  padding: 10px 20px;
  border: 1px solid rgba(var(--color-text-rgb), 0.2);
  border-radius: 8px;
  background: rgba(var(--color-surface-rgb), 0.8);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(var(--color-text-rgb), 0.2);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-number.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.page-ellipsis {
  padding: 0 4px;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .poems-grid {
    grid-template-columns: 1fr;
  }

  .filter-tags {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .filter-tag {
    flex-shrink: 0;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 12px;
  }
}
</style>
