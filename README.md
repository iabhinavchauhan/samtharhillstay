# Samthar Website & Admin CMS Architecture

A modern, database-driven website with a complete Admin Dashboard providing authorized administrators with 100% control over all content, styling, pricing, media, sections, and navigation without touching source code.

---

## 🚀 Quick Start & Running Locally

### 1. Start the Backend API & Database
```bash
cd server
npm install # (if not already installed)
node index.js
```
The backend server runs at `http://localhost:5000` with SQLite persistence (`server/database.sqlite`).
Default administrator credentials:
- **Username:** `admin`
- **Password:** `admin123`

### 2. Start the Frontend Application
```bash
cd client
npm install # (if not already installed)
npm run dev
```
The frontend Vite server runs at `http://localhost:5173`.

---

## 🔑 Administrative Access

- Access the Admin Dashboard directly at: **`/admin`** (or click the subtle "Admin Login" link in the footer).
- Login with your administrator credentials.

---

## 🛠️ Dashboard Capabilities

1. **Dashboard Overview**: Metrics overview, active homestays, menu items, and quick launchpads.
2. **Homepage Sections & Builder**:
   - Manage Hero title, taglines, subheadings, and slideshow images.
   - Reorder and toggle sections (Hero, Homestays, Reasons, Experiences, Destinations, Clusters, Gallery, FAQs, Contact).
   - Edit feature benefits, curated experiences, and attraction clusters.
3. **Homestays & Pricing Management**:
   - Add, edit, and delete homestays.
   - Set currency, starting prices, price labels, and badges.
   - Configure room tiers (e.g. Forest Suite, Cloud Room) and per-room pricing.
   - Update amenities, highlights, and gallery images.
4. **Food & Dining Menu Management**:
   - Manage regional recipes, dishes, and tea rituals.
   - Edit pricing, dietary tags (Veg / Non-Veg), descriptions, and served-at locations.
5. **Theme & Visual Customization Engine**:
   - Color pickers for primary forest brand, gold accents, hover colors, background wash, and body typography.
   - Pre-designed one-click palette presets.
   - Font family pickers (Cinzel, Playfair Display, Plus Jakarta Sans, Lora, Inter).
   - Corner radius sliders for cards and buttons with live specimen previews.
6. **Persistent Media Library**:
   - Upload images and files up to 15MB directly to disk (`server/uploads/`).
   - Image selector modal integrated with every component on the website.
7. **Header, Navigation, Footer & SEO**:
   - Edit logo text, subtitle, and CTA buttons.
   - Add/remove navbar navigation links.
   - Social media links (WhatsApp, Instagram, Phone, Email, Address).
   - SEO meta titles, descriptions, canonical URLs, and OpenGraph social share previews.
8. **Guest Inquiries & Leads Inbox**:
   - View booking requests and contact inquiries submitted by website visitors in real-time.
9. **Admin User Management**:
   - Create and manage authorized admin accounts with bcrypt password hashing and role permissions.
10. **Draft, Preview, Publish & Revisions**:
    - **Draft Isolation:** Changes saved as draft do not leak to public visitors until published.
    - **Live Preview:** View proposed changes in Desktop, Tablet, and Mobile viewport frames.
    - **Publish:** Instantly updates the live public website and saves an audit snapshot.
    - **Revision History:** Revert to any previous revision snapshot in one click.
    - **Full Backup / Restore:** Export full website configuration as a JSON file or restore from a backup file.
    - **Reset to Default:** Safe factory reset button to restore template values.

---

