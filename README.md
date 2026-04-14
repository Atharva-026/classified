# StyleSense AI — Real-Time AI Fashion Advisor

<div align="center">

![StyleSense AI](./src/assets/background_image2.jpeg)

### *Fashion intelligence that knows who you are*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-classifiedstylesense--ai.vercel.app-d4af5c?style=for-the-badge&logo=vercel)](https://classifiedstylesense-ai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Atharva--026%2Fclassified-181717?style=for-the-badge&logo=github)](https://github.com/Atharva-026/classified)
[![Blog](https://img.shields.io/badge/Blog-Read%20on%20Hashnode-2962FF?style=for-the-badge&logo=hashnode)](https://atharva.hashnode.dev)

*Built for the **Vision Possible: Agent Protocol Hackathon** by WeMakeDevs × Stream*

</div>

---

## What is StyleSense AI?

StyleSense AI is a **two-sided AI fashion platform** that uses real-time Vision AI to detect a customer's body type through their webcam and instantly recommend outfits from actual local store inventory — powered by Vision Agents SDK, MediaPipe Pose, and Groq/LLaMA.

No generic catalogues. No quiz-based approximations. Real body intelligence matched to real products available right now.

---

## System Architecture

![System Architecture](<./src/assets/AI Fashion App - System Architecture.jpg>)

### Body Type Classification

![Body Type Classification](<./src/assets/AI Fashion App - Body Type Classification.jpg>)

---

## Key Features

### Customer Portal (`/customer`)
- **Real-time body detection** — MediaPipe Pose detects 33 body landmarks at 60fps
- **5 body type archetypes** — Hourglass, Pear, Apple, Rectangle, Inverted Triangle
- **AI-powered suggestions** — Groq/LLaMA reasons about which items flatter your specific body type
- **Real inventory matching** — suggestions come from actual store products, not generic recommendations
- **Store attribution** — every product card shows which store carries the item
- **Style preferences** — filter by occasion, season, and style preference
- **Styling tips** — personalized advice on what to wear and what to avoid

### Store Portal (`/store`)
- **Store registration** — any store can sign up and list their inventory
- **Full inventory management** — add, edit, delete, toggle stock status
- **Image upload** — product photos stored on Supabase Storage
- **Body type tagging** — staff tag which body types each item flatters
- **Multi-store support** — each store has isolated inventory
- **JWT authentication** — secure login with bcrypt password hashing

### Landing Page (`/`)
- **Luxury editorial UI** — dark gold aesthetic matching high-fashion brands
- **Animated hero** — cycling gold wireframe backgrounds with parallax scroll
- **Cursor glow effect** — subtle radial gradient following mouse movement
- **Fully responsive** — works on all screen sizes

---

## Why StyleSense AI Beats the Competition

| Feature | StyleSense AI | Generic Fashion Apps | Quiz-Based Style Apps |
|---|---|---|---|
| Real-time body detection | ✅ Webcam + MediaPipe | ❌ None | ❌ Static quiz |
| Actual store inventory | ✅ Live Supabase DB | ❌ Global marketplace | ❌ Affiliate links |
| Body type intelligence | ✅ 33 landmark analysis | ❌ Size filters only | ⚠️ Approximation |
| Store attribution | ✅ Shows store per item | ❌ Anonymous | ❌ N/A |
| Two-sided platform | ✅ Customer + Store portals | ❌ Customer only | ❌ Customer only |
| Privacy | ✅ All analysis in browser | ⚠️ Data collected | ⚠️ Data collected |
| LLM reasoning | ✅ Explains why it works | ❌ Tag matching | ❌ Rule engine |
| Free to use | ✅ Completely free | ⚠️ Freemium | ⚠️ Subscription |

---

## Tech Stack

### Frontend
- **React 18** + Vite — fast development and production builds
- **Tailwind CSS v4** — utility-first styling with `@tailwindcss/vite` plugin
- **React Router v6** — client-side routing for multi-page experience
- **MediaPipe Pose** — 33-point body landmark detection via CDN

### Backend
- **Express.js** — lightweight Node.js API server
- **JWT + bcryptjs** — secure authentication and password hashing
- **Multer** — multipart form handling for image uploads
- **Groq SDK** — LLaMA 3.3 70B inference at 14,400 requests/day free

### Database & Storage
- **Supabase PostgreSQL** — inventory and staff data
- **Supabase Storage** — product image hosting with public CDN URLs

### AI & Vision
- **Vision Agents SDK by Stream** — real-time video infrastructure, <30ms latency
- **MediaPipe Pose** — Google's body landmark detection model
- **Groq / LLaMA 3.3 70B** — LLM reasoning for fashion recommendations

### Deployment
- **Vercel** — frontend hosting with automatic GitHub deployments
- **Render** — backend Express server hosting

---

## Project Structure

```
stylesense-ai/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx        # Hero, features, how it works
│   │   ├── CustomerPage.jsx       # Webcam + suggestions interface
│   │   ├── StorePage.jsx          # Inventory management dashboard
│   │   ├── StoreLogin.jsx         # Staff login page
│   │   └── StoreRegister.jsx      # New store registration
│   ├── components/
│   │   ├── WebcamFeed.jsx         # MediaPipe Pose integration
│   │   ├── SuggestionPanel.jsx    # AI recommendations display
│   │   ├── ProductCard.jsx        # Individual product display
│   │   └── AddItemModal.jsx       # Add inventory item form
│   ├── utils/
│   │   ├── bodyTypeClassifier.js  # Shoulder/hip ratio classification
│   │   ├── claudeService.js       # Groq API integration
│   │   └── supabase.js            # Supabase client
│   ├── assets/                    # Background images + diagrams
│   ├── App.jsx                    # Routes configuration
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles + animations
├── server.js                      # Express API server
├── render.yaml                    # Render deployment config
├── vite.config.js                 # Vite configuration
├── package.json
└── .env                           # Environment variables (not committed)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account (free)
- A Groq account (free)

### 1. Clone the Repository
```bash
git clone https://github.com/Atharva-026/classified.git
cd classified
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

Go to [supabase.com](https://supabase.com) and create a new project. Then run this SQL in the Supabase SQL Editor:

```sql
-- Create inventory table
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  occasion TEXT[] DEFAULT '{}',
  body_types TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  description TEXT,
  sizes TEXT[] DEFAULT '{"S","M","L","XL"}',
  in_stock BOOLEAN DEFAULT true,
  store_name TEXT DEFAULT 'StyleSense Store',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create staff table
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  store_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create default admin account (password: stylesense123)
INSERT INTO staff (username, password_hash, store_name)
VALUES ('admin', '$2b$10$CV19c6pXMXp6eABcn87J9./4dc81/.J/..chXtK5MgL7/3/Q9PEAa', 'StyleSense Store');
```

Create a Storage bucket named `product-images` and set it to **public**.

### 4. Get a Groq API Key
Go to [console.groq.com](https://console.groq.com) → API Keys → Create API Key → set expiry to **No Expiration**

### 5. Create Environment Variables

Create a `.env` file in the project root:

```env
# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Auth
STAFF_JWT_SECRET=your_secret_key_here
```

### 6. Run the Development Server

You need **two terminals** running simultaneously:

**Terminal 1 — Backend API:**
```bash
node server.js
```
Server starts at `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
npm run dev
```
App opens at `http://localhost:5173`

### 7. Access the App

| URL | Description |
|---|---|
| `http://localhost:5173` | Landing page |
| `http://localhost:5173/customer` | Customer portal (webcam) |
| `http://localhost:5173/store/login` | Store staff login |
| `http://localhost:5173/store/register` | Register new store |
| `http://localhost:5173/store` | Store dashboard |

**Default login credentials:**
```
Username: admin
Password: stylesense123
```

---

## How the Body Type Detection Works

StyleSense uses MediaPipe Pose to detect 33 body landmarks in real-time. The classifier uses 4 key points:

```javascript
// Key landmarks used
Point 11 → Left Shoulder
Point 12 → Right Shoulder
Point 23 → Left Hip
Point 24 → Right Hip

// Classification logic
const shoulderWidth = distance(landmarks[11], landmarks[12])
const hipWidth = distance(landmarks[23], landmarks[24])
const ratio = shoulderWidth / hipWidth

if (ratio > 1.2)                    → Inverted Triangle 🔺
if (ratio >= 0.9 && ratio <= 1.1)   → Hourglass ⌛
if (ratio < 0.85)                   → Pear 🍐
if (wideWaist)                      → Apple 🍎
else                                → Rectangle ▬
```

**Tips for best detection accuracy:**
- Stand 1.5–2 meters from the camera
- Ensure full body is visible in frame
- Wear fitted clothing for accurate landmark detection
- Good lighting helps significantly

---

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add all 4 environment variables
6. Deploy

### Frontend (Vercel)

1. Update all API URLs in frontend from `localhost:3001` to your Render URL
2. Go to [vercel.com](https://vercel.com) → Add New Project
3. Import your GitHub repo
4. Settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Supabase environment variables
6. Deploy

---

## API Endpoints

### Public Endpoints
```
GET  /api/inventory              Get all in-stock inventory
GET  /api/inventory?body_type=X  Filter by body type
GET  /api/inventory?occasion=Y   Filter by occasion
POST /api/staff/login            Staff login → returns JWT
POST /api/staff/register         Register new store
POST /api/fashion                AI styling suggestions
```

### Protected Endpoints (requires JWT)
```
POST   /api/inventory            Add inventory item
DELETE /api/inventory/:id        Delete item
PATCH  /api/inventory/:id/stock  Toggle stock status
```

---

## Environment Variables Reference

| Variable | Description | Where to get |
|---|---|---|
| `GROQ_API_KEY` | Groq LLM API key | console.groq.com |
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase dashboard → Settings → API |
| `STAFF_JWT_SECRET` | Secret for JWT signing | Any random string |

---

## Roadmap

- [ ] Virtual try-on using ControlNet + detected body pose (GAN-based)
- [ ] React Native mobile app using Vision Agents mobile SDK
- [ ] Store analytics — which body types is your inventory missing?
- [ ] Multi-language styling advice
- [ ] AI outfit builder — mix and match items from multiple stores
- [ ] Customer style history — remember past recommendations

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Stream** — Vision Agents SDK for real-time video infrastructure
- **WeMakeDevs** — Vision Possible: Agent Protocol Hackathon
- **Google** — MediaPipe Pose for body landmark detection
- **Groq** — Ultra-fast LLaMA inference API
- **Supabase** — Open source Firebase alternative
- **Ian Goodfellow et al.** — Original GAN paper (NeurIPS 2014)

---

<div align="center">

Built with ❤️ for the **Vision Possible: Agent Protocol Hackathon**

**[Live Demo](https://classifiedstylesense-ai.vercel.app)** · **[Blog Post](https://atharva.hashnode.dev)** · **[Vision Agents SDK](https://github.com/GetStream/vision-agents)**

</div>