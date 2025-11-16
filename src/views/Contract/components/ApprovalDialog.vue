<!-- src/views/Contract/components/ApprovalDialog.vue -->
<template>
  <!-- 修复：将v-model改为:visible绑定 + update:visible事件 -->
  <el-dialog :visible="visible" title="合同审核" width="500px" @close="handleClose" @update:visible="(val) => emit('update:visible', val)">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="审核结果" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="ApprovalStatus.AGREE">通过</el-radio>
          <el-radio :label="ApprovalStatus.REJECT">不通过</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核内容" prop="content">
        <el-input v-model="form.content" type="textarea" rows="4" placeholder="请输入审核意见（通过原因/不通过原因）" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交审核</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ApprovalStatus } from '@/enums/contract'

const formRef = ref()
const props = defineProps({
  visible: { type: Boolean, default: false },
  contractId: { type: Number, required: true }
})
const emit = defineEmits(['update:visible', 'onSuccess'])

const form = ref({
  status: ApprovalStatus.AGREE,
  content: '',
  contractId: props.contractId
})

const rules = {
  status: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  content: [{ required: true, message: '请输入审核内容', trigger: 'blur' }]
}

const handleSubmit = async () => {
  await formRef.value.validate()
  emit('onSuccess', form.value)
}

const handleClose = () => {
  formRef.value.resetFields()
  emit('update:visible', false)
}
</script>
