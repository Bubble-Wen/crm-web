<template>
  <el-dialog v-model="dialogVisible" title="变更商机状态" :close-on-click-modal="false" @close="cancelDialog">
    <el-form ref="statusFormRef" :model="statusForm" :rules="statusRules" label-width="120px">
      <el-form-item label="当前状态" prop="currentStatus">
        <el-input v-model="currentStatusLabel" disabled />
      </el-form-item>

      <el-form-item label="目标状态" prop="targetStatus">
        <el-select v-model="statusForm.targetStatus" placeholder="请选择目标状态">
          <el-option v-for="item in filterStatusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="变更原因" prop="reason">
        <el-input v-model="statusForm.reason" type="textarea" :rows="4" placeholder="请输入状态变更原因" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="cancelDialog">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认变更</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { FormInstance } from 'element-plus'
import { OpportunityStatusList } from '@/configs/enum'
import { ElMessage } from 'element-plus'

// 定义接口类型，明确api和回调函数的类型
interface StatusChangeParams {
  id: number | undefined
  currentStatus: number
  api?: (params: any) => Promise<any>
  onSuccess?: () => void
}

const dialogVisible = ref(false)
const statusFormRef = ref<FormInstance>()
const currentStatus = ref(0)
// 修改api和onSuccess的类型定义，明确为函数类型
const api = ref<((params: any) => Promise<any>) | null>(null)
const onSuccess = ref<(() => void) | null>(null)

// 状态表单 - 修正id的类型定义，允许number类型
const statusForm = reactive({
  id: undefined as number | undefined,
  targetStatus: 0,
  reason: ''
})

// 验证规则
const statusRules = reactive({
  targetStatus: [{ required: true, message: '请选择目标状态', trigger: 'change' }],
  reason: [{ required: true, message: '请输入变更原因', trigger: 'blur' }]
})

// 当前状态标签
const currentStatusLabel = computed(() => {
  const status = Object.values(OpportunityStatusList).find((item) => item.value === currentStatus.value)
  return status ? status.label : ''
})

// 过滤可变更的状态列表（根据业务逻辑定义）
const filterStatusList = computed(() => {
  // 这里可以根据当前状态定义允许的状态流转路径
  const allStatus = Object.values(OpportunityStatusList)

  // 简单示例：不允许重复选择当前状态
  return allStatus.filter((item) => item.value !== currentStatus.value)
})

// 接收参数，使用类型约束
const acceptParams = (params: StatusChangeParams) => {
  statusForm.id = params.id
  currentStatus.value = params.currentStatus
  statusForm.targetStatus = params.currentStatus
  statusForm.reason = ''
  api.value = params.api || null
  onSuccess.value = params.onSuccess || null
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!statusFormRef.value) return
  await statusFormRef.value.validate(async (valid) => {
    if (valid && api.value) {
      // 确保api存在才调用
      try {
        await api.value(statusForm)
        ElMessage.success('状态变更成功')
        dialogVisible.value = false
        onSuccess.value && onSuccess.value() // 确保回调存在才调用
      } catch (error) {
        console.error(error)
      }
    }
  })
}

// 取消
const cancelDialog = () => {
  dialogVisible.value = false
  statusFormRef.value?.resetFields()
}

defineExpose({
  acceptParams
})
</script>
