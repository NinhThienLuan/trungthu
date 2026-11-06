import type { ComplianceDoc, ComplianceDocType, Subscription } from '../services/sellerService'
import { toIsoDate } from './format'

export const REQUIRED_DOCUMENTS: ComplianceDocType[] = ['FOOD_SAFETY_CERT', 'BUSINESS_LICENSE', 'IDENTITY_KYC']

// Match BE: each type must have at least one approved submission, including history.
export const hasApprovedCompliance = (documents: ComplianceDoc[]) =>
  REQUIRED_DOCUMENTS.every((type) => documents.some((doc) => doc.documentType === type && doc.verificationStatus === 'APPROVED'))

export const isSubscriptionActive = (subscription: Subscription, today = toIsoDate(new Date())) =>
  subscription.status === 'ACTIVE' && !!subscription.startDate && !!subscription.endDate
  && subscription.startDate <= today && subscription.endDate >= today

export const SELLER_STATUS_CHANGED = 'seller-status-changed'
export const notifySellerStatusChanged = () => window.dispatchEvent(new Event(SELLER_STATUS_CHANGED))
