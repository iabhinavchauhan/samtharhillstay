import { useMemo, useState } from 'react'
import FoodCard from '../components/FoodCard'
import SearchBar from '../components/SearchBar'
import { foodPlaces } from '../data/foodPlaces'

export default function Food() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return foodPlaces.filter((item) => `${item.name} ${item.location} ${item.dish}`.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Food</p>
          <h3>Travel through flavor</h3>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search food places" />
        <div className="card-grid">
          {filtered.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
