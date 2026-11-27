import { lazy, Suspense, useContext, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ResortProvider } from './context/ResortContext.jsx'
import { AuthProvider } from './admin/AuthContext.jsx'
import { UserAuthProvider } from './context/UserAuthContext.jsx'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WelcomePopup from './components/WelcomePopup'
import FloatingContactActions from './components/FloatingContactActions'
const Home = lazy(() => import('./pages/Home'))
const Homestays = lazy(() => import('./pages/Homestays'))
const HomestayDetails = lazy(() => import('./pages/HomestayDetails'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Contact = lazy(() => import('./pages/Contact'))
const Blogs = lazy(() => import('./pages/Blogs'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Checkout = lazy(() => import('./pages/Checkout'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
import './index.css'
import { ResortContext } from './context/ResortContext.js'
import { siteOccasionClass } from './utils/occasionThemes'

function PublicLayout() {
  const { siteData, siteDataError, retrySiteData } = useContext(ResortContext)
  const occasionTheme = siteData?.theme?.occasionTheme || 'default'
  const occasionClass = siteOccasionClass(occasionTheme)

  return (
    <div className={`min-h-screen bg-[var(--site-bg,#faf8f1)] text-[var(--site-text,#1b2b22)] ${occasionClass}`}>
      {occasionTheme === 'christmas' && <div className="site-snowfall" aria-hidden="true" />}
      <Navbar />
      <WelcomePopup />
      {siteDataError && (
        <div role="alert" className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 text-xs text-amber-950">
          <span>
            Latest published content could not be loaded. {siteData ? 'Showing the last successfully loaded version.' : 'Showing built-in fallback content.'}
          </span>
          <button type="button" onClick={retrySiteData} className="shrink-0 font-bold underline">Retry</button>
        </div>
      )}
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
      <FloatingContactActions />
    </div>
  )
}

function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return undefined
    }
    const id = decodeURIComponent(hash.slice(1))
    let attempts = 0
    let timer
    const scrollToTarget = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      attempts += 1
      if (attempts < 12) timer = window.setTimeout(scrollToTarget, 250)
    }
    scrollToTarget()
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <AuthProvider>
        <UserAuthProvider>
          <ResortProvider>
            <Suspense fallback={<div className="grid min-h-[60vh] place-items-center bg-[var(--site-bg,#faf8f1)] text-sm text-[var(--site-text,#1b2b22)]" role="status">Loading page…</div>}>
            <Routes>
              {/* Dedicated Standalone Admin Portal & Login Routes */}
              <Route path="/admin/login" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />

              {/* Public pages share the site navigation and footer. */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/homestays" element={<Homestays />} />
                <Route path="/homestays/:slug" element={<HomestayDetails />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:slug" element={<Blogs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cart" element={<Navigate to="/dashboard?tab=cart" replace />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
          </ResortProvider>
        </UserAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
