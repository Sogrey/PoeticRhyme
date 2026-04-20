<script setup lang="ts">
import { ref } from 'vue'

type Theme = 'light' | 'warm' | 'cool'

const themes: { key: Theme; name: string; primaryColor: string; bgColor: string }[] = [
  { key: 'light', name: '清新', primaryColor: '#2d5a4a', bgColor: '#faf8f5' },
  { key: 'warm', name: '暖阳', primaryColor: '#8b5a3c', bgColor: '#fdf6e9' },
  { key: 'cool', name: '静谧', primaryColor: '#4a6fa5', bgColor: '#f0f4f8' },
]

const currentTheme = ref<Theme>('light')

const switchTheme = (theme: Theme) => {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
}
</script>

<template>
  <div class="theme-switcher">
    <button v-for="theme in themes" :key="theme.key" :class="['theme-btn', { active: currentTheme === theme.key }]"
      :style="{
        '--theme-primary': theme.primaryColor,
        '--theme-bg': theme.bgColor,
      }" :title="theme.name" @click="switchTheme(theme.key)">
      <span class="theme-dot"></span>
      <span class="theme-name">{{ theme.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: rgba(128, 128, 128, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 2px solid transparent;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-light);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

.theme-btn.active {
  background: var(--theme-bg);
  border-color: var(--theme-primary);
  color: var(--theme-primary);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

.theme-btn.active .theme-dot {
  background-color: var(--theme-primary);
  transform: scale(1.3);
}

.theme-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--color-text-light);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-name {
  letter-spacing: 0.5px;
}

@media (max-width: 480px) {
  .theme-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .theme-name {
    display: none;
  }
}
</style>
