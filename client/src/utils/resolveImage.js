export function resolveImage(src, key, width = 1200, height = 800) {
  if (!src || typeof src !== 'string') return src

  // If image already looks local or from picsum, return as-is
  if (!src.includes('loremflickr.com')) return src

  const seed = encodeURIComponent(String(key || src))
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}
