import { useContext } from 'react'
import { ResortContext } from '../context/ResortContext'

export default function Footer() {
  const { siteData } = useContext(ResortContext)
  const footer = siteData?.footer || {}
  const contact = siteData?.contact || {}
  const nav = siteData?.navigation || {}

  const rawExploreLinks = footer.exploreLinks || [
    { label: 'Home', href: '/#home' },
    { label: 'Homestays', href: '/#homestays' },
    { label: 'Experiences', href: '/#experiences' },
    { label: 'Gallery', href: '/#gallery' },
  ]

  const exploreLinks = rawExploreLinks

  const destinations = footer.destinations || ['Darjeeling', 'Sikkim', 'Silk Route']

  return (
    <footer className="relative overflow-hidden bg-[var(--primary-color,#10281e)] px-5 py-14 text-[#e9e7d9] sm:px-8 sm:py-16">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#d2b45f]/[.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[28%] h-80 w-80 rounded-full bg-[#78a486]/[.08] blur-3xl" />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr_1.1fr] lg:gap-12">
          <div>
            <a href="/#home" className="inline-flex items-center gap-3" aria-label="Samthar home">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--accent-gold,#d2b45f)]/30 bg-white/[.06] text-[var(--accent-gold,#e2c96f)]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 19 7-12 4 7 2-3 5 8H3Z" />
                  <path d="m8 19 5-8m-2 8 3-5" />
                </svg>
              </span>
              <span>
                <span className="display-font block text-2xl font-semibold tracking-wide text-white">
                  {nav.logoText || 'Samthar'}
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.24em] text-[var(--accent-gold,#d2b45f)]">
                  {nav.logoSubtitle || 'Kalimpong · West Bengal'}
                </span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#b9c2b8]">
              {footer.aboutText || 'A peaceful mountain stay in an offbeat village in Kalimpong. Come for the views, stay for the slower rhythm of the hills.'}
            </p>
            <a
              href={contact.whatsappLink || 'https://wa.me/919804600910'}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-[#d2b45f]/50 hover:bg-white/10"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L4 20l1.1-3.2A8.5 8.5 0 1 1 20 11.5Z" /><path d="M9 8.5c.3-.6.6-.6.9-.6h.5l.8 1.9-.9 1a7 7 0 0 0 2.8 2.8l1-.9 1.9.8" /></svg>
              Chat with our team <span aria-hidden="true">→</span>
            </a>
          </div>

          <nav aria-label="Footer quick links">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[var(--accent-gold,#d2b45f)]">Explore</h3>
            <ul className="space-y-3 text-sm text-[#d9dfd5]">
              {exploreLinks.map((link, idx) => (
                <li key={idx}><a href={link.href} className="footer-link">{link.label}</a></li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[var(--accent-gold,#d2b45f)]">Find your way</h3>
            <ul className="space-y-3 text-sm text-[#d9dfd5]">
              {destinations.map((dest, idx) => (
                <li key={idx}>{dest}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[var(--accent-gold,#d2b45f)]">Get in touch</h3>
            <div className="space-y-4 text-sm text-[#d9dfd5]">
              <a href={`tel:${contact.phoneLink || contact.phone || '+919804600910'}`} className="footer-link flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.07] text-[var(--accent-gold,#e2c96f)]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a15 15 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" /></svg>
                </span>
                {contact.phone || '+91 98046 00910'}
              </a>
              <p className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.07] text-[var(--accent-gold,#e2c96f)]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                </span>
                <span>{nav.logoText || 'Samthar'}<br /><span className="text-xs text-[#aeb9ae]">{contact.address || contact.location || 'Kalimpong, West Bengal'}</span></span>
              </p>
              <p className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.07] text-[var(--accent-gold,#e2c96f)]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
                </span>
                <span>Email<br /><span className="text-xs text-[#aeb9ae]">{contact.email || 'stay@samtharhillstay.com'}</span></span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#9faea1] sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyrightText || `© ${new Date().getFullYear()} Samthar. All rights reserved.`}</p>
          <div className="flex items-center gap-4">
            <p>{footer.tagline || 'Made for slower days in the hills'} <span className="text-[var(--accent-gold,#d2b45f)]">✦</span></p>
            <a href="/admin/login" className="text-white/40 hover:text-[#caa34b] transition text-[11px] font-medium flex items-center gap-1">
              <span>🔒 Admin Login</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
