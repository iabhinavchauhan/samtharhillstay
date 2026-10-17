import { useContext } from 'react'
import { CompareContext } from '../context/CompareContext'

export default function Compare() {
  const { compareItems } = useContext(CompareContext)

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Compare</p>
          <h3>Compare destinations and experiences side by side</h3>
        </div>
        {compareItems.length === 0 ? (
          <p>Select items from cards to compare them.</p>
        ) : (
          <div className="compare-table">
            <div className="compare-row compare-head">
              <span>Item</span>
              <span>Location</span>
              <span>Type</span>
              <span>Best season</span>
              <span>Rating</span>
            </div>
            {compareItems.map((item) => (
              <div key={item.id} className="compare-row">
                <span>{item.name || item.title}</span>
                <span>{item.region || item.location || item.nearbyDestination || item.dish}</span>
                <span>{item.type || 'Experience'}</span>
                <span>{item.bestSeason || 'Flexible'}</span>
                <span>{item.rating || '4.6'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
