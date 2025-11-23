<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="商机列表"
      rowKey="id"
      :columns="columns"
      :requestApi="OpportunityApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:opportunity:add']" @click="openDrawer('新增')">新增商机</el-button>
        <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected" v-hasPermi="['sys:opportunity:remove']" @click="batchDelete(scope.selectedListIds)"
          >批量删除</el-button
        >
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:opportunity:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" v-hasPermi="['sys:opportunity:remove']" @click="batchDelete([scope.row.id])">删除</el-button>
        <el-button type="info" link :icon="EditPen" @click="openFollowDrawer(scope.row)">跟进记录</el-button>
        <el-button type="warning" link :icon="Switch" @click="changeStatus(scope.row)">变更状态</el-button>
        <el-button type="success" link :icon="Document" v-if="scope.row.status === 3" @click="toContract(scope.row)">生成合同</el-button>
      </template>
    </ProTable>
    <OpportunityDialog ref="dialogRef" />
    <FollowRecordDialog ref="followDialogRef" />
    <StatusChangeDialog ref="statusDialogRef" />
  </div>
</template>

<script setup lang="ts" name="OpportunityManager">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { OpportunityApi } from '@/api/modules/opportunity'
import { CirclePlus, EditPen, Delete, Switch, Document } from '@element-plus/icons-vue'
import { useHandleData } from '@/hooks/useHandleData'
import { ElMessage, ElMessageBox } from 'element-plus'
import OpportunityDialog from './components/OpportunityDialog.vue'
import FollowRecordDialog from './components/FollowRecordDialog.vue'
import StatusChangeDialog from './components/StatusChangeDialog.vue'
import { OpportunityStatusList } from '@/configs/enum'

// 获取 ProTable 元素
const proTable = ref()
const dialogRef = ref()
const followDialogRef = ref()
const statusDialogRef = ref()

// 初始化请求参数
const initParam = reactive({})
const dataSize = ref(0)

// 数据处理回调
const dataCallback = (data: any) => {
  dataSize.value = data.list.size
  return {
    list: data.list,
    total: data.total
  }
}

// 表格配置项
const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '商机名称',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'customerName',
    label: '客户名称',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'estimatedAmount',
    label: '预估金额',
    minWidth: 120,
    formatter: (row: any) => `¥${row.estimatedAmount.toFixed(2)}`
  },
  {
    prop: 'successRate',
    label: '成交概率',
    minWidth: 100,
    formatter: (row: any) => `${row.successRate}%`
  },
  {
    prop: 'followerName',
    label: '跟进人',
    minWidth: 120
  },
  {
    prop: 'expectedClosingTime',
    label: '预计成交时间',
    minWidth: 140
  },
  {
    prop: 'status',
    label: '商机状态',
    minWidth: 120,
    enum: Object.values(OpportunityStatusList),
    search: { el: 'select' }
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 180
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 350 }
]

// 打开抽屉(新增、编辑)
const openDrawer = (title: string, row: Partial<any> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: OpportunityApi.saveOrEdit,
    getTableList: () => proTable.value?.getTableList(),
    maxHeight: '500px'
  }
  dialogRef.value.acceptParams(params)
}

// 打开跟进记录
const openFollowDrawer = (row: any) => {
  const params = {
    opportunityId: row.id,
    getFollowRecords: () => OpportunityApi.getFollowRecords({ opportunityId: row.id }),
    addFollowRecord: OpportunityApi.addFollowRecord
  }
  followDialogRef.value.acceptParams(params)
}

// 变更状态
const changeStatus = (row: any) => {
  const params = {
    id: row.id,
    currentStatus: row.status,
    api: OpportunityApi.changeStatus,
    onSuccess: () => proTable.value.getTableList()
  }
  statusDialogRef.value.acceptParams(params)
}

// 批量删除
const batchDelete = async (ids: any[]) => {
  await useHandleData(OpportunityApi.remove, ids, '删除所选商机')
  proTable.value.clearSelection()
  proTable.value.getTableList()
}

// 转为合同
const toContract = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认要将此商机转为合同吗？', '温馨提示', { type: 'warning' })
    const res = (await OpportunityApi.toContract({ id: row.id })) as any
    ElMessage.success('合同生成成功')
    // 打开合同编辑对话框
    openContractDialog(res.data.contractId)
    proTable.value.getTableList()
  } catch (error) {
    console.log(error)
  }
}

// 打开合同编辑对话框
const openContractDialog = (contractId: number) => {
  // 这里需要根据实际项目的路由配置进行调整
  // 示例：跳转到合同编辑页面
  // router.push({ path: '/contract/edit', query: { id: contractId } })
  console.log('打开合同编辑对话框，合同ID：', contractId)
}
</script>
