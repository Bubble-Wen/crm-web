<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="公海管理"
      :columns="columns"
      :requestApi="CustomerApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格操作（将插槽放在 ProTable 内部） -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:customer:private']" @click="customerToPrivate(scope.row.id)">客户领取</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts" name="PublicManage">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { CustomerApi } from '@/api/modules/customer'
import { GenderList, IsKeyDecisionMakerList } from '@/configs/enum'
import { EditPen } from '@element-plus/icons-vue'
import { useHandleData } from '@/hooks/useHandleData'
import { ElMessage } from 'element-plus' // 引入消息提示

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据
const initParam = reactive({ isPublic: 1 })
const dataSize = ref(0)

/**
 * 处理表格返回数据，修复数组长度获取方式
 */
const dataCallback = (data: any) => {
  dataSize.value = data.list.size
  return {
    list: data.list, // 避免 null/undefined 导致的渲染问题
    total: data.total
  }
}

const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '客户名称',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'phone',
    label: '手机号',
    minWidth: 160,
    search: { el: 'input' }
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 120
  },
  {
    prop: 'gender',
    label: '性别',
    enum: Object.values(GenderList),
    minWidth: 120
  },
  {
    prop: 'isKeyDecisionMaker',
    label: '是否为关键决策人',
    enum: Object.values(IsKeyDecisionMakerList),
    minWidth: 140
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 130 }
]

const customerToPrivate = async (id: any) => {
  //   await useHandleData(CustomerApi.toPrivate, { id }, '领取客户')
  //   proTable.value?.clearSelection()
  //   proTable.value?.getTableList() // 增加可选链，避免未定义报错
  if (!id) {
    ElMessage.warning('客户ID不存在')
    return
  }
  try {
    await useHandleData(CustomerApi.toPrivate, { id }, '领取客户')
    // 领取成功后强制刷新列表，确保已领取客户从公海消失
    proTable.value?.getTableList({ page: 1 }) // 重置到第一页，避免残留
  } catch (error) {
    console.error('领取失败:', error)
    // 不重复提示错误（useHandleData已处理）
  }
}
</script>
