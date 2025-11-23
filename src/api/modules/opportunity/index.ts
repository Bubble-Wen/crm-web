import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'

/**
 * @name 商机管理
 */
export const OpportunityApi = {
  // 分页查询商机
  page: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/page', params),
  // 保存或编辑商机
  saveOrEdit: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/saveOrUpdate', params),
  // 删除商机
  remove: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/remove', params),
  // 更改商机状态
  changeStatus: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/changeStatus', params),
  // 添加跟进记录
  addFollowRecord: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/followRecord/add', params),
  // 获取跟进记录列表
  getFollowRecords: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/followRecord/list', params),
  // 转为合同
  toContract: (params: any) => http.post(COMMON_ADMIN_API + '/opportunity/toContract', params)
}
