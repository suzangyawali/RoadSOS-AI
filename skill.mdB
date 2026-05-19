# SKILL.md

# 🚨 RoadSOS AI
## Offline Emergency Intelligence System for Road Accidents

> AI-powered multilingual emergency assistance platform with offline emergency communication, BLE relay, GPS routing, and intelligent accident severity prediction.

---

# 1. PROJECT GOAL

Build a production-style AI-powered road safety emergency platform for the IIT Madras National Road Safety Hackathon 2026.

The system should help accident victims and bystanders during the critical “Golden Hour” after road accidents.

The application must continue functioning even when internet connectivity is weak or unavailable.

---

# 2. PRIMARY OBJECTIVES

The system must provide:

- Nearest trauma centers
- Ambulance services
- Police stations
- Emergency contacts
- Offline emergency functionality
- AI emergency assistance
- GPS-based routing
- Multilingual accessibility
- Accident severity estimation
- Voice-based interaction

---

# 3. CORE IDEA

RoadSOS AI is an offline-first emergency response system designed specifically for road accidents.

The platform combines:

- Artificial Intelligence
- GPS routing
- Emergency coordination
- BLE communication
- Offline-first architecture
- Voice interaction
- Computer Vision

to create a deployable emergency response platform.

---

# 4. TARGET USERS

- Accident victims
- Bystanders
- Emergency responders
- Police authorities
- Ambulance services
- Government agencies

---

# 5. MAIN FEATURES

---

## 5.1 🚨 Emergency SOS System

### Requirements
- Large “HELP NOW” emergency button
- One-tap emergency activation
- Voice-triggered emergency mode
- Auto emergency workflow

### Actions after SOS
- Capture live GPS coordinates
- Identify nearby hospitals
- Identify police stations
- Identify ambulance services
- Notify emergency contacts
- Activate AI emergency assistant

---

## 5.2 🧠 AI Emergency Assistant

### Requirements
- Conversational AI assistant
- Emergency-focused responses
- Voice interaction support
- Real-time guidance

### AI Tasks
- First-aid guidance
- Emergency instructions
- Trauma stabilization guidance
- Nearest facility recommendations
- Panic reduction interaction

### Example Responses
- “Stay calm. Ambulance assistance is being arranged.”
- “Nearest trauma center is 2.1 km away.”
- “Avoid moving the victim’s neck.”

---

## 5.3 📶 Offline Emergency Mode

### MOST IMPORTANT FEATURE

When internet connectivity fails:
- app must continue functioning partially,
- emergency support should still work.

### Offline Features
- Cached hospitals database
- Cached police station database
- Cached ambulance contacts
- Offline emergency guidance
- Offline multilingual responses
- SMS emergency fallback
- BLE emergency communication

### Technical Requirements
- IndexedDB
- Service Workers
- Local JSON caching
- Background sync

---

## 5.4 📡 BLE Emergency Relay System

### Purpose
Allow emergency communication without internet using Bluetooth Low Energy (BLE).

### Requirements
- Discover nearby devices
- Broadcast emergency packets
- Relay emergency alerts
- Simulate BLE mesh communication

### BLE Emergency Packet Example
{
  "type": "SOS",
  "severity": "HIGH",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "message": "High severity accident"
}

### Technologies
- Web Bluetooth API
- BLE device discovery
- Local relay architecture

### Important
This does NOT need enterprise-grade mesh networking.
A working prototype/simulation is sufficient for hackathon demonstration.

---

## 5.5 📸 Accident Severity Prediction

### Purpose
Estimate accident severity using AI.

### Workflow
User uploads accident image →
AI predicts severity →
Emergency priority updated.

### Severity Classes
- Low
- Medium
- High

### Model Requirements
Use pretrained model:
- YOLOv8
OR
- MobileNet
OR
- EfficientNet

### Expected Output
{
  "severity": "HIGH",
  "confidence": 0.93
}

### Integration
Severity affects:
- emergency escalation,
- trauma center priority,
- alert urgency.

---

## 5.6 🗺️ GPS Emergency Routing

### Requirements
Display nearby:
- Hospitals
- Trauma centers
- Ambulance services
- Police stations
- Towing services
- Puncture shops

### Features
- Live location tracking
- Route visualization
- ETA estimation

### Technologies
- OpenStreetMap
- Leaflet.js
- Browser Geolocation API

---

## 5.7 🌍 Multilingual Support

### Supported Languages
- English
- Hindi
- Telugu
- Tamil
- Nepali

### Requirements
- Text translation
- Voice responses
- Emergency prompts
- Offline language fallback

---

## 5.8 🎤 Voice Interaction System

### Requirements
- Speech-to-Text
- Text-to-Speech
- Voice commands
- Emergency voice guidance

### Technologies
- Whisper API
- Browser Speech API
- TTS Engine

---

## 5.9 📊 Analytics Dashboard

### Dashboard Features
- Accident hotspots
- Emergency statistics
- High-risk zones
- Incident frequency
- Response time tracking

### Visualization
- Heatmaps
- Charts
- Severity analytics

### Technologies
- Recharts
- Chart.js
- Leaflet heatmaps

---

# 6. SYSTEM ARCHITECTURE

User
↓
Frontend Application
↓
Flask Backend API
↓
Emergency Intelligence Engine
├── AI Assistant
├── GPS Routing Engine
├── Severity Prediction Module
├── BLE Communication Module
├── Offline Emergency Engine
├── SOS Notification System
└── Voice Interaction Module

---

# 7. TECH STACK

## Frontend
- React.js
- TailwindCSS
- HTML5
- CSS3
- JavaScript ES6+

---

## Backend
- Flask
- Python 3.11+

---

## Database
- MongoDB
OR
- SQLite

---

## Maps & Navigation
- OpenStreetMap
- Leaflet.js

---

## AI Components
- OpenAI API
- Whisper
- YOLOv8 / MobileNet

---

## Offline Components
- Service Workers
- IndexedDB
- Local cache
- Background sync

---

## Communication
- Web Bluetooth API
- SMS fallback APIs

---

# 8. UI REQUIREMENTS

---

## Home Screen
- Large SOS button
- Voice activation button
- Nearby emergency services
- Emergency map

---

## Emergency Screen
- Active emergency status
- GPS map
- Nearby trauma centers
- AI voice guidance
- Offline mode indicator

---

## Dashboard
- Emergency analytics
- Heatmaps
- Accident trends

---

# 9. UX REQUIREMENTS

### VERY IMPORTANT

The app should:
- work under stress,
- require minimal interaction,
- prioritize speed,
- use large buttons,
- avoid clutter.

Emergency UI must feel:
- simple,
- fast,
- life-saving.

---

# 10. OFFLINE-FIRST REQUIREMENTS

The system should prioritize:
- resilience,
- degraded-mode functionality,
- emergency reliability.

Even when internet fails:
- core emergency workflow must continue.

---

# 11. MVP PRIORITY ORDER

Build in this order:

## Phase 1
- SOS button
- GPS map
- Nearby hospitals
- Emergency contacts

---

## Phase 2
- AI assistant
- Voice interaction
- Severity prediction

---

## Phase 3
- Offline mode
- Local caching
- Service workers

---

## Phase 4
- BLE emergency relay
- Dashboard analytics

---

# 12. DEMO FLOW

### FINAL HACKATHON DEMO

1. Accident image uploaded
2. AI predicts HIGH severity
3. SOS activated
4. GPS identifies trauma center
5. Voice assistant responds
6. Emergency contacts notified
7. Internet disconnected
8. Offline mode activates
9. BLE emergency relay demonstrated

This demo flow is mandatory.

---

# 13. HACKATHON JUDGING FOCUS

The system should optimize for:
- Real-world usefulness
- Reliability
- Offline functionality
- Innovation
- Accessibility
- Emergency usability
- Road safety impact

---

# 14. NON-GOALS

Avoid:
- overly academic research focus,
- unnecessary complex ML pipelines,
- enterprise-grade networking,
- massive training pipelines.

The project should prioritize:
- usability,
- demo quality,
- practical deployment.

---

# 15. FINAL PROJECT TITLE

# 🚨 RoadSOS AI
## Offline Emergency Intelligence System

---

# 16. FINAL ONE-LINE DESCRIPTION

An AI-powered multilingual road accident emergency platform that provides offline emergency assistance, BLE-based emergency communication, GPS routing, accident severity prediction, and intelligent emergency coordination during critical road accidents.

---
