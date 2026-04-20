<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
</script>

<template>
  <div class="app-wrapper">
    <AppLayout>
      <RouterView />
    </AppLayout>
  </div>
</template>

<style>
.app-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
}
</style>
