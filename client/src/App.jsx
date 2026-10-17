import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ResortProvider } from './context/ResortContext'
import { AuthProvider } from './admin/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Homestays from './pages/Homestays'
import HomestayDetails from './pages/HomestayDetails'
import Gallery from './pages/Gallery'
import Reviews from './pages/Reviews'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import AdminDashboard from './admin/AdminDashboard'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResortProvider>
          <Routes>
            {/* Dedicated Standalone Admin Portal & Login Routes */}
            <Route path="/admin/login" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* Public Live Website with Header & Footer */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-[var(--site-bg,#faf8f1)] text-[var(--site-text,#1b2b22)]">
                  <Navbar />
                  <main className="relative">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/homestays" element={<Homestays />} />
                      <Route path="/homestays/:slug" element={<HomestayDetails />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </ResortProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
