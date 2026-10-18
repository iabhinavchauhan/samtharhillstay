import { useEffect, useState, useContext, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { ResortContext } from '../context/ResortContext'
import { useUserAuth } from '../context/UserAuthContext'
import { ShoppingBag, User, LogOut, Calendar, CreditCard, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { siteData } = useContext(ResortContext)
  const { user, isAuthenticated, cartCount, logout } = useUserAuth()
  const nav = siteData?.navigation || {}
  const contact = siteData?.contact || {}
  const navigate = useNavigate()

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
  const [userDropdown, setUserDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 24)
  const [activeSection, setActiveSection] = useState(() => window.location.hash.slice(1) || 'home')
  const dropdownRef = useRef(null)

  const location = useLocation()
  const isHome = location.pathname === '/'

  const headerClass = isHome
    ? `home-navbar fixed inset-x-3 top-3 z-50 overflow-visible rounded-[20px] border border-white/15 text-white backdrop-blur-xl transition-colors duration-500 sm:inset-x-6 ${isScrolled ? 'home-navbar-scrolled' : ''}`
    : 'sticky top-0 z-50 border-b border-[#e8e3d6] bg-[#faf8f1]/95 text-[#10281e] backdrop-blur-md'

  const navTextClass = isHome ? 'text-white/75 hover:bg-white/10 hover:text-white' : 'text-[#3f4d43] hover:bg-[#eeeadc] hover:text-[#10281e]'

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

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

        {/* Desktop Links */}
        <nav className="hidden items-center gap-0 lg:flex">
          {navLinks.filter((l) => l.visible !== false).map((link) => (
            <a
              key={link.to || link.label}
              href={link.to}
              aria-current={isHome && activeSection === (link.to || '').split('#')[1] ? 'location' : undefined}
              className={`rounded-full px-2.5 py-2 text-[11px] font-medium transition lg:px-3 lg:text-[12px] ${navTextClass} ${isHome && activeSection === (link.to || '').split('#')[1] ? 'bg-white/15 text-white' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons: Cart, User Auth, Brochure, Admin */}
        <div className="hidden items-center gap-2 sm:flex">
          {/* Cart Indicator with Badge */}
          <Link
            to="/dashboard?tab=cart"
            title="My Cart"
            className={`relative flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition ${
              isHome
                ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                : 'border-[#d8d2c5] text-[#324239] hover:bg-[#eeeadc]'
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-[#caa34b]" />
            <span className="hidden xl:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#caa34b] text-[9px] font-bold text-[#10281e]">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth: Login or Account Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition ${
                  isHome
                    ? 'border-[#caa34b]/50 bg-[#caa34b]/20 text-white hover:bg-[#caa34b]/30'
                    : 'border-[#caa34b]/60 bg-[#caa34b]/15 text-[#10281e] hover:bg-[#caa34b]/25'
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#caa34b] text-[10px] font-bold text-[#10281e]">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="max-w-[90px] truncate">{user.name?.split(' ')[0] || 'Account'}</span>
                <ChevronDown className="h-3 w-3 text-[#caa34b]" />
              </button>

              {userDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#e5dfd1] bg-[#fffdf8] p-2 text-xs text-[#10281e] shadow-xl animate-fadeIn z-50">
                  <div className="border-b border-[#eee8da] px-3 py-2 text-[11px]">
                    <p className="font-bold text-[#10281e] truncate">{user.name}</p>
                    <p className="text-[10px] text-[#59645a] truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard?tab=profile"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#faf8f1] transition font-medium"
                  >
                    <User className="h-3.5 w-3.5 text-[#caa34b]" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard?tab=cart"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#faf8f1] transition font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#caa34b]" />
                      <span>My Cart</span>
                    </span>
                    {cartCount > 0 && (
                      <span className="rounded-full bg-[#caa34b] px-1.5 py-0.2 text-[9px] font-bold text-[#10281e]">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/dashboard?tab=bookings"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#faf8f1] transition font-medium"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#caa34b]" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    to="/dashboard?tab=payments"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#faf8f1] transition font-medium"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-[#caa34b]" />
                    <span>Payment History</span>
                  </Link>
                  <div className="border-t border-[#eee8da] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdown(false)
                        logout()
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition ${
                isHome
                  ? 'border-white/25 text-white hover:bg-white/10'
                  : 'border-[#d8d2c5] text-[#324239] hover:bg-white'
              }`}
            >
              Sign In
            </Link>
          )}

          <a
            href={contact.brochureUrl || "/samthar-brochure.pdf"}
            target="_blank"
            rel="noreferrer"
            className={`hidden xl:inline-block rounded-[10px] border px-3 py-2 text-[11px] font-semibold transition ${
              isHome ? 'border-white/25 text-white hover:bg-white/10' : 'border-[#d8d2c5] text-[#324239] hover:bg-white'
            }`}
          >
            Brochure
          </a>

          <a
            href={nav.ctaLink || "/#contact"}
            className="rounded-[10px] bg-[var(--accent-gold,#caa34b)] px-3.5 py-2 text-[11px] font-semibold text-[#17291e] transition hover:bg-[var(--accent-gold-hover,#d8b85e)]"
          >
            {nav.ctaText || 'Book Your Stay'}
          </a>

          <a
            href="/admin/login"
            title="Admin Management Portal"
            className={`flex items-center gap-1 rounded-[10px] border px-2.5 py-2 text-[11px] font-semibold transition ${
              isHome
                ? 'border-[#caa34b]/40 bg-[#caa34b]/15 text-[#caa34b] hover:bg-[#caa34b]/25 hover:text-white'
                : 'border-[#caa34b]/60 bg-[#caa34b]/10 text-[#7a5e1c] hover:bg-[#caa34b]/20 hover:text-[#10281e]'
            }`}
          >
            <span aria-hidden="true">🔒</span>
            <span className="hidden lg:inline">Admin</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={`grid h-10 w-10 place-items-center rounded-xl border sm:hidden ${
            isHome ? 'border-white/25 text-white' : 'border-[#ded8ca] text-[#10281e]'
          }`}
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span aria-hidden="true" className="text-xl leading-none">{open ? '×' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <nav
        className={`overflow-hidden transition-all duration-300 sm:hidden ${
          isHome ? 'bg-[#10281e] text-white' : 'bg-[#faf8f1] text-[#10281e]'
        } ${open ? `max-h-[580px] border-t ${isHome ? 'border-white/10' : 'border-[#e8e3d6]'} opacity-100` : 'max-h-0 opacity-0'}`}
      >
        <div className="grid grid-cols-2 gap-1 px-4 py-3">
          {navLinks.filter((l) => l.visible !== false).map((link) => (
            <a
              key={link.to || link.label}
              href={link.to}
              aria-current={isHome && activeSection === (link.to || '').split('#')[1] ? 'location' : undefined}
              className={`px-3 py-2.5 text-sm ${
                isHome && activeSection === (link.to || '').split('#')[1]
                  ? 'bg-white/10 text-white'
                  : isHome
                  ? 'text-white/85 hover:bg-white/10'
                  : 'text-[#324239] hover:bg-[#eeeadc]'
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {/* Mobile Cart & Account Links */}
          <Link
            to="/dashboard?tab=cart"
            className="col-span-2 flex items-center justify-between rounded-lg bg-[#caa34b]/15 px-3 py-2.5 text-sm font-semibold text-[#caa34b]"
            onClick={() => setOpen(false)}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>My Cart</span>
            </span>
            <span className="rounded-full bg-[#caa34b] px-2 py-0.5 text-xs text-[#10281e]">
              {cartCount}
            </span>
          </Link>

          {isAuthenticated && user ? (
            <Link
              to="/dashboard"
              className="col-span-2 flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2.5 text-sm font-semibold"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4 text-[#caa34b]" />
              <span>Guest Dashboard ({user.name})</span>
            </Link>
          ) : (
            <div className="col-span-2 grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                className="rounded-lg border border-[#caa34b] py-2 text-center text-xs font-semibold text-[#caa34b]"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-[#caa34b] py-2 text-center text-xs font-semibold text-[#10281e]"
                onClick={() => setOpen(false)}
              >
                Create Account
              </Link>
            </div>
          )}

          <a
            href={contact.brochureUrl || "/samthar-brochure.pdf"}
            target="_blank"
            rel="noreferrer"
            className={`col-span-2 rounded-lg px-3 py-2 text-sm ${
              isHome ? 'text-white/85 hover:bg-white/10' : 'text-[#324239] hover:bg-[#eeeadc]'
            }`}
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
            className="col-span-2 rounded-[10px] border border-[#caa34b]/40 bg-[#caa34b]/10 px-3 py-2 text-center text-xs font-semibold text-[#caa34b]"
            onClick={() => setOpen(false)}
          >
            🔒 Administrator Portal
          </a>
        </div>
      </nav>
    </header>
  )
}
