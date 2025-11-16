// src/enums/contract.ts
export enum ContractStatus {
  INIT = 0,
  AUDITING = 1,
  APPROVED = 2,
  REJECTED = 3,
  PENDING
}

export const ContractStatusMap = {
  [ContractStatus.INIT]: { label: '初始化', tagType: 'info' },
  [ContractStatus.AUDITING]: { label: '审核中', tagType: 'processing' },
  [ContractStatus.APPROVED]: { label: '审核通过', tagType: 'success' },
  [ContractStatus.REJECTED]: { label: '审核未通过', tagType: 'danger' }
}

export enum ApprovalStatus {
  INIT = 0,
  AGREE = 1,
  REJECT = 2
}

export const ApprovalStatusMap = {
  [ApprovalStatus.INIT]: { label: '初始化' },
  [ApprovalStatus.AGREE]: { label: '同意' },
  [ApprovalStatus.REJECT]: { label: '拒绝' }
}
