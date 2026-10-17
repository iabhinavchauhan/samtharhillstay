import { useState } from 'react'
import { Link } from 'react-router-dom'
import { homestays } from '../data/resortData'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-10 shadow-soft backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold text-cream">Let's plan your homestay escape.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-sand/80">Tell us your travel dates, party size, and preferences, and we will help craft a calm mountain retreat experience.</p>

          <form className="mt-10 space-y-6 rounded-[32px] border border-smoke/10 bg-slate-950/50 p-8">
            <label className="block text-sm font-medium text-sand/80">
              Name
              <input
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Your name"
                className="mt-3 w-full rounded-3xl border border-smoke/10 bg-smoke/5 px-4 py-3 text-sm text-cream outline-none transition focus:border-forest"
              />
            </label>
            <label className="block text-sm font-medium text-sand/80">
              Email
              <input
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Your email"
                className="mt-3 w-full rounded-3xl border border-smoke/10 bg-smoke/5 px-4 py-3 text-sm text-cream outline-none transition focus:border-forest"
              />
            </label>
            <label className="block text-sm font-medium text-sand/80">
              Message
              <textarea
                value={form.message}
                onChange={handleChange('message')}
                placeholder="Tell us which homestay you want and your dates"
                rows={6}
                className="mt-3 w-full rounded-3xl border border-smoke/10 bg-smoke/5 px-4 py-3 text-sm text-cream outline-none transition focus:border-forest"
              />
            </label>
            <button type="button" className="btn-primary mt-4 w-full justify-center">
              Send inquiry
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Homestay contacts</p>
            <div className="mt-5 space-y-6 text-sm text-sand/80">
              {homestays.map((stay) => (
                <div key={stay.slug} className="rounded-3xl border border-smoke/10 bg-forest/10 p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-sand/70">{stay.name}</p>
                  <p className="mt-2">{stay.contact.address}</p>
                  <p>Phone: {stay.contact.phone}</p>
                  <p>Email: {stay.contact.email}</p>
                  <p>WhatsApp: {stay.contact.whatsapp}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[40px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/70">Message us</p>
            <h2 className="mt-4 text-2xl font-semibold text-cream">Book the right homestay</h2>
            <p className="mt-4 text-sm leading-7 text-sand/80">Tell us which stay you prefer and we will connect you to the right host and package.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-cream px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-smoke/15">
              Send request
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
