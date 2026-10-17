import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Hero from '../components/Hero'
import DestinationCard from '../components/DestinationCard'
import AdventureCard from '../components/AdventureCard'
import FoodCard from '../components/FoodCard'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import { destinationCategories, destinations } from '../data/destinations'
import { adventures } from '../data/adventures'
import { foodPlaces } from '../data/foodPlaces'

const heroSlides = [
  {
    title: 'Mountains',
    description: 'Adventure begins where the air is crisp and the horizon stretches wide across alpine ridges.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80',
  },
  {
    title: 'Beaches',
    description: 'From reef escapes to sunset sailing, coastal adventures open the door to pure freedom.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
  },
  {
    title: 'Deserts',
    description: 'Golden dunes, cultural stays, and stars so bright they feel close enough to touch.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
  },
  {
    title: 'Forests',
    description: 'Walk into canopies, rivers, and wildlife sanctuaries built for discovery.',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1800&q=80',
  },
  {
    title: 'Lakes & Snow',
    description: 'Quiet waters, alpine winters, and dreamy escapes shaped by nature.',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=80',
  },
]

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: 'All', budget: 'All', difficulty: 'All' })

  useMemo(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((value) => (value + 1) % heroSlides.length)
    }, 12000)

    return () => window.clearInterval(timer)
  }, [])

  const filteredDestinations = useMemo(() => {
    return destinations.filter((item) => {
      const matchesSearch = `${item.name} ${item.region} ${item.type}`.toLowerCase().includes(search.toLowerCase())
      const matchesType = filters.type === 'All' || item.type === filters.type
      return matchesSearch && matchesType
    })
  }, [search, filters])

  const activeSlide = heroSlides[slideIndex]

  return (
    <section className="page-shell">
      <div className="hero-scene" style={{ backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04)), url(${activeSlide.image})` }}>
        <Hero slide={activeSlide} />
      </div>

      <section className="section-clean">
        <div className="section-heading">
          <p className="section-label">Destination categories</p>
          <h3>Discover every kind of journey</h3>
        </div>
        <div className="card-grid categories-grid">
          {destinationCategories.map((category) => (
            <NavLink key={category.id} to="/destinations" className="card category-card">
              <div className="card-media category-media">
                <img src={category.image} alt={category.title} />
              </div>
              <div className="card-content category-content">
                <p className="tag">{category.count}</p>
                <h4>{category.title}</h4>
                <p>{category.description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      <section className="section-clean">
        <div className="section-heading">
          <p className="section-label">Featured destinations</p>
          <h3>Travel inspiration for every explorer</h3>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search destinations, adventures, hotels..." />
        <FilterPanel filters={filters} onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} />
        <div className="card-grid">
          {filteredDestinations.map((item) => (
            <DestinationCard key={item.id} item={item} panelless />
          ))}
        </div>
      </section>

      <section className="section-clean">
        <div className="section-heading">
          <p className="section-label">Adventure activities</p>
          <h3>Thrills for every style of explorer</h3>
        </div>
        <div className="card-grid">
          {adventures.map((item) => (
            <AdventureCard key={item.id} item={item} panelless />
          ))}
        </div>
      </section>

      

      <section className="section-clean food-section">
        <div className="section-heading">
          <p className="section-label">Local food discovery</p>
          <h3>Find the flavors travelers remember</h3>
        </div>
        <div className="card-grid">
          {foodPlaces.map((item) => (
            <FoodCard key={item.id} item={item} panelless />
          ))}
        </div>
      </section>
    </section>
  )
}
