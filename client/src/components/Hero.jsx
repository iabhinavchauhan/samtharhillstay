import { NavLink } from 'react-router-dom'

export default function Hero({ slide }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="section-label">Offbeat stay near Kalimpong</p>
        <h2>{slide.title}</h2>
        <p>{slide.subtitle}</p>
        <p>{slide.description}</p>
      </div>
    </section>
  )
}
