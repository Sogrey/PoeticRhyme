<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePoetryDB } from '../composables/usePoetryDB'
import { initializeDb } from '../services/apiService'
import WordCloud from '../components/WordCloud.vue'

const router = useRouter()
const { getStats, getPoems, isDataLoaded, isLoading: dbLoading } = usePoetryDB()

const searchKeyword = ref('')
const stats = ref<any>(null)
const poems = ref<any[]>([])
const wordcloudData = ref<Array<{ name: string; value: number }>>([])
const selectedTag = ref<string | null>(null)
const localLoading = ref(false)

const hotCategories = [
  { name: '唐诗三百首', icon: '📜', path: '/poems?category=tang', desc: '经典唐诗精选' },
  { name: '宋词集锦', icon: '🎋', path: '/poems?category=song', desc: '婉约豪放并存' },
  { name: '诗经', icon: '📖', path: '/poems?category=shijing', desc: '最早的诗歌总集' },
  { name: '论语', icon: '🎓', path: '/poems?category=lunyu', desc: '儒家经典语录' },
]

const loadData = async () => {
  if (isDataLoaded.value && poems.value.length === 0) {
    localLoading.value = true
    try {
      const statsData = await getStats()
      stats.value = statsData

      const poemsData = await getPoems({ limit: 100 })
      poems.value = poemsData.data || []

      // 生成词云数据（基于标题和内容）
      const wordCount: Record<string, number> = {}
      poems.value.forEach((poem: any) => {
        if (poem.title) {
          const titleWords = poem.title.split('')
          titleWords.forEach((word: string) => {
            if (word.length > 0 && !/\s/.test(word)) {
              wordCount[word] = (wordCount[word] || 0) + 2 // 标题权重更高
            }
          })
        }
        if (poem.content) {
          const contentWords = poem.content.split('')
          contentWords.forEach((word: string) => {
            if (word.length > 0 && !/\s/.test(word)) {
              wordCount[word] = (wordCount[word] || 0) + 1
            }
          })
        }
      })
      wordcloudData.value = Object.entries(wordCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      localLoading.value = false
    }
  }
}

onMounted(async () => {
  await initializeDb()
  await loadData()
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/poems', query: { search: searchKeyword.value.trim() } })
  }
}

const handleTagClick = (tag: string) => {
  selectedTag.value = tag
  router.push({ path: '/poems', query: { tag } })
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const latestPoems = computed(() => {
  return poems.value.slice(0, 6)
})

const recommendedPoems = computed(() => {
  const shuffled = [...poems.value].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 6)
})
</script>

<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <h1 class="hero-slogan">书香润童心 · 诗韵伴成长</h1>
        <p class="hero-subtitle">探索中华诗词之美，传承千年文化智慧</p>
        <div class="search-box">
          <input v-model="searchKeyword" type="text" class="search-input" placeholder="搜索诗词、作者、成语..."
            @keyup.enter="handleSearch" />
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
        <div v-if="stats" class="stats-bar">
          <div class="stat-item">
            <span class="stat-number">{{ formatNumber(stats.poems || 0) }}</span>
            <span class="stat-label">诗词</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ formatNumber(stats.authors || 0) }}</span>
            <span class="stat-label">诗人</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ formatNumber(stats.shiJing || 0) }}</span>
            <span class="stat-label">诗经</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ formatNumber(stats.lunYu || 0) }}</span>
            <span class="stat-label">论语</span>
          </div>
        </div>
      </div>
    </section>

    <section class="wordcloud-section">
      <h2 class="section-title">诗词词云</h2>
      <div class="wordcloud-wrapper" v-if="wordcloudData.length > 0">
        <WordCloud :data="wordcloudData" size="100%" @tag-click="handleTagClick" />
      </div>
      <div v-else-if="localLoading" class="wordcloud-loading">
        <p>正在加载词云数据...</p>
      </div>
      <div v-else class="wordcloud-empty">
        <p>暂无词云数据</p>
      </div>
    </section>

    <section class="categories-section">
      <h2 class="section-title">热门分类</h2>
      <div class="categories-grid">
        <router-link v-for="cat in hotCategories" :key="cat.name" :to="cat.path" class="category-card">
          <span class="category-icon">{{ cat.icon }}</span>
          <div class="category-info">
            <h3 class="category-name">{{ cat.name }}</h3>
            <p class="category-desc">{{ cat.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <section class="recommend-section">
      <h2 class="section-title">热门推荐</h2>
      <div class="poems-grid">
        <router-link v-for="poem in recommendedPoems" :key="poem.id" :to="`/poems/${poem.id}`" class="poem-card">
          <h3 class="poem-title">{{ poem.title }}</h3>
          <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
          <p class="poem-content">{{ poem.content?.slice(0, 50) }}...</p>
        </router-link>
      </div>
    </section>

    <section class="latest-section">
      <h2 class="section-title">最新更新</h2>
      <div class="poems-list">
        <router-link v-for="poem in latestPoems" :key="poem.id" :to="`/poems/${poem.id}`" class="poem-item">
          <div class="poem-item-content">
            <h3 class="poem-title">{{ poem.title }}</h3>
            <p class="poem-author">{{ poem.dynasty }} · {{ poem.author }}</p>
          </div>
          <span class="poem-arrow">›</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100%;
}

.hero-section {
  position: relative;
  padding: 80px 24px 60px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08) 0%, rgba(var(--color-secondary-rgb), 0.05) 100%);
  border-radius: 0 0 50% 50%;
  transform: scale(2);
}

.hero-content {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-slogan {
  font-family: var(--font-title);
  font-size: 42px;
  color: var(--color-primary);
  margin: 0 0 16px 0;
  letter-spacing: 4px;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--color-text-light);
  margin: 0 0 40px 0;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto 32px;
  background: rgba(var(--color-surface-rgb), 0.9);
  border-radius: 48px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 16px 24px;
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
  padding: 16px 32px;
  border-radius: 40px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.3);
}

.stats-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 20px;
  background: rgba(var(--color-surface-rgb), 0.7);
  border-radius: 16px;
  backdrop-filter: blur(8px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-family: var(--font-title);
  font-size: 28px;
  color: var(--color-primary);
  font-weight: 600;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-light);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(var(--color-text-rgb), 0.1);
}

.section-title {
  font-family: var(--font-title);
  font-size: 28px;
  color: var(--color-primary);
  text-align: center;
  margin: 0 0 32px 0;
}

.wordcloud-section {
  padding: 48px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.wordcloud-wrapper {
  background: rgba(var(--color-surface-rgb), 0.5);
  border-radius: 16px;
  padding: 24px;
  min-height: 400px;
}

.wordcloud-loading,
.wordcloud-empty {
  text-align: center;
  padding: 60px;
  color: var(--color-text-light);
}

.categories-section {
  padding: 48px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(var(--color-surface-rgb), 0.8);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.category-icon {
  font-size: 40px;
}

.category-info {
  flex: 1;
}

.category-name {
  font-family: var(--font-title);
  font-size: 18px;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.category-desc {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0;
}

.recommend-section {
  padding: 48px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.poem-card .poem-title {
  font-family: var(--font-title);
  font-size: 20px;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.poem-card .poem-author {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 12px 0;
}

.poem-card .poem-content {
  font-family: var(--font-poetry);
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.8;
  margin: 0;
}

.latest-section {
  padding: 48px 24px 80px;
  max-width: 800px;
  margin: 0 auto;
}

.poems-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poem-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(var(--color-surface-rgb), 0.8);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.poem-item:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  transform: translateX(8px);
}

.poem-item-content {
  flex: 1;
}

.poem-item .poem-title {
  font-family: var(--font-title);
  font-size: 18px;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.poem-item .poem-author {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0;
}

.poem-arrow {
  font-size: 24px;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .hero-slogan {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .search-box {
    flex-direction: column;
    border-radius: 24px;
    padding: 16px;
    gap: 12px;
  }

  .search-btn {
    border-radius: 24px;
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 16px;
  }

  .stat-divider {
    display: none;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .poems-grid {
    grid-template-columns: 1fr;
  }
}
</style>
