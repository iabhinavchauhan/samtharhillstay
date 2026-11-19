<div align="center">

# Samthar Hill-Stay

### A quiet mountain escape, with a website and admin dashboard made to match.

![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Built%20with-Vite-8B5CF6?style=for-the-badge&logo=vite&logoColor=white)

**A full-stack homestay site for Samthar, Kalimpong**<br>
Explore stays, manage reservations, and update the public website through a secure CMS.

</div>

---

## ✨ What’s inside

| 🌿 Guest experience | 🎛️ Admin CMS |
|:--|:--|
| Browse homestays, rooms, food, experiences, destinations, and reviews | Edit homepage sections, stays, room rates, menus, navigation, and footer |
| Save stays to a cart and continue to checkout | Save drafts, preview changes, publish, and restore revisions |
| Child under age 6 is charged half the per guest rate; age 6 and above is full rate | Manage guest reviews, inquiries, media, themes, and admin accounts |
| See public content and reviews sync automatically while the site is open | Changes are served from the backend and stored in MongoDB |

---

## 🚀 Run locally

### 1. Start the API

The server reads configuration from `server/.env`. For local development, set at least:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret_for_local_development
```

Then start the backend:

```bash
cd server
npm install
npm start
```

The API is available at `http://localhost:5000`.

### 2. Start the website

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000**. Vite proxies `/api` requests to the local backend on port `5000`.

> **Using the root dev script?** `npm run dev` from the repository root starts the combined app through `server.js` on port `3000`.

---

## 🔐 Environment settings

Configure these in `server/.env` for local work and in your hosting provider for deployment.

| Variable | Purpose |
|:--|:--|
| `PORT` | API port; commonly `5000` locally. |
| `MONGODB_URI` | MongoDB connection string. |
| `MONGODB_DB_NAME` | Optional database name; otherwise the URI name or `samthar_db` is used. |
| `JWT_SECRET` | Signing secret for authentication tokens. Use a unique random value of at least 32 characters in production. |
| `ADMIN_PASSWORD` | Optional initial admin password when creating the first admin; use a unique value of at least 12 characters. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional credentials for live Razorpay checkout. Without valid credentials, checkout uses the built-in simulation mode. |
| `ALLOW_EPHEMERAL_DB` | Local development only: set to `true` to allow temporary in-memory storage without MongoDB. |
| `VITE_API_BASE_URL` | Frontend production setting: the API origin, without `/api` or a trailing slash. |

Production startup requires a MongoDB connection and a strong `JWT_SECRET`.

---

## 🧰 Useful commands

Run these from the repository root unless noted.

| Command | What it does |
|:--|:--|
| `npm run dev` | Start the combined local app. |
| `npm run build` | Build the client into `client/dist`. |
| `npm run lint` | Lint the client source. |
| `npm test` | Run the server API integration tests. |

To run just the API, use `npm start` inside `server`. To run the standalone client, use `npm run dev` inside `client`.

---

## 🗂️ Project layout

```text
.
├── client/                 # React website, admin dashboard, and Vite config
│   └── src/
│       ├── admin/           # CMS tools and admin authentication
│       ├── components/      # Shared site components
│       ├── context/         # Site, guest, and app state
│       └── pages/           # Public pages and guest dashboard
├── server/                 # Express API, MongoDB models, and integration tests
├── server.js               # Combined app entry point for local and production use
├── package.json            # Root scripts and dependencies
└── README.md
```

---

## 🏡 Admin dashboard

Visit **`/admin`** and sign in with an administrator account. The dashboard includes:

- Homepage content, section order, homestays, room tiers, pricing, and food menus
- Theme colors, fonts, navigation, footer, contact details, and SEO settings
- Media uploads and guest inquiry/review management
- Draft editing, responsive live preview, publishing, revision history, and backup/restore
- Admin account management and payment gateway settings

Draft changes stay private until published. Published site content and public reviews refresh automatically on open pages.

---

## ☁️ Deployment

### Backend — Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Configure `MONGODB_URI` and a unique `JWT_SECRET` (at least 32 characters). Set `MONGODB_DB_NAME` if the existing database name is not in the URI.
- `/api/health` should report MongoDB persistence as `mongodb`.

### Frontend — Cloudflare Pages

- Root directory: repository root
- Build command: `npm ci && npm run build`
- Output directory: `client/dist`
- Set `VITE_API_BASE_URL` to the Render service origin, such as `https://your-service.onrender.com`.

---

<div align="center">

**Samthar Hill-Stay** · Made for slower days in the hills 🌲

</div>
