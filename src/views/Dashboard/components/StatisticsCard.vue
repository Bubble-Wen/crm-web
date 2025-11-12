<!-- src/views/Dashboard/components/StatisticsCard.vue -->
<template>
  <el-card :style="{ backgroundColor: color + '10', borderLeft: `4px solid ${color}`, flex: '1', minWidth: '240px' }">
    <div class="card-content">
      <div class="card-header">
        <span class="card-title">{{ title }}</span>
        <el-icon :style="{ color }" class="card-icon">
          <!-- 直接使用注册后的组件，无需 component 标签 -->
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="card-value">{{ formatValue }}</div>
      <div class="card-change" :class="{ up: change > 0, down: change < 0, flat: change === 0 }">
        <el-icon v-if="change > 0" size="14">
          <CaretTop />
        </el-icon>
        <el-icon v-if="change < 0" size="14">
          <CaretBottom />
        </el-icon>
        <span>{{ change === 0 ? '持平' : `${Math.abs(change)}%` }}</span>
        <span class="change-desc">较昨日</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
// 导入需要的图标组件
import { User, Search, Document, Money } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true,
    // 校验 icon 只能是已导入的图标名称
    validator: (val: string) => ['User', 'Search', 'Document', 'Money'].includes(val)
  },
  color: {
    type: String,
    required: true
  },
  isAmount: {
    type: Boolean,
    default: false
  }
})

// 图标组件映射（关键：将字符串映射到实际组件）
const iconMap = {
  User,
  Search,
  Document,
  Money
}

// 计算属性：根据 props.icon 获取对应的组件
const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap]
})

// 计算属性：格式化数值（金额添加千分位和单位）
const formatValue = computed(() => {
  if (!props.isAmount) {
    return props.value
  }
  // 金额格式化：千分位分隔 + 元
  if (typeof props.value === 'number') {
    return `¥${props.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `¥${props.value}`
})
</script>

<style scoped>
.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  color: #666;
  font-size: 14px;
}

.card-icon {
  font-size: 24px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-change {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.up {
  color: #f53f3f;
}

.down {
  color: #00b42a;
}

.flat {
  color: #9c8686;
}

.change-desc {
  margin-left: 4px;
  color: #86909c;
}
</style>
