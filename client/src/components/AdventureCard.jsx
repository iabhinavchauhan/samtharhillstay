import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { CompareContext } from '../context/CompareContext'
import { WishlistContext } from '../context/WishlistContext'

export default function AdventureCard({ item, panelless = false }) {
  const { toggleWishlist, wishlist } = useContext(WishlistContext)
  const { toggleCompare } = useContext(CompareContext)
  const isSaved = wishlist.some((entry) => entry.id === item.id)

  return (
    <article className="card card-with-image">
      <div className="card-media">
        <img src={item.image} alt={item.name} loading="lazy" />
      </div>
      <div className={`card-content${panelless ? ' panelless' : ''}`}>
        <p className="tag">{item.type}</p>
        <h4>{item.name}</h4>
        <p className="meta-text">{item.location}</p>
        <p>{item.description}</p>
        <div className="card-meta">
          <span>⚡ {item.difficulty}</span>
          <span>🕒 {item.duration}</span>
        </div>
        <div className="card-actions">
          <button type="button" className="chip" onClick={() => toggleWishlist(item)}>{isSaved ? 'Saved' : 'Wishlist'}</button>
          <button type="button" className="chip" onClick={() => toggleCompare(item)}>Compare</button>
          <Link className="chip" to={`/adventures/${item.id}`}>View</Link>
        </div>
      </div>
    </article>
  )
}
