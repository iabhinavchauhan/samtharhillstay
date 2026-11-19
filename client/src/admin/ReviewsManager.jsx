import { useCallback, useEffect, useState } from 'react'
import { MessageSquare, RefreshCw, Star, Trash2, User } from 'lucide-react'
import { apiFetch } from '../utils/api'
import { useAuth } from './AuthContext.js'

export default function ReviewsManager() {
  const { token } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const fetchReviews = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load feedback.')
      setError('')
      setReviews(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load feedback.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // Network completion updates state asynchronously; this effect owns initial loading.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchReviews()
  }, [fetchReviews])

  const deleteReview = async (review) => {
    if (!window.confirm(`Delete the review from ${review.author || 'this guest'}?`)) return
    setDeletingId(review.id)
    setError('')
    try {
      const res = await apiFetch(`/api/admin/reviews/${encodeURIComponent(review.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete review.')
      setReviews((current) => current.filter((item) => item.id !== review.id))
    } catch (err) {
      setError(err.message || 'Failed to delete review.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#10281e] p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare className="h-5 w-5 text-[#caa34b]" /> Guest Reviews & Feedback
          </h2>
          <p className="mt-1 text-xs text-white/60">Website submissions are saved here and shown to visitors until you delete them.</p>
        </div>
        <button onClick={() => { setLoading(true); void fetchReviews() }} className="flex items-center gap-2 self-start rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 sm:self-auto">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-xs text-white/50">Loading guest feedback...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#10281e] p-12 text-center text-sm text-white/60">No guest reviews or feedback have been submitted yet.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="space-y-3 rounded-2xl border border-white/10 bg-[#10281e] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-white"><User className="h-4 w-4 text-[#caa34b]" />{review.author || 'Guest'}</h3>
                  <p className="mt-1 text-xs text-white/50">{[review.location, review.stayName || review.staySlug].filter(Boolean).join(' · ') || 'Guest feedback'}</p>
                </div>
                <button onClick={() => deleteReview(review)} disabled={deletingId === review.id} title="Delete review" aria-label={`Delete review from ${review.author}`} className="rounded-lg p-2 text-red-300 hover:bg-red-400/10 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-[#caa34b]" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < Number(review.rating || 0) ? 'fill-current' : 'text-white/20'}`} />)}
                <span className="ml-1 text-xs text-white/60">{review.rating}/5</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/80">{review.text}</p>
              {review.image && <img src={review.image} alt={`Photo from ${review.author || 'guest'}`} loading="lazy" decoding="async" className="max-h-56 rounded-xl object-cover" />}
              <time className="block text-[10px] text-white/40">{review.created_at ? new Date(review.created_at).toLocaleString() : ''}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
