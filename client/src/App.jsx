import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { ResortProvider } from './context/ResortContext'
import { AuthProvider } from './admin/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Homestays from './pages/Homestays'
import HomestayDetails from './pages/HomestayDetails'
import Gallery from './pages/Gallery'
import Reviews from './pages/Reviews'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'
import AdminDashboard from './admin/AdminDashboard'
import './index.css'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--site-bg,#faf8f1)] text-[var(--site-text,#1b2b22)]">
      <Navbar />
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
          </ResortProvider>
        </UserAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
