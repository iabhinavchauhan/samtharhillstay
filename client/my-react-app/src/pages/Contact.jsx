import { NavLink } from 'react-router-dom'

export default function Contact() {
  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Contact</p>
          <h3>Reach the Globe Quest team</h3>
        </div>
        <div className="contact-grid">
          <div className="detail-card">
            <h4>Talk to us</h4>
            <p>Email: hello@globequest.com</p>
            <p>Phone: +91 98765 43210</p>
            <p>Location: Mumbai, Delhi, Goa</p>
          </div>
          <div className="detail-card">
            <h4>Follow us</h4>
            <p><NavLink to="/">Instagram</NavLink></p>
            <p><NavLink to="/">YouTube</NavLink></p>
            <p><NavLink to="/">X</NavLink></p>
          </div>
        </div>
      </div>
    </section>
  )
}
