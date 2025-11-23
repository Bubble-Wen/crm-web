<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="商品列表"
      rowKey="id"
      :columns="columns"
      :requestApi="ProductApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格头部：新增商品按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增商品</el-button>
      </template>

      <!-- 表格操作栏：编辑、定时上下架 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="success" link :icon="Check" @click="openStateDialog('商品定时上架', scope.row)" v-if="scope.row.status !== 1">商品上架</el-button>
        <el-button type="danger" link :icon="Bottom" @click="openStateDialog('商品定时下架', scope.row)" v-if="scope.row.status === 1">商品下架</el-button>
      </template>
    </ProTable>

    <!-- 商品新增/编辑弹窗 -->
    <ProductDialog ref="dialogRef" />
    <!-- 定时上下架弹窗：使用重命名后的组件 -->
    <ProductStateDialog ref="stateDialogRef" />
  </div>
</template>

<script setup lang="ts" name="ProductManager">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { ProductStatusList } from '@/configs/enum'
import { ProductApi } from '@/api/modules/product'
import { Bottom, Check, CirclePlus, EditPen } from '@element-plus/icons-vue'
import ProductDialog from './components/ProductDialog.vue'
// 导入重命名后的定时上下架弹窗
import ProductStateDialog from './components/ProductStateDialog.vue'

// 1. 修正 ProTable ref 定义：初始为 null，明确类型
const proTable = ref<InstanceType<typeof ProTable> | null>(null)

// 弹窗实例
const dialogRef = ref()
const stateDialogRef = ref()

// 初始化参数
const initParam = reactive({})

// 表格数据处理
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  }
}

// 表格列配置
const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '商品名称',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'price',
    label: '价格',
    minWidth: 120
  },
  {
    prop: 'sales',
    label: '销量',
    minWidth: 120
  },
  {
    prop: 'stock',
    label: '库存数量',
    minWidth: 120
  },
  {
    prop: 'status',
    label: '商品状态',
    minWidth: 120,
    enum: Object.values(ProductStatusList),
    search: {
      el: 'select'
    },
    formatter: (row: any) => {
      const statusMap = { 0: '初始化', 1: '上架', 2: '下架' }
      const typeMap = { 0: 'info', 1: 'success', 2: 'danger' }
      return `<el-tag type="${typeMap[row.status]}">${statusMap[row.status]}</el-tag>`
    }
  },
  {
    prop: 'operation',
    label: '操作',
    fixed: 'right',
    width: 220
  }
]

// 2. 修正 openDrawer 方法：函数引用+可选链保护
const openDrawer = (title: string, row: Partial<any> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ProductApi.saveOrEdit,
    // 关键修复：用函数包裹，避免直接执行；可选链防止 undefined
    getTableList: () => proTable.value?.getTableList(),
    maxHeight: '300px'
  }
  // 可选链保护：确保 dialogRef 存在再调用方法
  dialogRef.value?.acceptParams(params)
}

// 3. 修正 openStateDialog 方法：同 openDrawer 修复逻辑
const openStateDialog = (title: string, row: Partial<any> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: false,
    api: ProductApi.saveOrEdit,
    // 关键修复：函数引用+可选链
    getTableList: () => proTable.value?.getTableList(),
    maxHeight: '150px'
  }
  // 可选链保护
  stateDialogRef.value?.acceptParams(params)
}

// 暴露 proTable（如需父组件调用，无需则可删除）
defineExpose({
  proTable
})
</script>
