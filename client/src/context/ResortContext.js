import { createContext } from 'react'

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
