<script setup lang="ts">
import { ref } from 'vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const menuItems = [
  { name: '首页', path: '/' },
  { name: '诗词大全', path: '/poems' },
  { name: '成语大全', path: '/chengyu' },
  { name: '经典名句', path: '/mingju' },
]

const isMenuOpen = ref(false)
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo">
        <span class="logo-text">书香诗韵</span>
      </div>
      <nav class="desktop-nav">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="nav-link">
          {{ item.name }}
        </router-link>
      </nav>
      <div class="header-actions">
        <ThemeSwitcher />
        <button class="mobile-menu-btn" @click="isMenuOpen = !isMenuOpen">
          <span class="menu-icon"></span>
        </button>
      </div>
    </div>
    <nav v-show="isMenuOpen" class="mobile-nav">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="mobile-nav-link"
        @click="isMenuOpen = false">
        {{ item.name }}
      </router-link>
      <div class="mobile-theme">
        <ThemeSwitcher />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(var(--color-background-rgb), 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.05);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-text {
  font-family: var(--font-title);
  font-size: 24px;
  color: var(--color-primary);
}

.desktop-nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-size: 16px;
  color: var(--color-text);
  text-decoration: none;
  padding: 8px 4px;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.menu-icon {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  position: relative;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  left: 0;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.mobile-nav-link {
  padding: 12px 0;
  font-size: 16px;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.mobile-theme {
  padding-top: 16px;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-nav {
    display: flex;
  }
}
</style>
