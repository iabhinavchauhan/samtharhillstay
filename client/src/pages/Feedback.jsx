import { useContext, useState } from 'react'
import { ResortContext } from '../context/ResortContext.js'

export default function Feedback() {
  const { addReview } = useContext(ResortContext)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      await addReview({
        author: form.get('name'),
        location: form.get('location'),
        rating: Number(form.get('rating')),
        text: form.get('message'),
      })
      formElement.reset()
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Feedback could not be submitted.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Feedback</p>
          <h3>Share how we can improve your next trip</h3>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" required maxLength={100} />
          <input name="location" placeholder="City or location (optional)" maxLength={120} />
          <select name="rating" defaultValue="5" aria-label="Rating">
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
          </select>
          <textarea name="message" placeholder="Tell us about your experience" rows="5" required maxLength={3000} />
          <button className="button primary" type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit feedback'}</button>
          {submitted && <p className="success-msg">Thanks! Your feedback has been received.</p>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </form>
      </div>
    </section>
  )
}
