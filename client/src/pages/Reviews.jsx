import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { ResortContext } from '../context/ResortContext'

export default function Reviews() {
  const { reviews, addReview } = useContext(ResortContext)
  const [form, setForm] = useState({ author: '', location: '', rating: 5, text: '' })

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

  const handleSubmit = () => {
    if (!form.author || !form.location || !form.text) return
    addReview(form)
    setForm({ author: '', location: '', rating: 5, text: '' })
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <header className="mb-16 rounded-[40px] border border-smoke/10 bg-smoke/5 p-10 shadow-soft backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Reviews</p>
        <h1 className="mt-4 text-4xl font-semibold text-cream">Guest stories from the retreat.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-sand/80">Read real guest experiences and add your own review of the homestays.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div className="rounded-[32px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Overall rating</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-6xl font-semibold text-cream">{averageRating}</span>
                  <span className="text-sm uppercase tracking-[0.35em] text-sand/70">based on {reviews.length} reviews</span>
                </div>
              </div>
              <div className="rounded-3xl bg-forest/10 px-6 py-4 text-sm font-semibold text-cream">Luxury homestay score</div>
            </div>
          </div>

          <div className="grid gap-4">
              {ratingDistribution.map((item) => (
              <div key={item.value} className="rounded-3xl border border-smoke/10 bg-smoke/5 p-5">
                <div className="flex items-center justify-between text-sm text-sand/80">
                  <span>{item.value} star</span>
                  <span>{item.count}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${reviews.length ? (item.count / reviews.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Add a review</p>
            <div className="mt-8 space-y-5">
              <label className="block text-sm text-sand/80">
                Name
                <input
                  value={form.author}
                  onChange={handleChange('author')}
                  className="mt-3 w-full rounded-3xl border border-smoke/10 bg-slate-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-forest"
                />
              </label>
              <label className="block text-sm text-sand/80">
                Location
                <input
                  value={form.location}
                  onChange={handleChange('location')}
                  className="mt-3 w-full rounded-3xl border border-smoke/10 bg-slate-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-forest"
                />
              </label>
              <label className="block text-sm text-sand/80">
                Rating
                <select
                  value={form.rating}
                  onChange={handleChange('rating')}
                  className="mt-3 w-full rounded-3xl border border-smoke/10 bg-slate-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-forest"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value} className="bg-slate-950 text-cream">
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-sand/80">
                Review
                <textarea
                  value={form.text}
                  onChange={handleChange('text')}
                  rows={5}
                  className="mt-3 w-full rounded-3xl border border-smoke/10 bg-slate-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-forest"
                />
              </label>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary w-full text-center"
              >
                Submit review
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <motion.article key={review.id} whileHover={{ y: -4 }} className="rounded-[32px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            {review.image && <img src={review.image} alt={`Photo shared by ${review.author}`} className="mb-6 max-h-64 w-full rounded-2xl object-cover" />}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-cream">{review.author}</h2>
                <p className="text-sm text-sand/70">{review.location}</p>
              </div>
              <span className="rounded-full bg-forest/10 px-4 py-2 text-sm font-semibold text-cream">{review.rating} ★</span>
            </div>
            <p className="mt-6 text-sm leading-7 text-sand/80">{review.text}</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
