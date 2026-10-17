import { NavLink } from 'react-router-dom'

export default function Hero({ slide }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="section-label">Adventure travel platform</p>
        <h2>Find Your Next Great Escape</h2>
        <p>{slide.description}</p>
        <div className="hero-actions">
          <NavLink className="button primary" to="/destinations">Explore Destinations</NavLink>
          <NavLink className="button secondary" to="/adventures">Find an Adventure</NavLink>
        </div>
      </div>
    </section>
  )
}
