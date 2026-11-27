import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../utils/api'
import { ResortContext } from './ResortContext.js'
import { homestays as defaultHomestays } from '../data/resortData'
import { normalizeDiscount } from '../utils/currency'

function reconcileHomestays(savedHomestays = []) {
  const matchedSavedIndexes = new Set()
  const completedDefaults = defaultHomestays.map((defaultStay) => {
    const defaultName = (defaultStay.name || '').trim().toLowerCase()
    const savedIndex = savedHomestays.findIndex((stay, index) => (
      !matchedSavedIndexes.has(index) &&
      ((stay.slug && stay.slug === defaultStay.slug) || (stay.name || '').trim().toLowerCase() === defaultName)
    ))
    if (savedIndex === -1) return defaultStay
    matchedSavedIndexes.add(savedIndex)
    const savedStay = savedHomestays[savedIndex]
    return { ...defaultStay, ...savedStay, contact: { ...defaultStay.contact, ...savedStay.contact } }
  })
  return [...completedDefaults, ...savedHomestays.filter((_, index) => !matchedSavedIndexes.has(index))]
}

function loadStorage(key, fallback) {
  try {
    const cached = window.localStorage.getItem(`resort.${key}`)
    return cached ? JSON.parse(cached) : fallback
  } catch {
    return fallback
  }
}

function saveStorage(key, value) {
  window.localStorage.setItem(`resort.${key}`, JSON.stringify(value))
}

export function ResortProvider({ children }) {
  const [siteData, setSiteData] = useState(() => loadStorage('publishedSiteData', null))
  const [siteDataError, setSiteDataError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  const retrySiteData = useCallback(() => {
    setLoading(true)
    setRetryCount((count) => count + 1)
  }, [])

  // Fetch published live data or draft preview from backend
  useEffect(() => {
    let isCurrentRequest = true
    const isPreview = window.location.search.includes('preview=true')
    const token = localStorage.getItem('samthar_admin_token')
    
    // If in preview mode with token, fetch draft!
    const endpoint = isPreview && token ? '/api/admin/content/draft' : '/api/content/published'
    const headers = isPreview && token ? { Authorization: `Bearer ${token}` } : {}

    apiFetch(endpoint, { headers })
      .then((res) => res.json())
      .then((data) => {
        const actual = data.draft ? data.draft : data
        if (!actual || typeof actual !== 'object' || Array.isArray(actual)) {
          throw new Error(`The API response from ${endpoint} did not contain site data.`)
        }
        if (!isCurrentRequest) return
        setSiteData(actual)
        setSiteDataError('')
        if (!isPreview) {
          try {
            saveStorage('publishedSiteData', actual)
          } catch (error) {
            console.warn('Could not cache published site data locally:', error.message)
          }
        }
        
        // Dynamically apply Theme CSS Variables & Typography
        if (actual.theme) {
          const root = document.documentElement
          if (actual.theme.primaryColor) root.style.setProperty('--primary-color', actual.theme.primaryColor)
          if (actual.theme.accentGold) root.style.setProperty('--accent-gold', actual.theme.accentGold)
          if (actual.theme.accentGoldHover) root.style.setProperty('--accent-gold-hover', actual.theme.accentGoldHover)
          if (actual.theme.backgroundColor) root.style.setProperty('--site-bg', actual.theme.backgroundColor)
          if (actual.theme.textColor) root.style.setProperty('--site-text', actual.theme.textColor)
          if (actual.theme.fontFamily) root.style.setProperty('--site-font', actual.theme.fontFamily)
          if (actual.theme.displayFont) root.style.setProperty('--display-font', actual.theme.displayFont)
          if (actual.theme.borderRadius) root.style.setProperty('--border-radius', actual.theme.borderRadius)
          if (actual.theme.buttonRadius) root.style.setProperty('--button-radius', actual.theme.buttonRadius)
          root.dataset.occasionTheme = actual.theme.occasionTheme || 'default'
        }

        // Apply dynamic SEO title and description
        if (actual.seo) {
          if (actual.seo.siteTitle) document.title = actual.seo.siteTitle
          const metaDesc = document.querySelector('meta[name="description"]')
          if (metaDesc && actual.seo.metaDescription) {
            metaDesc.setAttribute('content', actual.seo.metaDescription)
          }
        }
      })
      .catch((err) => {
        if (!isCurrentRequest) return
        console.error(`Failed to load published site data from ${endpoint}:`, err)
        setSiteDataError(err.message || 'Could not load the latest site content.')
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false)
      })
    return () => {
      isCurrentRequest = false
    }
  }, [retryCount])

  // Keep an already-open public page in sync after a publish from another tab/device.
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        setRetryCount((count) => count + 1)
      }
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    const refreshInterval = window.setInterval(refreshWhenVisible, 10_000)
    return () => {
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.clearInterval(refreshInterval)
    }
  }, [])

  const [wishlist, setWishlist] = useState(loadStorage('wishlist', []))
  const [favorites, setFavorites] = useState(loadStorage('favorites', []))
  const [reviews, setReviews] = useState([])
  const [recentViews, setRecentViews] = useState(loadStorage('recentViews', []))
  const [bookingDraft, setBookingDraft] = useState(
    loadStorage('bookingDraft', {
      homestay: 'samthar-hill-stay',
      checkIn: '',
      checkOut: '',
      guests: 2,
      room: 'Forest Suite',
    }),
  )

  useEffect(() => {
    saveStorage('wishlist', wishlist)
  }, [wishlist])

  useEffect(() => {
    saveStorage('favorites', favorites)
  }, [favorites])

  useEffect(() => {
    let isCurrentRequest = true
    let requestInFlight = false
    const refreshReviews = async () => {
      if (!isCurrentRequest || requestInFlight || document.visibilityState !== 'visible') return
      requestInFlight = true
      try {
        const res = await apiFetch('/api/reviews')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load reviews.')
        if (isCurrentRequest) setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Could not load guest reviews:', error)
      } finally {
        requestInFlight = false
      }
    }

    void refreshReviews()
    const refreshInterval = window.setInterval(refreshReviews, 10_000)
    document.addEventListener('visibilitychange', refreshReviews)
    return () => {
      isCurrentRequest = false
      window.clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', refreshReviews)
    }
  }, [])

  useEffect(() => {
    saveStorage('recentViews', recentViews)
  }, [recentViews])

  useEffect(() => {
    saveStorage('bookingDraft', bookingDraft)
  }, [bookingDraft])

  const toggleWishlist = useCallback((slug) => {
    setWishlist((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    )
  }, [])

  const toggleFavorite = useCallback((id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }, [])

  const addReview = useCallback(async (review) => {
    const res = await apiFetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Your review could not be saved.')
    setReviews((current) => [data, ...current.filter((item) => item.id !== data.id)])
    return data
  }, [])

  const addRecentView = useCallback((slug) => {
    setRecentViews((current) => {
      const next = [slug, ...current.filter((item) => item !== slug)]
      return next.slice(0, 5)
    })
  }, [])

  const updateBookingDraft = useCallback((patch) => {
    setBookingDraft((current) => ({ ...current, ...patch }))
  }, [])

  const homestays = useMemo(
    () => reconcileHomestays(siteData?.homestays || []),
    [siteData]
  )
  const foodItems = useMemo(() => siteData?.foodItems || [], [siteData])
  const discount = useMemo(
    () => normalizeDiscount(siteData?.discount),
    [siteData]
  )

  const value = useMemo(
    () => ({
      siteData,
      loading,
      siteDataError,
      retrySiteData,
      wishlist,
      toggleWishlist,
      favorites,
      toggleFavorite,
      reviews,
      addReview,
      recentViews,
      addRecentView,
      bookingDraft,
      updateBookingDraft,
      homestays,
      foodItems,
      discount,
    }),
    [siteData, loading, siteDataError, retrySiteData, wishlist, toggleWishlist, favorites, toggleFavorite, reviews, addReview, recentViews, addRecentView, bookingDraft, updateBookingDraft, homestays, foodItems, discount],
  )

  return <ResortContext.Provider value={value}>{children}</ResortContext.Provider>
}
