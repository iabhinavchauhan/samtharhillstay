import { useMemo, useState } from 'react'
import AdventureCard from '../components/AdventureCard'
import SearchBar from '../components/SearchBar'
import { adventures } from '../data/adventures'

export default function Adventures() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return adventures.filter((item) => `${item.name} ${item.location} ${item.type}`.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Adventures</p>
          <h3>Choose your adrenaline path</h3>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search adventures" />
        <div className="card-grid">
          {filtered.map((item) => (
            <AdventureCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
