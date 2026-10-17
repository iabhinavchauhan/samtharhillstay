import { createContext, useEffect, useMemo, useState } from 'react'

export const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('globe-wishlist')
    if (saved) {
      setWishlist(JSON.parse(saved))
    }
  }, [])

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
