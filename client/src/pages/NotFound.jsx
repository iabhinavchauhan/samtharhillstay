import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <motion.main
      className="min-h-[70vh] grid place-items-center px-6 py-24"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
    >
      <div className="max-w-xl text-center rounded-[32px] bg-smoke/80 border border-smoke/70 p-10 shadow-soft backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-forest">Page not found</p>
        <h1 className="mt-6 text-4xl font-serif font-semibold text-forest">404 · Lost in the hills</h1>
        <p className="mt-4 text-base text-forest/70">The path you tried to follow is hidden in mist. Return to the homestay sanctuary and continue exploring.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition hover:bg-forest/90">
          Return home
        </Link>
      </div>
    </motion.main>
  )
}
