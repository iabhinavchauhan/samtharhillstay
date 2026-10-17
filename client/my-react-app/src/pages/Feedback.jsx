import { useState } from 'react'

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Feedback</p>
          <h3>Share how we can improve your next trip</h3>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <input placeholder="Name" />
          <input placeholder="Email" />
          <input placeholder="Rating (1-5)" />
          <textarea placeholder="Tell us about your experience" rows="5" />
          <button className="button primary" type="submit">Submit feedback</button>
          {submitted && <p className="success-msg">Thanks! Your feedback has been received.</p>}
        </form>
      </div>
    </section>
  )
}
