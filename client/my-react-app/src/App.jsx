import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Destinations from './pages/Destinations'
import DestinationDetails from './pages/DestinationDetails'
import Adventures from './pages/Adventures'
import AdventureDetails from './pages/AdventureDetails'
import Food from './pages/Food'
import FoodDetails from './pages/FoodDetails'
import Wishlist from './pages/Wishlist'
import Compare from './pages/Compare'
import Feedback from './pages/Feedback'
import Help from './pages/Help'
import Contact from './pages/Contact'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <WishlistProvider>
        <CompareProvider>
          <div className="app-shell">
            <CustomCursor />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/:id" element={<DestinationDetails />} />
                <Route path="/adventures" element={<Adventures />} />
                <Route path="/adventures/:id" element={<AdventureDetails />} />
                
                <Route path="/food" element={<Food />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<section className="page-shell"><div className="section-block"><h3>Page not found</h3><p>Return home to continue exploring.</p></div></section>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CompareProvider>
      </WishlistProvider>
    </BrowserRouter>
  )
}

export default App
