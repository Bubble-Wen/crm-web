<template>
  <div class="stat-card">
    <div class="card-header">
      <span>{{ title }}</span>
      <component :is="iconComponent" class="card-icon" />
    </div>
    <div class="card-value">{{ value }}</div>
    <div class="card-footer">
      <span :class="footerClass">{{ footer }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Document, Search } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: {
    type: String,
    required: true,
    validator: (val: string) => ['User', 'Document', 'Search'].includes(val)
  },
  value: { type: [Number, String], required: true },
  footer: { type: String, required: true },
  footerClass: { type: String, default: '' }
})

// 动态组件映射
const iconMap = { User, Document, Search }
const iconComponent = computed(() => iconMap[props.icon as keyof typeof iconMap])
</script>

<style scoped lang="less">
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #666;
    font-size: 14px;
    .card-icon {
      font-size: 20px;
      color: #4285f4;
    }
  }
  .card-value {
    font-size: 28px;
    font-weight: bold;
    margin: 15px 0;
    color: #333;
  }
  .card-footer {
    font-size: 13px;
    color: #999;
  }
}
</style>
