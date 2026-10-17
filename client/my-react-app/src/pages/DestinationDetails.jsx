import { useParams } from 'react-router-dom'
import { destinations } from '../data/destinations'

export default function DestinationDetails() {
  const { id } = useParams()
  const destination = destinations.find((item) => item.id === id)

  if (!destination) {
    return <section className="page-shell"><h3>Destination not found</h3></section>
  }

  return (
    <section className="page-shell">
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(7, 15, 27, 0.76), rgba(10, 24, 43, 0.72)), url(${destination.image})` }}>
        <div>
          <p className="section-label">Destination details</p>
          <h3>{destination.name}</h3>
          <p>{destination.description}</p>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h4>Highlights</h4>
          <ul>
            {destination.highlights.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="detail-card">
          <h4>Travel facts</h4>
          <p><strong>Region:</strong> {destination.region}</p>
          <p><strong>Best season:</strong> {destination.bestSeason}</p>
          <p><strong>Trip duration:</strong> {destination.duration}</p>
          <p><strong>Difficulty:</strong> {destination.difficulty}</p>
        </div>
      </div>
    </section>
  )
}
