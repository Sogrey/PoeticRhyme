<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePoetryDB } from '../composables/usePoetryDB'
import { initializeDb } from '../services/apiService'
import { toggleFavorite, isFavorite } from '../utils/favoritesDb'
import type { Poem } from '../services/apiService'

const route = useRoute()
const router = useRouter()
const { getPoemById, getPoems } = usePoetryDB()

const poem = ref<Poem | null>(null)
const relatedPoems = ref<Poem[]>([])
const loading = ref(true)
const favorited = ref(false)

const poemId = computed(() => route.params.id as string)

const loadPoem = async () => {
  loading.value = true
  try {
    await initializeDb()
    const data = await getPoemById(poemId.value)
    poem.value = data

    if (data) {
      favorited.value = await isFavorite(data.id)
      const related = await getPoems({ limit: 50 })
      relatedPoems.value = (related.data || [])
        .filter(p => p.id !== data.id && (p.author === data.author || p.dynasty === data.dynasty))
        .slice(0, 6)
    }
  } catch (err) {
    console.error('Failed to load poem:', err)
  } finally {
    loading.value = false
  }
}

const handleToggleFavorite = async () => {
  if (!poem.value) return
  favorited.value = await toggleFavorite({
    id: poem.value.id,
    title: poem.value.title,
    author: poem.value.author,
    dynasty: poem.value.dynasty,
    content: poem.value.content,
    rhythmic: poem.value.rhythmic,
  })
}

const goToPoem = (id: string) => {
  router.push({ name: 'poem-detail', params: { id } })
}

onMounted(() => {
  loadPoem()
})
</script>

<template>
  <div class="poem-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!poem" class="empty-state">
      <p>诗词不存在</p>
      <button class="back-btn" @click="router.push({ name: 'poems' })">返回列表</button>
    </div>

    <template v-else>
      <header class="poem-header">
        <button class="back-btn" @click="router.back()">← 返回</button>
        <button
          class="favorite-btn"
          :class="{ active: favorited }"
          @click="handleToggleFavorite"
        >
          {{ favorited ? '★ 已收藏' : '☆ 收藏' }}
        </button>
      </header>

      <article class="poem-content">
        <div class="poem-title-row">
          <h1 class="poem-title">{{ poem.title }}</h1>
          <span class="poem-rhythmic" v-if="poem.rhythmic">{{ poem.rhythmic }}</span>
        </div>

        <p class="poem-meta">
          <span class="poem-dynasty">{{ poem.dynasty }}</span>
          <span class="poem-author">{{ poem.author }}</span>
        </p>

        <div class="poem-body">
          <p v-for="(line, index) in poem.content.split('\n')" :key="index" class="poem-line">
            {{ line }}
          </p>
        </div>
      </article>

      <section v-if="relatedPoems.length > 0" class="related-section">
        <h2 class="section-title">相关诗词</h2>
        <div class="related-list">
          <div
            v-for="related in relatedPoems"
            :key="related.id"
            class="related-card"
            @click="goToPoem(related.id)"
          >
            <h3 class="related-title">{{ related.title }}</h3>
            <p class="related-meta">{{ related.dynasty }} · {{ related.author }}</p>
            <p class="related-preview">{{ related.content.split('\n')[0] }}</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.poem-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 48px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.poem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn,
.favorite-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.back-btn:hover {
  background: var(--color-surface);
}

.favorite-btn {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text-light);
}

.favorite-btn.active {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  border-color: #ffd700;
  color: #5d4a00;
}

.favorite-btn:hover {
  transform: scale(1.05);
}

.poem-content {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.poem-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.poem-title {
  font-family: var(--font-title);
  font-size: 28px;
  color: var(--color-primary);
  margin: 0;
}

.poem-rhythmic {
  padding: 4px 12px;
  background: var(--color-background);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-light);
}

.poem-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 15px;
}

.poem-dynasty {
  padding: 2px 10px;
  background: var(--color-primary);
  color: white;
  border-radius: 4px;
  font-size: 13px;
}

.poem-author {
  color: var(--color-text-light);
  line-height: 1.6;
}

.poem-body {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
}

.poem-line {
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 2;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.poem-line:nth-child(even) {
  color: var(--color-primary);
}

.related-section {
  margin-top: 32px;
}

.section-title {
  font-size: 20px;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--color-primary);
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.related-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.related-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.related-title {
  font-size: 16px;
  color: var(--color-text);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.related-meta {
  font-size: 13px;
  color: var(--color-text-light);
  margin: 0 0 8px 0;
}

.related-preview {
  font-size: 14px;
  color: var(--color-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>