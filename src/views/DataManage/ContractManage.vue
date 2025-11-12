<template>
  <div class="container-box">
    <div class="select-box">
      <span>筛选：</span>
      <el-select v-model="selectedType" placeholder="选择统计类型" style="width: 240px; margin-left: 20px">
        <el-option label="按状态统计（数量）" value="status" />
      </el-select>
      <el-button type="primary" @click="getStatisData" style="margin-left: 20px">查询</el-button>
    </div>
    <div style="height: 80vh; width: 100%">
      <ContractPieChart :data="contractData || {}" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ContractPieChart from './components/ContractPieChart.vue'
import { ContractApi } from '@/api/modules/contract'
import { ElMessage } from 'element-plus'

// 1. 定义后端返回的单个统计项类型（与后端ContractTrendPieVO字段完全匹配）
interface ContractStatusPieItem {
  status: number // 状态编码（0-待审核，1-审核中，2-已通过）
  statusName?: string // 状态名称（后端可能返回，可选）
  count: number // 对应状态的合同数量
}

// 2. 定义接口返回通用类型（如果项目已有，可直接导入复用）
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 统计类型：与下拉选项value一致
const selectedType = ref('status')

// 3. 合同统计数据类型（给子组件ContractPieChart的props类型）
interface ContractStatData {
  typeList: string[] // 状态中文名称列表
  valueList: number[] // 对应数量列表
}
const contractData = ref<ContractStatData>({
  typeList: [],
  valueList: []
})

// 4. 状态编码-中文名称映射（统一管理，便于维护）
const statusNameMap = new Map<number, string>([
  [0, '待审核'],
  [1, '审核中'],
  [2, '已通过'],
  [3, '已驳回'], // 可根据实际业务补充
  [4, '已终止']
])

// 获取统计数据（用类型断言替代泛型，解决参数数量不匹配问题）
const getStatisData = async () => {
  try {
    // 关键修改：不传入泛型，而是通过 as 类型断言指定返回类型
    const res = (await ContractApi.getContractStatusPieData()) as unknown as ApiResponse<ContractStatusPieItem[]>

    // 校验返回数据有效性（双重保险，避免后端返回异常）
    if (!res || !Array.isArray(res.data)) {
      ElMessage.warning('统计数据格式异常')
      return
    }

    // 转换数据格式（严格类型校验，无any）
    const typeList: string[] = res.data.map((item) => {
      // 优先使用后端返回的statusName，没有则用映射表，兜底显示未知状态
      return item.statusName || statusNameMap.get(item.status) || `未知状态(${item.status})`
    })
    const valueList: number[] = res.data.map((item) => {
      // 确保count是数字，兜底0（避免后端返回null/undefined导致NaN）
      return typeof item.count === 'number' ? item.count : 0
    })

    contractData.value = { typeList, valueList }
  } catch (error) {
    console.error('获取合同统计数据失败:', error)
    ElMessage.error('获取统计数据失败，请重试')
    // 错误时重置数据，避免子组件渲染异常
    contractData.value = { typeList: [], valueList: [] }
  }
}

// 页面加载时初始化数据
onMounted(() => {
  getStatisData()
})
</script>

<style scoped>
.container-box {
  padding: 20px;
}
.select-box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>
