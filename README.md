# Samthar Website & Admin CMS Architecture

A modern, database-driven website with a complete Admin Dashboard providing authorized administrators with 100% control over all content, styling, pricing, media, sections, and navigation without touching source code.

---

## 🚀 Quick Start & Running Locally

### 1. Start the Backend API & Database
```bash
cd server
npm install # (if not already installed)
npm start
```
The backend listens on the platform-provided `PORT` (5000 locally when set in `server/.env`). Site content and app data use MongoDB configured through `MONGODB_URI`.

### 2. Start the Frontend Application
```bash
cd client
npm install # (if not already installed)
npm run dev
```
The frontend Vite server runs at `http://localhost:3000` and proxies API requests to the backend on port 5000.

## Production deployment

- Deploy the `server` directory as the Render web service. Use `npm install` as the build command and `npm start` as the start command. Render supplies `PORT`; configure `MONGODB_URI` and the other server credentials in Render's environment settings.
- Deploy the frontend to Cloudflare Pages from the repository root with build command `npm ci && npm run build` and output directory `client/dist`.
- In Cloudflare Pages, set `VITE_API_BASE_URL` to the Render service origin, for example `https://your-service-name.onrender.com`. Use the actual Render hostname, without a trailing slash or `/api` suffix, then trigger a new Pages deployment. The frontend appends `/api/...` paths to this origin.
- For local frontend development from `client`, Vite proxies `/api` requests to `http://localhost:5000`; set `PORT=5000` in `server/.env` or override the Vite proxy target.

---

## 🔑 Administrative Access

- Access the Admin Dashboard directly at: **`/admin`** (or click the subtle "Admin Login" link in the footer).
- Login with your administrator credentials.

---

## 🛠️ Dashboard Capabilities

1. **Dashboard Overview**: Metrics overview, active homestays, menu items, and quick launchpads.
2. **Homepage Sections & Builder**:
   - Manage Hero title, taglines, subheadings, and slideshow images.
   - Reorder and toggle sections (Hero, Homestays, Reasons, Experiences, Destinations, Clusters, Gallery, Contact).
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

