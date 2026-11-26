import { useCallback, useEffect, useMemo, useState } from 'react'
import { normalizeGalleryMedia, getVideoEmbedUrl } from '../utils/galleryMedia'
import { resolveImage } from '../utils/resolveImage'

export default function GalleryLightbox({ open, onClose, title, media = [] }) {
  const items = useMemo(
    () => (media || []).map(normalizeGalleryMedia).filter((item) => item.url),
    [media]
  )
  const [index, setIndex] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setIndex(0)
  }

  const total = items.length
  const goPrev = useCallback(() => {
    setIndex((current) => (total ? (current - 1 + total) % total : 0))
  }, [total])
  const goNext = useCallback(() => {
    setIndex((current) => (total ? (current + 1) % total : 0))
  }, [total])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
      else if (event.key === 'ArrowLeft') goPrev()
      else if (event.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, goPrev, goNext, onClose])

  if (!open || !total) return null

  const current = items[index]
  const embedUrl = current.type === 'video' ? getVideoEmbedUrl(current.url) : ''
  const mediaUrl = resolveImage(current.url, `gallery-${index}`)

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} gallery` : 'Media gallery'}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <button type="button" className="gallery-lightbox-close" aria-label="Close gallery" onClick={onClose}>×</button>
      {title && <p className="gallery-lightbox-title">{title}</p>}

      {total > 1 && (
        <button type="button" className="gallery-lightbox-nav gallery-lightbox-prev" aria-label="Previous" onClick={goPrev}>‹</button>
      )}

      <div className="gallery-lightbox-stage" onClick={(event) => event.stopPropagation()}>
        {current.type === 'video' ? (
          embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title || 'Video'} ${index + 1}`}
              className="gallery-lightbox-media"
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={mediaUrl} controls playsInline autoPlay className="gallery-lightbox-media" />
          )
        ) : (
          <img src={mediaUrl} alt={`${title || 'Photo'} ${index + 1}`} className="gallery-lightbox-media" />
        )}
      </div>

      {total > 1 && (
        <button type="button" className="gallery-lightbox-nav gallery-lightbox-next" aria-label="Next" onClick={goNext}>›</button>
      )}

      <p className="gallery-lightbox-counter">{index + 1} / {total}</p>
    </div>
  )
}