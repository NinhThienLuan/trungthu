import { ORDER_STATUS_LABEL } from '../constants'
import { cn } from '../lib/format'
import type { OrderStatus } from '../types/order'

const STYLE: Record<OrderStatus, string> = {
  PENDING_DEPOSIT: 'border-gold bg-champagne text-gold-ink',
  CONFIRMED: 'border-navy/20 bg-ivory text-navy',
  DEPOSITED: 'border-success/30 bg-success-soft text-success',
  BAKING_QUEUED: 'border-success/30 bg-success-soft text-success',
  DELIVERING: 'border-navy/20 bg-ivory text-navy',
  COMPLETED: 'border-navy bg-navy text-gold',
  CANCELLED: 'border-danger/30 bg-danger-soft text-danger',
}

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <span className={cn('chip', STYLE[status])}>{ORDER_STATUS_LABEL[status]}</span>
}
