import { useContext, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ResortContext } from "../context/ResortContext"
import { useUserAuth } from "../context/UserAuthContext"
import { resolveImage } from "../utils/resolveImage"
import { formatPrice } from "../utils/currency"
import { Calendar, Users, ShoppingBag, Check, ArrowRight } from "lucide-react"

export default function HomestayDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { toggleWishlist, addRecentView, wishlist, reviews, homestays, foodItems } = useContext(ResortContext)
  const { addToCart, recordRecentView, isAuthenticated } = useUserAuth()

  const [selectedRoom, setSelectedRoom] = useState("")
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date(Date.now() + 86400000)
    return d.toISOString().split("T")[0]
  })
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3)
    return d.toISOString().split("T")[0]
  })
  const [guests, setGuests] = useState(2)
  const [cartSuccess, setCartSuccess] = useState(false)
  const [cartError, setCartError] = useState("")

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
    if (!stay || !stay.rooms) return { price: 100, name: "Suite" }
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
    setCartError("")
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/homestays/${stay.slug}` } } })
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
      setCartError(err.message || "Could not add stay to cart.")
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
      image: stay.mainImage || (stay.gallery && stay.gallery[0]) || ""
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/checkout",
            state: { directStay: directPayload }
          }
        }
      })
      return
    }

    navigate("/checkout", { state: { directStay: directPayload } })
  }

  if (!stay) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-28 text-center sm:px-8 lg:px-12">
        <p className="text-[#5d645f]">Homestay not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 inline-flex rounded-full bg-[#caa34b] px-6 py-3 text-sm font-semibold text-[#10281e] hover:bg-[#d8b85e]"
        >
          Return back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6 rounded-[40px] border border-[#e5dbc0] bg-white p-10 shadow-sm">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#9b782d] font-bold">{stay.location}</p>
            <h1 className="text-4xl font-semibold text-[#10281e] font-sans">{stay.name}</h1>
            <p className="max-w-2xl text-base leading-8 text-[#5d645f]">{stay.description}</p>
            <div className="flex flex-wrap gap-3">
              {stay.amenities.map((item) => (
                <span key={item} className="rounded-full border border-[#e5dbc0] bg-[#faf7ef] px-4 py-2 text-sm text-[#5d645f]">
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

          <div className="rounded-[32px] border border-[#e5dbc0] bg-[#faf7ef] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Dining availability</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#10281e] font-sans">What&apos;s served here</h2>
            <p className="mt-4 text-sm leading-7 text-[#5d645f]">Enjoy these signature dishes and curated dining experiences when you stay at this homestay.</p>
            <div className="mt-6 grid gap-3">
              {(stay.foodHighlights || []).map((highlight) => (
                <div key={highlight} className="rounded-3xl bg-[#f4efdf] px-4 py-3 text-sm text-[#5d645f]">
                  {highlight}
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {stayMenu.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[#e5dbc0] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#10281e]">{item.name}</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">{item.rating?.toFixed(1) || '4.9'} ?</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#5d645f]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#e5dbc0] bg-[#faf7ef] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Guest reviews</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#10281e] font-sans">What guests say about this stay</h2>
            <div className="mt-6 space-y-4">
              {stayReviews.length > 0 ? (
                stayReviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-[#e5dbc0] bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#10281e]">{review.author}</h3>
                        <p className="text-sm text-[#6c7166]">{review.location}</p>
                      </div>
                      <span className="rounded-full bg-[#f4efdf] px-3 py-2 text-sm font-semibold text-[#10281e]">{review.rating} ?</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#5d645f]">{review.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[#5d645f]">No reviews have been added for this homestay yet.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-8">
          <div className="rounded-[40px] border border-[#e5dbc0] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Reserve your stay</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#10281e] font-sans">Room & Dates</h2>
              </div>
              <button
                onClick={() => toggleWishlist(stay.slug)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  wishlist.includes(stay.slug) ? 'bg-[#10281e] text-white' : 'bg-[#f4efdf] text-[#10281e] hover:bg-[#e5dbc0]'
                }`}
              >
                {wishlist.includes(stay.slug) ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-[#faf7ef] p-4 border border-[#e5dbc0] space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#9b782d]">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-white border border-[#e5dbc0] p-2 text-xs text-[#10281e] outline-none focus:border-[#caa34b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#9b782d]">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-white border border-[#e5dbc0] p-2 text-xs text-[#10281e] outline-none focus:border-[#caa34b]"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-[10px] uppercase font-bold text-[#9b782d]">Total Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-lg bg-white border border-[#e5dbc0] p-2 text-xs text-[#10281e] outline-none focus:border-[#caa34b]"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'} (Includes Farm Breakfast)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-xs uppercase tracking-wider text-[#9b782d] font-semibold">Select Room Tier</p>
              {stay.rooms.map((room) => (
                <div
                  key={room.name}
                  onClick={() => setSelectedRoom(room.name)}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${
                    selectedRoom === room.name
                      ? 'border-[#caa34b] bg-[#faf7ef] shadow-md ring-1 ring-[#caa34b]'
                      : 'border-[#e5dbc0] bg-white hover:border-[#caa34b]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#10281e]">{room.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#6c7166]">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#10281e]">{formatPrice(room.price)}</p>
                      <span className="text-[10px] text-[#6c7166]">/ night</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#f4efdf] border border-[#caa34b]/30 p-4 space-y-1 text-xs">
              <div className="flex justify-between text-[#5d645f]">
                <span>Rate ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                <span>{formatPrice(currentRoom?.price)} × {nights}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-[#e5dbc0] text-sm font-bold text-[#10281e]">
                <span>Estimated Total</span>
                <span className="text-lg text-[#caa34b]">{formatPrice(calculatedTotal)}</span>
              </div>
            </div>

            {cartSuccess && (
              <div className="mt-3 rounded-xl bg-[#f0fdf4] border border-[#86efac] p-3 text-xs text-[#166534] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#22c55e]" />
                  <span>Added to your cart!</span>
                </span>
                <Link to="/dashboard?tab=cart" className="font-bold underline hover:text-[#14532d]">
                  View Cart ?
                </Link>
              </div>
            )}

            {cartError && (
              <div className="mt-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-xs text-[#991b1b]">
                {cartError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-full border border-[#caa34b] bg-transparent px-4 py-3.5 text-xs font-semibold text-[#caa34b] transition hover:bg-[#caa34b]/10"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBookNow}
                className="flex items-center justify-center gap-2 rounded-full bg-[#caa34b] px-4 py-3.5 text-xs font-bold text-[#10281e] transition hover:bg-[#d8b85e] shadow-sm"
              >
                Book Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[40px] border border-[#e5dbc0] bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Nearby attractions</p>
            <h3 className="mt-4 text-2xl font-semibold text-[#10281e] font-sans">Explore around {stay.name}</h3>
            <div className="mt-6 grid gap-3">
              {stay.attractions.map((item) => (
                <div key={item} className="rounded-3xl border border-[#e5dbc0] bg-[#faf7ef] px-5 py-4 text-sm text-[#5d645f]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[40px] border border-[#e5dbc0] bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Need help?</p>
            <h3 className="mt-4 text-2xl font-semibold text-[#10281e] font-sans">Plan your perfect stay.</h3>
            <p className="mt-4 text-sm leading-7 text-[#5d645f]">Contact the host to customize your itinerary, dining preferences, and arrival details.</p>
            <Link to="/contact" className="mt-8 inline-flex rounded-full bg-[#10281e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f4233]">
              Contact host
            </Link>
          </div>
        </aside>
      </div>

      <div className="mt-16 rounded-[40px] border border-[#e5dbc0] bg-white p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Stay essentials</p>
        <h2 className="mt-4 text-3xl font-semibold text-[#10281e] font-sans">Room rates, meals and arrival details.</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[32px] bg-[#faf7ef] border border-[#e5dbc0] p-6 text-[#5d645f]">
            <p className="text-sm font-semibold text-[#10281e]">Selected room</p>
            <p className="mt-3 text-sm leading-7 text-[#5d645f]">{selectedRoom || stay.rooms[0].name}</p>
          </div>
          <div className="rounded-[32px] bg-[#faf7ef] border border-[#e5dbc0] p-6 text-[#5d645f]">
            <p className="text-sm font-semibold text-[#10281e]">Meals included</p>
            <p className="mt-3 text-sm leading-7 text-[#5d645f]">Breakfast and dinner with local seasonal dishes.</p>
          </div>
          <div className="rounded-[32px] bg-[#faf7ef] border border-[#e5dbc0] p-6 text-[#5d645f]">
            <p className="text-sm font-semibold text-[#10281e]">Arrival support</p>
            <p className="mt-3 text-sm leading-7 text-[#5d645f]">Travel coordination and host pickup can be arranged on request.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
