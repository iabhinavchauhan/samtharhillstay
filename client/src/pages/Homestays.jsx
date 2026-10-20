import { useContext } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ResortContext } from "../context/ResortContext"
import { resolveImage } from "../utils/resolveImage"
import { formatPrice } from "../utils/currency"

const cardReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function Homestays() {
  const { homestays } = useContext(ResortContext)

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <header className="mb-12 rounded-[36px] border border-[#e5dbc0] bg-[#faf7ef] p-8 shadow-sm sm:p-10">
        <p className="text-xs uppercase tracking-[0.38em] text-[#9b782d] font-bold">Stay collection</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#10281e] sm:text-5xl font-sans">
          Quiet mountain stays shaped for slow mornings and view-filled evenings.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#5d645f]">
          Discover handcrafted hill retreats with warm hospitality, regional food, and cozy spaces built for rest.
        </p>
      </header>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-[#e5dbc0] bg-[#f4efdf] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9b782d] font-bold">Homes</p>
          <p className="mt-3 text-3xl font-semibold text-[#10281e]">{homestays.length}</p>
        </div>
        <div className="rounded-[28px] border border-[#e5dbc0] bg-[#f4efdf] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9b782d] font-bold">Locations</p>
          <p className="mt-3 text-3xl font-semibold text-[#10281e]">Kalimpong</p>
        </div>
        <div className="rounded-[28px] border border-[#e5dbc0] bg-[#f4efdf] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.32em] text-[#9b782d] font-bold">Style</p>
          <p className="mt-3 text-3xl font-semibold text-[#10281e]">Slow luxury</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {homestays.map((stay, index) => (
          <motion.article
            key={stay.slug || index}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="group overflow-hidden rounded-[32px] border border-[#e5dbc0] bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div
                className="h-72 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${stay.mainImage || resolveImage(stay.image, stay.slug)})` }}
              />
              <div className="space-y-4 p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.32em] text-[#9b782d] font-bold">{stay.location}</p>
                  <span className="rounded-full bg-[#10281e]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10281e]">
                    {stay.rooms?.length || 1} rooms
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-2xl font-semibold text-[#10281e] font-sans">{stay.name}</h2>
                  {stay.priceStarting && (
                    <span className="text-sm font-bold text-[#caa34b]">
                      From {formatPrice(stay.priceStarting)}
                    </span>
                  )}
                </div>
                <p className="text-xs italic text-[#6c7166]">{stay.tagline}</p>
                <p className="text-sm leading-7 text-[#5d645f]">{stay.description}</p>
              </div>
            </div>

            <div className="p-8 pt-0">
              <Link
                to={`/homestays/${stay.slug}`}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#caa34b] px-4 py-3 text-xs font-bold text-[#10281e] transition hover:bg-[#d8b85e]"
              >
                View Rooms & Reserve
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
