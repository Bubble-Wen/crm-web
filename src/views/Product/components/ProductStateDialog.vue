<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="35%"
  >
    <div :style="'width: calc(100% - ' + dialogProps.labelWidth! / 2 + 'px)'">
      <el-form
        ref="ruleFormRef"
        label-position="right"
        :label-width="dialogProps.labelWidth + 'px'"
        :rules="rules"
        :model="dialogProps.row"
        :disabled="dialogProps.isView"
        :hide-required-asterisk="dialogProps.isView"
      >
        <el-form-item :label="dialogProps.title + '时间'" prop="time">
          <el-date-picker
            v-model="dialogProps.row.time"
            type="datetime"
            :placeholder="'请选择' + dialogProps.title + '时间'"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="cancelDialog">取消</el-button>
      <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit"> 确定 </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'

interface DialogProps {
  title: string
  isView: boolean
  fullscreen?: boolean
  row: {
    time?: string
    onShelfTime?: string
    offShelfTime?: string
    updateTime?: string
    createTime?: string
    [key: string]: any
  }
  labelWidth?: number
  maxHeight?: number | string
  api?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
}

const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 160,
  fullscreen: true,
  maxHeight: '500px'
})

const acceptParams = (params: DialogProps): void => {
  dialogProps.value.row = { ...dialogProps.value.row, ...params.row }
  if (dialogProps.value.title === '商品上架') {
    dialogProps.value.row.time = dialogProps.value.row.onShelfTime
  } else {
    dialogProps.value.row.time = dialogProps.value.row.offShelfTime
  }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({ acceptParams })

const rules = computed(() => ({
  time: [
    {
      required: true,
      message: `请选择${dialogProps.value.title}时间`,
      trigger: 'blur'
    },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          return callback(new Error(`请选择${dialogProps.value.title}时间`))
        }
        const now = new Date()
        const selected = new Date(value)
        if (selected.getTime() < now.getTime() - 8.64e7) {
          return callback(new Error(`${dialogProps.value.title}时间不能早于当前时间`))
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}))

const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
  ruleFormRef.value?.validate(async (valid) => {
    if (!valid) return

    try {
      delete dialogProps.value.row.updateTime
      delete dialogProps.value.row.createTime

      if (dialogProps.value.title === '商品上架') {
        dialogProps.value.row.onShelfTime = dialogProps.value.row.time
      } else {
        dialogProps.value.row.offShelfTime = dialogProps.value.row.time
      }

      if (dialogProps.value.api) {
        await dialogProps.value.api(dialogProps.value.row)
        ElMessage.success(`${dialogProps.value.title}成功！`)
        dialogProps.value.getTableList?.()
        dialogVisible.value = false
        ruleFormRef.value?.resetFields()
      }
    } catch (error) {
      console.log(error)
    }
  })
}

const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  const condition = ['查看', '编辑'].includes(dialogProps.value.title) || isClean
  if (condition) {
    dialogProps.value.row = {}
    ruleFormRef.value?.resetFields()
  }
}
</script>
