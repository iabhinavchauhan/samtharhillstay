import { useContext } from 'react'
import { WishlistContext } from '../context/WishlistContext'

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useContext(WishlistContext)

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Wishlist</p>
          <h3>Your saved adventures</h3>
        </div>
        {wishlist.length === 0 ? (
          <p>No saved items yet.</p>
        ) : (
          <div className="card-grid">
            {wishlist.map((item) => (
              <article key={item.id} className="card">
                <h4>{item.name || item.title}</h4>
                <p>{item.region || item.location || item.nearbyDestination || item.dish}</p>
                <button className="chip" type="button" onClick={() => toggleWishlist(item)}>Remove</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
