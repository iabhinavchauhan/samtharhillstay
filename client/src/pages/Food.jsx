import { useContext } from 'react'
import { ResortContext } from '../context/ResortContext'

export default function Food() {
  const { homestays, foodItems } = useContext(ResortContext)

  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <header className="mb-12 rounded-[36px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft backdrop-blur-xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.38em] text-sand/70">Food & dining</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-cream sm:text-5xl">
          Meals prepared with local produce, fresh mountain ingredients, and calm hospitality.
        </h1>
      </header>

      <div className="space-y-16">
        {homestays.map((stay) => {
          const dishes = foodItems.filter(
            (item) => (item.servedAt || []).some(s => s.toLowerCase().includes(stay.name.toLowerCase()))
          )
          const displayDishes = dishes.length > 0 ? dishes : foodItems.slice(0, 3)

          return (
            <section key={stay.slug || stay.name} className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[#caa34b] font-bold">{stay.name}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-cream">{stay.location}</h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {displayDishes.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-[32px] border border-smoke/10 bg-smoke/5 shadow-soft">
                    <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                    <div className="space-y-4 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-cream">{item.name}</p>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${item.type === 'Non-Veg' ? 'bg-red-500/15 text-red-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-sand/80">{item.description}</p>
                      {item.price && <p className="text-sm font-bold text-[#caa34b]">{item.price}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
