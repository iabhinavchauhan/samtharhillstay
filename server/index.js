const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  connectDb,
  Admin,
  SiteContent,
  Media,
  Revision,
  ContactSubmission,
  getDefaultSiteData
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'samthar-secret-token-key-2026';

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

// Authentication Middleware
function authenticateToken(req, res, next) {
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
    res.status(500).json({ error: 'Failed to retrieve website content.' });
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
// AUTHENTICATION ROUTES
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

// Verify Current Token / Profile
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

// 1. Get Draft Content (Admin Editor)
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

// 2. Save Draft
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

// 3. Publish Changes
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

    // Update published content
    await SiteContent.findOneAndUpdate(
      { id: 'published' },
      { data: contentToPublish, updated_at: new Date(), updated_by: req.user.username },
      { upsert: true, new: true }
    );

    // Sync draft content
    await SiteContent.findOneAndUpdate(
      { id: 'draft' },
      { data: contentToPublish, updated_at: new Date(), updated_by: req.user.username },
      { upsert: true, new: true }
    );

    // Add to revision history
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

// 4. Revisions Management
app.get('/api/admin/revisions', authenticateToken, async (req, res) => {
  try {
    const revisions = await Revision.find()
      .select('note created_by created_at')
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const formatted = revisions.map((r, index) => ({
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

// 5. Restore Revision
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

// 6. Reset to Factory Default
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

// 7. Full Backup (Export JSON) & Restore (Import JSON)
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

// 1. Get All Media
app.get('/api/admin/media', authenticateToken, async (req, res) => {
  try {
    const items = await Media.find().sort({ created_at: -1 }).lean();
    const formatted = items.map(m => ({ ...m, id: m._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load media.' });
  }
});

// 2. Upload New Media File
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

// 3. Delete Media Item
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

// Inquiries / Leads Route
app.get('/api/admin/inquiries', authenticateToken, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ created_at: -1 }).lean();
    const formatted = submissions.map(s => ({ ...s, id: s._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load inquiries.' });
  }
});

// Start Express Server with MongoDB
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[MERN Stack Server] Running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('[MongoDB Connection Error]:', err);
});
