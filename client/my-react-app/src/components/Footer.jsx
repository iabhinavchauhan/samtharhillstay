import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <h2>Globe Quest</h2>
        <p>Premium discovery for mountains, deserts, oceans, forests, villages, and every kind of adventure escape.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <ul>
          <li><NavLink to="/destinations">Destinations</NavLink></li>
          <li><NavLink to="/adventures">Adventures</NavLink></li>
          <li><NavLink to="/food">Food</NavLink></li>
        </ul>
      </div>
      <div>
        <h3>Travel ideas</h3>
        <ul>
          <li><NavLink to="/wishlist">Wishlist</NavLink></li>
          <li><NavLink to="/compare">Compare</NavLink></li>
          <li><NavLink to="/feedback">Feedback</NavLink></li>
          <li><NavLink to="/help">Help</NavLink></li>
        </ul>
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li>hello@globequest.com</li>
          <li>+91 98765 43210</li>
          <li>Mumbai • Delhi • Goa</li>
        </ul>
      </div>
    </footer>
  )
}
