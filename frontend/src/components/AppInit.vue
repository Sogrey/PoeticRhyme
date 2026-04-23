<script setup lang="ts">
import { usePoetryDB } from '../composables/usePoetryDB'

const { isLoading, error } = usePoetryDB()
</script>

<template>
  <div v-if="isLoading" class="data-init-overlay">
    <div class="data-init-content">
      <div class="loading-spinner"></div>
      <p class="init-message">正在初始化本地数据库...</p>
      <p class="init-error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.data-init-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.data-init-content {
  background: var(--color-background, #fff);
  padding: 2rem 3rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-primary-light, #e0d5c7);
  border-top-color: var(--color-primary, #8b7355);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.init-message {
  font-size: 1.1rem;
  color: var(--color-text, #333);
  margin: 0;
}

.init-progress {
  font-size: 0.9rem;
  color: var(--color-text-light, #666);
  margin: 0.5rem 0 0;
}

.init-error {
  font-size: 0.9rem;
  color: #e74c3c;
  margin: 0.5rem 0 0;
}
</style>
