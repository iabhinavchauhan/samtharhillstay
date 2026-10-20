export const homestays = [
  {
    slug: 'samthar-hill-stay',

    currency: 'INR',
    name: 'Samthar',
    location: 'Kalimpong Hills',
    tagline: 'A luxury hill stay nestled among pine forests with emerald valley views.',
    description:
      'An intimate homestay with handcrafted rooms, refined local cuisine, and slow mornings surrounded by greenery.',
    mainImage:
      'https://loremflickr.com/1200/800/mountain%20hotel?random=6b5324d0',
    gallery: [
      'https://loremflickr.com/1200/800/mountain%20cottage?random=d17f3756',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=6d03c7af',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=f15cb4c9',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=b0590e2e',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=68b96f1e',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=af9ea5f7',
    ],
    rooms: [
      {
        name: 'Forest Suite',
        description: 'A luxury suite with woven fabrics, views over cedar trees, and a private terrace.',
        price: 112,
      },
      {
        name: 'River View Suite',
        description: 'Soft-light interiors, open-air bathroom, and quiet river sounds after sundown.',
        price: 128,
      },
    ],
    amenities: ['Private balconies', 'Fireplace seating', 'Organic breakfast', 'Guided forest walk'],
    attractions: ['Tea plantations', 'Sunrise viewpoints', 'Local spice market', 'Birdwatching trails'],
    contact: {
      phone: '+91 98765 43210',
      email: 'stay@samtharhillstay.com',
      whatsapp: '+91 98765 43210',
      address: 'Kalimpong Hills, West Bengal',
    },
    foodHighlights: ['Saffron tea ritual', 'Forest balcony breakfast'],
  },
  {
    slug: 'suviksha-homestay',

    currency: 'INR',
    name: 'Suviksha Homestay',
    location: 'Misty Valleys',
    tagline: 'A warm homestay on a green plateau with calm mountain views.',
    description:
      'A cozy hideaway for travelers seeking calm, local homestyle dining, and slow afternoons beneath cedar canopies.',
    mainImage:
      'https://loremflickr.com/1200/800/forest%20cottage?random=9d018b71',
    gallery: [
      'https://loremflickr.com/1200/800/mountain%20cottage?random=6d03c7af',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=f15cb4c9',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=af9ea5f7',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=dc6a5e8f',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=c6d1fe6a',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=7686db60',
    ],
    rooms: [
      {
        name: 'Meadow Room',
        description: 'A spacious suite with handcrafted wood furniture and natural light throughout.',
        price: 98,
      },
      {
        name: 'Terrace Room',
        description: 'Private terrace and refined details designed for couples and quiet recollection.',
        price: 104,
      },
    ],
    amenities: ['Heated floors', 'Evening tea service', 'Private garden', 'Guided village walk'],
    attractions: ['Local pottery village', 'Canyon overlooks', 'Herbal spa treatments', 'Sunset ridge'],
    contact: {
      phone: '+91 98765 43211',
      email: 'hello@suvikshahomestay.com',
      whatsapp: '+91 98765 43211',
      address: 'Misty Valleys, West Bengal',
    },
    foodHighlights: ['Garden brunch', 'Evening tea service'],
  },
  {
    slug: 'asher-homestay',

    currency: 'INR',
    name: 'Asher Homestay',
    location: 'Emerald Ridge',
    tagline: 'A premium homestay with sweeping cedar vistas and mountain calm.',
    description:
      'A calm retreat surrounded by lush hills, pine forests, and serene valley views.',
    mainImage:
      'https://loremflickr.com/1200/800/mountain%20lodge?random=68d3af33',
    gallery: [
      'https://loremflickr.com/1200/800/mountain%20cottage?random=82734de5',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=cee6ae3f',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=49e578d5',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=68b96f1e',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=b0590e2e',
      'https://loremflickr.com/1200/800/mountain%20cottage?random=7686db60',
    ],
    rooms: [
      {
        name: 'Cloud Suite',
        description: 'A high-floor suite with panoramic glazing, private lounge, and soft mountain fiber bedding.',
        price: 138,
      },
      {
        name: 'Garden Suite',
        description: 'A calm suite with direct garden access, natural textures, and a luxurious rain shower.',
        price: 122,
      },
    ],
    amenities: ['Private dining', 'Yoga terrace', 'Afternoon pastries', 'Nature concierge'],
    attractions: ['Cloud forest trail', 'Tea tasting', 'Secluded waterfall', 'Local monastery'],
    contact: {
      phone: '+91 98765 43212',
      email: 'stay@asherhomestay.com',
      whatsapp: '+91 98765 43212',
      address: 'Emerald Ridge, West Bengal',
    },
    foodHighlights: ['Smoked trout', 'Cedar-spiced desserts'],
  },
]

export const heroSlides = homestays.map((homestay) => ({
  slug: homestay.slug,
  title: homestay.name,
  subtitle: homestay.tagline,
  description: homestay.description,
  image: homestay.mainImage,
}))

export const featuredRooms = [
  {
    title: 'Forest Suite',
    subtitle: 'Luxury room with private balcony and cedar views.',
    image: 'https://loremflickr.com/1200/800/hotel%20room?random=813f0942',
  },
  {
    title: 'Terrace Room',
    subtitle: 'A calming suite with a terrace, fireplace, and garden outlook.',
    image: 'https://loremflickr.com/1200/800/hotel%20room?random=19c1ebcd',
  },
  {
    title: 'Cloud Suite',
    subtitle: 'Elevated luxury with panoramic mountain views.',
    image: 'https://loremflickr.com/1200/800/mountain%20lodge?random=c4e5397d',
  },
]

export const galleryImages = [
  { src: 'https://loremflickr.com/1200/800/mountain%20cottage?random=8538f477', category: 'Homestays', title: 'Pine lounge retreat' },
  { src: 'https://loremflickr.com/1200/800/hotel%20room?random=168e16ae', category: 'Rooms', title: 'Forest suite interior' },
  { src: 'https://loremflickr.com/1200/800/food?random=a94ed4dc', category: 'Food', title: 'Mountain breakfast spread' },
  { src: 'https://loremflickr.com/1200/800/forest?random=22310209', category: 'Nature', title: 'Cedar forest path' },
  { src: 'https://loremflickr.com/1200/800/forest?random=f1324394', category: 'Experiences', title: 'Sunrise forest walk' },
  { src: 'https://loremflickr.com/1200/800/mountain%20cottage?random=8c1b92e3', category: 'Homestays', title: 'Garden view stay' },
]

export const foodItems = [
  {
    id: 'saffron-himalayan-tea',
    name: 'Saffron Himalayan Tea',
    description: 'A warm, fragrant brew made with local saffron and mountain herbs.',
    type: 'Veg',
    rating: 4.9,
    image: 'https://loremflickr.com/1200/800/food?random=b5738e3e',
    servedAt: ['Samthar', 'Suviksha Homestay', 'Asher Homestay'],
  },
  {
    id: 'forest-spice-stew',
    name: 'Forest Spice Stew',
    description: 'A rich stew of root vegetables, lentils, and warming Himalayan spices.',
    type: 'Veg',
    rating: 4.8,
    image: 'https://loremflickr.com/1200/800/food?random=ea3bfec4',
    servedAt: ['Samthar'],
  },
  {
    id: 'cedar-steamed-trout',
    name: 'Cedar-Steamed Trout',
    description: 'Delicate trout steamed over cedar wood with lemon, herbs, and mountain greens.',
    type: 'Non-Veg',
    rating: 4.9,
    image: 'https://loremflickr.com/1200/800/food?random=fc0e52e7',
    servedAt: ['Samthar'],
  },
  {
    id: 'lotus-rice-pilaf',
    name: 'Lotus Rice Pilaf',
    description: 'A fragrant pilaf with jasmine rice, nuts, dried berries, and gentle spice.',
    type: 'Veg',
    rating: 4.7,
    image: 'https://loremflickr.com/1200/800/food?random=c666679e',
    servedAt: ['Samthar'],
  },
  {
    id: 'mountain-berry-crisp',
    name: 'Mountain Berry Crisp',
    description: 'Warm berries with a crisp oat topping, served with a spoonful of cream.',
    type: 'Veg',
    rating: 4.6,
    image: 'https://loremflickr.com/1200/800/food?random=02cd9d3e',
    servedAt: ['Samthar'],
  },
  {
    id: 'herb-noodle-bowl',
    name: 'Herb-Infused Noodle Bowl',
    description: 'Steamed noodles with fresh herbs, crisp vegetables, and a light sesame broth.',
    type: 'Veg',
    rating: 4.7,
    image: 'https://loremflickr.com/1200/800/food?random=02cd9d3e',
    servedAt: ['Suviksha Homestay'],
  },
  {
    id: 'toasted-millet-porridge',
    name: 'Toasted Millet Porridge',
    description: 'Creamy millet porridge with toasted nuts, honey, and warm cinnamon.',
    type: 'Veg',
    rating: 4.6,
    image: 'https://loremflickr.com/1200/800/food?random=4c2013a2',
    servedAt: ['Suviksha Homestay'],
  },
  {
    id: 'ginger-simmered-greens',
    name: 'Ginger-Simmered Greens',
    description: 'Local greens slowly simmered with ginger, garlic, and a hint of mustard seed.',
    type: 'Veg',
    rating: 4.7,
    image: 'https://loremflickr.com/1200/800/food?random=2b0a6d8a',
    servedAt: ['Suviksha Homestay'],
  },
  {
    id: 'smoky-paneer-skewers',
    name: 'Smoky Paneer Skewers',
    description: 'Charred paneer cubes marinated with spices and served with mint chutney.',
    type: 'Veg',
    rating: 4.8,
    image: 'https://loremflickr.com/1200/800/food?random=aa4c4dc7',
    servedAt: ['Suviksha Homestay'],
  },
  {
    id: 'berry-yogurt-parfait',
    name: 'Berry Yogurt Parfait',
    description: 'Layers of creamy yogurt, fresh berries, and crunchy granola.',
    type: 'Veg',
    rating: 4.6,
    image: 'https://loremflickr.com/1200/800/dessert?random=078b025b',
    servedAt: ['Suviksha Homestay'],
  },
  {
    id: 'cloudberry-salad',
    name: 'Cloudberry Salad',
    description: 'A crisp salad of greens, cloudberries, toasted seeds, and citrus dressing.',
    type: 'Veg',
    rating: 4.7,
    image: 'https://loremflickr.com/1200/800/salad?random=1298361f',
    servedAt: ['Asher Homestay'],
  },
  {
    id: 'spiced-lamb-chops',
    name: 'Spiced Lamb Chops',
    description: 'Pan-seared lamb chops with mountain herbs and a smoky glaze.',
    type: 'Non-Veg',
    rating: 4.9,
    image: 'https://loremflickr.com/1200/800/food?random=078b025b',
    servedAt: ['Asher Homestay'],
  },
  {
    id: 'cedar-smoked-fish',
    name: 'Cedar-Smoked Fish',
    description: 'Fillet smoked over cedar, served with lemon and a side of wild greens.',
    type: 'Non-Veg',
    rating: 4.8,
    image: 'https://loremflickr.com/1200/800/seafood?random=89306559',
    servedAt: ['Asher Homestay'],
  },
  {
    id: 'chamomile-panna-cotta',
    name: 'Chamomile Panna Cotta',
    description: 'Silky panna cotta scented with chamomile and topped with honeyed berries.',
    type: 'Veg',
    rating: 4.7,
    image: 'https://loremflickr.com/1200/800/dessert?random=08c6c8a6',
    servedAt: ['Asher Homestay'],
  },
  {
    id: 'wild-mushroom-risotto',
    name: 'Wild Mushroom Risotto',
    description: 'Creamy risotto made with wild mushrooms, fresh herbs, and aged cheese.',
    type: 'Veg',
    rating: 4.8,
    image: 'https://loremflickr.com/1200/800/food?random=02cd9d3e',
    servedAt: ['Asher Homestay'],
  },
]


export const initialReviews = []

export const attractions = [
  'Tea garden viewpoints',
  'Riverbank picnic sites',
  'Vintage village market',
  'Cloud forest trails',
]
