# Wally's NW Soul 🍗

> **Northwest Soul. Real Flavor.**

A modern, high-converting restaurant ordering website built to convert Instagram/Facebook traffic into direct online orders — no DoorDash needed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mamiecotton-cmyk/Restaurant-Solutions)

---

## 🛠 Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe Checkout](https://stripe.com/docs/checkout/quickstart)
- [Vercel](https://vercel.com/) for deployment

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in your Stripe keys in `.env.local`:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> Get your Stripe test keys at [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add your environment variables in the Vercel dashboard
4. Deploy!

---

## 📁 Project Structure

```
app/
  page.tsx              # Landing page
  success/page.tsx      # Order success page
  api/checkout/route.ts # Stripe checkout API
components/
  Hero.tsx              # Hero section with CTA
  Menu.tsx              # Fan favorites menu grid
  MenuCard.tsx          # Individual menu item card
  Story.tsx             # Community story section
  OrderButton.tsx       # Reusable order button
  Footer.tsx            # Footer
```

---

## 🎨 Brand Colors

| Color | Hex |
|-------|-----|
| Gold | `#D4AF37` |
| Deep Red | `#8B0000` |
| Background | `#0a0a0a` |

---

## 📸 Follow Wally's NW Soul

[Instagram @wallys_nw_soul](https://www.instagram.com/wallys_nw_soul/)