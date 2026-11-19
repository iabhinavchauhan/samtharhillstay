import { useEffect, useMemo, useState } from 'react'
import { WishlistContext } from './WishlistContext.js'

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('globe-wishlist') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('globe-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const toggleWishlist = (item) => {
    setWishlist((current) => {
      const exists = current.some((entry) => entry.id === item.id)
      if (exists) {
        return current.filter((entry) => entry.id !== item.id)
      }
      return [...current, item]
    })
  }

  const value = useMemo(() => ({ wishlist, toggleWishlist }), [wishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
