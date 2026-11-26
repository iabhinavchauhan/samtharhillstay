export function normalizeGalleryMedia(item) {
  if (typeof item === 'string') return { type: 'image', url: item }
  if (!item || typeof item !== 'object') return { type: 'image', url: '' }
  return {
    ...item,
    type: item.type === 'video' ? 'video' : 'image',
    url: item.url || item.src || '',
  }
}

export function getVideoEmbedUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : ''
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : ''
    }
    if (host === 'vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).at(-1)
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : ''
    }
  } catch {
    return ''
  }
  return ''
}
