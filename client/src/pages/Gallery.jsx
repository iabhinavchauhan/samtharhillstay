import { homestays } from '../data/resortData'
import { resolveImage } from '../utils/resolveImage'

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

const galleryImages = {
  'samthar-hill-stay': [
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2b4535"/>
            <stop offset="100%" stop-color="#6a8c6d"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g1)"/>
        <circle cx="240" cy="220" r="120" fill="#d7c58d" opacity="0.9"/>
        <path d="M0 620 C220 520 320 440 460 600 C560 700 700 620 900 560 L1200 760 L0 760 Z" fill="#47664b"/>
        <path d="M120 760 L240 520 L360 760 Z" fill="#354730"/>
        <path d="M420 760 L520 520 L620 760 Z" fill="#3f5b40"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1b3f2b"/>
            <stop offset="100%" stop-color="#4d7a5b"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g2)"/>
        <path d="M0 600 Q200 400 380 580 T760 560 T1200 600 L1200 800 L0 800 Z" fill="#356040"/>
        <path d="M120 580 Q240 420 380 580 Q520 740 640 580 Q760 420 880 580 Q1000 740 1120 580" fill="rgba(255,255,255,0.18)"/>
        <path d="M760 280 C720 240 700 240 660 280 C640 300 620 330 620 360 C620 390 660 430 700 430 C740 430 780 390 780 360 C780 330 760 300 740 280 Z" fill="#c7d29d"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#617d72"/>
            <stop offset="100%" stop-color="#abb59f"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g3)"/>
        <ellipse cx="320" cy="660" rx="420" ry="150" fill="#4a6955"/>
        <ellipse cx="720" cy="610" rx="420" ry="160" fill="#5a7b61"/>
        <path d="M600 120 C520 180 520 260 620 320 C680 360 740 340 780 300 C840 240 820 140 740 120 Z" fill="#d4d2c6" opacity="0.7"/>
        <path d="M860 420 Q900 320 980 340 Q1060 360 1100 460 L1100 800 L860 800 Z" fill="#3d5b44"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2f5945"/>
            <stop offset="100%" stop-color="#7fa287"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g4)"/>
        <path d="M0 700 C180 560 280 450 420 590 C540 700 700 560 820 620 C940 680 1100 520 1200 600 L1200 800 L0 800 Z" fill="#3a6a52"/>
        <path d="M240 760 L310 560 L380 760 Z" fill="#2f4f39"/>
        <path d="M480 760 L530 580 L600 760 Z" fill="#3a5f46"/>
        <path d="M820 760 L890 560 L960 760 Z" fill="#2b4d37"/>
      </svg>`),
  ],
  'suviksha-homestay': [
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3a5d41"/>
            <stop offset="100%" stop-color="#8fae7f"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g5)"/>
        <path d="M0 700 C120 520 260 520 380 650 C500 780 640 620 760 680 C880 740 1020 620 1200 710 L1200 800 L0 800 Z" fill="#3d7a47"/>
        <path d="M220 680 Q320 540 420 660 Q520 780 620 640 Q720 500 820 660 Q920 820 1020 680" fill="rgba(255,255,255,0.18)"/>
        <circle cx="240" cy="240" r="88" fill="#f4d99e" opacity="0.85"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g6" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b5e37"/>
            <stop offset="100%" stop-color="#7ea57c"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g6)"/>
        <path d="M0 520 Q220 360 440 520 T880 520 T1200 520 L1200 800 L0 800 Z" fill="#537a4e"/>
        <path d="M320 520 Q360 420 430 500 Q500 580 540 520 Q580 460 650 520 Q720 580 780 500 Q840 420 890 520" fill="#4d6a44"/>
        <path d="M170 760 L270 520 L370 760 Z" fill="#32603d"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#21422e"/>
            <stop offset="100%" stop-color="#5d8e69"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g7)"/>
        <path d="M0 760 C140 600 260 580 420 700 C580 820 700 620 880 720 C1020 800 1180 620 1200 620 L1200 800 L0 800 Z" fill="#376045"/>
        <path d="M420 700 L500 520 L580 700 Z" fill="#2f5635"/>
        <path d="M950 730 C920 610 860 540 820 620 C780 700 740 650 700 560 C660 470 620 520 580 620 C540 720 500 700 460 620 C420 540 380 560 340 640" fill="rgba(255,255,255,0.14)"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g8" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2c4f34"/>
            <stop offset="100%" stop-color="#86a581"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g8)"/>
        <path d="M0 560 C180 420 340 380 540 520 C760 680 900 520 1080 600 L1200 600 L1200 800 L0 800 Z" fill="#4f7557"/>
        <path d="M170 760 L250 520 L330 760 Z" fill="#325b3a"/>
        <path d="M620 560 Q700 440 760 560 T900 560" fill="rgba(255,255,255,0.16)"/>
      </svg>`),
  ],
  'asher-homestay': [
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1f4b38"/>
            <stop offset="100%" stop-color="#5e8b69"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g9)"/>
        <path d="M0 600 Q200 420 420 580 Q640 740 860 620 Q1040 520 1200 620 L1200 800 L0 800 Z" fill="#3c6f50"/>
        <circle cx="240" cy="200" r="80" fill="#e8d7a7" opacity="0.9"/>
        <path d="M520 420 Q560 320 620 360 Q680 400 740 320 Q800 240 860 360 Q920 480 980 420" fill="rgba(255,255,255,0.14)"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g10" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2b5136"/>
            <stop offset="100%" stop-color="#7ca67f"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g10)"/>
        <path d="M0 680 C180 540 320 520 460 660 C600 800 740 620 860 700 C980 780 1180 600 1200 600 L1200 800 L0 800 Z" fill="#3f7153"/>
        <path d="M190 680 L280 520 L370 680 Z" fill="#2f5c3e"/>
        <path d="M530 680 L620 520 L710 680 Z" fill="#3d6d4c"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g11" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#32503f"/>
            <stop offset="100%" stop-color="#8ca687"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g11)"/>
        <path d="M0 700 C180 560 340 520 520 660 C700 800 860 620 1040 700 L1200 700 L1200 800 L0 800 Z" fill="#3f7155"/>
        <path d="M520 520 C560 420 620 420 660 520 C700 620 760 620 800 520 C840 420 900 420 940 520 C980 620 1040 620 1080 520" fill="rgba(255,255,255,0.16)"/>
      </svg>`),
    encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g12" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2f5340"/>
            <stop offset="100%" stop-color="#6d9a71"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g12)"/>
        <path d="M0 620 Q210 420 450 620 T900 620 T1200 620 L1200 800 L0 800 Z" fill="#4f7d57"/>
        <path d="M130 730 L240 510 L360 730 Z" fill="#2c5b3d"/>
        <path d="M680 730 L760 520 L860 730 Z" fill="#366049"/>
      </svg>`),
  ],
}

export default function Gallery() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <header className="mb-12 rounded-[36px] border border-smoke/10 bg-smoke/5 p-8 shadow-soft backdrop-blur-xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.38em] text-sand/70">Gallery</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-cream sm:text-5xl">
          A closer look at the mountain light, quiet rooms, and warm host hospitality.
        </h1>
      </header>

      <div className="space-y-16">
        {homestays.map((stay) => {
          const resolvedFromData = (stay.gallery || []).map((src, idx) => resolveImage(src, `${stay.slug}-${idx}`))
          const svgs = galleryImages[stay.slug] || []
          const images = [...resolvedFromData, ...svgs]

          return (
            <section key={stay.slug} className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-sand/70">{stay.location}</p>
                  <h2 className="mt-3 text-3xl font-semibold text-cream">{stay.name}</h2>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {images.map((src, index) => (
                  <div
                    key={`${stay.slug}-${index}`}
                    className={`overflow-hidden rounded-[30px] border border-smoke/10 bg-cover bg-center shadow-soft ${index % 3 === 0 ? 'h-80 sm:h-96' : index % 3 === 1 ? 'h-64 sm:h-80' : 'h-72 sm:h-88'}`}
                    style={{ backgroundImage: `url('${src}')` }}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
