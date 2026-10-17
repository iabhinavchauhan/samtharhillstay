import { useMemo, useState } from 'react'
import DestinationCard from '../components/DestinationCard'
import FilterPanel from '../components/FilterPanel'
import SearchBar from '../components/SearchBar'
import { destinations } from '../data/destinations'

export default function Destinations() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: 'All', budget: 'All', difficulty: 'All' })

  const filtered = useMemo(() => {
    return destinations.filter((item) => {
      const matchesSearch = `${item.name} ${item.region} ${item.type}`.toLowerCase().includes(search.toLowerCase())
      const matchesType = filters.type === 'All' || item.type === filters.type
      return matchesSearch && matchesType
    })
  }, [search, filters])

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Destinations</p>
          <h3>Collection of iconic escapes</h3>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search destinations" />
        <FilterPanel filters={filters} onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} />
        <div className="card-grid">
          {filtered.map((item) => (
            <DestinationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
