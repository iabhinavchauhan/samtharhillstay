import { useParams } from 'react-router-dom'
import { foodPlaces } from '../data/foodPlaces'

export default function FoodDetails() {
  const { id } = useParams()
  const food = foodPlaces.find((item) => item.id === id)

  if (!food) {
    return <section className="page-shell"><h3>Food place not found</h3></section>
  }

  return (
    <section className="page-shell">
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(7, 15, 27, 0.76), rgba(10, 24, 43, 0.72)), url(${food.image})` }}>
        <div>
          <p className="section-label">Food details</p>
          <h3>{food.name}</h3>
          <p>{food.description}</p>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h4>Place info</h4>
          <p><strong>Location:</strong> {food.location}</p>
          <p><strong>Famous dish:</strong> {food.dish}</p>
          <p><strong>Price range:</strong> {food.priceRange}</p>
          <p><strong>Rating:</strong> {food.rating}</p>
        </div>
      </div>
    </section>
  )
}
