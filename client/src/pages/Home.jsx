import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ResortContext } from '../context/ResortContext.js'
import { formatPrice, applyDiscount } from '../utils/currency'
import { apiFetch } from '../utils/api'
import { resolveImage, responsiveUnsplashImage, responsiveUnsplashSrcSet } from '../utils/resolveImage'
import { homestays as defaultHomestays } from '../data/resortData'
import HomestayImage from '../components/HomestayImage'
import GalleryLightbox from '../components/GalleryLightbox'
import { occasionThemeClass } from '../utils/occasionThemes'
import { Car, MapPin, Mountain, HeartHandshake, Route, Leaf, Users, PawPrint, Droplets } from 'lucide-react'

function compressReviewPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('Choose an image smaller than 8 MB.'))
      return
    }

    const imageUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(imageUrl)
      const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.naturalWidth * scale)
      canvas.height = Math.round(image.naturalHeight * scale)
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('This image could not be processed. Try another photo.'))
        return
      }
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('This image could not be processed. Try another photo.'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Could not read the processed photo.'))
        reader.readAsDataURL(blob)
      }, 'image/jpeg', 0.8)
    }
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('This image file could not be opened.'))
    }
    image.src = imageUrl
  })
}

export default function Home() {
  const { siteData, reviews, addReview, homestays, discount } = useContext(ResortContext)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#contact') {
      requestAnimationFrame(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }))
    }
  }, [location.pathname, location.hash])

  // Dynamic Content Fallbacks
  const hp = siteData?.homepage || {}
  const staysSection = {
    visible: true,
    kicker: 'Our homestays',
    heading: 'Handcrafted hill getaways',
    description: 'Each stay brings its own rhythm of the hills - from quiet valley panoramas and pine-forest stillness to thoughtful local hosting, slow breakfasts, and restful mountain suites.',
    ...(hp.staysSection || {}),
  }
  const reviewsSection = {
    visible: true,
    kicker: 'Guest Stories & Reviews',
    heading: 'Himalayan Memories from Our Guests',
    ...(hp.reviewsSection || {}),
  }
  const contactSection = {
    visible: true,
    kicker: 'Start planning',
    heading: 'Book Your Hill Stay',
    description: 'Reserve directly with our local family hosts. We handle pickups, custom mountain meals, and scenic itineraries.',
    assistantKicker: 'Personal Care',
    assistantHeading: 'We are here to assist.',
    assistantDescription: 'Our local hosts are on hand to advise on road conditions, weather, and scenic treks.',
    whatsappText: 'Contact personal care',
    ...(hp.contactSection || {}),
  }
  const defaultHero = {
    visible: true,
    tagline: 'Three homestays · One slower way to travel',
    title: 'Find your quiet in the hills',
    subtitle: 'Settle into a village home in Kalimpong, then wander pine trails, wake to valley views and take the road towards the Silk Route.',
    primaryButtonText: 'Book Your Stay',
    primaryButtonLink: '#contact',
    secondaryButtonText: 'Explore Homestays',
    secondaryButtonLink: '#homestays',
    images: [
      'https://images.unsplash.com/photo-1615751440098-f4ae06aa209e?auto=format&fit=crop&w=2200&q=85',
      'https://images.unsplash.com/photo-1763480005970-2eb7653864ce?auto=format&fit=crop&w=2200&q=85',
    ]
  }
  const hero = { ...defaultHero, ...(hp.hero || {}) }

  const reasonsData = hp.reasons || {
    visible: true,
    heading: 'Why travellers love staying with us',
    subheading: 'Crafted with care, nature, and slow mountain comfort.',
    items: [
      { title: 'Wide-open views and quiet village stays', desc: 'Enjoy forested slopes, rolling ridges and peaceful village surroundings, with room to slow down and feel at home.' },
      { title: 'An easy journey with plenty to explore', desc: 'Reach us from NJP, Bagdogra or Siliguri, then use your stay as a relaxed base for Kalimpong, Sikkim and the Silk Route.' },
      { title: 'Personal care that feels like home', desc: 'Settle into a comfortable stay for couples, families or groups, with home-cooked meals and a warm welcome from local hosts.' },
    ]
  }

  const reasonsItems = (reasonsData.items || []).length > 3
    ? [
        { title: 'Wide-open views and quiet village stays', desc: 'Enjoy forested slopes, rolling ridges and peaceful village surroundings, with room to slow down and feel at home.' },
        { title: 'An easy journey with plenty to explore', desc: 'Reach us from NJP, Bagdogra or Siliguri, then use your stay as a relaxed base for Kalimpong, Sikkim and the Silk Route.' },
        { title: 'Personal care that feels like home', desc: 'Settle into a comfortable stay for couples, families or groups, with home-cooked meals and a warm welcome from local hosts.' },
      ]
    : reasonsData.items || []

  const experiencesData = hp.experiences || {
    visible: true,
    heading: 'Curated Hill Experiences',
    subheading: 'Moments to remember across forests, tea gardens, and mountain trails.',
    items: [
      { number: '01', title: 'Mountain mornings', desc: 'Take in the shifting clouds with a cup of tea and a view from the porch.', image: 'https://thepinegetaways.com/images/gallery/experiences-couple-sunrise.jpg', alt: 'Sunrise over the mountains' },
      { number: '02', title: 'Nature escapes', desc: 'Find pine trails, waterfalls and quiet village walks close to your stay.', image: 'https://thepinegetaways.com/images/gallery/views-changey-falls.jpg', alt: 'Changey Falls among the hills' },
      { number: '03', title: 'Scenic photography', desc: 'Catch prayer flags, terraced hills and changing light across the mountains.', image: 'https://thepinegetaways.com/images/gallery/views-kanchenjunga.jpg', alt: 'Kanchenjunga mountain view' },
      { number: '04', title: 'Local food', desc: 'Share fresh, home-cooked meals shaped by the ingredients and recipes of the hills.', image: 'https://thepinegetaways.com/images/gallery/food-generous-spread.jpg', alt: 'A spread of home-cooked food' },
    ]
  }

  const defaultDestinations = {
    visible: true,
    items: [
      { name: 'Darjeeling', desc: 'Tea country, heritage streets and Himalayan panoramas make this a rewarding day out.', image: 'https://thepinegetaways.com/images/destinations/darjeeling.jpg', tags: ['Tea gardens', 'Himalayan views', 'Heritage'] },
      { name: 'Sikkim', desc: 'Travel towards monasteries, high mountain scenery and a distinct local culture.', image: 'https://thepinegetaways.com/images/destinations/sikkim.jpg', tags: ['Monasteries', 'Local culture', 'Mountain roads'] },
      { name: 'Silk Route', desc: 'Follow a historic mountain road through cloud-level villages and expansive views.', image: 'https://thepinegetaways.com/images/destinations/silk-route.jpg', tags: ['Scenic drives', 'Adventure', 'Nature'] },
    ]
  }
  const destinationsData = { ...defaultDestinations, ...(hp.destinations || {}) }

  const defaultClusters = {
    visible: true,
    clusters: [
      { title: 'Kalimpong', spots: ['Deolo Hill', 'Durpin Dara', 'Durpin Monastery', 'Mangal Dham', "Dr. Graham's Homes", 'Cactus and Orchid Nurseries', 'Morgan House', 'Lovers Meet View Point'] },
      { title: 'Pedong and Silk Route', spots: ['Damsang Fort', 'Sangchen Dorjee Monastery', 'Rishi Khola', 'Sillery Gaon', 'Icchey Gaon', 'Ramdhura'] },
      { title: 'Lava and Neora Valley', spots: ['Lava Monastery', 'Neora Valley National Park', 'Kolakham', 'Changey Falls', 'Loleygaon', 'Canopy Walk', 'Jhandi Dara', 'Rishop / Tiffin Dara', 'Rachela Pass'] },
      { title: 'Scenic getaways', spots: ['Teesta Valley', 'Samthar', 'Tinchuley', 'Kaffergaon'] },
      { title: 'Zuluk and Old Silk Route', spots: ['Rongli', 'Zuluk', 'Nathang Valley', 'Silent Valley'] },
    ]
  }
  const clustersData = { ...defaultClusters, ...(hp.clusters || {}) }

  const galleryData = hp.gallerySection || {
    visible: true,
    items: [
      { title: 'The Kanchenjunga range', type: 'Views', image: 'https://thepinegetaways.com/images/gallery/views-kanchenjunga.jpg' },
      { title: 'A quiet guest room', type: 'Rooms', image: 'https://thepinegetaways.com/images/gallery/rooms-blue-floral.jpg' },
      { title: 'A generous homemade spread', type: 'Food', image: 'https://thepinegetaways.com/images/gallery/food-generous-spread.jpg' },
      { title: 'A slow sunrise together', type: 'Experiences', image: 'https://thepinegetaways.com/images/gallery/experiences-couple-sunrise.jpg' },
      { title: 'Peaks above the clouds', type: 'Views', image: 'https://thepinegetaways.com/images/gallery/views-clouds.jpg' },
      { title: 'A warm twin-bed room', type: 'Rooms', image: 'https://thepinegetaways.com/images/gallery/rooms-twin-bed.jpg' },
    ]
  }

  const contactData = siteData?.contact || {
    phone: '+91 98046 00910',
    phoneLink: '+919804600910',
    whatsappLink: 'https://wa.me/919804600910',
    email: 'stay@samtharhillstay.com',
    instagram: '@samthar',
    location: 'Kalimpong District, West Bengal',
    address: 'Mairung, Kalimpong Hills, West Bengal 734301'
  }

  const stays = homestays.length ? homestays : defaultHomestays

  const heroImages = useMemo(() => hero.images?.length > 0 ? hero.images : ['https://images.unsplash.com/photo-1615751440098-f4ae06aa209e?auto=format&fit=crop&w=1600&q=75'], [hero.images])

  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const currentHeroImage = heroImages[heroImageIndex] || heroImages[0]
  const [failedHeroImages, setFailedHeroImages] = useState({})
  const heroFallbackImages = ['/images/field-notes/morning-view.jpg', '/images/field-notes/village-path.jpg']
  const fallbackHeroImage = heroFallbackImages[heroImageIndex % heroFallbackImages.length]
  const resolvedHeroImage = failedHeroImages[currentHeroImage]
    ? fallbackHeroImage
    : resolveImage(currentHeroImage, `hero-${heroImageIndex}`, 2200, 1200)
  const [activeStayImage, setActiveStayImage] = useState(null)
  const [stayGallery, setStayGallery] = useState({ open: false, title: '', media: [] })

  const openStayGallery = (stay) => {
    const media = []
    if (stay.mainImage || stay.image) media.push(stay.mainImage || stay.image)
    ;(stay.cardGallery || []).forEach((item) => media.push(item))
    setStayGallery({ open: true, title: stay.name, media })
  }
  const [preferredStay, setPreferredStay] = useState('No preference')
  const [enquiryAdults, setEnquiryAdults] = useState(2)
  const [enquiryChildAges, setEnquiryChildAges] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewPhoto, setReviewPhoto] = useState('')
  const [reviewForm, setReviewForm] = useState({ author: '', location: '', staySlug: '', text: '' })
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' })
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const reviewPhotoInput = useRef(null)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroImageIndex((idx) => (idx + 1) % heroImages.length)
    }, 4000)
    return () => window.clearInterval(intervalId)
  }, [heroImages])

  const sendEnquiry = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const checkIn = values.get('checkin')
    const checkOut = values.get('checkout')
    if (checkOut <= checkIn) {
      form.elements.checkout.setCustomValidity('Check-out must be after check-in.')
      form.elements.checkout.reportValidity()
      form.elements.checkout.setCustomValidity('')
      return
    }

    const adults = Number(values.get('adults') || 1)
    const childAges = values.getAll('childAge').map(Number)
    const guests = adults + childAges.length

    const payload = {
      name: values.get('name'),
      phone: values.get('phone'),
      dates: `${checkIn} to ${checkOut}`,
      homestay: values.get('homestay'),
      guests,
      adults,
      childAges,
      message: values.get('message') || ''
    }

    // Post to persistent database backend
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setEnquirySuccess(true)
    } catch (e) {
      console.warn('Backend save failed, opening WhatsApp anyway:', e)
    }

    const message = [
      'Hello, I am planning a hill getaway and would like to enquire about a stay.',
      `Name: ${values.get('name')}`,
      `WhatsApp number: ${values.get('phone')}`,
      `Arrival date: ${checkIn}`,
      `Departure date: ${checkOut}`,
      `Adults: ${adults}`,
      `Children: ${childAges.length}${childAges.length ? ` (ages: ${childAges.join(', ')})` : ''}`,
      `Stay preference: ${values.get('homestay')}`,
      `Special requests: ${values.get('message') || 'None'}`,
    ].join('\n')

    window.open(`${contactData.whatsappLink || 'https://wa.me/919804600910'}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const handleReviewPhoto = async (event) => {
    const input = event.currentTarget
    const [file] = input.files ?? []
    if (!file) return
    setReviewMessage({ type: '', text: '' })
    try {
      const compressedPhoto = await compressReviewPhoto(file)
      setReviewPhoto(compressedPhoto)
    } catch (error) {
      setReviewPhoto('')
      setReviewMessage({ type: 'error', text: error.message })
      input.value = ''
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setReviewMessage({ type: '', text: '' })
    if (!reviewForm.author.trim() || !reviewForm.staySlug || !reviewForm.text.trim()) {
      setReviewMessage({ type: 'error', text: 'Please add your name, choose a homestay, and write your review.' })
      return
    }
    setIsSavingReview(true)
    try {
      await addReview({
        author: reviewForm.author.trim(),
        location: reviewForm.location.trim(),
        stayName: reviewForm.staySlug,
        rating: reviewRating,
        text: reviewForm.text.trim(),
        image: reviewPhoto,
      })
      setReviewForm({ author: '', location: '', staySlug: '', text: '' })
      setReviewRating(5)
      setReviewPhoto('')
      if (reviewPhotoInput.current) reviewPhotoInput.current.value = ''
      setReviewMessage({ type: 'success', text: 'Thanks for sharing your experience! Your review has been saved.' })
    } catch (error) {
      setReviewMessage({ type: 'error', text: error.message || 'Your review could not be saved.' })
    } finally {
      setIsSavingReview(false)
    }
  }

  const todayDate = new Date().toISOString().split('T')[0]
  const homestayPreferenceField = (
    <label className="text-[11px] font-semibold text-[#415044]">
      Homestay Preference
      <select className="enquiry-input mt-2" name="homestay" value={preferredStay} onChange={(e) => setPreferredStay(e.target.value)}>
        <option>No preference</option>
        {stays.map((s) => <option key={s.name}>{s.name}</option>)}
      </select>
    </label>
  )

  return (
    <div className="overflow-hidden bg-[var(--site-bg,#faf8f1)] text-[var(--site-text,#1b2b22)]">
      {/* 1. HERO SECTION */}
      {hero.visible !== false && (
        <section id="home" className={`home-hero relative isolate flex items-end bg-[#10281e] ${occasionThemeClass(hero.theme)}`}>
          <img
            key={heroImageIndex}
            src={responsiveUnsplashImage(resolvedHeroImage)}
            srcSet={responsiveUnsplashSrcSet(resolvedHeroImage)}
            sizes="100vw"
            alt="Mountain landscape around Samthar"
            fetchPriority="high"
            decoding="async"
            onError={() => setFailedHeroImages((failed) => failed[currentHeroImage] ? failed : { ...failed, [currentHeroImage]: true })}
            className="hero-background-image pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#10281e]/85 via-[#10281e]/30 to-[#10281e]/10" aria-hidden="true" />
          {hero.theme && hero.theme !== 'default' && <div className="occasion-decoration" aria-hidden="true" />}
          <div className="home-shell hero-inner relative z-10 flex w-full flex-col justify-end pb-12 pt-28 text-white sm:pb-16 lg:pb-24">
            <div className="max-w-[760px] animate-[rise-in_.8s_ease_both]">
              {hero.tagline && (
                <p className="mb-4 inline-block rounded-full border border-white/35 bg-[#faf8f1]/90 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#10281e] shadow-lg sm:text-xs">
                  {hero.tagline}
                </p>
              )}
              <h1 className="display-font max-w-[700px] text-[40px] font-semibold leading-[1.04] text-[#fffdf6] sm:text-6xl lg:text-[70px]">
                {hero.title}
              </h1>
              <p className="mt-5 max-w-[540px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                {hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/#contact"
                  className="hero-primary-button rounded-full bg-[var(--accent-gold,#caa34b)] px-6 py-3 text-xs font-bold text-[#16281e] transition hover:bg-[var(--accent-gold-hover,#dfbc60)] shadow-lg"
                >
                  {hero.primaryButtonText || 'Book Your Stay'} <span aria-hidden="true">→</span>
                </a>
                <a
                  href={hero.secondaryButtonLink || '#homestays'}
                  className="hero-secondary-button rounded-full border border-white/50 bg-[#10281e]/30 px-6 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  {hero.secondaryButtonText || 'Explore Homestays'}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. HOMESTAYS SECTION */}
      {staysSection.visible !== false && <section id="homestays" className="home-section home-shell pb-8 pt-10 sm:pb-12 sm:pt-16">
        <div className="rounded-[32px] border-2 border-[#e5dbc0] p-4 sm:p-6 lg:p-8">
          <div className="mb-9 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="rounded-[28px] border border-[#e5dbc0] bg-[#f4efdf] p-5 shadow-sm sm:p-6">
              <p className="section-kicker">{staysSection.kicker}</p>
              <h2 className="section-title mt-3">{staysSection.heading}</h2>
            </div>
            <p className="max-w-xl rounded-[28px] border border-[#e5dbc0] bg-[#f4efdf] p-5 text-sm leading-6 text-[#5d645f] shadow-sm sm:p-6">
              {staysSection.description}
            </p>
          </div>

          <div className="space-y-6">
            {stays.map((stay, index) => (
              <article key={stay.slug || stay.name || index} className="stay-card group">
                <div className="stay-visual">
                  <button
                    type="button"
                    className="stay-photo relative overflow-hidden"
                    onClick={(event) => {
                      const image = event.currentTarget.querySelector('img')
                      setActiveStayImage({ name: stay.name, image: image?.currentSrc || image?.src || stay.mainImage || stay.image })
                    }}
                    aria-label={`Open photo of ${stay.name}`}
                  >
                    <HomestayImage src={stay.mainImage || stay.image} imageKey={stay.slug || stay.name} alt={stay.name} className="home-image transition duration-500 group-hover:scale-105" />
                  </button>
                </div>
                <div className="stay-content flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-widest text-[#caa34b] font-bold">{stay.location}</p>
                      {stay.priceStarting && (
                        <span className="rounded-full bg-[#10281e]/10 px-3 py-1 text-xs font-bold text-[#10281e]">
                          From {formatPrice(applyDiscount(stay.priceStarting, discount))} {stay.priceLabel || 'per night'}
                        </span>
                      )}
                    </div>
                    <h3 className="display-font mt-2 text-2xl font-bold text-[#10281e]">{stay.name}</h3>
                    <p className="mt-2 text-xs italic text-[#6c7166]">{stay.tagline}</p>
                    <p className="mt-3 text-sm leading-6 text-[#5d645f]">{stay.description}</p>
                    {stay.points && (
                      <ul className="mt-4 space-y-1.5 text-xs text-[#4a554d]">
                        {stay.points.map((pt, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-[#caa34b]">✓</span> {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-[#e5dbc0]/60">
                    <a
                      href={`/homestays/${stay.slug || 'samthar-hill-stay'}`}
                      className="rounded-full bg-[#10281e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1f4233]"
                    >
                      View Details & Rooms
                    </a>
                    <button
                      type="button"
                      onClick={() => openStayGallery(stay)}
                      className="rounded-full border border-[#caa34b] px-4 py-2 text-xs font-bold text-[#9b782d] transition hover:bg-[#caa34b]/15"
                    >
                      View Gallery
                    </button>
                    <a
                      href="#contact"
                      onClick={() => setPreferredStay(stay.name)}
                      className="rounded-full bg-[#caa34b] px-4 py-2 text-xs font-bold text-[#10281e] transition hover:bg-[#d8b85e]"
                    >
                      Book This Stay
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3.5">
          <div className="flex items-center gap-4 rounded-2xl border border-[#ebd5a4] bg-[#f8e9c8] px-6 py-5 sm:gap-5 sm:px-7">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#153226] text-white sm:h-12 sm:w-12">
              <PawPrint className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#153226] sm:text-lg">Pet Friendly</h3>
              <p className="mt-0.5 text-sm text-[#5d645f]">
                Bring your furry companions along - always welcome, no extra charge.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#153226] px-5 py-3.5 text-white sm:px-6 sm:py-4">
            <Droplets className="h-4 w-4 shrink-0 text-[#caa34b] sm:h-5 sm:w-5" strokeWidth={1.75} />
            <p className="text-xs font-medium text-white/95 sm:text-sm">
              Attached washrooms, fresh linen and hot water - every room
            </p>
          </div>
        </div>
      </section>}

      {/* 3. REASONS TO STAY */}
      {reasonsData.visible !== false && (
        <section className="border-b border-[#e9e3d7] bg-[#f5f2e8]">
          <div className="home-shell py-16 sm:py-20">
            <div className="mb-8 max-w-2xl">
              <p className="section-kicker">{reasonsData.subheading || 'Your hill escape starts here'}</p>
              <h2 className="section-title mt-3">{reasonsData.heading || 'Why guests love staying with us'}</h2>
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              {reasonsItems.map((item, index) => (
                <article key={item.title || index} className="experience-item">
                  <p className="text-[10px] font-bold tracking-[.18em] text-[#b08d3b]">0{index + 1}</p>
                  <h3 className="display-font mt-2 text-xl font-semibold text-[#173528]">{item.title}</h3>
                  <p className="mt-2 max-w-sm text-xs leading-6 text-[#73766d]">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. EXPERIENCES */}
      {experiencesData.visible !== false && (
        <section id="experiences" className="home-shell py-16 sm:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="section-kicker">{experiencesData.subheading || 'Curated hill moments'}</p>
            <h2 className="section-title mt-3">{experiencesData.heading || 'Curated Hill Experiences'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(experiencesData.items || []).map((exp, idx) => (
              <div key={idx} className="rounded-2xl border border-[#e5dbc0] bg-white overflow-hidden shadow-sm group">
                <div className="h-48 overflow-hidden relative">
                  <img src={exp.image} alt={exp.alt || exp.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 bg-[#10281e]/80 text-[#caa34b] font-mono font-bold text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {exp.number || `0${idx + 1}`}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-[#10281e]">{exp.title}</h3>
                  <p className="text-xs text-[#5d645f] leading-relaxed">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. EXPLORE & DAY TRIPS */}
      {destinationsData.visible !== false && (
        <section id="explore" className={`explore-section border-t border-[#e9e3d7] bg-[#f5f2e8] py-16 sm:py-20 ${occasionThemeClass(destinationsData.theme)}`}>
          {destinationsData.theme && destinationsData.theme !== 'default' && <div className="explore-decoration" aria-hidden="true" />}
          <div className="home-shell explore-content">
            <div className="mb-8 max-w-2xl">
              <p className="section-kicker">Day trips & surrounding trails</p>
              <h2 className="section-title mt-3">Excursions and Mountain Drives</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(destinationsData.items || []).map((dest, idx) => (
                <div key={idx} className="explore-card rounded-2xl border border-[#e5dbc0] bg-white overflow-hidden shadow-sm">
                  <div className="h-44 overflow-hidden">
                    <img src={dest.image} alt={dest.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="explore-card-title display-font text-lg font-bold text-[#10281e]">{dest.name}</h3>
                    <p className="text-xs text-[#5d645f] leading-relaxed">{dest.desc}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(dest.tags || []).map((t, i) => (
                        <span key={i} className="explore-tag text-[10px] bg-[#f4efdf] text-[#10281e] font-semibold px-2 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRANSPORT & SIGHTSEEING */}
      <section className="journey-section">
        <div className="home-shell">
          <div className="mb-8 max-w-3xl">
            <p className="section-kicker">Transport &amp; Sightseeing</p>
            <h2 className="section-title mt-3">Getting Here, and Getting Around</h2>
            <span className="mt-4 block h-[3px] w-16 rounded-full bg-[#caa34b]" />
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#626a61]">Pick-up, drop and local sightseeing arranged end to end - just tell us where you're coming from.</p>
          </div>

          <p className="section-kicker mb-4">Pick-up &amp; Drop From</p>
          <div className="journey-pickups">
            {[
              ['NJP Railway Station', 'Approx. 3 hrs'],
              ['Bagdogra Airport', 'Approx. 3.5 hrs'],
              ['New Mal Junction', 'Approx. 2.5 hrs'],
              ['Siliguri', 'Approx. 3 hrs'],
            ].map(([place, duration]) => (
              <article key={place} className="journey-pickup flex min-h-[120px] flex-col justify-center text-center">
                <h3 className="display-font text-lg font-semibold text-[#173528]">{place}</h3>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#a17b2f]">{duration}</p>
              </article>
            ))}
          </div>

          <div className="journey-options">
            <article className="journey-vehicles">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#a17b2f]"><Car className="h-4 w-4" />Vehicles</p>
              <h3 className="display-font mt-3 text-2xl font-semibold text-[#173528]">Choose Your Ride</h3>
              <ul className="mt-5">
                {[
                  ['5-seater', 'small families & couples'],
                  ['10-seater', 'groups & friends'],
                  ['Brezza', 'premium'],
                  ['Innova', 'premium'],
                  ['Other premium vehicles', 'on request'],
                ].map(([vehicle, detail]) => (
                  <li key={vehicle} className="flex flex-wrap items-baseline gap-x-2 border-b border-[#e5dfd1] py-3 text-sm last:border-0">
                    <span className="font-bold text-[#173528]">{vehicle}</span><span className="text-[#73766d]">· {detail}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="journey-sightseeing">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#a17b2f]"><MapPin className="h-4 w-4" />Sightseeing</p>
              <h3 className="display-font mt-3 text-2xl font-semibold text-[#173528]">Private Vehicles on Hire</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Lava', 'Lolegaon', 'Rishop', 'Delo', 'Changey Falls', 'Kalimpong town', 'Offbeat villages', 'Local sightseeing'].map((place) => (
                  <span key={place} className="rounded-full border border-[#e8c16c] bg-[#fbf4e2] px-4 py-2 text-sm text-[#173528]">{place}</span>
                ))}
              </div>
              <p className="mt-5 text-xs italic text-[#73766d]">Rates as per industry-standard local pricing.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 6. ATTRACTION CLUSTERS */}
      {clustersData.visible !== false && (
        <section className="home-shell attractions-section py-9 sm:py-12" style={{ backgroundColor: clustersData.backgroundColor || 'var(--paper)' }}>
          <div className="mb-4 max-w-2xl">
            <p className="section-kicker" style={{ color: clustersData.accentColor || 'var(--gold)' }}>Regional Highlights</p>
            <h2 className="section-title attractions-heading mt-2" style={{ color: clustersData.headingColor || 'var(--pine)' }}>Attraction Clusters Across Kalimpong & Sikkim</h2>
          </div>
          <div className="attraction-grid">
            {(clustersData.clusters || []).map((cluster, index) => (
              <article key={cluster.title || index} className="attraction-card" style={{ backgroundColor: clustersData.cardBackgroundColor || 'var(--paper)', borderColor: clustersData.cardBorderColor || 'var(--line)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="display-font grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e5dbc0] bg-[#f5f0e1] text-[10px] font-bold text-[#9b782d]" style={{ backgroundColor: clustersData.numberBackgroundColor || '#f5f0e1', borderColor: clustersData.numberBorderColor || '#e5dbc0', color: clustersData.accentColor || 'var(--gold)' }}>
                    0{index + 1}
                  </span>
                  <h3 className="text-[13px] font-bold leading-5 text-[#1b3527]" style={{ color: clustersData.cardHeadingColor || 'var(--pine)' }}>{cluster.title}</h3>
                </div>
                <ul className="attraction-list">
                  {(cluster.spots || []).map((place) => (
                    <li key={place} className="attraction-place" style={{ backgroundColor: clustersData.tagBackgroundColor || '#f4efdf', borderColor: clustersData.tagBorderColor || 'var(--line)', color: clustersData.tagTextColor || 'var(--pine-soft)' }}>{place}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 7. GALLERY SECTION */}
      {galleryData.visible !== false && (
        <section id="gallery" className="border-t border-[#e9e3d7] bg-white py-16 sm:py-20">
          <div className="home-shell">
            <div className="mb-8">
              <p className="section-kicker">{galleryData.subheading || 'A glimpse of hill life'}</p>
              <h2 className="section-title mt-2">{galleryData.heading || 'Moments from the Hills'}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(galleryData.items || []).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStayImage({ name: item.title, image: item.image })}
                  className="group flex min-h-56 w-full flex-col items-center gap-4 rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-5 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:gap-6 sm:p-7 sm:text-left"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-20 shrink-0 rounded-full border-[4px] border-[#c5a453] object-cover shadow-md transition duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
                  />
                  <div className="min-w-0">
                    <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full border border-[#e1d5b3] bg-[#f7f2e5] text-xs font-bold tracking-wide text-[#9b782d] sm:mx-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="display-font text-xl font-semibold leading-tight text-[#173528] sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#73766d]">
                      {item.description || (item.type ? `${item.type} moments from our hillside stays.` : 'A glimpse of life in the hills.')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. WHY CHOOSE SAMTHAR HILLSTAY */}
      <section className="border-t border-[#e9e3d7] bg-[#f7f6f0] py-16 sm:py-20">
        <div className="home-shell">
          <div className="text-center">
            <h2 className="section-title">Why Choose Samthar Hillstay</h2>
            <span className="mx-auto mt-4 block h-[2px] w-14 rounded-full bg-[#caa34b]" />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mountain,
                title: 'Scenic locations',
                desc: 'Every home looks out onto pine forests, ridges or open valley.',
              },
              {
                icon: MapPin,
                title: 'Convenient location',
                desc: 'A short drive from NJP, Bagdogra and Siliguri - easy to reach, worlds away.',
              },
              {
                icon: Route,
                title: 'Road-trip friendly',
                desc: 'The natural stopover between the plains and the Silk Route or Sikkim.',
              },
              {
                icon: HeartHandshake,
                title: 'Homely hospitality',
                desc: 'Homemade food and genuine care from families who live where they host.',
              },
              {
                icon: Leaf,
                title: 'Peaceful atmosphere',
                desc: 'Offbeat villages, away from the crowds of the usual hill-station circuit.',
              },
              {
                icon: Users,
                title: 'Family-friendly',
                desc: 'Comfortable enough for grandparents, easy enough for kids.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#ece7da] bg-white p-7 text-left shadow-[0_2px_12px_rgba(16,40,30,0.03)] sm:p-8"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#153226] text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="display-font mt-6 text-xl font-semibold text-[#153226]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-[#68706a]">
                    {item.desc}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 9. REVIEWS & TESTIMONIALS */}
      {reviewsSection.visible !== false && <section className="bg-[#10281e] text-white py-12 sm:py-16">
        <div className="home-shell">
          <div className="mb-6 max-w-2xl">
            <p className="section-kicker !text-[#d0b45e]">{reviewsSection.kicker}</p>
            <h2 className="display-font mt-2 text-3xl font-semibold sm:text-4xl">{reviewsSection.heading}</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Review Form */}
            <form onSubmit={submitReview} className="review-form">
              <h3 className="display-font text-xl font-semibold text-[#173528]">Write a guest review</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="review-label">Your name
                  <input className="review-input" value={reviewForm.author} onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })} required />
                </label>
                <label className="review-label">Your city
                  <input className="review-input" value={reviewForm.location} onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })} />
                </label>
                <label className="review-label">Which homestay did you visit?
                  <select className="review-input" value={reviewForm.staySlug} onChange={(e) => setReviewForm({ ...reviewForm, staySlug: e.target.value })} required>
                    <option value="">Choose a homestay</option>
                    {stays.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </label>
                <div>
                  <span className="review-label">Your rating</span>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button key={val} type="button" onClick={() => setReviewRating(val)} className={`text-xl ${val <= reviewRating ? 'text-[#caa34b]' : 'text-gray-300'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <label className="review-label sm:col-span-2">Your experience
                  <textarea rows={3} className="review-input" value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} required />
                </label>
                <label className="review-label sm:col-span-2">Photo (optional)
                  <input ref={reviewPhotoInput} type="file" accept="image/*" onChange={handleReviewPhoto} className="review-input" />
                  {reviewPhoto && <span className="mt-1 block text-xs text-emerald-800">Photo ready to submit.</span>}
                </label>
                <button type="submit" disabled={isSavingReview} className="rounded-full bg-[#173528] px-5 py-3 text-sm font-bold text-white sm:col-span-2 hover:bg-[#245039]">
                  {isSavingReview ? 'Saving...' : 'Share your review'}
                </button>
              </div>
              {reviewMessage.text && (
                <p className={`mt-3 text-sm ${reviewMessage.type === 'error' ? 'text-red-700' : 'text-emerald-800'}`}>{reviewMessage.text}</p>
              )}
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span className="font-semibold text-white">Recent Guest Feedback</span>
                <span>{reviews.length} total</span>
              </div>
              {reviews.length === 0 ? (
                <div className="text-white/50 text-sm py-8 text-center bg-white/5 rounded-2xl border border-white/10">
                  Be the first to leave a review of your mountain stay!
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                  {reviews.map((r) => (
                    <article key={r.id} className="bg-white text-[#10281e] p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{r.author}</h4>
                          <p className="text-[11px] text-gray-500">{[r.stayName, r.location].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span className="text-[#caa34b] text-sm">{'★'.repeat(r.rating || 5)}</span>
                      </div>
                      <p className="mt-3 text-xs text-[#5d645f] leading-relaxed">{r.text}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>}

      {/* 10. CONTACT & BOOKING FORM */}
      {contactSection.visible !== false && <section id="contact" className="home-section home-shell py-16 sm:py-20">
        <div className="mb-8 max-w-xl">
          <p className="section-kicker">{contactSection.kicker}</p>
          <h2 className="section-title mt-3">{contactSection.heading}</h2>
          <p className="mt-3 text-sm leading-6 text-[#6c7169]">
            {contactSection.description}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_.75fr]">
          <form onSubmit={sendEnquiry} className="border border-[#e5dfd1] bg-white p-5 sm:p-7 rounded-2xl shadow-sm">
            {enquirySuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                ✓ Your inquiry has been saved to the host dashboard and opened in WhatsApp!
              </div>
            )}
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <label className="text-[11px] font-semibold text-[#415044]">
                Your Name *
                <input className="enquiry-input mt-2" name="name" required />
              </label>
              <label className="text-[11px] font-semibold text-[#415044]">
                WhatsApp / Phone *
                <input className="enquiry-input mt-2" name="phone" type="tel" required />
              </label>
              <label className="text-[11px] font-semibold text-[#415044]">
                Arrival Date *
                <input className="enquiry-input mt-2" name="checkin" type="date" min={todayDate} required />
              </label>
              <label className="text-[11px] font-semibold text-[#415044]">
                Departure Date *
                <input className="enquiry-input mt-2" name="checkout" type="date" min={todayDate} required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#415044]">
                  Adults *
                  <select className="enquiry-input mt-2" name="adults" value={enquiryAdults} onChange={(e) => setEnquiryAdults(Number(e.target.value))} required>
                    {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'Adult' : 'Adults'}</option>)}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-[#415044]">
                  Children (under 18)
                  <select className="enquiry-input mt-2" value={enquiryChildAges.length} onChange={(e) => setEnquiryChildAges((ages) => Array.from({ length: Number(e.target.value) }, (_, index) => ages[index] ?? 6))}>
                    {[0, 1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'Child' : 'Children'}</option>)}
                  </select>
                </label>
                {enquiryChildAges.map((age, index) => (
                  <label key={index} className="text-[11px] font-semibold text-[#415044]">
                    Child {index + 1} age
                    <select name="childAge" className="enquiry-input mt-2" value={age} onChange={(e) => setEnquiryChildAges((ages) => ages.map((value, childIndex) => childIndex === index ? Number(e.target.value) : value))}>
                      {Array.from({ length: 18 }, (_, childAge) => <option key={childAge} value={childAge}>{childAge} years</option>)}
                    </select>
                  </label>
                ))}
                {homestayPreferenceField}
              </div>
              <label className="text-[11px] font-semibold text-[#415044] sm:col-span-2">
                Special Requests (optional)
                <textarea className="enquiry-input mt-2" name="message" rows="3" />
              </label>
              <button
                className="sm:col-span-2 rounded-full bg-[#24c96b] hover:bg-[#20b95f] px-5 py-3 text-sm font-bold text-[#0b2819] transition shadow-md"
                type="submit"
              >
                Send Inquiry on WhatsApp <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>

          <aside className="min-w-0 rounded-[28px] bg-[#10281e] p-6 text-white shadow-lg sm:p-8 flex flex-col justify-between">
            <div className="min-w-0">
              <p className="section-kicker !text-[#d0b45e]">{contactSection.assistantKicker}</p>
              <h3 className="display-font mt-3 text-2xl font-semibold">{contactSection.assistantHeading}</h3>
              <p className="mt-2 text-xs leading-5 text-white/65">
                {contactSection.assistantDescription}
              </p>
              <a href={contactData.whatsappLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#caa34b] hover:underline">
                <img aria-hidden="true" src="/whatsapp-logo.svg" alt="" className="h-5 w-5 shrink-0" />
                {contactSection.whatsappText} →
              </a>
              <div className="mt-6 space-y-3 text-sm">
                <a href={`tel:${contactData.phoneLink || contactData.phone}`} className="block text-white/85 hover:text-[#e2c96f]">
                  📞 &nbsp;{contactData.phone}
                </a>
                <a href={`mailto:${contactData.email}`} className="block text-white/65 text-xs transition hover:text-[#e2c96f]">✉ &nbsp;{contactData.email}</a>
                <a href="https://www.google.com/maps/search/?api=1&query=26.976279%2C88.511407" target="_blank" rel="noreferrer" className="block text-white/65 text-xs transition hover:text-[#e2c96f]">📍 &nbsp;Lake Gaon, Samthar, Kalimpong, West Bengal</a>
                <div className="overflow-hidden rounded-2xl border border-white/15">
                  <iframe
                    title="Map to Lake Gaon, Samthar, Kalimpong, West Bengal"
                    src="https://www.google.com/maps?q=26.976279%2C88.511407&output=embed"
                    className="w-full border-0 transition-[height] duration-300"
                    style={{ height: `${192 + enquiryChildAges.length * 56}px` }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

          </aside>
        </div>
      </section>}

      {/* Lightbox photo modal */}
      {activeStayImage && (
        <div
          className="stay-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveStayImage(null)}
        >
          <button type="button" className="stay-lightbox-close" onClick={() => setActiveStayImage(null)}>×</button>
          <img src={activeStayImage.image} alt={activeStayImage.name} />
          <p>{activeStayImage.name}</p>
        </div>
      )}

      <GalleryLightbox
        open={stayGallery.open}
        onClose={() => setStayGallery((prev) => ({ ...prev, open: false }))}
        title={stayGallery.title}
        media={stayGallery.media}
      />
    </div>
  )
}
