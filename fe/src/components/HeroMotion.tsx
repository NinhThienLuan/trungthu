import { useEffect, useState } from 'react'
import { DETAIL_GALLERY, MOCK_PRODUCTS } from '../apis/mockData'

/**
 * Video nền hero: "Breaking open traditional mooncake, close-up" — Thái Trường Giang (Pexels, giấy phép miễn phí).
 * https://www.pexels.com/video/breaking-open-traditional-mooncake-close-up-39057909/
 */
const HERO_VIDEO = 'https://videos.pexels.com/video-files/39057909/16620591_1920_1080_30fps.mp4'

const HERO_STITCH =
  'https://lh3.googleusercontent.com/aida/AEtjO1WA3bE4RLcHOKQ7kyM6600CviTSESGNC0hvHTzZFhzJGy2pAmBIk0ZsMdgI43BzJejUMlNiQZ75VmxiiGc-zq3b09d_tqEv6Bdr58W41_fMUGHBRe4UFXdsawCRsbR3PZUTNdz_Ac0XYRK_Lyb6p3PxiL-ZxRlQKs0ALWNaU0efJsaN-z5LZ7ncsf9OHnwpZAS33H'

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
export function HeroMotion({ firstSrc = HERO_STITCH }: { firstSrc?: string }) {
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
