import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ResortContext } from '../context/ResortContext'
import { useUserAuth } from '../context/UserAuthContext'
import { foodItems, homestays as fallbackStays } from '../data/resortData'
import { resolveImage } from '../utils/resolveImage'
import { Calendar, Users, ShoppingBag, Check, ArrowRight } from 'lucide-react'

export default function HomestayDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { toggleWishlist, addRecentView, wishlist, reviews, homestays, foodItems } = useContext(ResortContext)
  const { addToCart, recordRecentView, isAuthenticated } = useUserAuth()

  const [selectedRoom, setSelectedRoom] = useState('')
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date(Date.now() + 86400000)
    return d.toISOString().split('T')[0]
  })
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3)
    return d.toISOString().split('T')[0]
  })
  const [guests, setGuests] = useState(2)
  const [cartSuccess, setCartSuccess] = useState(false)
  const [cartError, setCartError] = useState('')

  const stay = useMemo(() => (homestays || []).find((item) => item.slug === slug), [homestays, slug])
  const stayMenu = useMemo(
    () => (stay ? (foodItems || []).filter((item) => (item.servedAt || []).some(s => s.toLowerCase().includes(stay.name.toLowerCase()))) : []),
    [stay, foodItems],
  )
  const stayReviews = useMemo(
    () => reviews.filter((review) => review.staySlug === slug),
    [reviews, slug],
  )

  useEffect(() => {
    if (stay) {
      addRecentView(stay.slug)
      if (recordRecentView) recordRecentView(stay.slug)
    }
  }, [stay, addRecentView, recordRecentView])

  useEffect(() => {
    if (stay && stay.rooms && stay.rooms.length > 0) {
      setSelectedRoom(stay.rooms[0].name)
    }
  }, [stay])

  const currentRoom = useMemo(() => {
    if (!stay || !stay.rooms) return { price: 100, name: 'Suite' }
    return stay.rooms.find((r) => r.name === selectedRoom) || stay.rooms[0]
  }, [stay, selectedRoom])

  const nights = useMemo(() => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
    return isNaN(diff) || diff < 1 ? 1 : diff
  }, [checkIn, checkOut])

  const calculatedTotal = useMemo(() => {
    return (currentRoom?.price || 100) * nights
  }, [currentRoom, nights])

  const handleAddToCart = async () => {
    setCartError('')
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/homestays/${stay.slug}` } } })
      return
    }
    try {
      await addToCart({
        staySlug: stay.slug,
        roomName: currentRoom.name,
        checkIn,
        checkOut,
        guests
      })
      setCartSuccess(true)
      setTimeout(() => setCartSuccess(false), 4000)
    } catch (err) {
      setCartError(err.message || 'Could not add stay to cart.')
    }
  }

  const handleBookNow = () => {
    const directPayload = {
      stay_slug: stay.slug,
      stay_name: stay.name,
      room_name: currentRoom.name,
      price_per_night: currentRoom.price,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests,
      total_price: calculatedTotal,
      image: stay.mainImage || (stay.gallery && stay.gallery[0]) || ''
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/checkout',
            state: { directStay: directPayload }
          }
        }
      })
      return
    }

    navigate('/checkout', { state: { directStay: directPayload } })
  }

  if (!stay) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-28 text-center sm:px-8 lg:px-12">
        <p className="text-sand/70">Homestay not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 inline-flex rounded-full bg-cream px-6 py-3 text-sm font-semibold text-slate-950"
        >
          Return back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6 rounded-[40px] border border-smoke/10 bg-smoke/5 p-10 shadow-soft backdrop-blur-xl">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-sand/70">{stay.location}</p>
            <h1 className="text-4xl font-semibold text-cream">{stay.name}</h1>
            <p className="max-w-2xl text-base leading-8 text-sand/80">{stay.description}</p>
            <div className="flex flex-wrap gap-3">
              {stay.amenities.map((item) => (
                <span key={item} className="rounded-full border border-smoke/10 bg-smoke/5 px-4 py-2 text-sm text-sand">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stay.gallery.map((image, idx) => (
              <div
                key={image}
                className="overflow-hidden rounded-[28px] bg-cover bg-center h-64"
                style={{ backgroundImage: `url(${resolveImage(image, `${stay.slug}-${idx}`)})` }}
              />
            ))}
          </div>

          <div className="rounded-[32px] border border-smoke/10 bg-smoke/5 p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Dining availability</p>
            <h2 className="mt-3 text-3xl font-semibold text-cream">What’s served here</h2>
            <p className="mt-4 text-sm leading-7 text-sand/80">Enjoy these signature dishes and curated dining experiences when you stay at this homestay.</p>
            <div className="mt-6 grid gap-3">
              {(stay.foodHighlights || []).map((highlight) => (
                <div key={highlight} className="rounded-3xl bg-forest/10 px-4 py-3 text-sm text-sand">
                  {highlight}
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {stayMenu.map((item) => (
                <div key={item.id} className="rounded-3xl border border-smoke/10 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-cream">{item.name}</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-sand/70">{item.rating?.toFixed(1) || '4.9'} ★</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-sand/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-smoke/10 bg-smoke/5 p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Guest reviews</p>
            <h2 className="mt-3 text-3xl font-semibold text-cream">What guests say about this stay</h2>
            <div className="mt-6 space-y-4">
              {stayReviews.length > 0 ? (
                stayReviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-smoke/10 bg-slate-950/60 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-cream">{review.author}</h3>
                        <p className="text-sm text-sand/70">{review.location}</p>
                      </div>
                      <span className="rounded-full bg-forest/10 px-3 py-2 text-sm font-semibold text-cream">{review.rating} ★</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-sand/80">{review.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-sand/80">No reviews have been added for this homestay yet.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-8">
          <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Reserve your stay</p>
                <h2 className="mt-2 text-2xl font-semibold text-cream">Room & Dates</h2>
              </div>
              <button
                onClick={() => toggleWishlist(stay.slug)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  wishlist.includes(stay.slug) ? 'bg-forest text-cream' : 'bg-smoke/10 text-sand hover:bg-smoke/20'
                }`}
              >
                {wishlist.includes(stay.slug) ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Date Pickers & Guests Counter */}
            <div className="mt-6 rounded-2xl bg-slate-950/60 p-4 border border-smoke/10 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-sand/70">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-smoke/10 border border-smoke/15 p-2 text-xs text-cream outline-none focus:border-[#caa34b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-sand/70">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-smoke/10 border border-smoke/15 p-2 text-xs text-cream outline-none focus:border-[#caa34b]"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-[10px] uppercase font-bold text-sand/70">Total Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-smoke/15 p-2 text-xs text-cream outline-none focus:border-[#caa34b]"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'} (Includes Farm Breakfast)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Tier Selection */}
            <div className="mt-6 space-y-4">
              <p className="text-xs uppercase tracking-wider text-sand/70 font-semibold">Select Room Tier</p>
              {stay.rooms.map((room) => (
                <div
                  key={room.name}
                  onClick={() => setSelectedRoom(room.name)}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${
                    selectedRoom === room.name
                      ? 'border-[#caa34b] bg-slate-900/90 shadow-md ring-1 ring-[#caa34b]'
                      : 'border-smoke/10 bg-slate-950/60 hover:border-smoke/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-cream">{room.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-sand/70">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cream">${room.price}</p>
                      <span className="text-[10px] text-sand/60">/ night</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Preview */}
            <div className="mt-6 rounded-2xl bg-forest/20 border border-[#caa34b]/30 p-4 space-y-1 text-xs">
              <div className="flex justify-between text-sand/80">
                <span>Rate ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                <span>${currentRoom?.price} × {nights}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-white/10 text-sm font-bold text-cream">
                <span>Estimated Total</span>
                <span className="text-lg text-[#caa34b]">${calculatedTotal}</span>
              </div>
            </div>

            {cartSuccess && (
              <div className="mt-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 p-3 text-xs text-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Added to your cart!</span>
                </span>
                <Link to="/dashboard?tab=cart" className="font-bold underline hover:text-white">
                  View Cart →
                </Link>
              </div>
            )}

            {cartError && (
              <div className="mt-3 rounded-xl bg-red-950/80 border border-red-500/50 p-3 text-xs text-red-200">
                {cartError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-full border border-[#caa34b] bg-transparent px-4 py-3.5 text-xs font-semibold text-[#caa34b] transition hover:bg-[#caa34b]/15"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBookNow}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--accent-gold,#caa34b)] px-4 py-3.5 text-xs font-bold text-[#10281e] transition hover:bg-[#d8b85e] shadow-md"
              >
                <span>Book Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Nearby attractions</p>
            <div className="mt-6 space-y-4">
              {stay.attractions.map((item) => (
                <div key={item} className="rounded-3xl border border-smoke/10 bg-slate-950/60 px-5 py-4 text-sm text-sand">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Need help?</p>
            <h3 className="mt-4 text-2xl font-semibold text-cream">Plan your perfect stay.</h3>
            <p className="mt-4 text-sm leading-7 text-sand/80">Contact the host to customize your itinerary, dining preferences, and arrival details.</p>
            <Link to="/contact" className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest/90">
              Contact host
            </Link>
          </div>
        </aside>
      </div>

      <div className="mt-16 rounded-[40px] border border-smoke/10 bg-smoke/5 p-10 shadow-soft">
        <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Stay essentials</p>
        <h2 className="mt-4 text-3xl font-semibold text-cream">Room rates, meals and arrival details.</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[32px] bg-slate-950/60 p-6 text-sand">
            <p className="text-sm font-semibold text-cream">Selected room</p>
            <p className="mt-3 text-sm leading-7 text-sand/80">{selectedRoom || stay.rooms[0].name}</p>
          </div>
          <div className="rounded-[32px] bg-slate-950/60 p-6 text-sand">
            <p className="text-sm font-semibold text-cream">Meals included</p>
            <p className="mt-3 text-sm leading-7 text-sand/80">Breakfast and dinner with local seasonal dishes.</p>
          </div>
          <div className="rounded-[32px] bg-slate-950/60 p-6 text-sand">
            <p className="text-sm font-semibold text-cream">Arrival support</p>
            <p className="mt-3 text-sm leading-7 text-sand/80">Travel coordination and host pickup can be arranged on request.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
