<template>
  <div class="dashboard-container">
    <!-- 1. 统计卡片区域（添加滚动容器） -->
    <div class="stats-scroll-container">
      <div class="stats-card-wrapper">
        <div class="statistics-card-group">
          <!-- 原有卡片 -->
          <StatisticsCard title="新增客户" :value="statisticsData.newCustomerCount" :change="statisticsData.customerChange" icon="User" color="#4285f4" />
          <StatisticsCard title="新增线索" :value="statisticsData.newLeadCount" :change="statisticsData.leadChange" icon="Search" color="#00b42a" />
          <StatisticsCard title="新增合同" :value="statisticsData.newContractCount" :change="statisticsData.contractChange" icon="Document" color="#ff7d00" />
          <StatisticsCard title="合同总金额" :value="formatCurrency(statisticsData.contractAmount)" :change="statisticsData.amountChange" color="#f53f3f" :isAmount="true" />

          <!-- 新增：审核统计卡片 -->
          <StatisticsCard title="审核通过" :value="statisticsData.todayApprovedContractCount" :change="statisticsData.approvedContractChange" icon="Check" color="#27ae60" />
          <StatisticsCard title="审核拒绝" :value="statisticsData.todayRejectedContractCount" :change="statisticsData.rejectedContractChange" icon="Close" color="#e74c3c" />
        </div>
      </div>
    </div>

    <!-- 2. 图表区域 -->
    <div class="chart-wrapper">
      <el-card class="full-height-card">
        <template #header>近7日数据趋势</template>
        <TrendChart :chartData="trendData" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 脚本部分保持不变
import { ref, onMounted } from 'vue'
import { DashboardApi, DashboardStatistics, DashboardTrend } from '@/api/modules/dashboard'
import StatisticsCard from './components/StatisticsCard.vue'
import TrendChart from './components/TrendChart.vue'

const statisticsData = ref<DashboardStatistics>({
  newCustomerCount: 0,
  customerChange: 0,
  newLeadCount: 0,
  leadChange: 0,
  newContractCount: 0,
  contractChange: 0,
  contractAmount: 0,
  amountChange: 0,
  todayApprovedContractCount: 0,
  approvedContractChange: 0,
  todayRejectedContractCount: 0,
  rejectedContractChange: 0
})

const trendData = ref<DashboardTrend>({
  dates: [],
  customerData: [],
  leadData: [],
  contractData: [],
  approvedData: [],
  rejectedData: []
})

const formatCurrency = (value: number) => `¥${value.toFixed(2)}`

const fetchStatisticsData = async () => {
  try {
    const res = await DashboardApi.getDashboardData()
    if (res.data?.statistics && res.data?.trend) {
      statisticsData.value = res.data.statistics
      trendData.value = res.data.trend
    } else {
      console.error('获取的数据格式不正确')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => fetchStatisticsData())
</script>

<style scoped>
/* 新增滚动容器，允许横向滚动 */
.stats-scroll-container {
  overflow-x: auto; /* 横向滚动 */
  padding-bottom: 8px; /* 避免滚动条遮挡内容 */
}

/* 取消卡片容器固定高度，由内容撑开 */
.stats-card-wrapper {
  height: auto;
}

/* 关键：禁止换行，强制一行显示 */
.statistics-card-group {
  display: flex;
  gap: 20px;
  align-items: stretch;
  flex-wrap: nowrap; /* 禁止换行 */
  min-width: max-content; /* 确保容器宽度足够容纳所有卡片 */
  padding: 5px 0; /* 增加内边距避免滚动条紧贴卡片 */
}

/* 其他样式保持不变 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 20px;
  box-sizing: border-box;
  gap: 24px;
}

.chart-wrapper {
  flex: 1;
  min-height: 350px;
}

.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-height-card .el-card__body {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
  margin: 0;
}
</style>
