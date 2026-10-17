import { useContext, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { WishlistContext } from '../context/WishlistContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { wishlist } = useContext(WishlistContext)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/adventures', label: 'Adventures' },
    
    { to: '/food', label: 'Food' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className="topbar">
      <NavLink className="brand-block" to="/">
        <div className="brand-badge">✦</div>
        <div>
          <p className="brand-eyebrow">One World. Endless Adventures.</p>
          <h1>Globe Quest</h1>
        </div>
      </NavLink>

      <button className="menu-toggle" onClick={() => setOpen((value) => !value)}>
        ☰
      </button>

      <nav className={`nav-links ${open ? 'open' : ''}`}>
        {links.map((link) => (
          <NavLink key={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to={link.to} onClick={() => setOpen(false)}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
