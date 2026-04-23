<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const props = defineProps<{
  data: Array<{ name: string; value: number }>
  shape?: string
  size?: string
}>()

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const defaultSize = '100%'

const initChart = () => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value)
    const option = {
      series: [{
        type: 'wordCloud',
        shape: props.shape || 'circle',
        gridSize: 8,
        sizeRange: [14, 60],
        rotationRange: [-45, 45],
        rotationStep: 15,
        textStyle: {
          normal: {
            fontFamily: 'var(--font-poetry)',
            fontWeight: 'normal',
            color: function () {
              const colors = [
                'rgb(100, 120, 180)',
                'rgb(120, 100, 160)',
                'rgb(80, 140, 160)',
                'rgb(140, 100, 120)',
                'rgb(100, 160, 140)',
              ]
              return colors[Math.floor(Math.random() * colors.length)]
            }
          },
          emphasis: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: props.data
      }]
    }
    myChart.setOption(option)
  }
}

const handleResize = () => {
  myChart?.resize()
}

const handleClick = (params: any) => {
  if (params.name) {
    emit('tag-click', params.name)
  }
}

const emit = defineEmits<{
  (e: 'tag-click', name: string): void
}>()

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
  myChart?.on('click', handleClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.off('click', handleClick)
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})

watch(() => props.data, () => {
  if (myChart && props.data.length > 0) {
    myChart.setOption({
      series: [{
        data: props.data
      }]
    })
  }
}, { deep: true })
</script>

<template>
  <div ref="chartRef" :style="{ width: size || defaultSize, height: size || defaultSize }" class="wordcloud-container"></div>
</template>

<style scoped>
.wordcloud-container {
  min-height: 300px;
}
</style>
