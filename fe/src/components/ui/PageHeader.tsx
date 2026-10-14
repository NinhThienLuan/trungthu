import type { ReactNode } from 'react'

/** Tiêu đề trang thống nhất: eyebrow + h1 + 1 dòng mô tả ngắn */
export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-h1">{title}</h1>
        {description && <p className="mt-2 text-body text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
