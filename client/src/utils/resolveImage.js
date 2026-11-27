const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')

// Generate a cache-busting token based on current date (changes daily)
// For more aggressive cache busting, use a timestamp or version from backend
function getCacheBuster() {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
}

export function resolveImage(src, key, width = 1200, height = 800) {
  if (!src || typeof src !== 'string') return src

  // Uploads are served by the API host, which can differ from the website host.
  if (src.startsWith('/uploads/') && configuredApiBaseUrl) {
    const base = `${configuredApiBaseUrl}${src}`
    // Add cache-busting query parameter for uploaded images
    const separator = base.includes('?') ? '&' : '?'
    return `${base}${separator}v=${getCacheBuster()}`
  }

  // If image already looks local or from picsum, return as-is
  if (!src.includes('loremflickr.com')) return src

  const seed = encodeURIComponent(String(key || src))
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

export function responsiveUnsplashImage(src, width = 1280, quality = 75) {
  if (!src || typeof src !== 'string') return src

  try {
    const url = new URL(src)
    if (url.hostname !== 'images.unsplash.com') return src
    url.searchParams.set('auto', 'format')
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', String(quality))
    return url.toString()
  } catch {
    return src
  }
}

export function responsiveUnsplashSrcSet(src, widths = [640, 960, 1280, 1600, 1920], quality = 75) {
  if (!src || typeof src !== 'string' || !src.startsWith('https://images.unsplash.com/')) return undefined
  return widths.map((width) => `${responsiveUnsplashImage(src, width, quality)} ${width}w`).join(', ')
}
