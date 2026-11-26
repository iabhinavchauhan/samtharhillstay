import { useState } from 'react'
import { Link } from 'react-router-dom'
import { homestays } from '../data/resortData'
import { apiFetch } from '../utils/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus({ state: 'error', message: 'Please enter your name and phone number.' })
      return
    }
    setStatus({ state: 'sending', message: 'Sending your inquiry…' })
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to send inquiry.')
      setStatus({ state: 'success', message: 'Thank you! Your inquiry has been received. Our hosts will reach out shortly.' })
      setForm({ name: '', phone: '', message: '' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Could not send your inquiry. Please try again.' })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[40px] border border-[#e5dbc0] bg-[#faf7ef] p-10 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold text-[#10281e]">Let's plan your homestay escape.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d645f]">Tell us your travel dates, party size, and preferences, and we will help craft a calm mountain retreat experience.</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-[32px] border border-[#e5dbc0] bg-white p-8">
            <label className="block text-sm font-medium text-[#5d645f]">
              Name
              <input
                value={form.name}
                onChange={handleChange('name')}
                required
                className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-[#faf7ef] px-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b]"
              />
            </label>
            <label className="block text-sm font-medium text-[#5d645f]">
              Phone
              <input
                value={form.phone}
                onChange={handleChange('phone')}
                required
                className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-[#faf7ef] px-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b]"
              />
            </label>
            <label className="block text-sm font-medium text-[#5d645f]">
              Message
              <textarea
                value={form.message}
                onChange={handleChange('message')}
                rows={6}
                className="mt-3 w-full rounded-2xl border border-[#e5dbc0] bg-[#faf7ef] px-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b]"
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
                      : 'border border-[#e5dbc0] bg-[#faf7ef] text-[#5d645f]'
                }`}
              >
                {status.message}
              </p>
            )}
            <button type="submit" disabled={status.state === 'sending'} className="mt-4 w-full justify-center rounded-full bg-[#caa34b] px-6 py-3 text-sm font-bold text-[#10281e] transition hover:bg-[#d8b85e] disabled:opacity-60">
              {status.state === 'sending' ? 'Sending…' : 'Send inquiry'}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[40px] border border-[#e5dbc0] bg-[#faf7ef] p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Homestay contacts</p>
            <div className="mt-5 space-y-6 text-sm text-[#5d645f]">
              {homestays.map((stay) => (
                <div key={stay.slug} className="rounded-3xl border border-[#e5dbc0] bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">{stay.name}</p>
                  <p className="mt-2">{stay.contact.address}</p>
                  <p>Phone: {stay.contact.phone}</p>
                  <p>Email: <a href={`mailto:${stay.contact.email}`} className="underline underline-offset-2 hover:text-[#10281e]">{stay.contact.email}</a></p>
                  <p>WhatsApp: {stay.contact.whatsapp}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[40px] border border-[#e5dbc0] bg-[#faf7ef] p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9b782d] font-bold">Message us</p>
            <h2 className="mt-4 text-2xl font-semibold text-[#10281e]">Book the right homestay</h2>
            <p className="mt-4 text-sm leading-7 text-[#5d645f]">Tell us which stay you prefer and we will connect you to the right host and package.</p>
            <Link to="/homestays" className="mt-6 inline-flex rounded-full bg-[#10281e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f4233]">
              Browse homestays
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}