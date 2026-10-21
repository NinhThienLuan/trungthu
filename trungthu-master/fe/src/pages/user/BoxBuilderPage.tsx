// Tự phối hộp quà: markup chuyển nguyên từ Stitch, logic tính giá làm lại theo đúng script gốc của Stitch.
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { BOX_CAKES, BOX_MATERIALS, BOX_PROVIDER, BOX_SIZES, type BoxCake } from '../../apis/mockData'
import { useCartStore, type BoxSlot } from '../../stores/cartStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ROUTES } from '../../constants'
import { cn } from '../../lib/format'

const LOGO_FEE = 50000
const TEA_FEE = 250000
const NOTE_MAX = 300
const vnd = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}₫`
const CATEGORIES = ['Hoàng Kim', 'Cổ Truyền', 'Ngự Thiện Hải Vị']

const toSlot = (c: BoxCake): BoxSlot => ({
  variantId: c.id,
  productName: c.name,
  variantName: c.artisanShort,
  unitPrice: c.price,
  imageUrl: c.imageUrl,
})

/** Bậc chiết khấu theo script Stitch: >=100 hộp -25% + miễn phí logo, >=50 hộp -15% */
function discountFor(qty: number) {
  if (qty >= 100) return { rate: 0.25, freeLogo: true, badge: 'Ưu đãi Doanh Nghiệp: Giảm 25% + Miễn Phí In Khắc Kim' }
  if (qty >= 50) return { rate: 0.15, freeLogo: false, badge: 'Ưu đãi Doanh Nghiệp: Giảm 15% cho đơn từ 50 hộp' }
  return { rate: 0, freeLogo: false, badge: 'Từ 50 hộp giảm 15% | Từ 100 hộp giảm 25% + Miễn Phí In Logo' }
}

export function BoxBuilderPage() {
  useDocumentTitle('Tự phối hộp quà')
  const navigate = useNavigate()
  const addBox = useCartStore((s) => s.addBox)

  const [sizeId, setSizeId] = useState(BOX_SIZES[0].id)
  const [materialId, setMaterialId] = useState(BOX_MATERIALS[0].id)
  // Giống Stitch: xếp sẵn 2 vị để khách thấy ngay khay hoạt động
  const [slots, setSlots] = useState<Array<BoxSlot | null>>([toSlot(BOX_CAKES[0]), toSlot(BOX_CAKES[1]), null, null])
  const [activeSlot, setActiveSlot] = useState(2)
  const [withLogo, setWithLogo] = useState(true)
  const [logoName, setLogoName] = useState<string | null>(null)
  const [withCard, setWithCard] = useState(true)
  const [note, setNote] = useState('')
  const [withTea, setWithTea] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState<string | null>(null)
  const [toast, setToast] = useState<{ title: string; message: string; icon: string } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const size = BOX_SIZES.find((s) => s.id === sizeId)!
  const material = BOX_MATERIALS.find((m) => m.id === materialId)!
  const filled = slots.filter((s): s is BoxSlot => s !== null)
  const isFull = filled.length === size.slots
  const cakes = BOX_CAKES.filter((c) => !category || c.category === category)

  // Giá 1 hộp = quy cách + chất liệu + logo + trà (giá quy cách đã gồm bánh — như script Stitch)
  const discount = discountFor(quantity)
  const logoFee = withLogo && !discount.freeLogo ? LOGO_FEE : 0
  const teaFee = withTea ? TEA_FEE : 0
  const singleBox = size.price + material.fee + logoFee + teaFee
  const discountedSingle = Math.round(singleBox * (1 - discount.rate))
  const grandTotal = discountedSingle * quantity

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const showToast = (title: string, message: string, icon = 'check_circle') => {
    setToast({ title, message, icon })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const chooseSize = (id: string) => {
    const next = BOX_SIZES.find((s) => s.id === id)!
    setSizeId(id)
    setSlots((prev) => Array.from({ length: next.slots }, (_, i) => prev[i] ?? null))
    setActiveSlot((a) => Math.min(a, next.slots - 1))
    showToast('Đã đổi quy cách', `Đã chuyển sang ${next.name}.`)
  }

  const chooseMaterial = (id: string) => {
    setMaterialId(id)
    showToast('Đã đổi chất liệu', `Vỏ hộp: ${BOX_MATERIALS.find((m) => m.id === id)!.fullName}`)
  }

  const putCake = (cake: BoxCake) => {
    const target = slots[activeSlot] === null ? activeSlot : slots.indexOf(null)
    if (target === -1) {
      showToast('Khay đã đầy', 'Bỏ bớt một vị trong khay hoặc đổi sang quy cách lớn hơn.', 'warning')
      return
    }
    const next = slots.map((s, i) => (i === target ? toSlot(cake) : s))
    setSlots(next)
    const after = next.findIndex((s, i) => s === null && i > target)
    setActiveSlot(after !== -1 ? after : Math.max(0, next.indexOf(null)))
    showToast('Đã cập nhật khay quà', `${cake.name} vào Vị Trí ${String(target + 1).padStart(2, '0')}.`)
  }

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? null : s)))
    setActiveSlot(index)
    showToast('Đã Bỏ Vị Bánh', 'Bạn có thể chọn vị mới từ thư viện bên phải.')
  }

  const clearTray = () => {
    setSlots(Array.from({ length: size.slots }, () => null))
    setActiveSlot(0)
  }

  const handleAdd = () => {
    if (!isFull) {
      showToast('Khay chưa đủ bánh', `Vui lòng chọn thêm ${size.slots - filled.length} vị bánh nữa để hoàn tất hộp quà.`, 'warning')
      return
    }
    const priceLines = [
      { label: `Quy cách ${size.name} (gồm ${size.slots} bánh)`, amount: size.price },
      { label: `Vỏ hộp ${material.fullName}`, amount: material.fee },
      ...(withLogo ? [{ label: discount.freeLogo ? 'In khắc kim logo (miễn phí từ 100 hộp)' : 'In khắc kim / ép kim logo', amount: logoFee }] : []),
      ...(withTea ? [{ label: 'Hũ Trà Sen Tây Hồ Ngự Phẩm', amount: teaFee }] : []),
      ...(discount.rate ? [{ label: `Chiết khấu doanh nghiệp -${discount.rate * 100}%`, amount: discountedSingle - singleBox }] : []),
    ]
    addBox(
      {
        variantId: `box-${size.id}-${material.id}`,
        productId: 'box-builder',
        providerId: BOX_PROVIDER.id,
        storeName: BOX_PROVIDER.storeName,
        productName: `Hộp ${size.name}`,
        variantName: material.fullName,
        unitPrice: discountedSingle,
        // Giá đã áp chiết khấu theo số lượng lúc thêm -> không cho tăng thêm trong giỏ
        stock: quantity,
        imageUrl: material.imageUrl,
        slots: filled,
        note: withCard && note.trim() ? note.trim() : undefined,
        priceLines,
      },
      quantity,
    )
    showToast('Đã Thêm Vào Giỏ Hàng', `Hộp ${material.fullName} (${quantity} hộp) đã được lưu vào đơn hàng của bạn.`)
    clearTray()
    setQuantity(1)
  }

  const slotGrid =
    size.slots === 4
      ? 'grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg'
      : size.slots === 6
        ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl'
        : 'grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl'

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin pt-6 pb-2">
        <nav className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-outline mb-3" aria-label="Breadcrumb">
          <Link className="hover:text-secondary transition-colors" to="/">
            Trang Chủ
          </Link>
          <Icon name="chevron_right" className="text-[13px] text-secondary" aria-hidden />
          <span className="text-secondary font-semibold">Tác Phẩm Tự Phối Quà Thượng Tuyển</span>
        </nav>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="font-label-sm text-label-sm tracking-[0.25em] text-secondary uppercase block">Dấu Ấn Độc Bản • Mỹ Vị Cung Đình</span>
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-ink-dark tracking-tight leading-none">
              Tự Phối Hộp Quà Thượng Tuyển
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Tùy biến khay quà phong vị hoàng gia theo phong vị riêng biệt. Lựa chọn chất liệu trứ danh, tuyển chọn hương bánh nghệ nhân và chạm khắc biểu
              tượng doanh nghiệp sắc nét.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-[0.25rem] shadow-sm">
            <div className="flex items-center gap-2 pl-2 pr-3 py-1">
              <Icon name="verified" className="text-secondary text-[22px]" aria-hidden />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-ink-dark">100% Thủ Công</span>
                <span className="font-body-sm text-[11px] text-outline">Nghệ Nhân Lão Luyện</span>
              </div>
            </div>
            <div className="w-px h-7 bg-surface-variant" />
            <div className="flex items-center gap-2 pl-2 pr-3 py-1">
              <Icon name="local_shipping" className="text-secondary text-[22px]" aria-hidden />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-ink-dark">Giao Hỏa Tốc</span>
                <span className="font-body-sm text-[11px] text-outline">Bảo Quản Chuẩn Nhiệt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin pb-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
            {/* 01 Quy cách */}
            <div className="bg-surface-container-lowest p-6 rounded-[0.25rem] shadow-sm space-y-4">
              <StepHeader step="01" title="Quy Cách Hộp Quà" aside="Tiêu Chuẩn Cung Đình" asideClass="text-secondary uppercase tracking-wider" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOX_SIZES.map((s) => {
                  const active = s.id === sizeId
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => chooseSize(s.id)}
                      aria-pressed={active}
                      className={cn(
                        'group text-left p-4 rounded-[0.25rem] transition-all relative overflow-hidden',
                        active ? 'bg-surface-container' : 'bg-surface-container-low',
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Icon
                          name={s.icon}
                          className={cn('text-[22px] transition-colors', active ? 'text-secondary' : 'text-outline group-hover:text-secondary')}
                          aria-hidden
                        />
                        <span className={cn('w-2.5 h-2.5 rounded-[0.75rem]', active ? 'bg-secondary' : 'bg-transparent')} />
                      </div>
                      <p className="font-headline-sm text-[16px] text-ink-dark font-medium leading-snug">{s.name}</p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">{s.note}</p>
                      <div className="mt-3 font-label-md text-label-md text-secondary font-bold">Từ {vnd(s.price)}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Khay bánh */}
            <div className="relative bg-primary-container text-champagne-light p-6 sm:p-8 rounded-[0.5rem] shadow-xl overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-[0.75rem] bg-secondary/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-[0.75rem] bg-primary/40 blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-[0.75rem] bg-secondary-fixed animate-pulse" />
                  <span className="font-label-sm text-label-sm text-champagne-light uppercase tracking-widest">{material.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearTray}
                    className="text-on-primary-container hover:text-champagne-light text-body-sm flex items-center gap-1 transition-colors"
                  >
                    <Icon name="restart_alt" className="text-[16px]" aria-hidden />
                    <span className="font-label-sm text-[10px] tracking-wider uppercase">Làm Mới Khay</span>
                  </button>
                  <span className="text-on-primary-container font-label-sm">|</span>
                  <span className="font-label-sm text-secondary-fixed" aria-live="polite">
                    Đã xếp: {filled.length}/{size.slots} vị bánh
                  </span>
                </div>
              </div>
              <div className="relative z-10 bg-primary p-6 sm:p-8 rounded-[0.25rem] shadow-inner flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-full text-center pb-5 mb-5 flex flex-col items-center">
                  <span className="font-headline-sm text-[13px] tracking-[0.2em] text-secondary-fixed uppercase">NGUYỆT VIÊN ĐÀI • NGỰ THƯỢNG PHẨM</span>
                </div>
                <div className={cn(slotGrid, 'transition-all duration-300')}>
                  {slots.map((slot, i) => {
                    const active = i === activeSlot && !slot
                    return (
                      <div
                        key={i}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveSlot(i)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveSlot(i)}
                        aria-label={slot ? `Vị trí ${i + 1}: ${slot.productName}` : `Vị trí ${i + 1}, ô trống`}
                        className={cn(
                          'slot-card group relative aspect-square bg-primary-container rounded-[0.25rem] p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-lg',
                          active && 'ring-2 ring-secondary-fixed',
                        )}
                      >
                        {slot ? (
                          <div className="flex flex-col items-center justify-center w-full h-full relative">
                            <div className="w-16 h-16 rounded-[0.75rem] overflow-hidden mb-1.5 shadow-md">
                              <img className="w-full h-full object-cover" alt="" src={slot.imageUrl ?? ''} />
                            </div>
                            <span className="font-headline-sm text-[12px] text-champagne-light line-clamp-1 leading-tight">{slot.productName}</span>
                            <span className="font-body-sm text-[10px] text-secondary-fixed/90">{slot.variantName}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeSlot(i)
                              }}
                              className="absolute top-0 right-0 p-1 text-champagne-light/60 hover:text-error transition-colors"
                              title="Bỏ vị bánh"
                              aria-label={`Bỏ ${slot.productName} khỏi vị trí ${i + 1}`}
                            >
                              <Icon name="cancel" className="text-[16px]" aria-hidden />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 text-on-primary-container group-hover:text-champagne-light transition-colors">
                            <Icon name="add_circle" className="text-[28px] text-secondary-fixed/70" aria-hidden />
                            <span className="font-label-sm text-[10px] tracking-wider uppercase text-champagne-light/90">
                              Vị Trí {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-primary-container">{active ? 'Đang kích hoạt' : 'Chọn vị từ thư viện'}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {size.tea && (
                    <div className="col-span-full flex items-center justify-center gap-2 rounded-[0.25rem] border border-dashed border-secondary-fixed/40 py-2 text-[11px] text-secondary-fixed font-label-sm uppercase tracking-wider">
                      <Icon name="local_cafe" className="text-[16px]" aria-hidden /> Kèm 1 hũ ngự trà
                    </div>
                  )}
                </div>
                <p className="mt-6 text-center font-body-sm text-[11px] text-on-primary-container">
                  Nhấp vào một ô khay để kích hoạt hoặc nhấn <strong className="text-champagne-light">+ Đặt Vào Khay</strong> bên danh mục bánh.
                </p>
              </div>
            </div>

            {/* 02 Chất liệu */}
            <div className="bg-surface-container-lowest p-6 rounded-[0.25rem] shadow-sm space-y-4">
              <StepHeader step="02" title="Chất Liệu & Mỹ Thuật Vỏ Hộp" aside="Gia Công Nghệ Nhân Huế" asideClass="text-outline" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOX_MATERIALS.map((m) => {
                  const active = m.id === materialId
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => chooseMaterial(m.id)}
                      aria-pressed={active}
                      className={cn(
                        'group text-left p-4 rounded-[0.25rem] transition-all relative',
                        active ? 'bg-surface-container ring-1 ring-secondary' : 'bg-surface-container-low',
                      )}
                    >
                      <div className="w-full h-20 rounded-[0.125rem] mb-3 overflow-hidden bg-surface-variant">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" src={m.imageUrl} />
                      </div>
                      <p className="font-headline-sm text-[15px] text-ink-dark font-medium leading-tight">{m.name}</p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">{m.note}</p>
                      <div className={cn('mt-2 font-label-sm font-bold', m.fee ? 'text-secondary' : 'text-outline')}>
                        {m.fee ? `+${vnd(m.fee)}` : 'Bao gồm sẵn'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 03 Cá nhân hoá */}
            <div className="bg-surface-container-lowest p-6 rounded-[0.25rem] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StepBadge step="03" />
                  <h2 className="font-headline-sm text-headline-sm text-ink-dark">Cá Nhân Hóa & Quà Tặng Kèm</h2>
                </div>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-[0.125rem] font-label-sm text-[10px] tracking-wider uppercase font-bold">
                  Đặc Quyền Doanh Nghiệp
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-[0.25rem] bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        className="w-4 h-4 rounded-[0.125rem] cursor-pointer accent-secondary"
                        type="checkbox"
                        checked={withLogo}
                        onChange={(e) => setWithLogo(e.target.checked)}
                      />
                      <span className="font-label-lg text-label-lg text-ink-dark">In Khắc Kim / Ép Kim Logo</span>
                    </label>
                    <span className="font-label-sm text-[11px] text-secondary font-bold">+50.000₫/hộp</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">Ép kim nhiệt sắc nét hoặc khắc laser mạ vàng biểu trưng thương hiệu lên mặt nắp hộp.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-[0.125rem] cursor-pointer hover:bg-surface-container transition-colors">
                      <Icon name="upload_file" className="text-[18px] text-secondary" aria-hidden />
                      <span className="font-label-sm text-[11px] text-ink-dark">Đính Kèm File AI/PDF Vector</span>
                      <input
                        accept=".ai,.eps,.pdf,.png"
                        className="hidden"
                        type="file"
                        disabled={!withLogo}
                        onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)}
                      />
                    </label>
                  </div>
                  <span className="text-[10px] font-body-sm text-outline block text-center">
                    {logoName ? `Đã nhận file: ${logoName}` : 'Chưa có tệp đính kèm (Miễn phí từ 50 hộp)'}
                  </span>
                </div>
                <div className="p-4 rounded-[0.25rem] bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        className="w-4 h-4 rounded-[0.125rem] cursor-pointer accent-secondary"
                        type="checkbox"
                        checked={withCard}
                        onChange={(e) => setWithCard(e.target.checked)}
                      />
                      <span className="font-label-lg text-label-lg text-ink-dark">Thiệp Thư Pháp Viết Tay</span>
                    </label>
                    <span className="font-label-sm text-[11px] text-secondary font-bold">Miễn Phí</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Giấy mỹ thuật cán vân lụa, đề tặng thư pháp theo tên người nhận hoặc in lời chúc trang trọng.
                  </p>
                  <textarea
                    className="w-full bg-surface-container-lowest p-2 rounded-[0.125rem] text-body-sm text-ink-dark placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary resize-none disabled:opacity-50"
                    placeholder="Nhập lời chúc hoặc thông điệp tri ân (tối đa 100 chữ)..."
                    aria-label="Lời chúc trên thiệp"
                    rows={2}
                    maxLength={NOTE_MAX}
                    disabled={!withCard}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 rounded-[0.25rem] bg-surface-container space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon name="local_cafe" className="text-secondary text-[20px]" aria-hidden />
                    <span className="font-label-lg text-label-lg text-ink-dark">Nâng Cấp Kèm Hũ Trà Cung Đình Ướp Hoa Tươi</span>
                  </div>
                  <span className="font-label-sm text-[11px] text-outline">Tùy Chọn Thưởng Trữ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TeaOption checked={!withTea} onChange={() => setWithTea(false)} title="Không Kèm Thêm Trà" note="Chỉ thưởng thức bánh" price="0₫" />
                  <TeaOption checked={withTea} onChange={() => setWithTea(true)} title="Trà Sen Tây Hồ Ngự Phẩm" note="Hũ thiếc 75g ướp hoa tươi" price={`+${vnd(TEA_FEE)}`} highlight />
                </div>
              </div>
            </div>
          </div>

          {/* 04 Thư viện vị bánh */}
          <div className="lg:col-span-5 flex flex-col gap-6 min-w-0 lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest p-6 rounded-[0.25rem] shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <StepBadge step="04" />
                  <h2 className="font-headline-sm text-headline-sm text-ink-dark">Thư Viện Vị Bánh Nghệ Nhân</h2>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                  Nhấp nút <strong className="text-secondary">+ Đặt Vào Khay</strong> để phối vị
                </p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-nowrap" role="group" aria-label="Lọc vị bánh">
                {[null, ...CATEGORIES].map((c) => (
                  <button
                    key={c ?? 'all'}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={cn(
                      'px-3 py-1 rounded-[0.75rem] font-label-sm text-label-sm uppercase tracking-wider transition-colors',
                      category === c ? 'bg-primary text-secondary-fixed' : 'bg-surface-container text-on-surface-variant hover:text-ink-dark',
                    )}
                  >
                    {c ?? `Tất Cả (${BOX_CAKES.length})`}
                  </button>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                {cakes.map((cake) => (
                  <div
                    key={cake.id}
                    className="group p-3.5 rounded-[0.25rem] bg-surface-container-low hover:bg-surface-container transition-all flex gap-4 items-center"
                  >
                    <div className="w-20 h-20 rounded-[0.125rem] overflow-hidden shrink-0 bg-surface-variant shadow-sm relative">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" src={cake.imageUrl} />
                      {cake.badge && (
                        <span className="absolute bottom-1 right-1 bg-primary/80 text-champagne-light font-label-sm text-[8px] px-1 rounded-[0.125rem]">
                          {cake.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <h3 className="font-headline-sm text-[15px] text-ink-dark truncate">{cake.name}</h3>
                        <span className="font-label-md text-label-md text-secondary shrink-0 font-bold">{vnd(cake.price)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon name="storefront" className="text-secondary text-[14px]" aria-hidden />
                        <span className="font-body-sm text-[11px] text-on-surface-variant truncate">{cake.artisan}</span>
                      </div>
                      <p className="font-body-sm text-[11px] text-outline line-clamp-1 mt-1">{cake.description}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-label-sm text-[9px] uppercase tracking-wider text-outline">{cake.tag}</span>
                        <button
                          type="button"
                          onClick={() => putCake(cake)}
                          className="inline-flex items-center gap-1 bg-primary text-secondary-fixed hover:bg-ink-dark px-3 py-1 rounded-[0.125rem] font-label-sm text-[10px] tracking-wider uppercase transition-colors"
                          aria-label={`Đặt ${cake.name} vào khay`}
                        >
                          <Icon name="add" className="text-[14px]" aria-hidden /> <span>Đặt Vào Khay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-[0.25rem] bg-surface-container flex items-start gap-3 mt-4">
                <Icon name="workspace_premium" className="text-secondary text-[22px] shrink-0" aria-hidden />
                <div className="space-y-1">
                  <span className="font-headline-sm text-[13px] text-ink-dark">Cam Kết Di Sản & Nguyên Liệu Thuần Khiết</span>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Tất cả bánh đều được nướng tươi trong vòng 24 giờ trước khi giao, không chất bảo quản công nghiệp, chuẩn kiểm định an toàn ngự phẩm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh tổng kết (sticky như bản Stitch) */}
      <div className="sticky bottom-0 z-40 w-full bg-primary-container text-champagne-light shadow-2xl">
        <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-3.5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
              <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="flex items-center justify-between text-[11px] font-label-sm">
                  <span className="text-secondary-fixed uppercase tracking-wider">Tiến Độ Khay Bánh</span>
                  <span className="text-champagne-light font-bold">
                    {filled.length}/{size.slots} Vị
                  </span>
                </div>
                <div className="w-full h-1.5 bg-primary rounded-[0.75rem] overflow-hidden">
                  <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${(filled.length / size.slots) * 100}%` }} />
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-on-primary-container/30" />
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-[11px] text-on-primary-container uppercase">Số lượng:</span>
                <div className="flex items-center bg-primary rounded-[0.125rem] px-1 py-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    className="w-6 h-6 flex items-center justify-center text-champagne-light hover:text-secondary-fixed text-lg font-bold"
                  >
                    -
                  </button>
                  <input
                    className="w-12 bg-transparent text-center font-label-md text-label-md text-champagne-light focus:outline-none"
                    aria-label="Số hộp"
                    type="number"
                    min={1}
                    max={5000}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(5000, q + 1))}
                    aria-label="Tăng số lượng"
                    className="w-6 h-6 flex items-center justify-center text-champagne-light hover:text-secondary-fixed text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-[0.125rem] bg-tertiary-container text-secondary-fixed text-[11px] font-label-sm">
                <Icon name="stars" className="text-[15px]" aria-hidden />
                <span>{discount.badge}</span>
              </div>
            </div>
            <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto">
              <div className="flex flex-col text-right">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-body-sm text-[11px] text-on-primary-container">{quantity > 1 ? 'Tổng:' : 'Đơn giá:'}</span>
                  <span className="font-headline-md text-headline-md text-secondary-fixed tracking-tight">{vnd(quantity > 1 ? grandTotal : singleBox)}</span>
                </div>
                <span className="font-body-sm text-[10px] text-on-primary-container">
                  {quantity > 1 ? `Gồm ${quantity} hộp • Đã trừ chiết khấu ${discount.rate * 100}%` : `Đã gồm VAT & hộp ${material.fullName}`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.rfq)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[0.125rem] bg-tertiary-container text-secondary-fixed hover:bg-tertiary font-label-md text-label-md uppercase tracking-wider transition-colors"
                >
                  <Icon name="business_center" className="text-[18px]" aria-hidden /> <span>Mẫu Thử B2B</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.125rem] bg-secondary text-on-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed font-label-md text-label-md uppercase tracking-wider transition-colors"
                >
                  <Icon name="shopping_bag" className="text-[18px]" aria-hidden /> <span>Thêm Vào Giỏ Hàng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast thông báo (như bản Stitch) */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed top-24 right-6 z-50 transition-all duration-300 flex items-center gap-3 bg-primary text-champagne-light px-5 py-3 rounded-[0.25rem] shadow-2xl',
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none',
        )}
      >
        <Icon name={toast?.icon ?? 'check_circle'} className="text-secondary text-[22px]" aria-hidden />
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-secondary-fixed">{toast?.title}</span>
          <span className="font-body-sm text-[11px] text-champagne-light/80">{toast?.message}</span>
        </div>
        {toast?.title === 'Đã Thêm Vào Giỏ Hàng' && (
          <Link to={ROUTES.cart} className="ml-2 font-label-sm text-[11px] text-secondary-fixed underline">
            Xem giỏ
          </Link>
        )}
      </div>
    </div>
  )
}

function StepBadge({ step }: { step: string }) {
  return (
    <span className="w-6 h-6 rounded-[0.75rem] bg-primary text-secondary-fixed text-[11px] font-bold flex items-center justify-center font-label-sm">
      {step}
    </span>
  )
}

function StepHeader({ step, title, aside, asideClass }: { step: string; title: string; aside: string; asideClass: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <StepBadge step={step} />
        <h2 className="font-headline-sm text-headline-sm text-ink-dark">{title}</h2>
      </div>
      <span className={cn('font-label-sm text-label-sm', asideClass)}>{aside}</span>
    </div>
  )
}

function TeaOption(props: { checked: boolean; onChange: () => void; title: string; note: string; price: string; highlight?: boolean }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-[0.125rem] bg-surface-container-lowest cursor-pointer hover:shadow-sm transition-all">
      <div className="flex items-center gap-2.5">
        <input className="accent-secondary" name="teaAddon" type="radio" checked={props.checked} onChange={props.onChange} />
        <div className="flex flex-col">
          <span className="font-label-md text-ink-dark">{props.title}</span>
          <span className="font-body-sm text-[11px] text-outline">{props.note}</span>
        </div>
      </div>
      <span className={cn('font-label-sm', props.highlight ? 'text-secondary font-bold' : 'text-outline')}>{props.price}</span>
    </label>
  )
}
