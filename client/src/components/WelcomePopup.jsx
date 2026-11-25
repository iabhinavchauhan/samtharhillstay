import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const highlights = [
  'Scenic mountain views',
  'Authentic homestay experience',
  'Comfortable accommodation',
  'Peaceful surroundings',
  'Family-friendly',
  'Perfect for couples and groups',
]

export default function WelcomePopup() {
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('samthar-welcome-dismissed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (pathname !== '/' || dismissed) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setDismissed(true)
        try {
          sessionStorage.setItem('samthar-welcome-dismissed', 'true')
        } catch {
          // The popup is still dismissed for this render if storage is unavailable.
        }
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [pathname, dismissed])

  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem('samthar-welcome-dismissed', 'true')
    } catch {
      // Dismiss for the current render even when storage is unavailable.
    }
  }

  if (dismissed || pathname !== '/') return null

  return (
    <div className="welcome-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) dismiss()
    }}>
      <section className="welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-description">
        <div className="welcome-art">
          <button className="welcome-close" type="button" aria-label="Close welcome message" onClick={dismiss}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <img className="welcome-logo" src="/favicon.png" alt="Samthar Hillstay" />
        </div>
        <div className="welcome-content">
          <p className="welcome-kicker">Welcome</p>
          <h2 id="welcome-title">Samthar Hillstay</h2>
          <p className="welcome-tagline">YOUR HOME ABOVE THE HILLS</p>
          <p className="welcome-description" id="welcome-description">
            Find your quiet corner in the Kalimpong hills. Stay with welcoming local hosts, wake to mountain views, and take each day at your own pace.
          </p>
          <ul className="welcome-highlights">
            {highlights.map((highlight) => <li key={highlight}><span aria-hidden="true">✓</span>{highlight}</li>)}
          </ul>
          <div className="welcome-actions">
            <Link className="welcome-primary" to="/#homestays" onClick={dismiss}>Explore Homestays</Link>
            <button className="welcome-later" type="button" onClick={dismiss}>Maybe later</button>
          </div>
        </div>
      </section>
    </div>
  )
}
