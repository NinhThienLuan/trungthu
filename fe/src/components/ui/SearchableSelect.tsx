import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '../../lib/format'

export type SelectOption = { value: string; label: string; description?: string; imageUrl?: string; searchText?: string }
export type SelectGroup = { label?: string; options: SelectOption[] }

type SearchableSelectProps = {
  id: string
  value: string
  groups: SelectGroup[]
  placeholder: string
  onChange: (value: string) => void
  disabled?: boolean
}

const normalize = (value: string) => value.toLocaleLowerCase('vi-VN')
  .replace(/đ/g, 'd')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

/** Ô chọn có tìm kiếm không dấu, nhóm tùy chọn và điều khiển bằng bàn phím. */
export function SearchableSelect({ id, value, groups, placeholder, onChange, disabled = false }: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const allOptions = groups.flatMap((group) => group.options)
  const selected = allOptions.find((option) => option.value === value)
  const search = normalize(query.trim())
  const visibleGroups = groups.map((group) => ({
    ...group,
    options: search && group.label && normalize(group.label).includes(search)
      ? group.options
      : group.options.filter((option) => normalize([option.label, option.description, option.searchText]
        .filter(Boolean).join(' ')).includes(search)),
  })).filter((group) => group.options.length > 0)
  const visibleOptions = visibleGroups.flatMap((group) => group.options)
  const active = visibleOptions[Math.min(activeIndex, visibleOptions.length - 1)]
  const activeValue = active?.value

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const choose = (option: SelectOption) => {
    onChange(option.value)
    close()
  }

  useEffect(() => {
    if (!open) return
    const handleOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', handleOutside)
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [open])

  useEffect(() => {
    if (open && activeValue) {
      listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeValue])

  const openList = () => {
    if (disabled || open) return
    setQuery('')
    setActiveIndex(Math.max(0, allOptions.findIndex((option) => option.value === value)))
    setOpen(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openList()
      } else {
        setActiveIndex((index) => Math.max(0, Math.min(visibleOptions.length - 1,
          index + (event.key === 'ArrowDown' ? 1 : -1))))
      }
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      if (active) choose(active)
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      close()
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        {selected?.imageUrl ? (
          <img src={selected.imageUrl} alt="" aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-6 w-8 -translate-y-1/2 object-contain" />
        ) : (
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        )}
        <input
          id={id}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={open && active ? `${id}-option-${active.value}` : undefined}
          autoComplete="off"
          className="input pl-9 pr-9"
          value={open ? query : selected?.label ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={openList}
          onClick={openList}
          onChange={(event) => {
            if (!open) setOpen(true)
            if (value) onChange('')
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={handleKeyDown}
        />
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
      {open && (
        <div id={`${id}-listbox`} ref={listRef} role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-sm border border-line bg-white py-1 shadow-lg">
          {visibleGroups.length ? visibleGroups.map((group, groupIndex) => (
            <div key={group.label ?? groupIndex} role="group" aria-label={group.label}>
              {group.label && (
                <div className="sticky top-0 z-10 border-b border-line bg-champagne px-3 py-2 text-small font-semibold text-navy">
                  {group.label}
                </div>
              )}
              {group.options.map((option) => (
                <button
                  key={option.value}
                  id={`${id}-option-${option.value}`}
                  type="button"
                  tabIndex={-1}
                  role="option"
                  aria-selected={option.value === value}
                  data-active={option.value === active?.value}
                  className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-body text-ink hover:bg-champagne/60',
                    option.value === active?.value && 'bg-champagne/60', option.value === value && 'font-semibold text-navy')}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  onMouseEnter={() => setActiveIndex(visibleOptions.findIndex((item) => item.value === option.value))}
                >
                  {option.imageUrl && <img src={option.imageUrl} alt="" aria-hidden="true"
                    className="h-8 w-12 shrink-0 object-contain" loading="lazy" />}
                  <span className="min-w-0">
                    <span className="block">{option.label}</span>
                    {option.description && <span className="block text-small font-normal text-muted">{option.description}</span>}
                  </span>
                </button>
              ))}
            </div>
          )) : (
            <p className="px-3 py-3 text-small text-muted">Không tìm thấy lựa chọn phù hợp.</p>
          )}
        </div>
      )}
    </div>
  )
}
