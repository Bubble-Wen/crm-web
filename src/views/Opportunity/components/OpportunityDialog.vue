<template>
  <el-dialog v-model="dialogVisible" :title="dialogProps.title" :max-height="dialogProps.maxHeight" :close-on-click-modal="false" @close="cancelDialog">
    <el-form ref="ruleFormRef" :model="dialogProps.row" :rules="rules" label-width="120px">
      <el-form-item label="商机名称" prop="name">
        <el-input v-model="dialogProps.row.name" placeholder="请输入商机名称" :disabled="dialogProps.isView" />
      </el-form-item>

      <el-form-item label="客户信息" prop="customerId">
        <el-select v-model="dialogProps.row.customerId" placeholder="请选择客户" :disabled="dialogProps.isView">
          <el-option v-for="item in customerList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="预估金额" prop="estimatedAmount">
        <el-input v-model.number="dialogProps.row.estimatedAmount" placeholder="请输入预估金额" :disabled="dialogProps.isView" />
      </el-form-item>

      <el-form-item label="成交概率" prop="successRate">
        <el-slider v-model="dialogProps.row.successRate" :min="0" :max="100" :disabled="dialogProps.isView" show-input />
      </el-form-item>

      <el-form-item label="跟进人" prop="followerId">
        <el-select v-model="dialogProps.row.followerId" placeholder="请选择跟进人" :disabled="dialogProps.isView">
          <el-option v-for="item in userList" :key="item.id" :label="item.nickname || item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="预计成交时间" prop="expectedClosingTime">
        <el-date-picker v-model="dialogProps.row.expectedClosingTime" type="date" placeholder="请选择预计成交时间" :disabled="dialogProps.isView" />
      </el-form-item>

      <el-form-item label="商机状态" prop="status" v-if="dialogProps.row.id">
        <el-select v-model="dialogProps.row.status" placeholder="请选择商机状态" :disabled="dialogProps.isView">
          <el-option v-for="item in Object.values(OpportunityStatusList)" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="商机描述" prop="description">
        <el-input v-model="dialogProps.row.description" type="textarea" :rows="4" placeholder="请输入商机描述" :disabled="dialogProps.isView" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="cancelDialog">取消</el-button>
      <el-button type="primary" @click="handleSubmit" v-if="!dialogProps.isView">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { FormInstance } from 'element-plus'
import { OpportunityStatusList } from '@/configs/enum'
import { CustomerApi } from '@/api/modules/customer'
import { getManagerPage } from '@/api/modules/manager'
import { ElMessage } from 'element-plus'

// 定义接口类型
interface OpportunityRow {
  id?: number
  name: string
  customerId?: number
  customerName?: string
  estimatedAmount: number
  successRate: number
  followerId?: number
  followerName?: string
  expectedClosingTime: string
  status: number
  description: string
}

interface DialogPropsType {
  title: string
  row: OpportunityRow
  isView: boolean
  api?: (params: OpportunityRow) => Promise<any>
  getTableList?: () => Promise<any>
  maxHeight: string
}

interface CustomerItem {
  id: number
  name: string
}

// 修正用户列表接口返回类型定义
interface UserItem {
  id: number
  name: string // 增加name字段兼容接口返回
  nickname?: string
}

// 修正客户接口响应类型
interface CustomerApiResponse {
  data: {
    list: CustomerItem[]
  }
}

// 修正用户列表响应接口类型
interface UserApiResponse {
  data: {
    list: UserItem[]
  }
}

const dialogVisible = ref(false)
const ruleFormRef = ref<FormInstance>()
const dialogProps: DialogPropsType = reactive({
  title: '',
  row: {
    name: '',
    estimatedAmount: 0,
    successRate: 0,
    expectedClosingTime: '',
    status: 0,
    description: ''
  },
  isView: false,
  maxHeight: '500px'
})

// 客户列表和用户列表 - 明确类型
const customerList = ref<CustomerItem[]>([])
const userList = ref<UserItem[]>([])

// 表单验证规则
const rules = reactive({
  name: [{ required: true, message: '请输入商机名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  estimatedAmount: [{ required: true, message: '请输入预估金额', trigger: 'blur' }],
  successRate: [{ required: true, message: '请设置成交概率', trigger: 'change' }],
  followerId: [{ required: true, message: '请选择跟进人', trigger: 'change' }],
  expectedClosingTime: [{ required: true, message: '请选择预计成交时间', trigger: 'change' }]
})

// 接收父组件参数
const acceptParams = (params: Partial<DialogPropsType>) => {
  dialogProps.title = params.title || ''
  dialogProps.row = { ...dialogProps.row, ...params.row }
  dialogProps.isView = params.isView || false
  dialogProps.api = params.api
  dialogProps.getTableList = params.getTableList
  dialogProps.maxHeight = params.maxHeight || '500px'
  dialogVisible.value = true
}

// 获取客户列表 - 修正类型断言
const getCustomerList = async () => {
  const res = (await CustomerApi.list({})) as CustomerApiResponse
  customerList.value = res.data?.list ?? []
}

// 获取用户列表 - 修正类型断言和字段映射
const getUsers = async () => {
  const res = (await getManagerPage({ page: 1, limit: 100 })) as unknown as UserApiResponse
  userList.value = res.data?.list ?? []
}

// 提交表单
const handleSubmit = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid) => {
    if (valid && dialogProps.api) {
      try {
        await dialogProps.api(dialogProps.row)
        ElMessage.success(`${dialogProps.title}成功`)
        dialogProps.getTableList && (await dialogProps.getTableList())
        dialogVisible.value = false
      } catch (error) {
        console.error(error)
      }
    }
  })
}

// 取消
const cancelDialog = () => {
  dialogVisible.value = false
  ruleFormRef.value?.resetFields()
}

// 初始化数据
onMounted(() => {
  getCustomerList()
  getUsers()
})

defineExpose({
  acceptParams
})
</script>
