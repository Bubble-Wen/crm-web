<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="客户列表"
      rowKey="id"
      :columns="columns"
      :requestApi="CustomerApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格头部：批量删除按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增客户</el-button>
        <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds.map(Number))">批量删除</el-button>
        <el-button type="primary" :icon="Download" v-hasPermi="['sys:customer:export']" @click="downloadFile">导出</el-button>
      </template>

      <!-- 表格操作列：横向排列三个按钮 -->
      <template #operation="scope">
        <el-row :gutter="6">
          <el-col :span="8">
            <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:customer:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="danger" link :icon="Delete" v-hasPermi="['sys:customer:remove']" @click="batchDelete([scope.row.id])">删除</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="warning" link :icon="Share" @click="customerToPublic(scope.row.id)">转⼊公海</el-button>
          </el-col>
        </el-row>
      </template>
    </ProTable>
    <CustomerDialog ref="dialogRef" />
  </div>
</template>

<script setup lang="ts" name="CustomerManager">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { CustomerApi } from '@/api/modules/customer'
import { CustomerLevelList, CustomerSourceList, FollowUpStatusList, GenderList, IsKeyDecisionMakerList } from '@/configs/enum'
import { CirclePlus, Download, EditPen, Delete, Share } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useDownload } from '@/hooks/useDownload'
import CustomerDialog from './components/CustomerDialog.vue'
import { useHandleData } from '@/hooks/useHandleData'

// ProTable 实例，用于刷新表格、获取查询参数
const proTable = ref()

// 表格初始化请求参数
const initParam = reactive({ isPublic: 0 })

// 处理后端返回数据格式（适配 ProTable 要求的 { list, total } 结构）
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
    label: '客户名称',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'phone',
    label: '手机号',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 150
  },
  {
    prop: 'gender',
    label: '性别',
    enum: Object.values(GenderList),
    minWidth: 100
  },
  {
    prop: 'isKeyDecisionMaker',
    label: '是否是关键决策人',
    enum: Object.values(IsKeyDecisionMakerList),
    minWidth: 100
  },
  {
    prop: 'dealCount',
    label: '成交次数',
    minWidth: 120
  },
  {
    prop: 'level',
    label: '客户级别',
    enum: Object.values(CustomerLevelList),
    minWidth: 120,
    search: { el: 'select' }
  },
  {
    prop: 'source',
    label: '客户来源',
    minWidth: 120,
    enum: Object.values(CustomerSourceList),
    search: { el: 'select' }
  },
  {
    prop: 'address',
    label: '客户地址',
    minWidth: 120
  },
  {
    prop: 'followStatus',
    label: '跟进状态',
    enum: Object.values(FollowUpStatusList),
    minWidth: 120
  },
  {
    prop: 'nextFollowStatus',
    label: '下次跟进时间',
    minWidth: 120
  },
  {
    prop: 'createName',
    label: '创建人',
    minWidth: 120
  },
  {
    prop: 'ownerName',
    label: '所属销售姓名',
    minWidth: 120
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 200
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 220 } // 调整操作列宽度（因删除公海按钮）
]
// 转⼊公海
const customerToPublic = async (id: any) => {
  await useHandleData(CustomerApi.toPublic, { id: id }, '转⼊公海')
  proTable.value.clearSelection()
  proTable.value.getTableList()
}

// 导出客户信息
const downloadFile = async () => {
  if (initParam) {
    proTable.value.searchParam.isPublic = initParam.isPublic
  }
  ElMessageBox.confirm('确认导出用户信息吗？', '温馨提醒', { type: 'warning' })
    .then(() => useDownload(CustomerApi.export, '客户信息', proTable?.value.searchParam))
    .catch(() => {})
}

// 弹窗引用（新增/编辑客户）
const dialogRef = ref()
const openDrawer = (title: string, row: Partial<any> = {}) => {
  const params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: CustomerApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '300px'
  }
  dialogRef.value.acceptParams(params)
}

// 批量/单个删除客户
const batchDelete = async (ids: number[]) => {
  // 未选客户时提示
  if (ids.length === 0) {
    ElMessage.warning('请选择要删除的客户')
    return
  }
  // 删除确认弹窗
  ElMessageBox.confirm(`确定要删除选中的${ids.length}个客户吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  })
    .then(async () => {
      try {
        await CustomerApi.remove(ids) // 调用后端删除接口
        ElMessage.success('删除成功')
        proTable.value.clearSelection() // 清除表格选中状态
        proTable.value.getTableList() // 刷新表格数据
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 取消删除，不执行操作
    })
}
</script>
