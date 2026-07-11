# Maison Lumière — Luxury Restaurant Site with Online Ordering

A hyperactive, two-page fine-dining website with a **fully operational client-side
ordering system** — cart, quantities, a multi-step checkout, and order confirmation —
plus live WebGL 3D, procedural fire/ember atmosphere, and a drop-in cooking-video hero.

---

## ▸ Quick start

No build step, no installs.

1. Unzip the folder.
2. **Serve it locally** (recommended so fonts, the 3D CDN, and the cart all behave):
   ```bash
   cd maison-lumiere
   python3 -m http.server 8000     # visit http://localhost:8000
   ```
   You can also just double-click `index.html`, but a local server is closer to a
   real deployment.

---

## ▸ The ordering system (operational)

It works like a real deployed site:

- **Add to order** from the home signature dishes, the tasting card, or any of the
  **38 menu items** — each "Add" flies a chip into the cart and bumps the live count.
- **Cart drawer** (the bag icon, top-right) — change quantities, remove items, see a
  running **subtotal, HST (13%), and total**.
- **Checkout** — a 4-step flow: review → your details (pickup/delivery, date, time,
  address, notes, with validation) → payment → an **order-confirmation screen** with a
  generated order number and ETA.
- **Persistence** — the cart is saved in `localStorage`, so it survives moving between
  Home and Menu and reloading the page.

### Connecting real payments
Checkout payment is a **clearly-labelled placeholder** — no card details are collected
and no charge is made. To take live payment, wire **Stripe**, **Square**, or your POS
into the "Place Order" handler in `assets/js/main.js` (the `data-place-order` branch).
The tax rate (13% HST) and the $9 delivery fee live at the top of `assets/js/cart.js`.

### Editing the menu
Everything is driven by one file: **`assets/js/menu-data.js`**. Add, remove, re-price,
or re-tag items there — the menu page and the cart both update automatically.

### Reservations (booking form)
The **Reservations** link and any **Reserve a Table** button open a booking modal:
party size + day/time dropdowns (built from the same open-hours schedule), name, email,
**optional** phone, and special requests — ending in a confirmation with a reservation
number (`MR-XXXX-YY`). Parties of 9+ are routed to call.

### Tipping & order summary
The payment step has a **tip selector** (None / 10% / 15% / 20% / Custom $) that updates
the total live. The confirmation screen shows an **itemized recap** — every line item,
subtotal, delivery, HST, tip, grand total — plus any **notes for the kitchen**.

### The schedule (dropdowns)
Open days/hours that drive every date & time dropdown live in the **`RESTAURANT`** block
at the bottom of `assets/js/menu-data.js` (`openDays`, `openTime`, `closeTime`,
`slotMinutes`, `leadMinutes`). Change them and the whole order/booking flow follows.

---

## ▸ The cooking-video hero (and the Pinterest question)

You asked for **Pinterest cooking videos** in the hero. That specific source isn't
possible to ship: this build environment has no internet, and scraping or re-hosting
Pinterest's videos would violate their terms and copyright. So the hero is built to do
it the legitimate way, two options:

**Option A — drop in a video file** (looks most like a real site):
```
assets/video/hero-cooking.mp4   → full-screen hero background
assets/video/ambience.mp4       → the "An evening, slowed down" band
```

**Option B — use a web cooking video via YouTube** (the legit way to use an online clip
as a hero). In `index.html`, set the ID:
```html
<script>window.HERO_VIDEO = { youtubeId: "YOUR_YOUTUBE_ID" };</script>
```
The hero then plays that video muted, looped, and cover-cropped behind the 3D layer.

Either way, the **3D dust + procedural embers play underneath**, so the hero looks
alive even with no video at all.

> Free, license-cleared clips: **Pexels Videos**, **Coverr**, **Mixkit**, **Mazwai**.
> Search: *"flame grill steak", "searing", "flambé", "pouring sauce", "candlelit
> restaurant", "chef plating".* Use muted 1080p loops under 10 MB.

---

## ▸ What's animated ("hyperactive")

3D rotating gilded form + golden dust with mouse parallax · procedural embers & steam ·
pulsing candle glow · letter-by-letter title · **scroll-progress bar** · **magnetic
buttons** · blur-to-sharp scroll reveals · 3D-tilt dish cards · cuisine marquee ·
gold-shimmer headings · **fly-to-cart** animation · cart-count bounce · sliding cart
drawer · animated multi-step checkout modal · toast notifications. All respect
`prefers-reduced-motion`; layout is responsive to mobile.

---

## ▸ Folder structure

```
maison-lumiere/
├── index.html              Home — hero, dishes (orderable), ambience, reserve
├── menu.html               Le Menu — full orderable menu + tasting card
├── README.md               This file
└── assets/
    ├── css/
    │   ├── main.css         Tokens, layout, motion
    │   └── order.css        Cart drawer, checkout modal, toasts, add buttons
    ├── js/
    │   ├── menu-data.js     ← the menu (edit items/prices here)
    │   ├── cart.js          Ordering engine (localStorage, tax, fees)
    │   ├── three-scene.js   WebGL 3D hero
    │   ├── background-fx.js  Embers/steam + optional YouTube hero
    │   └── main.js          Menu render, drawer, checkout, all interactions
    ├── video/               ← drop hero-cooking.mp4 / ambience.mp4
    ├── images/              ← drop dish & room photography
    └── fonts/               (Google Fonts CDN by default)
```

---

## ▸ Deploying

Pure static HTML/CSS/JS — host on **Netlify, Vercel, GitHub Pages, Cloudflare Pages,
or any static host**. Drag the folder in, or `git push`. The cart works on the live
site exactly as it does locally.

## ▸ Rebrand in 3 edits
1. **Name** — replace `Maison Lumière` across both HTML files.
2. **Colors** — edit the `:root` tokens in `assets/css/main.css`.
3. **Menu** — edit `assets/js/menu-data.js`.

## ▸ Tech notes
- **Three.js r128** via cdnjs (needs internet on the viewer's machine; download
  `three.min.js` locally and repoint the `<script>` for fully offline 3D).
- Fonts: Cormorant Garamond + Jost via Google Fonts.
- Scripts use plain globals (no ES modules), so the cart even works from `file://`.
