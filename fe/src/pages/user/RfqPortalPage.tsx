import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RfqFormCatcher } from '../../components/RfqFormCatcher'
import { B2bPortalView } from './B2bPortalView'
import { Icon } from '../../components/Icon'
import type { RfqResponse } from '../../types/order'

export function RfqPortalPage() {
  const [created, setCreated] = useState<RfqResponse | null>(null)

  return (
    <RfqFormCatcher onSubmitted={setCreated}>
      {created && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="card w-full max-w-lg p-6 bg-white shadow-2xl rounded-lg text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Icon name="check_circle" className="text-[32px]" aria-hidden />
            </div>
            <h3 className="text-xl font-bold text-navy">Gửi Yêu Cầu Báo Giá Thành Công!</h3>
            <p className="mt-2 text-sm text-muted">
              Mã yêu cầu: <b className="text-navy">{created.code}</b> ({created.companyName} — {created.requestedQuantity} hộp).
              Yêu cầu của bạn đã được chuyển tới hệ thống các xưởng bánh uy tín để tiếp nhận và gửi báo giá cạnh tranh.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/orders?tab=rfq"
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <Icon name="request_quote" className="text-[18px]" aria-hidden />
                <span>Xem Báo Giá Tại Trang Đơn Lớn</span>
              </Link>
              <button
                type="button"
                onClick={() => setCreated(null)}
                className="btn btn-outline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <B2bPortalView />
    </RfqFormCatcher>
  )
}
