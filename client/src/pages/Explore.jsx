import { NavLink } from 'react-router-dom'
import { destinationCategories } from '../data/destinations'

export default function Explore() {
  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Explore</p>
          <h3>Choose your next horizon</h3>
        </div>
        <div className="card-grid">
          {destinationCategories.map((item) => (
            <NavLink key={item.id} to="/destinations" className="card category-card">
              <div className="card-media category-media">
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <div className="card-content category-content">
                <p className="tag">{item.count}</p>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  )
}
