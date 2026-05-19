# TECHSTACK.md

# 🚨 RoadSOS AI
## Offline Emergency Intelligence System

---

# 📌 Overview

RoadSOS AI is an AI-powered multilingual emergency response platform designed for road accidents.

The system combines:
- AI emergency assistance
- GPS routing
- Offline-first emergency workflows
- BLE emergency relay
- Voice interaction
- Accident severity prediction

to create a deployable emergency coordination system.

---

# 🧱 System Architecture

Frontend (Next.js)
↓
Flask Backend APIs
↓
Emergency Intelligence Engine
├── AI Assistant
├── GPS Routing Engine
├── Offline Emergency Engine
├── BLE Communication Module
├── Severity Prediction Module
└── Voice Interaction System

---

# 🖥️ Frontend Stack

# Framework
- Next.js 15

### Purpose
- Main frontend framework
- Routing
- Server/client rendering
- PWA support

---

# Language
- TypeScript

### Purpose
- Type safety
- Scalable frontend architecture
- Better maintainability

---

# Styling
- TailwindCSS

### Purpose
- Fast UI development
- Responsive design
- Modern emergency dashboard styling

---

# UI Components
- shadcn/ui

### Purpose
- Accessible UI components
- Dialogs
- Cards
- Buttons
- Modals

---

# Animations
- Framer Motion

### Purpose
- Emergency state transitions
- Smooth UI animations
- Interactive emergency flows

---

# Icons
- lucide-react

### Purpose
- Emergency icons
- Navigation icons
- Dashboard visuals

---

# State Management
- Zustand

### Purpose
- Global emergency state
- SOS state management
- Offline mode state
- User session state

---

# HTTP Client
- Axios

### Purpose
- Backend API communication

---

# 🗺️ Maps & Navigation

# Map Engine
- OpenStreetMap

### Purpose
- Free map provider
- Hospital discovery
- Route visualization

---

# Map Library
- Leaflet.js
- react-leaflet

### Purpose
- Interactive emergency maps
- GPS tracking
- Emergency markers
- Routing display

---

# 🤖 AI Stack

# AI Assistant
- OpenAI API

### Purpose
- Emergency chatbot
- First-aid guidance
- Multilingual assistance
- Context-aware emergency interaction

---

# Speech Recognition
- Whisper API

### Purpose
- Voice-to-text emergency interaction
- Multilingual speech input

---

# Text-to-Speech
- Browser Speech Synthesis API
OR
- pyttsx3

### Purpose
- Voice guidance
- Emergency announcements
- Offline speech fallback

---

# 📸 Computer Vision Stack

# Severity Prediction Model
- YOLOv8 Nano

### Purpose
- Accident severity estimation
- Vehicle damage analysis
- Emergency prioritization

---

# ML Framework
- Ultralytics YOLO

### Purpose
- Model inference
- Severity classification

---

# ⚙️ Backend Stack

# Framework
- Flask

### Purpose
- REST APIs
- Emergency services backend
- AI orchestration

---

# Language
- Python 3.11+

---

# API Handling
- Flask-CORS

### Purpose
- Cross-origin frontend/backend communication

---

# Authentication
- JWT Authentication

### Purpose
- Secure user sessions
- Protected APIs

---

# ORM / Database Access
- PyMongo

### Purpose
- MongoDB interaction

---

# 🌐 Offline-First Stack

# PWA Support
- next-pwa

### Purpose
- Installable app
- Offline app functionality

---

# Offline Storage
- IndexedDB

### Purpose
- Cached hospitals
- Cached emergency services
- Offline emergency data

---

# Browser Database Library
- idb

### Purpose
- Simplified IndexedDB handling

---

# Offline Background Tasks
- Service Workers

### Purpose
- Offline caching
- Background sync
- Emergency fallback systems

---

# 📡 BLE Communication Stack

# BLE API
- Web Bluetooth API

### Purpose
- Nearby device discovery
- BLE emergency relay
- Offline emergency communication

---

# BLE Functionality
- Device discovery
- Emergency packet broadcasting
- Emergency message relay

---

# 📱 Communication Stack

# Emergency SMS
- Twilio API

### Purpose
- SOS SMS fallback
- Live location sharing
- Emergency notifications

---

# 📊 Analytics & Visualization

# Charts
- Recharts

### Purpose
- Accident statistics
- Severity analytics
- Emergency response charts

---

# Heatmaps
- Leaflet Heatmaps

### Purpose
- Accident hotspot visualization

---

# 🗄️ Database Stack

# Primary Database
- MongoDB Atlas

### Purpose
- Emergency logs
- User data
- Incident reports
- SOS events
- Analytics data

---

# Local Offline Database
- IndexedDB

### Purpose
- Offline-first emergency support

---

# ☁️ Deployment Stack

# Frontend Deployment
- Vercel

### Purpose
- Fast Next.js deployment
- Global CDN

---

# Backend Deployment
- Render

### Purpose
- Flask API hosting

---

# Database Hosting
- MongoDB Atlas

### Purpose
- Cloud database management

---

# 🔒 Security Stack

# Authentication
- JWT Tokens

---

# Encryption
- HTTPS
- Secure API handling

---

# Validation
- Zod

### Purpose
- Form validation
- API validation
- Type-safe frontend validation

---

# 📂 Recommended Project Structure

roadsos-ai/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   └── public/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── ai/
│   ├── ble/
│   ├── offline/
│   └── utils/
│
├── ml/
│   ├── severity_model/
│   └── inference/
│
└── docs/

---

# 🚀 MVP PRIORITY STACK

## Phase 1
- Next.js frontend
- Flask backend
- SOS system
- GPS maps

---

## Phase 2
- AI assistant
- Voice interaction
- Severity prediction

---

## Phase 3
- Offline mode
- IndexedDB
- Service workers

---

## Phase 4
- BLE emergency relay
- Analytics dashboard

---

# 🎯 Final Stack Summary

Frontend:
- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion

Backend:
- Flask
- Python

Database:
- MongoDB Atlas

AI:
- OpenAI API
- Whisper
- YOLOv8 Nano

Maps:
- OpenStreetMap
- Leaflet.js

Offline:
- PWA
- IndexedDB
- Service Workers

Communication:
- Web Bluetooth API
- Twilio SMS

Deployment:
- Vercel
- Render

---