# RoadSOS AI

**AI-Powered Offline Emergency Intelligence System for Road Accidents**

> Built for the IIT Madras National Road Safety Hackathon 2026

RoadSOS AI is an offline-first emergency response platform that helps accident victims and bystanders during the critical **Golden Hour** after road accidents. It combines AI assistance, GPS routing, accident severity prediction, BLE emergency relay, and voice interaction into a single deployable emergency coordination system.

---

## Features

### Emergency SOS System
- One-tap **HELP NOW** button with animated emergency UI
- Voice-activated emergency mode (say "HELP" or "SOS")
- Auto GPS capture and nearest hospital identification
- Emergency contact notification
- Real-time emergency timer

### AI Emergency Assistant
- Conversational AI powered by OpenAI (GPT-4o-mini)
- Multilingual support: English, Hindi, Telugu, Tamil, Nepali
- Voice interaction (Speech-to-Text + Text-to-Speech)
- Offline fallback with cached emergency guidance
- Quick prompts for common emergency questions

### GPS Emergency Routing
- Interactive map with OpenStreetMap + Leaflet.js
- Nearby hospitals, trauma centers, police stations
- Distance calculation and route visualization
- One-tap calling for emergency facilities

### Accident Severity Prediction
- Image upload for AI-based severity estimation
- Severity classification: LOW / MEDIUM / HIGH
- Confidence scoring and recommended actions
- Emergency escalation triggers (YOLOv8 model architecture, simulated for demo)

### Offline-First Architecture
- Progressive Web App (PWA) — installable on mobile
- Service Worker for offline caching and API fallback
- IndexedDB for local hospital and emergency data storage
- Background sync for queued emergency requests

### BLE Emergency Relay
- Bluetooth Low Energy device discovery
- Emergency packet broadcasting to nearby devices
- Communication log and relay simulation
- Designed for internet-free emergency scenarios

### Analytics Dashboard
- Monthly accident statistics with stacked bar charts
- Accident hotspot rankings
- Key metrics: total accidents, fatalities, response times, peak danger periods
- Severity distribution visualization

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Framer Motion |
| State | Zustand |
| Maps | OpenStreetMap, Leaflet.js |
| Backend | Flask, Python |
| AI | OpenAI API (GPT-4o-mini), Whisper (STT), Browser Speech API (TTS) |
| Computer Vision | YOLOv8 Nano (architecture) |
| Database | MongoDB Atlas (production), In-memory (development) |
| Offline | PWA, Service Workers, IndexedDB (idb) |
| Communication | Web Bluetooth API, Twilio SMS |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
roadsos-ai/
├── frontend/                 # Next.js 15 application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx      # SOS home page
│   │   │   ├── map/          # GPS emergency map
│   │   │   ├── assistant/    # AI chatbot
│   │   │   ├── severity/     # Severity prediction
│   │   │   ├── analytics/    # Dashboard
│   │   │   └── ble/          # BLE relay
│   │   ├── components/       # React components
│   │   │   ├── layout/       # Navbar, offline banner
│   │   │   ├── map/          # Leaflet map component
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── hooks/            # Custom hooks (geolocation, voice)
│   │   ├── services/         # API client, offline DB
│   │   ├── store/            # Zustand state management
│   │   └── types/            # TypeScript declarations
│   └── public/               # PWA manifest, service worker
│
├── backend/                  # Flask API server
│   ├── app.py                # Application entry point
│   ├── routes/               # API route handlers
│   │   ├── emergency.py      # SOS endpoints
│   │   ├── hospitals.py      # Hospital/police/ambulance search
│   │   ├── ai_assistant.py   # AI chat (online + offline)
│   │   ├── severity.py       # Severity prediction
│   │   ├── analytics.py      # Statistics and hotspots
│   │   └── auth.py           # JWT authentication
│   └── requirements.txt      # Python dependencies
│
├── skill.md                  # Full project specification
├── techstack.md              # Technology decisions
├── systemdesign.md           # System architecture
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- npm

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys

python app.py
```

The backend runs at `http://localhost:5000`.

### Environment Variables

**Backend** (`.env`):
| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET_KEY` | JWT signing key | Yes (has default) |
| `OPENAI_API_KEY` | OpenAI API key for AI assistant | No (uses offline fallback) |
| `MONGODB_URI` | MongoDB connection string | No (uses in-memory) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS | No |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No |
| `TWILIO_PHONE_NUMBER` | Twilio sender number | No |

**Frontend** (`.env.local`):
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sos` | Create emergency SOS session |
| `GET` | `/api/emergency/:id` | Get emergency details |
| `PATCH` | `/api/emergency/:id/resolve` | Resolve emergency |
| `GET` | `/api/hospitals/nearby?lat=&lon=` | Find nearby hospitals |
| `GET` | `/api/police/nearby` | Find nearby police stations |
| `GET` | `/api/ambulance/services` | List ambulance services |
| `POST` | `/api/ai/chat` | AI assistant conversation |
| `POST` | `/api/severity/predict` | Predict accident severity |
| `GET` | `/api/analytics/hotspots` | Accident hotspot data |
| `GET` | `/api/analytics/stats` | Monthly statistics |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |

---

## Demo Flow

1. Accident image uploaded → AI predicts **HIGH** severity
2. SOS activated → GPS identifies nearest trauma center
3. Voice assistant responds with first-aid guidance
4. Emergency contacts notified
5. Internet disconnected → Offline mode activates
6. BLE emergency relay broadcasts to nearby devices
7. Analytics dashboard shows accident trends

---

## License

This project is developed for the IIT Madras National Road Safety Hackathon 2026.
