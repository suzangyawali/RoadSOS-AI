# SYSTEMDESIGN.md

# 🚨 RoadSOS AI
## Offline Emergency Intelligence System

---

# 📌 Overview

RoadSOS AI is an AI-powered offline-first emergency response platform designed for road accident scenarios.

The system enables:
- intelligent emergency assistance,
- accident severity prediction,
- offline emergency communication,
- BLE emergency relay,
- GPS-based emergency routing,
- multilingual voice support.

The architecture prioritizes:
- reliability,
- low-latency emergency response,
- offline resilience,
- usability during high-stress situations.

---

# 🎯 System Design Goals

The architecture is designed for:

✅ Fast emergency response  
✅ Offline-first reliability  
✅ Real-time emergency coordination  
✅ Scalable frontend/backend separation  
✅ AI-assisted emergency workflows  
✅ Lightweight deployment for hackathons  
✅ Simple but production-style architecture  

---

# 🧱 High-Level Architecture

User Device
↓
Next.js Frontend (PWA)
↓
Flask Backend APIs
↓
Emergency Intelligence Engine
├── AI Assistant Service
├── Severity Prediction Service
├── GPS Routing Service
├── SOS Notification Service
├── BLE Relay Service
├── Offline Sync Engine
└── Analytics Engine
↓
MongoDB Atlas

---

# 🌐 Frontend System Design

# Frontend Framework
- Next.js 15
- TypeScript
- TailwindCSS

---

# Frontend Responsibilities

The frontend handles:
- emergency UI,
- GPS maps,
- offline caching,
- BLE communication,
- voice interaction,
- dashboard rendering.

---

# Frontend Modules

## 1. Emergency UI Module
Responsible for:
- SOS activation,
- emergency status,
- live routing.

---

## 2. Map Module
Responsible for:
- displaying nearby hospitals,
- live GPS location,
- emergency routes.

---

## 3. Offline Engine
Responsible for:
- local caching,
- IndexedDB storage,
- offline fallback workflows.

---

## 4. BLE Communication Layer
Responsible for:
- nearby device discovery,
- emergency packet broadcasting,
- local relay communication.

---

## 5. Voice Interface
Responsible for:
- speech-to-text,
- text-to-speech,
- multilingual voice interaction.

---

# ⚙️ Backend System Design

# Backend Framework
- Flask
- Python 3.11+

---

# Backend Responsibilities

The backend handles:
- AI orchestration,
- emergency APIs,
- accident severity prediction,
- emergency notifications,
- analytics processing,
- database interaction.

---

# Backend API Modules

## 1. Emergency API

### Responsibilities
- create emergency sessions,
- process SOS requests,
- manage emergency workflows.

### Example Endpoints
POST /api/sos
GET /api/emergency/:id

---

## 2. Hospital Routing API

### Responsibilities
- nearby hospital search,
- trauma center discovery,
- emergency route generation.

### Example Endpoints
GET /api/hospitals/nearby
GET /api/routes/emergency

---

## 3. Severity Prediction API

### Responsibilities
- image upload,
- accident severity classification,
- confidence scoring.

### Example Endpoints
POST /api/severity/predict

---

## 4. AI Assistant API

### Responsibilities
- conversational AI,
- emergency guidance,
- multilingual assistance.

### Example Endpoints
POST /api/ai/chat

---

## 5. BLE Communication API

### Responsibilities
- BLE packet handling,
- nearby relay sync,
- emergency broadcasting.

### Example Endpoints
POST /api/ble/broadcast
GET /api/ble/status

---

## 6. Analytics API

### Responsibilities
- hotspot analytics,
- severity statistics,
- response monitoring.

### Example Endpoints
GET /api/analytics/hotspots
GET /api/analytics/stats

---

# 🧠 AI System Design

# AI Components

## 1. Conversational AI Assistant

### Model
- OpenAI API

### Purpose
- emergency interaction,
- first-aid guidance,
- multilingual communication.

---

## 2. Accident Severity Prediction

### Model
- YOLOv8 Nano

### Workflow
Image Upload
↓
Inference Engine
↓
Severity Classification
↓
Emergency Priority Decision

---

## 3. Voice AI

### Components
- Whisper STT
- Browser TTS

### Purpose
- hands-free emergency interaction.

---

# 📶 Offline-First System Design

# Core Principle

The application must continue functioning even when internet connectivity fails.

---

# Offline Architecture

Internet Available?
↓
YES → Cloud APIs + Full Sync
NO → Offline Emergency Engine

---

# Offline Engine Responsibilities

## 1. Cached Emergency Services
Store locally:
- hospitals,
- police stations,
- ambulance contacts.

---

## 2. IndexedDB Storage
Store:
- emergency sessions,
- cached maps,
- emergency instructions.

---

## 3. Service Worker Layer
Responsible for:
- offline caching,
- background sync,
- emergency fallback routing.

---

## 4. SMS Emergency Fallback
If internet unavailable:
- send emergency SMS,
- share coordinates.

---

# 📡 BLE Emergency Relay Design

# Purpose

Allow nearby devices to communicate during connectivity failure.

---

# BLE Communication Flow

Accident Detected
↓
BLE Broadcast Triggered
↓
Nearby Devices Discovered
↓
Emergency Packet Relayed
↓
Local Emergency Awareness

---

# BLE Packet Structure

{
  "type": "SOS",
  "severity": "HIGH",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "timestamp": "2026-05-20T04:00:00Z"
}

---

# BLE Responsibilities

- Device discovery
- Packet relay
- Offline communication
- Local emergency coordination

---

# Important Design Note

The BLE system is:
- prototype-oriented,
- lightweight,
- optimized for hackathon demonstration.

Enterprise-scale mesh networking is NOT required.

---

# 🗺️ GPS Routing System

# Components
- OpenStreetMap
- Leaflet.js
- Geolocation API

---

# Workflow

GPS Coordinates
↓
Nearby Service Search
↓
Route Generation
↓
Map Visualization

---

# Nearby Services

The routing system identifies:
- trauma centers,
- ambulance services,
- police stations,
- towing services,
- puncture shops.

---

# 🗄️ Database Design

# Primary Database
- MongoDB Atlas

---

# Collections

## Users
Stores:
- profile,
- emergency contacts,
- language preferences.

---

## Emergencies
Stores:
- SOS events,
- GPS coordinates,
- severity results,
- timestamps.

---

## Hospitals
Stores:
- hospital locations,
- trauma center metadata,
- emergency contact numbers.

---

## Analytics
Stores:
- accident statistics,
- hotspot data,
- severity trends.

---

# 🔒 Security Design

# Authentication
- JWT Authentication

---

# Security Features
- HTTPS communication
- API validation
- Input sanitization
- Secure emergency sessions

---

# 📊 Analytics System Design

# Dashboard Components

## Accident Heatmaps
Visualize:
- accident-prone areas,
- dangerous zones.

---

## Severity Analytics
Visualize:
- high-risk accident trends,
- severity distributions.

---

## Emergency Metrics
Track:
- emergency counts,
- response trends,
- usage statistics.

---

# ☁️ Deployment Design

# Frontend Deployment
- Vercel

---

# Backend Deployment
- Render

---

# Database Hosting
- MongoDB Atlas

---

# Deployment Architecture

User
↓
Vercel Frontend
↓
Render Flask APIs
↓
MongoDB Atlas

---

# 📱 Progressive Web App Design

# PWA Features

✅ Installable app  
✅ Offline support  
✅ Service workers  
✅ Background sync  
✅ Mobile-first UI  

---

# 📈 Scalability Considerations

Future scalability support:
- microservice separation,
- edge caching,
- cloud scaling,
- distributed BLE coordination,
- real-time emergency analytics.

---

# 🎬 Final Demo Flow

1. User uploads accident image
2. AI predicts HIGH severity
3. SOS activated
4. GPS routing begins
5. Nearby trauma center displayed
6. Voice assistant activated
7. Internet disconnected
8. Offline mode enabled
9. BLE emergency relay demonstrated

---

# 🏆 System Design Priorities

The system prioritizes:

1. Reliability
2. Emergency usability
3. Offline resilience
4. Fast response
5. Accessibility
6. Real-world deployment
7. Simplicity under stress

---

# 📌 Conclusion

RoadSOS AI is designed as a practical offline-first emergency response platform capable of assisting users during critical road accidents.

The architecture combines:
- AI assistance,
- BLE communication,
- GPS routing,
- offline-first design,
- emergency intelligence

to create a scalable and deployable road safety solution.

---