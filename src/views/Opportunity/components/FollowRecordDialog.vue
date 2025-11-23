<template>
  <el-dialog v-model="dialogVisible" title="跟进记录" width="60%" :close-on-click-modal="false" @close="cancelDialog">
    <el-button type="primary" style="margin-bottom: 20px" @click="showAddForm = true">添加跟进记录</el-button>

    <!-- 添加跟进记录表单 -->
    <el-form ref="followFormRef" :model="followForm" :rules="followRules" label-width="120px" v-if="showAddForm" style="margin-bottom: 20px">
      <el-form-item label="跟进时间" prop="followTime">
        <el-date-picker v-model="followForm.followTime" type="datetime" placeholder="请选择跟进时间" />
      </el-form-item>

      <el-form-item label="跟进方式" prop="method">
        <el-select v-model="followForm.method" placeholder="请选择跟进方式">
          <el-option v-for="item in Object.values(FollowUpMethodList)" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="沟通内容" prop="content">
        <el-input v-model="followForm.content" type="textarea" :rows="4" placeholder="请输入沟通内容" />
      </el-form-item>

      <el-form-item label="下一步计划" prop="nextPlan">
        <el-input v-model="followForm.nextPlan" type="textarea" rows="2" placeholder="请输入下一步计划" />
      </el-form-item>

      <el-form-item>
        <el-button @click="showAddForm = false">取消</el-button>
        <el-button type="primary" @click="saveFollowRecord">保存</el-button>
      </el-form-item>
    </el-form>

    <!-- 跟进记录列表 -->
    <el-table :data="followRecords" border>
      <el-table-column prop="followTime" label="跟进时间" width="200" />
      <el-table-column prop="method" label="跟进方式" width="120" :formatter="formatMethod" />
      <el-table-column prop="content" label="沟通内容" />
      <el-table-column prop="nextPlan" label="下一步计划" />
      <el-table-column prop="creatorName" label="跟进人" width="120" />
    </el-table>

    <template #footer>
      <el-button @click="cancelDialog">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FormInstance } from 'element-plus'
import { FollowUpMethodList } from '@/configs/enum'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const followFormRef = ref<FormInstance>()
const showAddForm = ref(false)
const opportunityId = ref<number | undefined>(undefined)
const getFollowRecords = ref<(() => Promise<{ data: any[] }>) | null>(null)
const addFollowRecord = ref<((params: any) => Promise<any>) | null>(null)

// 跟进记录列表
const followRecords = ref<any[]>([])

// 跟进表单 - 修正opportunityId类型为number | undefined
const followForm = reactive({
  opportunityId: undefined as number | undefined,
  followTime: new Date(),
  method: 0,
  content: '',
  nextPlan: ''
})

// 表单验证规则
const followRules = reactive({
  followTime: [{ required: true, message: '请选择跟进时间', trigger: 'change' }],
  method: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入沟通内容', trigger: 'blur' }],
  nextPlan: [{ required: true, message: '请输入下一步计划', trigger: 'blur' }]
})

// 接收父组件参数
const acceptParams = (params: any) => {
  opportunityId.value = params.opportunityId
  getFollowRecords.value = params.getFollowRecords
  addFollowRecord.value = params.addFollowRecord
  followForm.opportunityId = params.opportunityId
  dialogVisible.value = true
  loadFollowRecords()
}

// 加载跟进记录
const loadFollowRecords = async () => {
  if (getFollowRecords.value) {
    const res = await getFollowRecords.value()
    followRecords.value = res.data
  }
}

// 保存跟进记录
const saveFollowRecord = async () => {
  const formRef = followFormRef.value
  if (!formRef) return

  await formRef.validate(async (valid) => {
    if (valid && addFollowRecord.value) {
      try {
        await addFollowRecord.value(followForm)
        ElMessage.success('添加跟进记录成功')
        showAddForm.value = false
        // 重置表单
        formRef.resetFields()
        // 修正类型不匹配问题
        followForm.opportunityId = opportunityId.value
        followForm.followTime = new Date()
        // 重新加载列表
        loadFollowRecords()
      } catch (error) {
        console.error(error)
      }
    }
  })
}

// 格式化跟进方式
const formatMethod = (row: any) => {
  const method = Object.values(FollowUpMethodList).find((item) => item.value === row.method)
  return method ? method.label : ''
}

// 取消
const cancelDialog = () => {
  dialogVisible.value = false
  showAddForm.value = false
  followRecords.value = []
}

defineExpose({
  acceptParams
})
</script>
