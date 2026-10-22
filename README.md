# Amjad

**A full-featured e-commerce store built with Node.js, Express, EJS and MongoDB — production-ready and deployed on [Vercel](https://vercel.com).**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![EJS](https://img.shields.io/badge/Templates-EJS-brightgreen)](https://ejs.co/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000)](https://vercel.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## Overview

Amjad is a server-rendered online store with a complete storefront, customer accounts, a shopping cart with Stripe checkout, and a full admin panel for managing the catalog. It runs anywhere Node.js runs and is configured out of the box for serverless deployment on Vercel.

## Features

### Storefront
- Home page with banners, ads, best-selling, new-arrival and featured product sections
- Product detail pages with images, discounts, reviews and ratings
- Live search with suggestions (`/search`, `/search-suggestion`)
- Category, tag and brand navigation
- Quick-view product modal

### Customer accounts
- Sign up / sign in / sign out with bcrypt password hashing
- E-mail activation flow (Gmail SMTP)
- Profile management
- Cart: add, remove, clear — with a mini-cart in the header
- Wishlist
- Stripe checkout with success/cancel handling
- Product ratings and reviews

### Admin panel (`/{ADMIN_PANEL_PATH}`)
- Dashboard with statistics, activities and top products
- Products: create, edit, delete, image upload (sharp resizing)
- Categories, tags, banners and advertisements management
- Admin accounts and authentication (protected by `adminIsAuth` middleware)

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 22 |
| Web framework | Express 4 |
| Views | EJS templates |
| Database | MongoDB (Mongoose) |
| Sessions | express-session + connect-mongodb-session |
| Security | csurf (CSRF cookies), bcrypt password hashing, signed session cookies |
| Payments | Stripe |
| Images | sharp |
| Mail | nodemailer (Gmail) |
| Hosting | Vercel (serverless functions) |

## Project structure

```
├── api/
│   └── index.js          # Vercel serverless entrypoint (exports the Express app)
├── controller/           # Route controllers (shop, user, admin, auth, errors)
├── middleware/           # auth guards (isAuth, alreadyLoggedIn)
├── models/               # Mongoose schemas (User, Product, Category, Order, ...)
├── routes/               # Express routers (shop, user, admin, auth)
├── utils/                # helpers (mail, image resize, slugs)
├── views/                # EJS templates (storefront + admin)
├── public/               # Static assets served at /public/*
├── app.js                # Express app (exports for Vercel, listens locally)
├── vercel.json           # Vercel routing / function configuration
└── .vercelignore         # files never uploaded to Vercel
```

## Getting started

### 1. Prerequisites
- **Node.js 22+**
- A **MongoDB** database (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_STRING` | ✅ | MongoDB connection string, e.g. `mongodb://localhost:27017/amjad` |
| `SESSION_SECRET` | ✅ | Any long random string used to sign session cookies |
| `ADMIN_PANEL_PATH` | ✅ | URL base of the admin panel, e.g. `admin` → `example.com/admin` |
| `SERVER_URL` | ✅ | Public base URL, e.g. `http://localhost:8080` (used in activation links & Stripe redirects) |
| `PORT` | local | Port for local development (defaults to `8080`) |
| `STRIPE_PRIVATE_KEY` | for checkout | Stripe **secret** key (`sk_...`) |
| `EMAIL` | for e-mail | Gmail address used to send activation e-mails |
| `PASSWORD` | for e-mail | Gmail **app password** (not your login password) |

### 4. Run

```bash
npm run dev     # development, with nodemon
npm start       # production
```

Open http://localhost:8080 — the admin panel is at `http://localhost:8080/<ADMIN_PANEL_PATH>/auth/signin` (create the first admin through the sign-up link on that page).

## Deployment on Vercel

The project is pre-configured for Vercel:

- `api/index.js` exports the Express app as a serverless function — the app never calls `app.listen()` on Vercel.
- `vercel.json` serves everything in `public/` from the CDN, rewrites `/public/*` asset URLs to the static files, and routes all other requests to the Express function.
- Views (`views/**/*`) are explicitly bundled into the function via `functions.includeFiles`.
- Uploads go to `/tmp` on Vercel (see [limitations](#limitations--notes)).

### Option A — CLI

```bash
npm i -g vercel
vercel link        # select/ create the project
vercel env add MONGO_STRING production
vercel env add SESSION_SECRET production
vercel env add ADMIN_PANEL_PATH production
vercel env add SERVER_URL production
# optional: STRIPE_PRIVATE_KEY, EMAIL, PASSWORD
vercel --prod
```

### Option B — GitHub

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/new) → **Import Project** → pick the repo.
3. Add the environment variables above under **Settings → Environment Variables**.
4. Deploy.

> ⚠️ The app **fails fast with a clear error** if `MONGO_STRING`, `SESSION_SECRET`, `ADMIN_PANEL_PATH` or `SERVER_URL` are missing on Vercel — set them before expecting the site to render.

## Limitations & notes

- **Image uploads on Vercel** — serverless filesystems are read-only, so files uploaded through the admin panel land in ephemeral `/tmp` and are lost between invocations. For persistent uploads, plug in object storage (e.g. Vercel Blob / S3) and store that URL instead. Files already present in `public/uploads/` **are** served (they are uploaded with each deployment).
- **Template images** — the original demo images of the UI template (logo, favicon, demo product photos) are not part of this repository; add your own under `public/frontend/assets/images/` (e.g. `logo/logo.jpg`, `favicon/favicon.png`).
- **Currency** — prices are displayed in `BDT` (see the templates) — adjust the currency strings if you need another one.

## Roadmap / ideas

- Persistent upload storage (Vercel Blob)
- Order history & invoice PDFs
- Product reviews with photos
- SEO meta tags & sitemap

## Credits

UI based on the [Ecolife eCommerce HTML template](https://hasthemes.com/) by HasThemes. Backend, features and deployment configuration built for Amjad.

## License

[ISC](https://opensource.org/licenses/ISC) © Amjad
