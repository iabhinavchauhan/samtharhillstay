import { useParams } from 'react-router-dom'
import { adventures } from '../data/adventures'

export default function AdventureDetails() {
  const { id } = useParams()
  const adventure = adventures.find((item) => item.id === id)

  if (!adventure) {
    return <section className="page-shell"><h3>Adventure not found</h3></section>
  }

  return (
    <section className="page-shell">
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(7, 15, 27, 0.76), rgba(10, 24, 43, 0.72)), url(${adventure.image})` }}>
        <div>
          <p className="section-label">Adventure details</p>
          <h3>{adventure.name}</h3>
          <p>{adventure.description}</p>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h4>Adventure info</h4>
          <p><strong>Location:</strong> {adventure.location}</p>
          <p><strong>Difficulty:</strong> {adventure.difficulty}</p>
          <p><strong>Duration:</strong> {adventure.duration}</p>
          <p><strong>Safety level:</strong> {adventure.safetyLevel}</p>
        </div>
        <div className="detail-card">
          <h4>Best time</h4>
          <p>{adventure.bestSeason}</p>
        </div>
      </div>
    </section>
  )
}
