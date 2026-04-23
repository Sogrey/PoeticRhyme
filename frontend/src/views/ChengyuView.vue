<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { initIdiomDatabase, getIdioms, searchIdioms, getIdiomCount, type Idiom } from '../utils/idiomDb'

const router = useRouter()

const idioms = ref<Idiom[]>([])
const loading = ref(true)
const searchKeyword = ref('')
const page = ref(1)
const pageSize = 30
const totalCount = ref(0)
const searchMode = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const loadIdioms = async () => {
  loading.value = true
  try {
    await initIdiomDatabase()
    const data = getIdioms(page.value, pageSize)
    idioms.value = data
    totalCount.value = getIdiomCount()
  } catch (err) {
    console.error('Failed to load idioms:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    searchMode.value = false
    page.value = 1
    await loadIdioms()
    return
  }

  loading.value = true
  searchMode.value = true
  try {
    await initIdiomDatabase()
    idioms.value = searchIdioms(keyword, 100)
    totalCount.value = idioms.value.length
    page.value = 1
  } catch (err) {
    console.error('Failed to search idioms:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (!searchMode.value) {
    loadIdioms()
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchMode.value = false
  page.value = 1
  loadIdioms()
}

const goToDetail = (idiom: Idiom) => {
  router.push({ name: 'chengyu-detail', params: { id: idiom.id } })
}

onMounted(() => {
  loadIdioms()
})
</script>

<template>
  <div class="chengyu-view">
    <div class="search-bar">
      <input v-model="searchKeyword" type="text" placeholder="搜索成语、拼音或释义..." class="search-input"
        @keyup.enter="handleSearch" />
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <div v-if="searchMode" class="search-info">
      搜索到 <span class="count">{{ totalCount }}</span> 个成语
      <button class="clear-btn" @click="clearSearch">清除搜索</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="idioms.length === 0" class="empty">
      <p>没有找到相关成语</p>
    </div>

    <div v-else class="idiom-list">
      <div v-for="idiom in idioms" :key="idiom.id" class="idiom-card" @click="goToDetail(idiom)">
        <div class="idiom-pinyin">{{ idiom.pinyin }}</div>
        <div class="idiom-word">{{ idiom.word }}</div>
        <div class="idiom-explanation">{{ idiom.explanation }}</div>
      </div>
    </div>

    <div v-if="!searchMode && totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page === 1" @click="handlePageChange(page - 1)">
        上一页
      </button>

      <template v-for="p in totalPages" :key="p">
        <button v-if="p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)" class="page-number"
          :class="{ active: p === page }" @click="handlePageChange(p)">
          {{ p }}
        </button>
        <span v-else-if="p === page - 3 || p === page + 3" class="page-ellipsis">
          ...
        </span>
      </template>

      <button class="page-btn" :disabled="page === totalPages" @click="handlePageChange(page + 1)">
        下一页
      </button>
    </div>

    <div class="total-info">
      共 {{ totalCount }} 条成语
    </div>
  </div>
</template>

<style scoped>
.chengyu-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px;
  font-family: var(--font-body);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-btn {
  padding: 12px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: var(--color-primary-dark);
}

.search-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: var(--color-text-light);
  font-size: 14px;
}

.search-info .count {
  color: var(--color-primary);
  font-weight: bold;
}

.clear-btn {
  padding: 6px 12px;
  background: var(--color-background-alt);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.clear-btn:hover {
  background: var(--color-border);
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-light);
  font-size: 18px;
}

.idiom-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.idiom-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.idiom-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.idiom-word {
  font-family: var(--font-title);
  font-size: 22px;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.idiom-pinyin {
  font-size: 13px;
  color: var(--color-text-light);
  margin-bottom: 8px;
}

.idiom-explanation {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
}

.page-btn,
.page-number {
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-card);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.page-ellipsis {
  color: var(--color-text-light);
}

.total-info {
  text-align: center;
  margin-top: 20px;
  color: var(--color-text-light);
  font-size: 14px;
}

@media (max-width: 640px) {
  .search-bar {
    flex-direction: column;
  }

  .idiom-list {
    grid-template-columns: 1fr;
  }
}
</style>
