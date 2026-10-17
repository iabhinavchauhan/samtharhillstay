import { useEffect, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { ResortContext } from '../context/ResortContext'

export default function Navbar() {
  const { siteData } = useContext(ResortContext)
  const nav = siteData?.navigation || {}
  const contact = siteData?.contact || {}

  const rawNavLinks = nav.links || [
    { to: '/#home', label: 'Home' },
    { to: '/#homestays', label: 'Homestays' },
    { to: '/#experiences', label: 'Experiences' },
    { to: '/#explore', label: 'Explore' },
    { to: '/#gallery', label: 'Gallery' },
    { to: '/#contact', label: 'Contact' },
  ]

  const navLinks = rawNavLinks.filter((link) => link.visible !== false)

  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 24)
  const [activeSection, setActiveSection] = useState(() => window.location.hash.slice(1) || 'home')
  const location = useLocation()
  const isHome = location.pathname === '/'
  const headerClass = isHome
    ? `home-navbar fixed inset-x-3 top-3 z-50 overflow-hidden rounded-[20px] border border-white/15 text-white backdrop-blur-xl transition-colors duration-500 sm:inset-x-6 ${isScrolled ? 'home-navbar-scrolled' : ''}`
    : 'sticky top-0 z-50 border-b border-[#e8e3d6] bg-[#faf8f1]/95 text-[#10281e] backdrop-blur-md'
  const navTextClass = isHome ? 'text-white/75 hover:bg-white/10 hover:text-white' : 'text-[#3f4d43] hover:bg-[#eeeadc] hover:text-[#10281e]'

  useEffect(() => {
    if (!isHome) return undefined

    const updateScrollState = () => setIsScrolled(window.scrollY > 24)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })

    const sectionIds = navLinks.map((link) => (link.to || '').split('#')[1]).filter(Boolean)
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 66
    const updateActiveSection = () => {
      const readingLine = headerHeight + 40
      const currentSection = sections
        .filter((section) => {
          const bounds = section.getBoundingClientRect()
          return bounds.top <= readingLine && bounds.bottom > readingLine
        })
        .at(-1)

      if (currentSection) setActiveSection(currentSection.id)
      else if (window.scrollY < 80) setActiveSection('home')
    }

    const initialFrame = requestAnimationFrame(updateActiveSection)
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      cancelAnimationFrame(initialFrame)
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [isHome, navLinks])

  return (
    <header className={headerClass}>
      <div className="mx-auto flex min-h-[66px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/#home" className={`flex shrink-0 items-center gap-2.5 ${isHome ? 'text-white' : 'text-[#10281e]'}`} onClick={() => setOpen(false)}>
          <img src={nav.logoImage || "/samthar-mark.svg?v=2"} alt="" className="h-10 w-10 shrink-0 object-contain" />
          <span className="leading-tight">
            <span className="display-font block text-base font-bold tracking-wide">{nav.logoText || 'Samthar'}</span>
            <span className={`block text-[8px] font-bold uppercase tracking-[.2em] ${isHome ? 'text-white/70' : 'text-[#777a70]'}`}>
              {nav.logoSubtitle || 'Kalimpong · West Bengal'}
            </span>
          </span>
        </a>

        <button
          className={`grid h-10 w-10 place-items-center border md:hidden ${isHome ? 'border-white/25 text-white' : 'border-[#ded8ca] text-[#10281e]'}`}
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span aria-hidden="true" className="text-xl leading-none">{open ? '×' : '☰'}</span>
        </button>

        <nav className="hidden items-center gap-0 md:flex">
          {navLinks.filter((l) => l.visible !== false).map((link) => (
            <a
              key={link.to || link.label}
              href={link.to}
              aria-current={isHome && activeSection === (link.to || '').split('#')[1] ? 'location' : undefined}
              className={`rounded-full px-2 py-2 text-[11px] font-medium transition lg:px-3 lg:text-[12px] ${navTextClass} ${isHome && activeSection === (link.to || '').split('#')[1] ? 'bg-white/15 text-white' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={contact.brochureUrl || "/samthar-brochure.pdf"}
            target="_blank"
            rel="noreferrer"
            className={`rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition ${isHome ? 'border-white/25 text-white hover:bg-white/10' : 'border-[#d8d2c5] text-[#324239] hover:bg-white'}`}
          >
            <span aria-hidden="true">↓ </span>
            <span className="hidden lg:inline">Open Brochure</span>
            <span className="lg:hidden">Brochure</span>
          </a>
          <a
            href={nav.ctaLink || "/#contact"}
            className="rounded-[10px] bg-[var(--accent-gold,#caa34b)] px-4 py-2 text-[11px] font-semibold text-[#17291e] transition hover:bg-[var(--accent-gold-hover,#d8b85e)]"
          >
            {nav.ctaText || 'Book Your Stay'}
          </a>
          <a
            href="/admin/login"
            title="Admin Management Portal"
            className={`flex items-center gap-1 rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition ${
              isHome
                ? 'border-[#caa34b]/40 bg-[#caa34b]/15 text-[#caa34b] hover:bg-[#caa34b]/25 hover:text-white'
                : 'border-[#caa34b]/60 bg-[#caa34b]/10 text-[#7a5e1c] hover:bg-[#caa34b]/20 hover:text-[#10281e]'
            }`}
          >
            <span aria-hidden="true">🔒</span>
            <span>Admin</span>
          </a>
        </div>
      </div>

      <nav className={`overflow-hidden transition-all duration-300 md:hidden ${isHome ? 'bg-[#10281e] text-white' : 'bg-[#faf8f1] text-[#10281e]'} ${open ? `max-h-[480px] border-t ${isHome ? 'border-white/10' : 'border-[#e8e3d6]'} opacity-100` : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-2 gap-1 px-4 py-3">
          {navLinks.filter((l) => l.visible !== false).map((link) => (
            <a
              key={link.to || link.label}
              href={link.to}
              aria-current={isHome && activeSection === (link.to || '').split('#')[1] ? 'location' : undefined}
              className={`px-3 py-3 text-sm ${isHome && activeSection === (link.to || '').split('#')[1] ? 'bg-white/10 text-white' : (isHome ? 'text-white/85 hover:bg-white/10' : 'text-[#324239] hover:bg-[#eeeadc]')}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={contact.brochureUrl || "/samthar-brochure.pdf"}
            target="_blank"
            rel="noreferrer"
            className={`col-span-2 rounded-lg px-3 py-3 text-sm ${isHome ? 'text-white/85 hover:bg-white/10' : 'text-[#324239] hover:bg-[#eeeadc]'}`}
            onClick={() => setOpen(false)}
          >
            Open Brochure ↗
          </a>
          <a
            href={nav.ctaLink || "/#contact"}
            className="col-span-2 rounded-[10px] bg-[var(--accent-gold,#caa34b)] px-3 py-3 text-center text-sm font-semibold text-[#17291e]"
            onClick={() => setOpen(false)}
          >
            {nav.ctaText || 'Book Your Stay'}
          </a>
          <a
            href="/admin/login"
            className={`col-span-2 rounded-[10px] border px-3 py-2.5 text-center text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
              isHome
                ? 'border-[#caa34b]/40 bg-[#caa34b]/15 text-[#caa34b]'
                : 'border-[#caa34b]/60 bg-[#caa34b]/10 text-[#7a5e1c]'
            }`}
            onClick={() => setOpen(false)}
          >
            <span>🔒 Admin Login</span>
          </a>
        </div>
      </nav>
    </header>
  )
}
