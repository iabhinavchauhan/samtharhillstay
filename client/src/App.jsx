import { lazy, Suspense, useContext } from 'react'
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { ResortProvider } from './context/ResortContext'
import { AuthProvider } from './admin/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
const Home = lazy(() => import('./pages/Home'))
const Homestays = lazy(() => import('./pages/Homestays'))
const HomestayDetails = lazy(() => import('./pages/HomestayDetails'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Checkout = lazy(() => import('./pages/Checkout'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
import './index.css'
import { ResortContext } from './context/ResortContext'

function PublicLayout() {
  const { siteData, siteDataError, retrySiteData } = useContext(ResortContext)

  return (
    <div className="min-h-screen bg-[var(--site-bg,#faf8f1)] text-[var(--site-text,#1b2b22)]">
      <Navbar />
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
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
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
