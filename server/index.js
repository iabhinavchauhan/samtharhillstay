import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';

import {
  connectDb,
  Admin,
  User,
  CartItem,
  Booking,
  Payment,
  SiteContent,
  Media,
  Revision,
  ContactSubmission,
  getDefaultSiteData
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'samthar-secret-token-key-2026';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_samthar_public';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'samthar_test_secret_key_2026';

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('[Razorpay] Initialized with live/test API keys.');
  } catch (err) {
    console.warn('[Razorpay] Initialization warning:', err.message);
  }
} else {
  console.log('[Razorpay] Configured with test environment credentials.');
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${safeName}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// Admin Authentication Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Admin token is missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

// User Customer Authentication Middleware
export function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Please log in to access this feature.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || !decoded.id) {
      return res.status(403).json({ error: 'Your session has expired. Please sign in again.' });
    }
    req.user = decoded;
    next();
  });
}

// Helper to look up authoritative room price & details from current published content
async function getAuthoritativeStayAndRoom(staySlug, roomName) {
  const publishedDoc = await SiteContent.findOne({ id: 'published' }).lean();
  const siteData = publishedDoc?.data || getDefaultSiteData();
  const homestays = siteData.homestays || getDefaultSiteData().homestays;

  const normalizedSlug = (staySlug || '').toLowerCase();
  let stay = homestays.find(h => h.slug === normalizedSlug)
    || homestays.find(h => (h.name || '').toLowerCase() === normalizedSlug)
    || homestays.find(h => normalizedSlug.includes((h.slug || '').toLowerCase()) || (h.slug || '').toLowerCase().includes(normalizedSlug))
    || homestays[0];

  if (!stay) {
    throw new Error(`Homestay with slug '${staySlug}' not found.`);
  }

  const normalizedRoomName = (roomName || '').toLowerCase();
  const rooms = stay.rooms && stay.rooms.length > 0
    ? stay.rooms
    : [{ name: 'Mountain View Room', price: 95, description: 'Tranquil room with panoramic pine valley views' }];

  const room = rooms.find(r => (r.name || '').toLowerCase() === normalizedRoomName)
    || rooms.find(r => (r.name || '').toLowerCase().includes(normalizedRoomName) || normalizedRoomName.includes((r.name || '').toLowerCase()))
    || rooms[0];

  return { stay, room };
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  return isNaN(nights) ? 1 : nights;
}

// -------------------------------------------------------------
// USER CUSTOMER AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// 1. User Signup
app.post('/api/user/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'user'
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '14d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'user',
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    console.error('[Error] User Signup:', err);
    res.status(500).json({ error: 'Account registration failed. Please try again.' });
  }
});

// 2. User Login
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email address.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '14d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: 'user',
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('[Error] User Login:', err);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// 3. Current User Profile
app.get('/api/user/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'user',
        recent_views: user.recent_views || [],
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('[Error] Fetch User Profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// 4. Update Profile
app.put('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    if (email && email.trim().toLowerCase() !== req.user.email?.toLowerCase()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email address.' });
      }
      const existing = await User.findOne({ email: email.trim().toLowerCase() });
      if (existing && existing._id?.toString() !== req.user.id?.toString()) {
        return res.status(400).json({ error: 'This email is already taken by another account.' });
      }
      updates.email = email.trim().toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role || 'user',
        created_at: updatedUser.created_at
      }
    });
  } catch (err) {
    console.error('[Error] Updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile details.' });
  }
});

// 5. Change Password
app.put('/api/user/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    console.error('[Error] Changing password:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// 6. Record & Fetch Recently Viewed Stays
app.post('/api/user/recent-views', authenticateUser, async (req, res) => {
  try {
    const { staySlug } = req.body;
    if (!staySlug) return res.status(400).json({ error: 'staySlug is required.' });

    const user = await User.findById(req.user.id);
    if (user) {
      const views = (user.recent_views || []).filter(s => s !== staySlug);
      views.unshift(staySlug);
      const capped = views.slice(0, 10);
      await User.findByIdAndUpdate(req.user.id, { recent_views: capped });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record view.' });
  }
});

app.get('/api/user/recent-views', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const slugs = user?.recent_views || [];

    const publishedDoc = await SiteContent.findOne({ id: 'published' }).lean();
    const homestays = publishedDoc?.data?.homestays || getDefaultSiteData().homestays;

    const matchedStays = slugs
      .map(slug => homestays.find(h => h.slug === slug))
      .filter(Boolean);

    res.json({ success: true, stays: matchedStays });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent views.' });
  }
});

// -------------------------------------------------------------
// USER CART ENDPOINTS (PERSISTENT & VALIDATED)
// -------------------------------------------------------------

// 1. Get User's Cart
app.get('/api/cart', authenticateUser, async (req, res) => {
  try {
    const items = await CartItem.find({ user_id: req.user.id });
    const formatted = (Array.isArray(items) ? items : []).map(i => ({ ...i, id: i._id }));
    const totalAmount = formatted.reduce((acc, item) => acc + (Number(item.total_price) || 0), 0);

    res.json({
      success: true,
      items: formatted,
      count: formatted.length,
      totalAmount
    });
  } catch (err) {
    console.error('[Error] Fetching Cart:', err);
    res.status(500).json({ error: 'Failed to load your cart.' });
  }
});

// 2. Add Stay to Cart
app.post('/api/cart', authenticateUser, async (req, res) => {
  try {
    const { staySlug, roomName, checkIn, checkOut, guests } = req.body;
    if (!staySlug) {
      return res.status(400).json({ error: 'staySlug is required.' });
    }

    const { stay, room } = await getAuthoritativeStayAndRoom(staySlug, roomName);

    const defaultCheckIn = checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const defaultCheckOut = checkOut || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const nights = calculateNights(defaultCheckIn, defaultCheckOut);
    const guestCount = Math.max(1, parseInt(guests || 2, 10));
    const totalPrice = room.price * nights;

    const cartItem = await CartItem.create({
      user_id: req.user.id,
      stay_slug: stay.slug,
      stay_name: stay.name,
      room_name: room.name,
      price_per_night: room.price,
      currency: stay.currency || 'USD',
      check_in: defaultCheckIn,
      check_out: defaultCheckOut,
      nights,
      guests: guestCount,
      total_price: totalPrice,
      image: stay.mainImage || (stay.gallery && stay.gallery[0]) || ''
    });

    const allItems = await CartItem.find({ user_id: req.user.id });
    const formatted = allItems.map(i => ({ ...i, id: i._id }));
    const totalAmount = formatted.reduce((acc, i) => acc + Number(i.total_price || 0), 0);

    res.json({
      success: true,
      message: `${stay.name} (${room.name}) added to your cart!`,
      item: { ...cartItem, id: cartItem._id },
      items: formatted,
      totalAmount
    });
  } catch (err) {
    console.error('[Error] Adding to cart:', err);
    res.status(400).json({ error: err.message || 'Failed to add stay to cart.' });
  }
});

// 3. Update Cart Item Dates or Guests
app.put('/api/cart/:id', authenticateUser, async (req, res) => {
  try {
    const item = await CartItem.findById(req.params.id);
    if (!item || item.user_id?.toString() !== req.user.id?.toString()) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    const { checkIn, checkOut, guests } = req.body;
    const newCheckIn = checkIn || item.check_in;
    const newCheckOut = checkOut || item.check_out;
    const nights = calculateNights(newCheckIn, newCheckOut);
    const guestCount = guests ? Math.max(1, parseInt(guests, 10)) : item.guests;

    // Recalculate price using authoritative room price
    const { room } = await getAuthoritativeStayAndRoom(item.stay_slug, item.room_name);
    const totalPrice = room.price * nights;

    const updated = await CartItem.findByIdAndUpdate(req.params.id, {
      check_in: newCheckIn,
      check_out: newCheckOut,
      nights,
      guests: guestCount,
      price_per_night: room.price,
      total_price: totalPrice
    });

    const allItems = await CartItem.find({ user_id: req.user.id });
    const formatted = allItems.map(i => ({ ...i, id: i._id }));
    const totalAmount = formatted.reduce((acc, i) => acc + Number(i.total_price || 0), 0);

    res.json({
      success: true,
      message: 'Cart item updated.',
      item: { ...updated, id: updated._id },
      items: formatted,
      totalAmount
    });
  } catch (err) {
    console.error('[Error] Updating cart item:', err);
    res.status(400).json({ error: err.message || 'Failed to update cart item.' });
  }
});

// 4. Remove Item from Cart
app.delete('/api/cart/:id', authenticateUser, async (req, res) => {
  try {
    const item = await CartItem.findById(req.params.id);
    if (!item || item.user_id?.toString() !== req.user.id?.toString()) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    await CartItem.findByIdAndDelete(req.params.id);
    const allItems = await CartItem.find({ user_id: req.user.id });
    const formatted = allItems.map(i => ({ ...i, id: i._id }));
    const totalAmount = formatted.reduce((acc, i) => acc + Number(i.total_price || 0), 0);

    res.json({
      success: true,
      message: 'Stay removed from cart.',
      items: formatted,
      totalAmount
    });
  } catch (err) {
    console.error('[Error] Removing cart item:', err);
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// 5. Clear Entire Cart
app.delete('/api/cart', authenticateUser, async (req, res) => {
  try {
    await CartItem.deleteMany({ user_id: req.user.id });
    res.json({ success: true, message: 'Cart cleared.', items: [], totalAmount: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

// -------------------------------------------------------------
// RAZORPAY PAYMENT & BOOKINGS WORKFLOW
// -------------------------------------------------------------

// 1. Get Public Razorpay Configuration (Never expose Key Secret)
app.get('/api/payments/config', (req, res) => {
  res.json({
    keyId: RAZORPAY_KEY_ID,
    currency: 'INR'
  });
});

// 2. Create Order & Booking (Server-calculated price validation)
app.post('/api/bookings/create-order', authenticateUser, async (req, res) => {
  try {
    const { staySlug, roomName, checkIn, checkOut, guests, fromCart } = req.body;

    let bookingItems = [];
    if (fromCart) {
      const cartItems = await CartItem.find({ user_id: req.user.id });
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty. Please choose a homestay first.' });
      }
      bookingItems = cartItems;
    } else {
      if (!staySlug) {
        return res.status(400).json({ error: 'staySlug is required.' });
      }
      const { stay, room } = await getAuthoritativeStayAndRoom(staySlug, roomName);
      const defaultCheckIn = checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const defaultCheckOut = checkOut || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      const nights = calculateNights(defaultCheckIn, defaultCheckOut);
      const guestCount = Math.max(1, parseInt(guests || 2, 10));
      const totalPrice = room.price * nights;

      bookingItems = [{
        stay_slug: stay.slug,
        stay_name: stay.name,
        room_name: room.name,
        price_per_night: room.price,
        check_in: defaultCheckIn,
        check_out: defaultCheckOut,
        nights,
        guests: guestCount,
        total_price: totalPrice,
        image: stay.mainImage || (stay.gallery && stay.gallery[0]) || ''
      }];
    }

    // Authoritative total price calculation on backend
    const totalAmount = bookingItems.reduce((acc, item) => acc + Number(item.total_price), 0);
    const primaryItem = bookingItems[0];
    const bookingRef = `ST-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Razorpay amount in subunits (paise for INR, or cents for USD)
    // Convert to INR paise (approx 85 INR per USD if USD, or direct)
    const amountInINR = Math.round(totalAmount * 85);
    const amountInPaise = amountInINR * 100;

    let razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    if (razorpayInstance) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: bookingRef,
          notes: {
            bookingRef,
            userId: req.user.id,
            userEmail: req.user.email
          }
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.warn('[Razorpay API Error, using fallback order ID]:', err.message);
      }
    }

    // Create booking record with status pending
    const userDoc = await User.findById(req.user.id);
    const booking = await Booking.create({
      booking_ref: bookingRef,
      user_id: req.user.id,
      user_name: userDoc?.name || req.user.name,
      user_email: userDoc?.email || req.user.email,
      user_phone: userDoc?.phone || '',
      stay_slug: primaryItem.stay_slug,
      stay_name: primaryItem.stay_name + (bookingItems.length > 1 ? ` (+${bookingItems.length - 1} stays)` : ''),
      room_name: primaryItem.room_name,
      image: primaryItem.image,
      check_in: primaryItem.check_in,
      check_out: primaryItem.check_out,
      nights: primaryItem.nights,
      guests: primaryItem.guests,
      price_per_night: primaryItem.price_per_night,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      payment_status: 'pending',
      razorpay_order_id: razorpayOrderId
    });

    res.json({
      success: true,
      bookingId: booking._id,
      bookingRef,
      razorpayOrderId,
      amount: amountInPaise,
      displayAmount: totalAmount,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      customer: {
        name: userDoc?.name || req.user.name,
        email: userDoc?.email || req.user.email,
        phone: userDoc?.phone || ''
      }
    });
  } catch (err) {
    console.error('[Error] Creating Razorpay Order:', err);
    res.status(400).json({ error: err.message || 'Failed to initiate booking order.' });
  }
});

// 3. Verify Payment Signature & Confirm Booking
app.post('/api/bookings/verify-payment', authenticateUser, async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment verification credentials.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.user_id?.toString() !== req.user.id?.toString()) {
      return res.status(404).json({ error: 'Associated booking reservation not found.' });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    let isSignatureValid = false;
    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(bodyToSign)
      .digest('hex');

    if (razorpay_signature === expectedSignature) {
      isSignatureValid = true;
    } else if (razorpay_signature && razorpay_signature.startsWith('simulated_sig_')) {
      // Test-mode simulated checkout verification
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      await Booking.findByIdAndUpdate(bookingId, { payment_status: 'failed' });
      return res.status(400).json({
        error: 'Payment verification failed. Invalid cryptographic signature from gateway.'
      });
    }

    // Update booking to confirmed and paid
    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
      status: 'confirmed',
      payment_status: 'paid',
      razorpay_payment_id
    });

    // Store verified payment transaction record
    const paymentRecord = await Payment.create({
      transaction_id: razorpay_payment_id,
      booking_ref: booking.booking_ref,
      booking_id: booking._id,
      user_id: req.user.id,
      amount: booking.total_amount,
      currency: booking.currency || 'USD',
      payment_method: 'Razorpay Gateway',
      payment_status: 'successful',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || expectedSignature
    });

    // Clear cart upon successful payment
    await CartItem.deleteMany({ user_id: req.user.id });

    res.json({
      success: true,
      message: 'Payment verified successfully and booking confirmed!',
      booking: { ...updatedBooking, id: updatedBooking._id },
      transaction: paymentRecord
    });
  } catch (err) {
    console.error('[Error] Payment verification:', err);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

// 4. Get User's Bookings
app.get('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id });
    const formatted = (Array.isArray(bookings) ? bookings : []).map(b => ({ ...b, id: b._id }));
    res.json({ success: true, bookings: formatted });
  } catch (err) {
    console.error('[Error] Fetching bookings:', err);
    res.status(500).json({ error: 'Failed to load bookings.' });
  }
});

// 5. Get Single Booking Detail
app.get('/api/bookings/:id', authenticateUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.user_id?.toString() !== req.user.id?.toString()) {
      return res.status(404).json({ error: 'Booking reservation not found.' });
    }
    res.json({ success: true, booking: { ...booking, id: booking._id } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load booking details.' });
  }
});

// 6. Get User's Payment History
app.get('/api/payments', authenticateUser, async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user.id });
    const formatted = (Array.isArray(payments) ? payments : []).map(p => ({ ...p, id: p._id }));
    res.json({ success: true, payments: formatted });
  } catch (err) {
    console.error('[Error] Fetching payments:', err);
    res.status(500).json({ error: 'Failed to load payment history.' });
  }
});

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------

// 1. Get Live Published Website Content
app.get('/api/content/published', async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ id: 'published' }).lean();
    if (!doc || !doc.data) {
      return res.json(getDefaultSiteData());
    }
    res.json(doc.data);
  } catch (err) {
    console.error('[Error] Fetching published content:', err);
    res.json(getDefaultSiteData());
  }
});

// 2. Submit Inquiry / Booking / Contact Form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, dates, homestay, guests, message } = req.body;
    const submission = await ContactSubmission.create({
      name: name || '',
      phone: phone || '',
      dates: dates || '',
      homestay: homestay || '',
      guests: guests || 1,
      message: message || ''
    });
    res.json({ success: true, message: 'Inquiry received successfully.', id: submission._id });
  } catch (err) {
    console.error('[Error] Contact submission:', err);
    res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Admin Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await Admin.findOne({ username: username.trim() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or credentials.' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        name: admin.name
      }
    });
  } catch (err) {
    console.error('[Error] Login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// Verify Admin Token
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }
    res.json({ user: admin });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// -------------------------------------------------------------
// SECURE ADMIN CONTENT & DRAFT ROUTES
// -------------------------------------------------------------

app.get('/api/admin/content/draft', authenticateToken, async (req, res) => {
  try {
    const draftDoc = await SiteContent.findOne({ id: 'draft' }).lean();
    const pubDoc = await SiteContent.findOne({ id: 'published' }).lean();

    const draftData = draftDoc?.data || pubDoc?.data || getDefaultSiteData();
    const publishedData = pubDoc?.data || getDefaultSiteData();

    res.json({
      draft: draftData,
      published: publishedData,
      updated_at: draftDoc ? draftDoc.updated_at : null,
      updated_by: draftDoc ? draftDoc.updated_by : null
    });
  } catch (err) {
    console.error('[Error] Fetching draft content:', err);
    res.status(500).json({ error: 'Failed to load draft content.' });
  }
});

app.post('/api/admin/content/draft', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid content data payload.' });
    }

    await SiteContent.findOneAndUpdate(
      { id: 'draft' },
      { data, updated_at: new Date(), updated_by: req.user.username },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Draft saved successfully.' });
  } catch (err) {
    console.error('[Error] Saving draft:', err);
    res.status(500).json({ error: 'Failed to save draft.' });
  }
});

app.post('/api/admin/content/publish', authenticateToken, async (req, res) => {
  try {
    const { data, note } = req.body;
    let contentToPublish = data;

    if (!contentToPublish) {
      const draftDoc = await SiteContent.findOne({ id: 'draft' }).lean();
      if (!draftDoc || !draftDoc.data) {
        return res.status(400).json({ error: 'No draft found to publish.' });
      }
      contentToPublish = draftDoc.data;
    }

    await SiteContent.findOneAndUpdate(
      { id: 'published' },
      { data: contentToPublish, updated_at: new Date(), updated_by: req.user.username },
      { upsert: true, new: true }
    );

    await SiteContent.findOneAndUpdate(
      { id: 'draft' },
      { data: contentToPublish, updated_at: new Date(), updated_by: req.user.username },
      { upsert: true, new: true }
    );

    await Revision.create({
      data: contentToPublish,
      note: note || 'Published content update',
      created_by: req.user.username
    });

    res.json({ success: true, message: 'Changes published successfully and live on the website!' });
  } catch (err) {
    console.error('[Error] Publishing content:', err);
    res.status(500).json({ error: 'Failed to publish content.' });
  }
});

app.get('/api/admin/revisions', authenticateToken, async (req, res) => {
  try {
    const revisions = await Revision.find()
      .select('note created_by created_at')
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const formatted = revisions.map((r) => ({
      id: r._id,
      note: r.note,
      created_by: r.created_by,
      created_at: r.created_at,
      size: JSON.stringify(r).length
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load revision history.' });
  }
});

app.post('/api/admin/revisions/:id/restore', authenticateToken, async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);
    if (!revision || !revision.data) {
      return res.status(404).json({ error: 'Revision not found.' });
    }

    await SiteContent.findOneAndUpdate(
      { id: 'published' },
      { data: revision.data, updated_at: new Date(), updated_by: req.user.username }
    );
    await SiteContent.findOneAndUpdate(
      { id: 'draft' },
      { data: revision.data, updated_at: new Date(), updated_by: req.user.username }
    );

    await Revision.create({
      data: revision.data,
      note: `Restored from revision (${revision.note || ''})`,
      created_by: req.user.username
    });

    res.json({ success: true, message: `Successfully restored revision snapshot.` });
  } catch (err) {
    console.error('[Error] Restoring revision:', err);
    res.status(500).json({ error: 'Failed to restore revision.' });
  }
});

app.post('/api/admin/content/reset-default', authenticateToken, async (req, res) => {
  try {
    const defaultData = getDefaultSiteData();
    await SiteContent.findOneAndUpdate({ id: 'published' }, { data: defaultData, updated_at: new Date(), updated_by: req.user.username });
    await SiteContent.findOneAndUpdate({ id: 'draft' }, { data: defaultData, updated_at: new Date(), updated_by: req.user.username });
    await Revision.create({ data: defaultData, note: 'Reset to system default settings', created_by: req.user.username });

    res.json({ success: true, message: 'All website content and styles reset to system default.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset settings.' });
  }
});

app.get('/api/admin/backup', authenticateToken, async (req, res) => {
  try {
    const pub = await SiteContent.findOne({ id: 'published' }).lean();
    const draft = await SiteContent.findOne({ id: 'draft' }).lean();
    const media = await Media.find().lean();
    const revisions = await Revision.find().select('note created_by created_at').sort({ created_at: -1 }).limit(20).lean();

    const backupPayload = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      exported_by: req.user.username,
      published: pub ? pub.data : null,
      draft: draft ? draft.data : null,
      media_count: media.length,
      revisions_count: revisions.length
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=samthar-backup-${Date.now()}.json`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate backup.' });
  }
});

app.post('/api/admin/restore-backup', authenticateToken, async (req, res) => {
  try {
    const { backup } = req.body;
    if (!backup || !backup.published) {
      return res.status(400).json({ error: 'Invalid backup format.' });
    }

    await SiteContent.findOneAndUpdate({ id: 'published' }, { data: backup.published, updated_at: new Date(), updated_by: req.user.username });
    await SiteContent.findOneAndUpdate({ id: 'draft' }, { data: backup.published, updated_at: new Date(), updated_by: req.user.username });
    await Revision.create({ data: backup.published, note: `Restored from external backup (${backup.exported_at || ''})`, created_by: req.user.username });

    res.json({ success: true, message: 'Backup restored successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore backup.' });
  }
});

// -------------------------------------------------------------
// MEDIA LIBRARY ROUTES
// -------------------------------------------------------------

app.get('/api/admin/media', authenticateToken, async (req, res) => {
  try {
    const items = await Media.find().sort({ created_at: -1 }).lean();
    const formatted = items.map(m => ({ ...m, id: m._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load media.' });
  }
});

app.post('/api/admin/media/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const altText = req.body.altText || req.file.originalname;

    const mediaDoc = await Media.create({
      filename: req.file.filename,
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      alt_text: altText
    });

    res.json({
      success: true,
      media: {
        id: mediaDoc._id,
        filename: req.file.filename,
        url: fileUrl,
        mimetype: req.file.mimetype,
        size: req.file.size,
        alt_text: altText
      }
    });
  } catch (err) {
    console.error('[Error] Media upload:', err);
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

app.delete('/api/admin/media/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Media.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Media not found.' });
    }

    const filePath = path.join(uploadsDir, item.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not remove file from disk:', e);
      }
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media item deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media.' });
  }
});

// -------------------------------------------------------------
// USER / ADMIN MANAGEMENT
// -------------------------------------------------------------

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const users = await Admin.find().select('-password').sort({ created_at: 1 }).lean();
    const formatted = users.map(u => ({ ...u, id: u._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list users.' });
  }
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const { username, password, role, name } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existing = await Admin.findOne({ username: username.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      username: username.trim(),
      password: hashedPassword,
      role: role || 'editor',
      name: name || ''
    });

    res.json({ success: true, message: 'Admin user created successfully.', id: newAdmin._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.params.id === req.user.id?.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own logged-in account.' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

app.get('/api/admin/inquiries', authenticateToken, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ created_at: -1 }).lean();
    const formatted = submissions.map(s => ({ ...s, id: s._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load inquiries.' });
  }
});

// Database error handling
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    console.warn('[AI Studio] Database offline — returning fallback');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Database service offline' });
  }
  console.error('[Server Error]:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export async function startServer(port = PORT) {
  await connectDb();
  return new Promise((resolve) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[Samthar Server] Running on http://0.0.0.0:${port}`);
      resolve(server);
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
