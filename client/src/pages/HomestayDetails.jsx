import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ResortContext } from '../context/ResortContext'
import { foodItems, homestays } from '../data/resortData'
import { resolveImage } from '../utils/resolveImage'

const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1)

export default function HomestayDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { toggleWishlist, addRecentView, wishlist, reviews, homestays, foodItems } = useContext(ResortContext)
  const [selectedRoom, setSelectedRoom] = useState('')

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
    if (stay) addRecentView(stay.slug)
  }, [stay, addRecentView])

  useEffect(() => {
    if (stay && stay.rooms.length > 0) {
      setSelectedRoom(stay.rooms[0].name)
    }
  }, [stay])

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
              {stay.foodHighlights.map((highlight) => (
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
                    <span className="text-xs uppercase tracking-[0.35em] text-sand/70">{item.rating.toFixed(1)} ★</span>
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
                <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Book your stay</p>
                <h2 className="mt-2 text-2xl font-semibold text-cream">Reserve a room</h2>
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

            <div className="mt-8 space-y-6">
              {stay.rooms.map((room) => (
                <div key={room.name} className="rounded-3xl border border-smoke/10 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-cream">{room.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-sand/80">{room.description}</p>
                    </div>
                    <p className="text-xl font-semibold text-cream">${room.price}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(room.name)}
                    className={`mt-4 w-full rounded-full py-3 text-sm font-semibold transition ${
                      selectedRoom === room.name ? 'bg-forest text-cream' : 'bg-smoke/10 text-sand hover:bg-smoke/15'
                    }`}
                  >
                    {selectedRoom === room.name ? 'Selected' : 'Choose room'}
                  </button>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full rounded-full bg-cream px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-smoke/15">
              Book now
            </button>
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
