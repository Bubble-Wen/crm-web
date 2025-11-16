// @/api/modules/upload.ts
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'
import http from '@/api'

// 修复方案2: 如果types目录不存在，可以先注释掉类型导入，使用any替代
// import type { ApiResponse, UploadResult } from '@/types'

/**
 * 上传图片/文件
 * @param params - 表单数据（包含文件）
 * @returns 上传结果（含文件URL）
 */
export const uploadFile = (params: FormData): Promise<any> => {
  return http.post(`${COMMON_ADMIN_API}/common/upload/file`, params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传视频
 * @param params - 表单数据（包含视频文件）
 * @returns 上传结果（含视频URL）
 */
export const uploadVideo = (params: FormData): Promise<any> => {
  return http.post(`${COMMON_ADMIN_API}/common/upload/video`, params, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
