import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ResortContext } from '../context/ResortContext.js'
import { useContext } from 'react'

export default function WelcomePopup() {
  const { pathname } = useLocation()
  const { siteData } = useContext(ResortContext)
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  const popupData = siteData?.homepage?.welcomePopup || {}
  const kicker = popupData.kicker || 'Welcome'
  const title = popupData.title || 'Samthar Hillstay'
  const tagline = popupData.tagline || 'YOUR HOME ABOVE THE HILLS'
  const description = popupData.description || 'Find your quiet corner in the Kalimpong hills. Stay with welcoming local hosts, wake to mountain views, and take each day at your own pace.'
  const highlights = popupData.highlights || [
    'Scenic mountain views',
    'Authentic homestay experience',
    'Comfortable accommodation',
    'Peaceful surroundings',
    'Family-friendly',
    'Perfect for couples and groups',
  ]
  const primaryButtonText = popupData.primaryButtonText || 'Explore Homestays'
  const primaryButtonLink = popupData.primaryButtonLink || '/#homestays'
  const secondaryButtonText = popupData.secondaryButtonText || 'Maybe later'
  const logo = popupData.logo || '/favicon.png'
  const isPopupVisible = popupData.visible !== false

  useEffect(() => {
    if (pathname !== '/' || dismissed || !isPopupVisible) return undefined
    const timer = window.setTimeout(() => setVisible(true), 2000)
    return () => window.clearTimeout(timer)
  }, [pathname, dismissed, isPopupVisible])

  useEffect(() => {
    if (pathname !== '/' || dismissed) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setDismissed(true)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [pathname, dismissed])

  const dismiss = () => {
    setDismissed(true)
  }

  if (dismissed || pathname !== '/' || !visible || !isPopupVisible) return null

  return (
    <div className="welcome-overlay" onClick={(event) => {
      if (event.target === event.currentTarget) {
        event.stopPropagation()
        dismiss()
      }
    }}>
      <section className="welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-description">
        <div className="welcome-art">
          <button className="welcome-close" type="button" aria-label="Close welcome message" onClick={dismiss}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <img className="welcome-logo" src={logo} alt="Samthar Hillstay" />
        </div>
        <div className="welcome-content">
          <p className="welcome-kicker">{kicker}</p>
          <h2 id="welcome-title">{title}</h2>
          <p className="welcome-tagline">{tagline}</p>
          <p className="welcome-description" id="welcome-description">
            {description}
          </p>
          <ul className="welcome-highlights">
            {highlights.map((highlight) => <li key={highlight}><span aria-hidden="true">✓</span>{highlight}</li>)}
          </ul>
          <div className="welcome-actions">
            <Link className="welcome-primary" to={primaryButtonLink} onClick={dismiss}>{primaryButtonText}</Link>
            <button className="welcome-later" type="button" onClick={dismiss}>{secondaryButtonText}</button>
          </div>
        </div>
      </section>
    </div>
  )
}
