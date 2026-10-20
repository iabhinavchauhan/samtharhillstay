import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../utils/api'

export const ResortContext = createContext({
  theme: 'dark',
  siteData: null,
  siteDataError: '',
  retrySiteData: () => {},
  loading: true,
  wishlist: [],
  favorites: [],
  reviews: [],
  recentViews: [],
  bookingDraft: {},
  toggleWishlist: () => {},
  toggleFavorite: () => {},
  addReview: () => {},
  addRecentView: () => {},
  updateBookingDraft: () => {},
  homestays: [],
  foodItems: [],
})

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

  const [wishlist, setWishlist] = useState(loadStorage('wishlist', []))
  const [favorites, setFavorites] = useState(loadStorage('favorites', []))
  const [reviews, setReviews] = useState(() => loadStorage('reviews', []))
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
    saveStorage('reviews', reviews)
  }, [reviews])

  useEffect(() => {
    saveStorage('recentViews', recentViews)
  }, [recentViews])

  useEffect(() => {
    saveStorage('bookingDraft', bookingDraft)
  }, [bookingDraft])

  const toggleWishlist = (slug) => {
    setWishlist((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    )
  }

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const addReview = useCallback((review) => {
    const nextReviews = [{ id: `r-${Date.now()}`, ...review }, ...reviews]
    try {
      saveStorage('reviews', nextReviews)
    } catch {
      throw new Error('Your review could not be saved.')
    }
    setReviews(nextReviews)
  }, [reviews])

  const addRecentView = (slug) => {
    setRecentViews((current) => {
      const next = [slug, ...current.filter((item) => item !== slug)]
      return next.slice(0, 5)
    })
  }

  const updateBookingDraft = (patch) => {
    setBookingDraft((current) => ({ ...current, ...patch }))
  }

  const homestays = siteData?.homestays || []
  const foodItems = siteData?.foodItems || []

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
    }),
    [siteData, loading, siteDataError, retrySiteData, wishlist, favorites, reviews, recentViews, bookingDraft, addReview, homestays, foodItems],
  )

  return <ResortContext.Provider value={value}>{children}</ResortContext.Provider>
}
