<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <p class="copyright">书香诗韵 · 专注儿童诗词启蒙</p>
        <p class="slogan">书香润童心，诗韵伴成长</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: rgba(var(--color-surface-rgb), 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 32px 24px;
  margin-top: auto;
  border-top: 1px solid rgba(var(--color-text-rgb), 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.copyright {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 8px 0;
}

.slogan {
  font-family: var(--font-poetry);
  font-size: 16px;
  color: var(--color-primary);
  margin: 0;
}
</style>
