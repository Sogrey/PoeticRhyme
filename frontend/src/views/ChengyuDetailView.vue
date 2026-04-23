<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initIdiomDatabase, getIdiomById, type IdiomDetail } from '../utils/idiomDb'

const route = useRoute()
const router = useRouter()

const idiom = ref<IdiomDetail | null>(null)
const loading = ref(true)

const loadIdiom = async () => {
  loading.value = true
  try {
    await initIdiomDatabase()
    const id = parseInt(route.params.id as string)
    idiom.value = getIdiomById(id)
  } catch (err) {
    console.error('Failed to load idiom:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadIdiom()
})
</script>

<template>
  <div class="chengyu-detail-view">
    <button class="back-btn" @click="goBack">← 返回</button>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="!idiom" class="not-found">
      <p>未找到该成语</p>
    </div>

    <div v-else class="idiom-content">
      <div class="idiom-header">
        <div class="idiom-pinyin">{{ idiom.pinyin }}</div>
        <h1 class="idiom-word">{{ idiom.word }}</h1>
        <div class="idiom-meta">
          <span class="meta-item">字数：{{ idiom.length }}</span>
        </div>
      </div>

      <div class="idiom-section">
        <h2>释义</h2>
        <p class="idiom-explanation">{{ idiom.explanation }}</p>
      </div>

      <div v-if="idiom.source && idiom.source !== '暂无出处'" class="idiom-section">
        <h2>出处</h2>
        <p class="idiom-source">{{ idiom.source }}</p>
      </div>

      <div v-if="idiom.allusion" class="idiom-section">
        <h2>典故</h2>
        <p class="idiom-allusion">{{ idiom.allusion }}</p>
      </div>

      <div v-if="idiom.story" class="idiom-section">
        <h2>故事</h2>
        <p class="idiom-story">{{ idiom.story }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chengyu-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.loading,
.not-found {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-light);
  font-size: 18px;
}

.idiom-content {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
}

.idiom-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.idiom-word {
  font-family: var(--font-title);
  font-size: 42px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.idiom-pinyin {
  font-size: 18px;
  color: var(--color-text-light);
}

.idiom-section {
  margin-bottom: 24px;
}

.idiom-section h2 {
  font-size: 18px;
  color: var(--color-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.idiom-explanation {
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.8;
}

.idiom-source {
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.8;
  font-style: italic;
}

.idiom-allusion,
.idiom-story {
  font-size: 15px;
  color: var(--color-text);
  line-height: 2;
  text-align: justify;
}

.idiom-meta {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.meta-item {
  font-size: 14px;
  color: var(--color-text-light);
}

@media (max-width: 640px) {
  .idiom-content {
    padding: 20px;
  }

  .idiom-word {
    font-size: 32px;
  }
}
</style>
