import { useState } from 'react'
import { resolveImage } from '../utils/resolveImage'

const fallbackImages = [
  '/images/field-notes/morning-view.jpg',
  '/images/field-notes/village-path.jpg',
]

function fallbackFor(key = '') {
  const index = Array.from(String(key)).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return fallbackImages[index % fallbackImages.length]
}

export default function HomestayImage({ src, imageKey, alt, className, ...props }) {
  const resolvedSrc = resolveImage(src, imageKey)
  const fallbackSrc = fallbackFor(imageKey)

  return <HomestayImageAsset key={resolvedSrc} src={resolvedSrc || fallbackSrc} fallbackSrc={fallbackSrc} alt={alt} className={className} props={props} />
}

function HomestayImageAsset({ src, fallbackSrc, alt, className, props }) {
  const [failed, setFailed] = useState(false)

  return (
    <img
      src={failed ? fallbackSrc : src}
      alt={alt || ''}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
