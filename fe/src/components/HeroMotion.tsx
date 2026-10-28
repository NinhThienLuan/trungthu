import { useEffect, useState } from 'react'
import { DETAIL_GALLERY, MOCK_PRODUCTS } from '../apis/mockData'

/**
 * Video nền hero: "Breaking open traditional mooncake, close-up" — Thái Trường Giang (Pexels, giấy phép miễn phí).
 * https://www.pexels.com/video/breaking-open-traditional-mooncake-close-up-39057909/
 */
const HERO_VIDEO = 'https://videos.pexels.com/video-files/39057909/16620591_1920_1080_30fps.mp4'

/** Video nặng ~13MB: chỉ tải trên màn hình >= 768px, không bật giảm chuyển động / tiết kiệm dữ liệu */
function shouldLoadVideo() {
  if (typeof window === 'undefined') return false
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  return window.matchMedia('(min-width: 768px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !saveData
}

/**
 * Nền hero: video lặp, tắt tiếng. Trong lúc video chưa chạy (hoặc trên mobile) hiển thị
 * slideshow ảnh chuyển cảnh + zoom chậm bằng CSS làm phương án dự phòng.
 */
// Ảnh Stitch cũ (lh3 .../aida/...) đã hết hạn (400/403): slide đầu dùng ảnh hộp quà trong bộ ảnh chi tiết
export function HeroMotion({ firstSrc = DETAIL_GALLERY[3] }: { firstSrc?: string }) {
  const [useVideo, setUseVideo] = useState(false)
  const [playing, setPlaying] = useState(false)
  useEffect(() => setUseVideo(shouldLoadVideo()), [])

  const slides = [firstSrc, DETAIL_GALLERY[0], MOCK_PRODUCTS[2]?.imageUrl, MOCK_PRODUCTS[1]?.imageUrl].filter(Boolean) as string[]

  return (
    <div className="hero-motion absolute inset-0" aria-hidden>
      {/* Slideshow luôn nằm dưới video để lúc video hiện dần không bị nháy tối */}
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="hero-motion-slide absolute inset-0 h-full w-full object-cover object-center brightness-[0.88]"
          style={{ animationDelay: `${i * 6}s` }}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      {useVideo && (
        <video
          className={`absolute inset-0 h-full w-full object-cover object-center brightness-[0.85] transition-opacity duration-1000 ${playing ? 'opacity-100' : 'opacity-0'}`}
          src={HERO_VIDEO}
          poster={firstSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          onError={() => setUseVideo(false)}
        />
      )}
    </div>
  )
}
