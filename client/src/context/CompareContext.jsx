import { useMemo, useState } from 'react'
import { CompareContext } from './CompareContext.js'

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([])

  const toggleCompare = (item) => {
    setCompareItems((current) => {
      const exists = current.some((entry) => entry.id === item.id)
      if (exists) {
        return current.filter((entry) => entry.id !== item.id)
      }
      if (current.length >= 3) {
        return [...current.slice(1), item]
      }
      return [...current, item]
    })
  }

  const value = useMemo(() => ({ compareItems, toggleCompare }), [compareItems])

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
