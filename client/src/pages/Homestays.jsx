import { useContext, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ResortContext } from "../context/ResortContext.js"
import HomestayImage from "../components/HomestayImage"
import GalleryLightbox from "../components/GalleryLightbox"
import { formatPrice, applyDiscount } from "../utils/currency"

const cardReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function Homestays() {
  const { homestays, discount } = useContext(ResortContext)
  const [gallery, setGallery] = useState({ open: false, title: '', media: [] })

  const openGallery = (stay) => {
    const media = []
    if (stay.mainImage || stay.image) media.push(stay.mainImage || stay.image)
    ;(stay.cardGallery || []).forEach((item) => media.push(item))
    setGallery({ open: true, title: stay.name, media })
  }

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
        <p className="mt-4 text-sm font-medium text-[#7a5e1c]">Children under 6 stay at half the per guest rate; ages 6 and above are charged the full rate.</p>
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

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
              <button
                type="button"
                onClick={() => openGallery(stay)}
                className="relative block h-72 w-full overflow-hidden"
                aria-label={`Open ${stay.name} photo and video gallery`}
              >
                <HomestayImage
                  src={stay.mainImage || stay.image}
                  imageKey={stay.slug || stay.name}
                  alt={stay.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-[#10281e]/85 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  View Gallery
                </span>
              </button>
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
                    <>
                      {discount.enabled && discount.percent > 0 && (
                        <span className="rounded-full bg-[#caa34b] px-2.5 py-1 text-[10px] font-extrabold text-[#10281e] mr-2">
                          {discount.percent}% OFF
                        </span>
                      )}
                      <span className="text-sm font-bold text-[#caa34b]">
                        From {formatPrice(applyDiscount(stay.priceStarting, discount))}
                      </span>
                    </>
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
        {homestays.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-[#e5dbc0] bg-[#faf7ef] px-6 py-12 text-center text-sm text-[#5d645f]">
            Homestay listings are coming soon. Please check back shortly.
          </p>
        )}
      </div>

      <GalleryLightbox
        open={gallery.open}
        onClose={() => setGallery((prev) => ({ ...prev, open: false }))}
        title={gallery.title}
        media={gallery.media}
      />
    </div>
  )
}
