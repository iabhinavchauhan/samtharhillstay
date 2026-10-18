import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

let isMongoConnected = false;

// 1. Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  name: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// 2. User Schema (Regular Customers)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'user' },
  recent_views: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now }
});

// 3. Site Content Schema (id: 'published' or 'draft')
const siteContentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  data: { type: Object, required: true },
  updated_by: { type: String, default: 'admin' },
  updated_at: { type: Date, default: Date.now }
});

// 4. Media Schema
const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },
  alt_text: { type: String },
  created_at: { type: Date, default: Date.now }
});

// 5. Revision History Schema
const revisionSchema = new mongoose.Schema({
  data: { type: Object, required: true },
  note: { type: String, default: '' },
  created_by: { type: String, default: 'admin' },
  created_at: { type: Date, default: Date.now }
});

// 6. Contact Inquiries Schema
const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  dates: { type: String, default: '' },
  homestay: { type: String, default: '' },
  guests: { type: Number, default: 1 },
  message: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// 7. Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  stay_slug: { type: String, required: true },
  stay_name: { type: String, required: true },
  room_name: { type: String, required: true },
  price_per_night: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  check_in: { type: String, required: true },
  check_out: { type: String, required: true },
  nights: { type: Number, required: true, default: 1 },
  guests: { type: Number, required: true, default: 1 },
  total_price: { type: Number, required: true },
  image: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// 8. Booking Schema
const bookingSchema = new mongoose.Schema({
  booking_ref: { type: String, unique: true, required: true },
  user_id: { type: String, required: true, index: true },
  user_name: { type: String, required: true },
  user_email: { type: String, required: true },
  user_phone: { type: String, default: '' },
  stay_slug: { type: String, required: true },
  stay_name: { type: String, required: true },
  room_name: { type: String, required: true },
  image: { type: String, default: '' },
  check_in: { type: String, required: true },
  check_out: { type: String, required: true },
  nights: { type: Number, required: true, default: 1 },
  guests: { type: Number, required: true, default: 1 },
  price_per_night: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'confirmed' }, // 'confirmed', 'pending', 'cancelled'
  payment_status: { type: String, default: 'paid' }, // 'paid', 'pending', 'failed'
  razorpay_order_id: { type: String, default: '' },
  razorpay_payment_id: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// 9. Payment Schema
const paymentSchema = new mongoose.Schema({
  transaction_id: { type: String, unique: true, required: true },
  booking_ref: { type: String, required: true, index: true },
  booking_id: { type: String, required: true },
  user_id: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  payment_method: { type: String, default: 'Razorpay' },
  payment_status: { type: String, default: 'successful' }, // 'successful', 'pending', 'failed', 'refunded'
  razorpay_order_id: { type: String, default: '' },
  razorpay_payment_id: { type: String, default: '' },
  razorpay_signature: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const MongoAdmin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
const MongoSiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema);
const MongoMedia = mongoose.models.Media || mongoose.model('Media', mediaSchema);
const MongoRevision = mongoose.models.Revision || mongoose.model('Revision', revisionSchema);
const MongoContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
const MongoCartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
const MongoBooking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const MongoPayment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// In-Memory Storage for when MongoDB is offline
const memory = {
  admins: [],
  users: [],
  cartItems: [],
  bookings: [],
  payments: [],
  siteContent: new Map(),
  media: [],
  revisions: [],
  contactSubmissions: []
};

function wrapQuery(val) {
  const p = Promise.resolve(val);
  p.lean = function() {
    return wrapQuery(val ? JSON.parse(JSON.stringify(val)) : null);
  };
  p.select = function(fields) {
    if (!val) return wrapQuery(val);
    const filter = (item) => {
      const copy = { ...item };
      if (typeof fields === 'string' && fields.includes('-password')) {
        delete copy.password;
      }
      return copy;
    };
    const filtered = Array.isArray(val) ? val.map(filter) : filter(val);
    return wrapQuery(filtered);
  };
  p.sort = function(sortObj) {
    if (!Array.isArray(val) || !sortObj) return wrapQuery(val);
    const key = Object.keys(sortObj)[0];
    const dir = sortObj[key] === -1 ? -1 : 1;
    const sorted = [...val].sort((a, b) => {
      const vA = new Date(a[key]).getTime() || a[key] || 0;
      const vB = new Date(b[key]).getTime() || b[key] || 0;
      return (vA > vB ? 1 : vA < vB ? -1 : 0) * dir;
    });
    return wrapQuery(sorted);
  };
  p.limit = function(n) {
    if (!Array.isArray(val)) return wrapQuery(val);
    return wrapQuery(val.slice(0, n));
  };
  return p;
}

export const Admin = {
  findOne(query) {
    if (isMongoConnected) return MongoAdmin.findOne(query);
    const found = memory.admins.find(a => (query.username ? a.username.toLowerCase() === query.username.toLowerCase() : true));
    return wrapQuery(found ? { ...found } : null);
  },
  findById(id) {
    if (isMongoConnected) return MongoAdmin.findById(id);
    const found = memory.admins.find(a => a._id?.toString() === id?.toString());
    return wrapQuery(found ? { ...found } : null);
  },
  find(query) {
    if (isMongoConnected) return MongoAdmin.find(query);
    return wrapQuery(memory.admins.map(a => ({ ...a })));
  },
  async create(data) {
    if (isMongoConnected) return MongoAdmin.create(data);
    const doc = {
      _id: 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...data,
      created_at: new Date()
    };
    memory.admins.push(doc);
    return doc;
  },
  async findByIdAndDelete(id) {
    if (isMongoConnected) return MongoAdmin.findByIdAndDelete(id);
    const idx = memory.admins.findIndex(a => a._id?.toString() === id?.toString());
    if (idx !== -1) memory.admins.splice(idx, 1);
    return { success: true };
  }
};

export const User = {
  findOne(query) {
    if (isMongoConnected) return MongoUser.findOne(query);
    const found = memory.users.find(u => {
      if (query.email) return u.email?.toLowerCase() === query.email?.toLowerCase();
      if (query._id) return u._id?.toString() === query._id?.toString();
      return true;
    });
    return wrapQuery(found ? { ...found } : null);
  },
  findById(id) {
    if (isMongoConnected) return MongoUser.findById(id);
    const found = memory.users.find(u => u._id?.toString() === id?.toString());
    return wrapQuery(found ? { ...found } : null);
  },
  find(query) {
    if (isMongoConnected) return MongoUser.find(query);
    return wrapQuery(memory.users.map(u => ({ ...u })));
  },
  async create(data) {
    if (isMongoConnected) return MongoUser.create(data);
    const doc = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      recent_views: [],
      role: 'user',
      ...data,
      created_at: new Date()
    };
    memory.users.push(doc);
    return doc;
  },
  async findByIdAndUpdate(id, update, options = {}) {
    if (isMongoConnected) return MongoUser.findByIdAndUpdate(id, update, options);
    const idx = memory.users.findIndex(u => u._id?.toString() === id?.toString());
    if (idx === -1) return null;
    memory.users[idx] = { ...memory.users[idx], ...update };
    return { ...memory.users[idx] };
  }
};

export const CartItem = {
  find(query = {}) {
    if (isMongoConnected) return MongoCartItem.find(query);
    const items = memory.cartItems.filter(item => {
      if (query.user_id && item.user_id?.toString() !== query.user_id?.toString()) return false;
      return true;
    });
    return wrapQuery(items.map(i => ({ ...i })));
  },
  findById(id) {
    if (isMongoConnected) return MongoCartItem.findById(id);
    const found = memory.cartItems.find(i => i._id?.toString() === id?.toString());
    return wrapQuery(found ? { ...found } : null);
  },
  async create(data) {
    if (isMongoConnected) return MongoCartItem.create(data);
    const doc = {
      _id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...data,
      created_at: new Date()
    };
    memory.cartItems.push(doc);
    return doc;
  },
  async findByIdAndUpdate(id, update, options = {}) {
    if (isMongoConnected) return MongoCartItem.findByIdAndUpdate(id, update, options);
    const idx = memory.cartItems.findIndex(i => i._id?.toString() === id?.toString());
    if (idx === -1) return null;
    memory.cartItems[idx] = { ...memory.cartItems[idx], ...update };
    return { ...memory.cartItems[idx] };
  },
  async findByIdAndDelete(id) {
    if (isMongoConnected) return MongoCartItem.findByIdAndDelete(id);
    const idx = memory.cartItems.findIndex(i => i._id?.toString() === id?.toString());
    if (idx !== -1) memory.cartItems.splice(idx, 1);
    return { success: true };
  },
  async deleteMany(query = {}) {
    if (isMongoConnected) return MongoCartItem.deleteMany(query);
    if (query.user_id) {
      memory.cartItems = memory.cartItems.filter(i => i.user_id?.toString() !== query.user_id?.toString());
    }
    return { acknowledged: true };
  }
};

export const Booking = {
  find(query = {}) {
    if (isMongoConnected) return MongoBooking.find(query);
    const items = memory.bookings.filter(b => {
      if (query.user_id && b.user_id?.toString() !== query.user_id?.toString()) return false;
      return true;
    });
    return wrapQuery(items.map(b => ({ ...b })));
  },
  findById(id) {
    if (isMongoConnected) return MongoBooking.findById(id);
    const found = memory.bookings.find(b => b._id?.toString() === id?.toString());
    return wrapQuery(found ? { ...found } : null);
  },
  findOne(query) {
    if (isMongoConnected) return MongoBooking.findOne(query);
    const found = memory.bookings.find(b => {
      if (query.booking_ref && b.booking_ref === query.booking_ref) return true;
      if (query.razorpay_order_id && b.razorpay_order_id === query.razorpay_order_id) return true;
      if (query._id && b._id === query._id) return true;
      return false;
    });
    return wrapQuery(found ? { ...found } : null);
  },
  async create(data) {
    if (isMongoConnected) return MongoBooking.create(data);
    const doc = {
      _id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      currency: 'INR',
      status: 'confirmed',
      payment_status: 'paid',
      ...data,
      created_at: new Date()
    };
    memory.bookings.unshift(doc);
    return doc;
  },
  async findByIdAndUpdate(id, update, options = {}) {
    if (isMongoConnected) return MongoBooking.findByIdAndUpdate(id, update, options);
    const idx = memory.bookings.findIndex(b => b._id?.toString() === id?.toString());
    if (idx === -1) return null;
    memory.bookings[idx] = { ...memory.bookings[idx], ...update };
    return { ...memory.bookings[idx] };
  }
};

export const Payment = {
  find(query = {}) {
    if (isMongoConnected) return MongoPayment.find(query);
    const items = memory.payments.filter(p => {
      if (query.user_id && p.user_id?.toString() !== query.user_id?.toString()) return false;
      return true;
    });
    return wrapQuery(items.map(p => ({ ...p })));
  },
  findOne(query) {
    if (isMongoConnected) return MongoPayment.findOne(query);
    const found = memory.payments.find(p => {
      if (query.transaction_id && p.transaction_id === query.transaction_id) return true;
      if (query.booking_ref && p.booking_ref === query.booking_ref) return true;
      return false;
    });
    return wrapQuery(found ? { ...found } : null);
  },
  async create(data) {
    if (isMongoConnected) return MongoPayment.create(data);
    const doc = {
      _id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      payment_method: 'Razorpay',
      currency: 'INR',
      payment_status: 'successful',
      ...data,
      created_at: new Date()
    };
    memory.payments.unshift(doc);
    return doc;
  }
};

export const SiteContent = {
  findOne(query) {
    if (isMongoConnected) return MongoSiteContent.findOne(query);
    const doc = memory.siteContent.get(query.id);
    return wrapQuery(doc ? { ...doc } : null);
  },
  async findOneAndUpdate(query, update, options) {
    if (isMongoConnected) return MongoSiteContent.findOneAndUpdate(query, update, options);
    let doc = memory.siteContent.get(query.id);
    if (!doc) {
      doc = { id: query.id, _id: 'content_' + query.id };
    }
    if (update.data) doc.data = JSON.parse(JSON.stringify(update.data));
    if (update.updated_at) doc.updated_at = update.updated_at;
    if (update.updated_by) doc.updated_by = update.updated_by;
    memory.siteContent.set(query.id, doc);
    return doc;
  }
};

export const Media = {
  find(query) {
    if (isMongoConnected) return MongoMedia.find(query);
    return wrapQuery(memory.media.map(m => ({ ...m })));
  },
  findById(id) {
    if (isMongoConnected) return MongoMedia.findById(id);
    const found = memory.media.find(m => m._id?.toString() === id?.toString());
    return wrapQuery(found ? { ...found } : null);
  },
  async create(data) {
    if (isMongoConnected) return MongoMedia.create(data);
    const doc = {
      _id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...data,
      created_at: new Date()
    };
    memory.media.unshift(doc);
    return doc;
  },
  async findByIdAndDelete(id) {
    if (isMongoConnected) return MongoMedia.findByIdAndDelete(id);
    const idx = memory.media.findIndex(m => m._id?.toString() === id?.toString());
    if (idx !== -1) memory.media.splice(idx, 1);
    return { success: true };
  }
};

export const Revision = {
  find(query) {
    if (isMongoConnected) return MongoRevision.find(query);
    return wrapQuery(memory.revisions.map(r => ({ ...r })));
  },
  findById(id) {
    if (isMongoConnected) return MongoRevision.findById(id);
    const found = memory.revisions.find(r => r._id?.toString() === id?.toString());
    return wrapQuery(found ? { ...found } : null);
  },
  async create(data) {
    if (isMongoConnected) return MongoRevision.create(data);
    const doc = {
      _id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...data,
      created_at: new Date()
    };
    memory.revisions.unshift(doc);
    return doc;
  }
};

export const ContactSubmission = {
  find(query) {
    if (isMongoConnected) return MongoContactSubmission.find(query);
    return wrapQuery(memory.contactSubmissions.map(c => ({ ...c })));
  },
  async create(data) {
    if (isMongoConnected) return MongoContactSubmission.create(data);
    const doc = {
      _id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      ...data,
      created_at: new Date()
    };
    memory.contactSubmissions.unshift(doc);
    return doc;
  }
};

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim()) {
    try {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(uri.trim(), { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
      console.log('[MongoDB] Connected to database successfully.');

      const existingAdmin = await MongoAdmin.findOne({ username: 'admin' });
      if (!existingAdmin) {
        const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await MongoAdmin.create({
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          name: 'Super Administrator'
        });
        console.log('[MongoDB] Created default administrator: admin');
      }

      const publishedContent = await MongoSiteContent.findOne({ id: 'published' });
      if (!publishedContent) {
        const defaultData = getDefaultSiteData();
        await MongoSiteContent.create({ id: 'published', data: defaultData, updated_by: 'system_init' });
        await MongoSiteContent.create({ id: 'draft', data: defaultData, updated_by: 'system_init' });
        await MongoRevision.create({ data: defaultData, note: 'Initial default setup', created_by: 'system_init' });
        console.log('[MongoDB] Seeded default published, draft and base revision in MongoDB.');
      }
      return;
    } catch (err) {
      console.warn('[MongoDB] Connection failed, using in-memory store:', err.message);
      isMongoConnected = false;
    }
  }

  console.log('[AI Studio] Initializing resilient in-memory store for Samthar...');
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  memory.admins = [
    {
      _id: 'admin_default',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: 'Super Administrator',
      created_at: new Date()
    }
  ];

  // Seed sample verified traveler account for immediate demonstration
  const userPassword = await bcrypt.hash('password123', 10);
  const sampleUserId = 'user_traveler_101';
  memory.users = [
    {
      _id: sampleUserId,
      name: 'Rohan Sharma',
      email: 'traveler@samthar.com',
      password: userPassword,
      phone: '+91 98765 43210',
      role: 'user',
      recent_views: ['samthar-hill-stay', 'suviksha-homestay'],
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ];

  // Seed sample booking & payment for the traveler
  const sampleBookingRef = 'ST-829104-M9K';
  const sampleBookingId = 'book_sample_01';
  const sampleTxnId = 'pay_RzP91823901';

  memory.bookings = [
    {
      _id: sampleBookingId,
      booking_ref: sampleBookingRef,
      user_id: sampleUserId,
      user_name: 'Rohan Sharma',
      user_email: 'traveler@samthar.com',
      user_phone: '+91 98765 43210',
      stay_slug: 'samthar-hill-stay',
      stay_name: 'SAMTHAR Hill-Stay',
      room_name: 'Forest Suite',
      image: 'https://thepinegetaways.com/images/homestays/mairung.jpg',
      check_in: '2026-11-10',
      check_out: '2026-11-13',
      nights: 3,
      guests: 2,
      price_per_night: 112,
      total_amount: 336,
      currency: 'USD',
      status: 'confirmed',
      payment_status: 'paid',
      razorpay_order_id: 'order_samp_91023',
      razorpay_payment_id: sampleTxnId,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  memory.payments = [
    {
      _id: 'pay_sample_01',
      transaction_id: sampleTxnId,
      booking_ref: sampleBookingRef,
      booking_id: sampleBookingId,
      user_id: sampleUserId,
      amount: 336,
      currency: 'USD',
      payment_method: 'Razorpay UPI',
      payment_status: 'successful',
      razorpay_order_id: 'order_samp_91023',
      razorpay_payment_id: sampleTxnId,
      razorpay_signature: 'verified_sig_sample',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const defaultData = getDefaultSiteData();
  memory.siteContent.set('published', {
    id: 'published',
    _id: 'content_published',
    data: defaultData,
    updated_by: 'system_init',
    updated_at: new Date()
  });
  memory.siteContent.set('draft', {
    id: 'draft',
    _id: 'content_draft',
    data: defaultData,
    updated_by: 'system_init',
    updated_at: new Date()
  });
  memory.revisions = [
    {
      _id: 'rev_default',
      data: defaultData,
      note: 'Initial default setup',
      created_by: 'system_init',
      created_at: new Date()
    }
  ];
  console.log('[AI Studio] In-memory store ready. Default traveler account: traveler@samthar.com / password123');
}

export function getDefaultSiteData() {
  return {
    theme: {
      primaryColor: '#10281e',
      primaryDark: '#0b1d15',
      accentGold: '#caa34b',
      accentGoldHover: '#d8b85e',
      backgroundColor: '#faf8f1',
      textColor: '#1b2b22',
      fontFamily: 'Inter, sans-serif',
      displayFont: 'Cinzel, serif',
      borderRadius: '20px',
      buttonRadius: '10px'
    },
    seo: {
      siteTitle: 'Samthar Hill-Stay | Peaceful Mountain Homestays in Kalimpong',
      metaDescription: 'A peaceful village homestay nestled among pine forests with emerald valley views in Kalimpong, West Bengal.',
      ogImage: 'https://images.unsplash.com/photo-1615751440098-f4ae06aa209e?auto=format&fit=crop&w=2200&q=85',
      canonicalUrl: 'https://samthar.com',
      keywords: 'Kalimpong homestay, Samthar, hill stay, mountain retreat, West Bengal tourism, Darjeeling, offbeat travel'
    },
    contact: {
      phone: '+91 98046 00910',
      phoneLink: '+919804600910',
      whatsapp: '+91 98046 00910',
      whatsappLink: 'https://wa.me/919804600910',
      email: 'stay@samtharhillstay.com',
      instagram: '@samthar',
      location: 'Kalimpong District, West Bengal',
      address: 'Mairung, Kalimpong Hills, West Bengal 734301',
      brochureUrl: '/samthar-brochure.pdf'
    },
    navigation: {
      logoText: 'Samthar',
      logoSubtitle: 'Kalimpong · West Bengal',
      logoImage: '/samthar-mark.svg?v=2',
      ctaText: 'Book Your Stay',
      ctaLink: '/#contact',
      links: [
        { label: 'Home', to: '/#home', visible: true },
        { label: 'Homestays', to: '/#homestays', visible: true },
        { label: 'Experiences', to: '/#experiences', visible: true },
        { label: 'Explore', to: '/#explore', visible: true },
        { label: 'Gallery', to: '/#gallery', visible: true },
        { label: 'Contact', to: '/#contact', visible: true }
      ]
    },
    footer: {
      aboutText: 'A peaceful mountain stay in an offbeat village in Kalimpong. Come for the views, stay for the slower rhythm of the hills.',
      copyrightText: '© 2026 Samthar. All rights reserved.',
      tagline: 'Made for slower days in the hills ✦',
      exploreLinks: [
        { label: 'Home', href: '/#home' },
        { label: 'Homestays', href: '/#homestays' },
        { label: 'Experiences', href: '/#experiences' },
        { label: 'Gallery', href: '/#gallery' }
      ],
      destinations: ['Darjeeling', 'Sikkim', 'Silk Route', 'Kalimpong Town', 'Lava & Rishyap']
    },
    homepage: {
      sectionsOrder: ['hero', 'stays', 'reasons', 'experiences', 'destinations', 'clusters', 'gallery', 'reviews', 'faq', 'contact'],
      hero: {
        visible: true,
        tagline: 'OFFBEAT KALIMPONG · SLOW RETREATS',
        title: 'Calm hillside stays shaped for slower days and mountain mornings.',
        subtitle: 'Breathe in pine forest air, savor home-cooked Himalayan recipes, and take in rolling cloudscapes from handcrafted hillside verandas.',
        primaryButtonText: 'Book Your Stay',
        primaryButtonLink: '#contact',
        secondaryButtonText: 'Explore Homestays',
        secondaryButtonLink: '#homestays',
        images: [
          'https://images.unsplash.com/photo-1615751440098-f4ae06aa209e?auto=format&fit=crop&w=2200&q=85',
          'https://images.unsplash.com/photo-1763480005970-2eb7653864ce?auto=format&fit=crop&w=2200&q=85',
          'https://images.unsplash.com/photo-1756745887664-cb38d43cc1b0?auto=format&fit=crop&w=2200&q=85',
          'https://images.unsplash.com/photo-1765871319901-0aaafe3f1a2a?auto=format&fit=crop&w=2200&q=85',
          'https://images.unsplash.com/photo-1698235933866-83c6dadeff6d?auto=format&fit=crop&w=2200&q=85'
        ]
      },
      reasons: {
        visible: true,
        heading: 'Why travellers love staying with us',
        subheading: 'Crafted with care, nature, and slow mountain comfort.',
        items: [
          { title: 'Wake up to wide-open views', desc: 'Enjoy peaceful panoramas of forested slopes, rolling ridges and the valley beyond.' },
          { title: 'A smooth journey to the hills', desc: 'Reach your stay by road from NJP, Bagdogra or Siliguri, with local pickup options available.' },
          { title: 'Set out and explore', desc: 'Make a relaxed base for discovering Kalimpong, Sikkim and the winding Silk Route.' },
          { title: 'Care that feels personal', desc: 'Enjoy home-cooked meals and a warm welcome from people who know the hills.' },
          { title: 'Find your quieter corner', desc: 'Stay in peaceful village surroundings and take a break from the busy hill-station pace.' },
          { title: 'Space to feel at home', desc: 'Settle into a comfortable stay suited to couples, families and groups.' }
        ]
      },
      experiences: {
        visible: true,
        heading: 'Curated Hill Experiences',
        subheading: 'Moments to remember across forests, tea gardens, and mountain trails.',
        items: [
          { number: '01', title: 'Mountain mornings', desc: 'Take in the shifting clouds with a cup of tea and a view from the porch.', image: 'https://thepinegetaways.com/images/gallery/experiences-couple-sunrise.jpg', alt: 'Sunrise over the mountains' },
          { number: '02', title: 'Nature escapes', desc: 'Find pine trails, waterfalls and quiet village walks close to your stay.', image: 'https://thepinegetaways.com/images/gallery/views-changey-falls.jpg', alt: 'Changey Falls among the hills' },
          { number: '03', title: 'Scenic photography', desc: 'Catch prayer flags, terraced hills and changing light across the mountains.', image: 'https://thepinegetaways.com/images/gallery/views-kanchenjunga.jpg', alt: 'Kanchenjunga mountain view' },
          { number: '04', title: 'Local food', desc: 'Share fresh, home-cooked meals shaped by the ingredients and recipes of the hills.', image: 'https://thepinegetaways.com/images/gallery/food-generous-spread.jpg', alt: 'A spread of home-cooked food' },
          { number: '05', title: 'Road trips', desc: 'Arrange a local vehicle for day trips towards the Silk Route and Sikkim.', image: 'https://thepinegetaways.com/images/destinations/silk-route.jpg', alt: 'Scenic Silk Route mountain road' },
          { number: '06', title: 'Slow living', desc: 'Leave room in the day for a view, a conversation and a little more rest.', image: 'https://thepinegetaways.com/images/gallery/experiences-porch-chat.jpg', alt: 'A relaxed conversation on the porch' }
        ]
      },
      destinations: {
        visible: true,
        heading: 'Day Trips & Nearby Excursions',
        subheading: 'Explore scenic routes, ancient monasteries, and historic trails.',
        items: [
          {
            name: 'Darjeeling',
            desc: 'Tea country, heritage streets and Himalayan panoramas make this a rewarding day out.',
            image: 'https://thepinegetaways.com/images/destinations/darjeeling.jpg',
            tags: ['Tea gardens', 'Himalayan views', 'Heritage']
          },
          {
            name: 'Sikkim',
            desc: 'Travel towards monasteries, high mountain scenery and a distinct local culture.',
            image: 'https://thepinegetaways.com/images/destinations/sikkim.jpg',
            tags: ['Monasteries', 'Local culture', 'Mountain roads']
          },
          {
            name: 'Silk Route',
            desc: 'Follow a historic mountain road through cloud-level villages and expansive views.',
            image: 'https://thepinegetaways.com/images/destinations/silk-route.jpg',
            tags: ['Scenic drives', 'Adventure', 'Nature']
          }
        ]
      },
      clusters: {
        visible: true,
        heading: 'Attraction Clusters',
        subheading: 'Key viewpoints, heritage landmarks, and valleys across North Bengal.',
        clusters: [
          { title: 'Kalimpong', spots: ['Deolo Hill', 'Durpin Dara', 'Durpin Monastery', 'Mangal Dham', "Dr. Graham's Homes", 'Cactus and Orchid Nurseries', 'Morgan House', 'Lovers Meet View Point'] },
          { title: 'Pedong and Silk Route', spots: ['Damsang Fort', 'Sangchen Dorjee Monastery', 'Rishi Khola', 'Sillery Gaon', 'Icchey Gaon', 'Ramdhura'] },
          { title: 'Lava and Neora Valley', spots: ['Lava Monastery', 'Neora Valley National Park', 'Kolakham', 'Changey Falls', 'Loleygaon', 'Canopy Walk', 'Jhandi Dara', 'Rishop / Tiffin Dara', 'Rachela Pass'] },
          { title: 'Scenic getaways', spots: ['Teesta Valley', 'Samthar', 'Tinchuley', 'Kaffergaon'] },
          { title: 'Zuluk and Old Silk Route', spots: ['Rongli', 'Zuluk', 'Nathang Valley', 'Silent Valley'] }
        ]
      },
      gallerySection: {
        visible: true,
        heading: 'Moments from the Hills',
        subheading: 'Glances into our rooms, food, mountain view decks, and trails.',
        items: [
          { title: 'The Kanchenjunga range', type: 'Views', image: 'https://thepinegetaways.com/images/gallery/views-kanchenjunga.jpg' },
          { title: 'A quiet guest room', type: 'Rooms', image: 'https://thepinegetaways.com/images/gallery/rooms-blue-floral.jpg' },
          { title: 'A generous homemade spread', type: 'Food', image: 'https://thepinegetaways.com/images/gallery/food-generous-spread.jpg' },
          { title: 'A slow sunrise together', type: 'Experiences', image: 'https://thepinegetaways.com/images/gallery/experiences-couple-sunrise.jpg' },
          { title: 'Peaks above the clouds', type: 'Views', image: 'https://thepinegetaways.com/images/gallery/views-clouds.jpg' },
          { title: 'A warm twin-bed room', type: 'Rooms', image: 'https://thepinegetaways.com/images/gallery/rooms-twin-bed.jpg' },
          { title: 'Tea by the campfire', type: 'Food', image: 'https://thepinegetaways.com/images/gallery/food-evening-tea.jpg' },
          { title: 'Forest birdwatching', type: 'Experiences', image: 'https://thepinegetaways.com/images/gallery/experiences-birdwatching.jpg' },
          { title: 'Changey Falls', type: 'Views', image: 'https://thepinegetaways.com/images/gallery/views-changey-falls.jpg' },
          { title: 'A bright single room', type: 'Rooms', image: 'https://thepinegetaways.com/images/gallery/rooms-vibrant-single.jpg' },
          { title: 'Grilled skewers', type: 'Food', image: 'https://thepinegetaways.com/images/gallery/food-grilled-skewers.jpg' },
          { title: 'Porch time in Pradhan Gaon', type: 'Experiences', image: 'https://thepinegetaways.com/images/gallery/experiences-porch-chat.jpg' }
        ]
      },
      faqSection: {
        visible: true,
        heading: 'Frequently Asked Questions',
        subheading: 'Everything you need to know about planning your stay with us.',
        faqs: [
          { question: 'How do we reach Samthar from NJP or Bagdogra?', answer: 'We are situated approximately 3.5 to 4 hours scenic drive from NJP Railway Station and Bagdogra Airport. Private cabs and shared jeeps to Kalimpong can be arranged upon request.' },
          { question: 'Can I book a private guided walk or village trek?', answer: 'Yes! Every homestay offers curated local walks, birdwatching trails, and village explorations guided by warm local hosts.' },
          { question: 'Are meals included with the stay?', answer: 'We offer packages that include wholesome farm-to-table breakfast and hearty home-cooked Himalayan dinners.' },
          { question: 'Is there high-speed Wi-Fi available?', answer: 'Yes, reliable Wi-Fi is available across our properties so you can work remotely while staying immersed in quiet nature.' },
          { question: 'What is the best season to visit?', answer: 'September to May offers clear blue skies and breathtaking snow peak views. The monsoons (June to August) bring lush greenery, mist, and quiet romance.' }
        ]
      }
    },
    homestays: [
      {
        slug: 'samthar-hill-stay',
        name: 'SAMTHAR Hill-Stay',
        location: 'Mairung, Kalimpong',
        tagline: 'A luxury hill stay nestled among pine forests with emerald valley views.',
        description: 'An intimate homestay with handcrafted rooms, refined local cuisine, and slow mornings surrounded by greenery.',
        detail: 'Ideal for slow weekends, family escapes, and unhurried mornings with tea, clouds, and forest air.',
        mainImage: 'https://thepinegetaways.com/images/homestays/mairung.jpg',
        gallery: [
          'https://thepinegetaways.com/images/gallery/views-kanchenjunga.jpg',
          'https://thepinegetaways.com/images/gallery/rooms-blue-floral.jpg',
          'https://thepinegetaways.com/images/gallery/food-generous-spread.jpg',
          'https://thepinegetaways.com/images/gallery/experiences-couple-sunrise.jpg'
        ],
        points: ['Quiet mountain village setting', 'Cloud views from the property', 'Camping and bonfire on request', 'Welcoming for couples and families'],
        amenities: ['Private balconies', 'Fireplace seating', 'Organic breakfast', 'Guided forest walk'],
        attractions: ['Tea plantations', 'Sunrise viewpoints', 'Local spice market', 'Birdwatching trails'],
        priceStarting: 112,
        currency: 'USD',
        priceLabel: 'per night',
        badge: 'Popular Choice',
        rooms: [
          { name: 'Forest Suite', description: 'A luxury suite with woven fabrics, views over cedar trees, and a private terrace.', price: 112 },
          { name: 'River View Suite', description: 'Soft-light interiors, open-air bathroom, and quiet river sounds after sundown.', price: 128 }
        ],
        contact: {
          phone: '+91 98046 00910',
          email: 'stay@samtharhillstay.com',
          whatsapp: '+91 98046 00910',
          address: 'Mairung, Kalimpong Hills, West Bengal'
        }
      },
      {
        slug: 'suviksha-homestay',
        name: 'Suviksha Homestay',
        location: 'Damsang Valley, Kalimpong',
        tagline: 'A warm homestay on a green plateau with calm mountain views.',
        description: 'A cozy hideaway for travelers seeking calm, local homestyle dining, and slow afternoons beneath cedar canopies.',
        detail: 'Best for travellers who want a quieter hill stay with open views, easy mornings, and room to unwind.',
        mainImage: 'https://thepinegetaways.com/images/homestays/damsang-valley.png',
        gallery: [
          'https://thepinegetaways.com/images/gallery/views-clouds.jpg',
          'https://thepinegetaways.com/images/gallery/rooms-twin-bed.jpg',
          'https://thepinegetaways.com/images/gallery/food-evening-tea.jpg'
        ],
        points: ['Valley-facing rooms', 'Open lawn with mountain views', 'Sunrise and sunset outlooks', 'Quiet natural surroundings'],
        amenities: ['Heated floors', 'Evening tea service', 'Private garden', 'Guided village walk'],
        attractions: ['Local pottery village', 'Canyon overlooks', 'Herbal spa treatments', 'Sunset ridge'],
        priceStarting: 98,
        currency: 'USD',
        priceLabel: 'per night',
        badge: 'Valley Vista',
        rooms: [
          { name: 'Meadow Room', description: 'A spacious suite with handcrafted wood furniture and natural light throughout.', price: 98 },
          { name: 'Terrace Room', description: 'Private terrace and refined details designed for couples and quiet recollection.', price: 104 }
        ],
        contact: {
          phone: '+91 98046 00910',
          email: 'hello@suvikshahomestay.com',
          whatsapp: '+91 98046 00910',
          address: 'Damsang Valley, Kalimpong, West Bengal'
        }
      },
      {
        slug: 'asher-homestay',
        name: 'Asher Homestay',
        location: 'Pradhan Gaon, Kalimpong',
        tagline: 'A premium homestay with sweeping cedar vistas and mountain calm.',
        description: 'A calm retreat surrounded by lush hills, pine forests, and serene valley views.',
        detail: 'A cozy base for nature lovers, short getaways, and golden-hour walks through the hills and nearby viewpoints.',
        mainImage: 'https://thepinegetaways.com/images/homestays/pradhan-gaon.jpg',
        gallery: [
          'https://thepinegetaways.com/images/gallery/views-changey-falls.jpg',
          'https://thepinegetaways.com/images/gallery/rooms-wood-paneled.jpg',
          'https://thepinegetaways.com/images/gallery/experiences-bonfire.jpg'
        ],
        points: ['A cozy village experience', 'Forest all around', 'Close to Duka Falls', 'A restful weekend base'],
        amenities: ['Private cedar deck', 'Wood stove heating', 'Himalayan breakfast', 'Forest trail access'],
        attractions: ['Duka Falls', 'Pine Ridge walk', 'Monastery view point'],
        priceStarting: 105,
        currency: 'USD',
        priceLabel: 'per night',
        badge: 'Peaceful Retreat',
        rooms: [
          { name: 'Cloud Suite', description: 'A high-floor suite with panoramic glazing, private lounge, and soft mountain fiber bedding.', price: 105 },
          { name: 'Pine Haven', description: 'Cozy wood-lined room looking straight into tall pine canopies.', price: 118 }
        ],
        contact: {
          phone: '+91 98046 00910',
          email: 'stay@asherhomestay.com',
          whatsapp: '+91 98046 00910',
          address: 'Pradhan Gaon, Kalimpong, West Bengal'
        }
      }
    ]
  };
}
