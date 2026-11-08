import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { hasApprovedCompliance, isSubscriptionActive, SELLER_STATUS_CHANGED } from '../lib/sellerEligibility'
import { sellerService, subscriptionService } from '../services/sellerService'
import { Notice } from './ui/States'

/** Mounted only for sellers; refresh after mutations, navigation or returning to the tab. */
export function SellerStatusBanner() {
  const { pathname } = useLocation()
  const { data, loading, error, reload } = useApi(async () => {
    const [documents, subscriptions] = await Promise.all([sellerService.documents(), subscriptionService.mine()])
    return { documents, subscriptions }
  }, [pathname])

  useEffect(() => {
    window.addEventListener(SELLER_STATUS_CHANGED, reload)
    window.addEventListener('focus', reload)
    return () => {
      window.removeEventListener(SELLER_STATUS_CHANGED, reload)
      window.removeEventListener('focus', reload)
    }
  }, [reload])

  const wrapper = 'page pt-4 no-print print:hidden'
  if (loading) return <div className={wrapper} role="status"><p className="text-small text-muted">Đang kiểm tra hồ sơ và gói bán hàng...</p></div>
  if (error) return <div className={wrapper}><Notice tone="danger">Chưa kiểm tra được hồ sơ và gói bán hàng. {error} <button type="button" className="underline" onClick={reload}>Thử lại</button></Notice></div>
  if (!data) return null

  const complianceApproved = hasApprovedCompliance(data.documents)
  const active = data.subscriptions.some((s) => isSubscriptionActive(s))
  if (complianceApproved && active) return null
  const pending = data.subscriptions.find((s) => s.status === 'PENDING_PAYMENT')
  const subscriptionMessage = pending?.paymentCode ? 'Gói bán hàng đang chờ xác nhận thanh toán.'
    : pending ? 'Gói bán hàng đang chờ admin đối soát chuyển khoản.' : 'Gian hàng chưa có gói bán hàng còn hiệu lực.'

  return (
    <div className={wrapper} aria-label="Hồ sơ và gói bán hàng">
      <Notice>
        <div className="flex flex-col gap-2">
          {!complianceApproved && <p>Gian hàng đang chờ duyệt hồ sơ KYC. Cần đủ giấy ATTP, giấy phép kinh doanh và CCCD được duyệt. <Link to="/seller/profile" className="font-semibold underline">Kiểm tra hồ sơ</Link></p>}
          {!active && <p>{subscriptionMessage} <Link to="/seller/subscription" className="font-semibold underline">{pending ? 'Xem yêu cầu gói' : 'Chọn gói bán hàng'}</Link></p>}
        </div>
      </Notice>
    </div>
  )
}
