import { useState, type FormEvent, type ReactNode } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { addDays, toIsoDate } from '../../lib/format'
import { sellerSettingsService } from '../../services/sellerSettingsService'
import { TextInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'

const today = () => toIsoDate(new Date())

/** Một khối form: gửi, báo lỗi/thành công tại chỗ */
function Section({ title, hint, submitLabel, onSubmit, children }: {
  title: string
  hint?: string
  submitLabel: string
  onSubmit: (data: Record<string, string>) => Promise<string>
  children: ReactNode
}) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string }>()

  const handle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setResult(undefined)
    try {
      setResult({ ok: true, text: await onSubmit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>) })
    } catch (err) {
      setResult({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={handle} className="card flex flex-col gap-4 p-5 md:p-6">
      <div>
        <h2 className="text-h3">{title}</h2>
        {hint && <p className="mt-1 text-small text-muted">{hint}</p>}
      </div>
      {children}
      {result && <Notice tone={result.ok ? 'success' : 'danger'}>{result.text}</Notice>}
      <button type="submit" className="btn btn-primary self-start" disabled={busy}>
        {busy ? 'Đang lưu...' : submitLabel}
      </button>
    </form>
  )
}

/** Seller: những cấu hình bắt buộc để buyer checkout được (năng lực nướng, tài khoản nhận VietQR) */
export function SettingsPage() {
  useDocumentTitle('Cài đặt bán hàng')
  const { data, loading, error, reload } = useApi(() => sellerSettingsService.get(), [])
  const from = today()
  const to = toIsoDate(addDays(new Date(), 30))
  const capacity = useApi(() => sellerSettingsService.capacities(from, to), [])

  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? 'Không tải được cài đặt'} onRetry={reload} />

  const openDays = capacity.data?.filter((d) => d.maxQuantity > 0).length ?? 0

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Cài đặt bán hàng"
        description="Thiếu năng lực nướng thì khách không đặt được hàng. Phí giao do sàn áp dụng: nội thành TP.HCM 35.000₫, nơi khác 70.000₫." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Năng lực nướng"
          hint={`30 ngày tới: ${openDays} ngày đang nhận đơn. Bánh nướng hôm trước cho đơn giao hôm sau.`}
          submitLabel="Áp dụng"
          onSubmit={async (f) => {
            const rows = await sellerSettingsService.setCapacity({ from: f.from, to: f.to, maxQuantity: Number(f.maxQuantity) })
            capacity.reload()
            return `Đã đặt ${rows.length} ngày nướng.`
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Từ ngày nướng" name="from" type="date" min={from} defaultValue={from} required />
            <TextInput label="Đến ngày" name="to" type="date" min={from} defaultValue={to} required />
            <TextInput label="Số bánh / ngày" name="maxQuantity" type="number" min={0} defaultValue={500} required />
          </div>
        </Section>


        <Section
          title="Tài khoản nhận tiền (VietQR)"
          hint="Khách chuyển khoản cọc vào tài khoản này; bạn xác nhận đã nhận tiền ở trang đơn hàng."
          submitLabel="Lưu tài khoản"
          onSubmit={async (f) => {
            await sellerSettingsService.setBankAccount({ bankCode: f.bankCode, accountNumber: f.accountNumber, accountName: f.accountName })
            reload()
            return 'Đã lưu tài khoản ngân hàng.'
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Mã ngân hàng" name="bankCode" placeholder="VCB" defaultValue={data.bankCode ?? ''} required />
            <TextInput label="Số tài khoản" name="accountNumber" inputMode="numeric" defaultValue={data.accountNumber ?? ''} required />
            <TextInput label="Tên chủ tài khoản" name="accountName" defaultValue={data.accountName ?? ''} required />
          </div>
        </Section>

      </div>
    </div>
  )
}
