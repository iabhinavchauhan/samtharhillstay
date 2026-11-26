import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { ResortContext } from '../context/ResortContext.js'

export default function Reviews() {
  const { reviews, addReview } = useContext(ResortContext)
  const [form, setForm] = useState({ author: '', location: '', rating: 5, text: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const ratingDistribution = [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: reviews.filter((review) => Math.round(review.rating) === value).length,
  }))

  const handleChange = (field) => (event) => {
    const value = field === 'rating' ? Number(event.target.value) : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.author.trim() || !form.location.trim() || !form.text.trim()) {
      setStatus({ state: 'error', message: 'Please fill in your name, location, and review.' })
      return
    }
    setStatus({ state: 'sending', message: 'Submitting your review…' })
    try {
      await addReview(form)
      setForm({ author: '', location: '', rating: 5, text: '' })
      setStatus({ state: 'success', message: 'Thank you! Your review has been posted.' })
    } catch (error) {
      setStatus({ state: 'error', message: error.message || 'Your review could not be saved.' })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <header className="mb-16 rounded-[40px] border border-[#e5dbc0] bg-[#faf7ef] p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Reviews</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#10281e]">Guest stories from the retreat.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d645f]">Read real guest experiences and add your own review of the homestays.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div className="rounded-[32px] border border-[#e5dbc0] bg-[#faf7ef] p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Overall rating</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-6xl font-semibold text-[#10281e]">{averageRating}</span>
                  <span className="text-sm uppercase tracking-[0.35em] text-[#9b782d]">based on {reviews.length} reviews</span>
                </div>
              </div>
              <div className="rounded-3xl bg-[#caa34b]/15 px-6 py-4 text-sm font-semibold text-[#9b782d]">Luxury homestay score</div>
            </div>
          </div>

          <div className="grid gap-4">
            {ratingDistribution.map((item) => (
              <div key={item.value} className="rounded-3xl border border-[#e5dbc0] bg-white p-5">
                <div className="flex items-center justify-between text-sm text-[#5d645f]">
                  <span>{item.value} star</span>
                  <span>{item.count}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f4efdf]">
                  <div className="h-full rounded-full bg-[#caa34b]" style={{ width: `${reviews.length ? (item.count / reviews.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[40px] border border-[#e5dbc0] bg-[#faf7ef] p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Add a review</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block text-sm text-[#5d645f]">
                Name
                <input
                  value={form.author}
                  onChange={handleChange('author')}
                  required
                  className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-white px-4 py-3 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </label>
              <label className="block text-sm text-[#5d645f]">
                Location
                <input
                  value={form.location}
                  onChange={handleChange('location')}
                  required
                  className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-white px-4 py-3 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </label>
              <label className="block text-sm text-[#5d645f]">
                Rating
                <select
                  value={form.rating}
                  onChange={handleChange('rating')}
                  className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-white px-4 py-3 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-[#5d645f]">
                Review
                <textarea
                  value={form.text}
                  onChange={handleChange('text')}
                  rows={5}
                  required
                  className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-white px-4 py-3 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </label>
              {status.message && (
                <p
                  role="status"
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    status.state === 'error'
                      ? 'border border-red-300 bg-red-50 text-red-700'
                      : status.state === 'success'
                        ? 'border border-green-300 bg-green-50 text-green-700'
                        : 'border border-[#e5dbc0] bg-white text-[#5d645f]'
                  }`}
                >
                  {status.message}
                </p>
              )}
              <button type="submit" disabled={status.state === 'sending'} className="w-full rounded-full bg-[#caa34b] px-6 py-3 text-center text-sm font-bold text-[#10281e] transition hover:bg-[#d8b85e] disabled:opacity-60">
                {status.state === 'sending' ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          </div>
        </aside>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-[#e5dbc0] bg-[#faf7ef] px-6 py-10 text-center text-sm text-[#5d645f]">
            No reviews yet. Be the first to share your experience.
          </p>
        )}
        {reviews.map((review) => (
          <motion.article key={review.id} whileHover={{ y: -4 }} className="rounded-[32px] border border-[#e5dbc0] bg-white p-8 shadow-sm">
            {review.image && <img src={review.image} alt={`Photo shared by ${review.author}`} loading="lazy" decoding="async" className="mb-6 max-h-64 w-full rounded-2xl object-cover" />}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#10281e]">{review.author}</h2>
                <p className="text-sm text-[#9b782d]">{review.location}</p>
              </div>
              <span className="rounded-full bg-[#caa34b]/15 px-4 py-2 text-sm font-semibold text-[#9b782d]">{review.rating} ★</span>
            </div>
            <p className="mt-6 text-sm leading-7 text-[#5d645f]">{review.text}</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}