<script setup lang="ts">
</script>

<template>
  <div class="about-view">
    <section class="hero-section">
      <h1 class="about-title">关于书香诗韵</h1>
      <p class="about-subtitle">传承千年文化，浸润童心成长</p>
    </section>

    <section class="content-section">
      <div class="about-card">
        <h2>项目介绍</h2>
        <p>书香诗韵是一款专注于儿童诗词启蒙的学习平台，致力于将中华优秀传统文化以现代化、趣味化的方式呈现给孩子们。</p>
        <p>我们收录了唐诗、宋词、诗经、论语等经典文学作品，让孩子在诗词的海洋中感受中华文化的魅力。</p>
      </div>

      <div class="about-card">
        <h2>核心功能</h2>
        <ul class="feature-list">
          <li>海量诗词收录 - 超过85万首古诗词</li>
          <li>智能搜索 - 快速找到想要的诗词</li>
          <li>分类浏览 - 按朝代、作者、题材筛选</li>
          <li>每日推荐 - 发现诗词之美</li>
          <li>主题切换 - 多彩主题随心换</li>
        </ul>
      </div>

      <div class="about-card">
        <h2>数据来源</h2>
        <p>诗词数据主要来源于以下开源项目：</p>
        <ul class="source-list">
          <li><a href="https://github.com/chinese-poetry/chinese-poetry" target="_blank" rel="noopener">chinese-poetry</a> - 最全中华古诗词数据库</li>
          <li><a href="https://github.com/Werneror/Poetry" target="_blank" rel="noopener">Werneror/Poetry</a> - 收录先秦到现代共计85万余首古诗词</li>
        </ul>
      </div>

      <div class="about-card">
        <h2>技术栈</h2>
        <div class="tech-stack">
          <span class="tech-item">Vue 3</span>
          <span class="tech-item">TypeScript</span>
          <span class="tech-item">Vite</span>
          <span class="tech-item">shuimo-ui</span>
          <span class="tech-item">Pinia</span>
          <span class="tech-item">Node.js</span>
          <span class="tech-item">Express</span>
          <span class="tech-item">SQLite</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.hero-section {
  text-align: center;
  margin-bottom: 48px;
}

.about-title {
  font-family: var(--font-title);
  font-size: 36px;
  color: var(--color-primary);
  margin: 0 0 16px 0;
}

.about-subtitle {
  font-size: 18px;
  color: var(--color-text-light);
  margin: 0;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.about-card {
  background: rgba(var(--color-surface-rgb), 0.8);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(var(--color-text-rgb), 0.05);
}

.about-card h2 {
  font-family: var(--font-title);
  font-size: 22px;
  color: var(--color-primary);
  margin: 0 0 16px 0;
}

.about-card p {
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.8;
  margin: 0 0 12px 0;
}

.about-card p:last-child {
  margin-bottom: 0;
}

.feature-list,
.source-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li,
.source-list li {
  font-size: 16px;
  color: var(--color-text);
  line-height: 2;
  padding-left: 24px;
  position: relative;
}

.feature-list li::before {
  content: '📜';
  position: absolute;
  left: 0;
}

.source-list li::before {
  content: '🔗';
  position: absolute;
  left: 0;
}

.source-list a {
  color: var(--color-primary);
  text-decoration: none;
}

.source-list a:hover {
  text-decoration: underline;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-item {
  padding: 8px 16px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 20px;
  font-size: 14px;
  color: var(--color-primary);
}
</style>
