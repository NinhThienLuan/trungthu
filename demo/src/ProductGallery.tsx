import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Image } from 'antd'

const VISIBLE_THUMBS = 10

export function ProductGallery({
  images,
  index: controlledIndex,
  onIndexChange,
}: {
  images: string[]
  index?: number
  onIndexChange?: (index: number) => void
}) {
  const [localIndex, setLocalIndex] = useState(0)
  const [start, setStart] = useState(0)
  const total = images.length
  const index = controlledIndex ?? localIndex
  const current = total === 0 ? 0 : Math.min(index, total - 1)
  const canSlide = total > 1
  const thumbStart = Math.min(start, Math.max(total - VISIBLE_THUMBS, 0))
  const thumbs = images.slice(thumbStart, thumbStart + VISIBLE_THUMBS)

  function go(next: number) {
    const clamped = Math.max(0, Math.min(total - 1, next))
    setLocalIndex(clamped)
    onIndexChange?.(clamped)
    setStart((windowStart) => {
      if (clamped < windowStart) return clamped
      if (clamped >= windowStart + VISIBLE_THUMBS) return clamped - VISIBLE_THUMBS + 1
      return windowStart
    })
  }

  if (total === 0) {
    return <div className="gallery-empty">Chưa có ảnh</div>
  }

  return (
    <div className="gallery">
      <div
        className="gallery-stage"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') go(current - 1)
          if (event.key === 'ArrowRight') go(current + 1)
        }}
      >
        <Image src={images[current]} alt="" preview={{ src: images[current] }} />
        {canSlide && current > 0 && (
          <button type="button" className="gallery-nav prev" aria-label="Ảnh trước" onClick={() => go(current - 1)}>
            <LeftOutlined />
          </button>
        )}
        {canSlide && current < total - 1 && (
          <button type="button" className="gallery-nav next" aria-label="Ảnh sau" onClick={() => go(current + 1)}>
            <RightOutlined />
          </button>
        )}
        {canSlide && <span className="gallery-count">{current + 1}/{total}</span>}
      </div>
      {canSlide && (
        <div className="gallery-thumbs">
          {thumbStart > 0 && (
            <button type="button" className="gallery-thumb-nav" aria-label="Thumbnail trước" onClick={() => setStart(thumbStart - 1)}>
              <LeftOutlined />
            </button>
          )}
          <div className="gallery-thumb-row">
            {thumbs.map((image, offset) => {
              const imageIndex = thumbStart + offset
              return (
                <button
                  key={`${imageIndex}-${image.slice(0, 24)}`}
                  type="button"
                  className={imageIndex === current ? 'gallery-thumb active' : 'gallery-thumb'}
                  onClick={() => go(imageIndex)}
                >
                  <img src={image} alt="" />
                </button>
              )
            })}
          </div>
          {thumbStart + VISIBLE_THUMBS < total && (
            <button type="button" className="gallery-thumb-nav" aria-label="Thumbnail sau" onClick={() => setStart(thumbStart + 1)}>
              <RightOutlined />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
