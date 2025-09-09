// Application constants for consistent status handling

export const BORROWING_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  RETURNED: 'RETURNED'
};

export const AUDIT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

export const BORROWING_ACTIONS = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT'
};

export const AUDIT_ACTIONS = {
  VERIFY: 'VERIFY',
  REJECT: 'REJECT'
};

export const STATUS_BADGE_CLASSES = {
  PENDING: 'bg-warning',
  APPROVED: 'bg-success',
  REJECTED: 'bg-danger',
  ACTIVE: 'bg-info',
  RETURNED: 'bg-secondary',
  VERIFIED: 'bg-success'
};
