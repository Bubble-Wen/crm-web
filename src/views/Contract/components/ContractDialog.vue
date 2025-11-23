<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="75%"
    top="8vh"
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
        <el-form-item label="合同编号" prop="number" v-if="dialogProps.row!.id">
          <!-- 修复：readonly="true" → readonly（布尔值） -->
          <el-input v-model="dialogProps.row!.number" readonly show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="合同名称" prop="name">
          <el-input v-model="dialogProps.row!.name" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="签约客户" prop="customerId">
          <div class="flex" style="width: 100%">
            <!-- 修复：disabled → :disabled（布尔值绑定） -->
            <el-input v-model="dialogProps.row!.customerName" placeholder="请选择要签约的客户" class="mr-18px" :disabled="true"> </el-input>
            <el-button type="primary" @click="openCustomerDialog">客户信息</el-button>
            <CustomerDialog ref="customerRef" @get-customer-data="openCustomerDialog" />
          </div>
        </el-form-item>
        <div class="flex" style="width: 100%">
          <el-form-item label="合同开始时间" prop="startTime">
            <el-date-picker
              v-model="dialogProps.row!.startTime"
              type="date"
              placeholder="选择合同开始时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同结束时间" prop="endTime">
            <el-date-picker
              v-model="dialogProps.row!.endTime"
              type="date"
              placeholder="选择合同结束时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同签约时间" prop="signTime">
            <el-date-picker
              v-model="dialogProps.row!.signTime"
              type="date"
              placeholder="选择合同签约时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
        </div>
        <div class="flex" style="width: 100%">
          <el-form-item label="合同总金额" prop="amount" style="flex: 1">
            <!-- 修复：readonly="true" → :readonly="true"（布尔值绑定） -->
            <el-input v-model="dialogProps.row!.amount" clearable :readonly="true"></el-input>
          </el-form-item>
          <el-form-item label="已收款项" prop="receivedAmount" style="flex: 1">
            <!-- 修复：readonly="true" → :readonly="true"（布尔值绑定） -->
            <el-input v-model="dialogProps.row!.receivedAmount" clearable :readonly="true"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialogProps.row!.remark" clearable type="textarea" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <div style="width: 100%">
          <h2>合同产品关系</h2>
          <el-divider />
          <el-table :data="dialogProps.row.products" border style="width: 100%">
            <el-table-column prop="pName" label="商品录入" min-width="140">
              <template #default="scope">
                <el-input v-model="scope.row.pName" placeholder="请输入商品" style="width: 180px" />
                <el-button type="primary" style="margin-left: 5px" @click="openProductDialog(scope.$index)">选择商品</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价"> </el-table-column>
            <el-table-column prop="count" label="数量">
              <template #default="scope">
                <el-input-number v-model="scope.row.count" :min="1" @change="calculateSubtotal(scope.row)" style="width: 100px" />
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="小计" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="danger" size="small" link @click="removeContractProduct(scope.$index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; justify-content: center; width: 100%; margin-top: 10px">
            <el-button type="primary" @click="addContractProduct"> + 添加合同产品关系 </el-button>
          </div>
        </div>
      </el-form>
      <ProductDialog ref="productRef" @get-product-data="onProductSelect" />
    </div>
    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import CustomerDialog from './CustomerDialog.vue'
import ProductDialog from './ProductDialog.vue'
interface DialogProps {
  title: string
  isView: boolean
  fullscreen?: boolean
  row: any
  labelWidth?: number
  maxHeight?: number | string
  api?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
}
const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {
    products: []
  },
  labelWidth: 120,
  fullscreen: false,
  maxHeight: '500px'
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

// 自定义校验函数 - 修复逻辑错误：endTime 与 startTime 对比反了
const validateEndTime = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择合同结束时间'))
  } else if (dialogProps.value.row.startTime && new Date(value) < new Date(dialogProps.value.row.startTime)) {
    callback(new Error('合同结束时间不能早于开始时间'))
  } else {
    callback()
  }
}
const rules = reactive({
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择合同开始时间', trigger: 'blur' }],
  endTime: [
    { required: true, message: '请选择合同结束时间', trigger: 'blur' },
    {
      validator: validateEndTime,
      trigger: 'blur'
    }
  ],
  signTime: [{ required: true, message: '请选择合同签约时间', trigger: 'blur' }]
  // 销售邮箱不添加校验规则，仅做展示
})

// 新增一行
const addContractProduct = () => {
  dialogProps.value.row.products.push({
    pName: '',
    pId: 0,
    price: 0,
    count: 0,
    totalPrice: 0
  })
}

// 删除指定行
const removeContractProduct = (index) => {
  dialogProps.value.row.products.splice(index, 1)
  // 删除后重新计算总金额（避免总金额残留已删除商品的金额）
  calculateTotalAmount()
}

// 计算小计
const calculateSubtotal = (item) => {
  item.totalPrice = item.price * item.count
  calculateTotalAmount()
}

// 计算合同总金额（提取为独立方法，便于复用）
const calculateTotalAmount = () => {
  dialogProps.value.row.amount = dialogProps.value.row.products.reduce((total, product) => total + (product.price || 0) * (product.count || 0), 0)
}

const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
  if (!ruleFormRef.value) return // 避免 null 调用
  ruleFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      // 深拷贝避免修改原对象
      const submitData = { ...dialogProps.value.row }
      delete submitData.updateTime
      delete submitData.createTime

      // 校验是否添加了商品
      if (submitData.products.length === 0) {
        ElMessage.error('请至少添加一个合同产品')
        return
      }

      // 校验商品信息完整性
      const invalidProduct = submitData.products.find((item) => !item.pId || !item.pName || item.price <= 0 || item.count <= 0)
      if (invalidProduct) {
        ElMessage.error('商品信息不完整（请选择有效商品并填写数量）')
        return
      }

      await dialogProps.value.api!(submitData)
      ElMessage.success({ message: `${dialogProps.value.title}成功！` })
      await dialogProps.value.getTableList!() // 等待列表刷新完成
      dialogVisible.value = false
      if (ruleFormRef.value) {
        ruleFormRef.value.resetFields()
      }
      cancelDialog(true)
    } catch (error: any) {
      console.error('提交失败：', error)
      ElMessage.error(`提交失败：${error.response?.data?.msg || '服务器异常'}`)
    }
  })
}

const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  const condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {
      products: [],
      salesEmail: '' // 重置时保留销售邮箱字段
    }
    if (ruleFormRef.value) {
      ruleFormRef.value.resetFields()
    }
  }
}

// 打开客户列表
const customerRef = ref()
const openCustomerDialog = (val?: any) => {
  const params = {
    title: '客户列表'
  }
  if (customerRef.value) {
    customerRef.value.acceptParams(params)
  }
  if (val?.id && val?.name) {
    dialogProps.value.row.customerId = String(val.id)
    dialogProps.value.row.customerName = val.name
  }
}

// 打开商品列表
const productRef = ref()
const currentIndex = ref(0)
const openProductDialog = (index: number) => {
  currentIndex.value = index
  console.log('当前行索引：', index)
  const params = {
    title: '商品列表'
  }
  if (productRef.value) {
    productRef.value.acceptParams(params)
  }
}

// 子组件回调回来选中的商品
const onProductSelect = (val: any) => {
  const index = currentIndex.value
  if (val?.id && val?.name && val?.price) {
    dialogProps.value.row.products[index].pId = val.id
    dialogProps.value.row.products[index].pName = val.name
    dialogProps.value.row.products[index].price = val.price
    calculateSubtotal(dialogProps.value.row.products[index])
  }
}
</script>
