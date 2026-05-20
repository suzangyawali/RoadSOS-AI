---
name: testing-roadsos-ai
description: End-to-end testing procedure for the RoadSOS AI emergency response platform. Use when verifying SOS, Map, AI Assistant, Severity, Analytics, or BLE features.
---

# Testing RoadSOS AI

## Prerequisites

### Start Backend
```bash
cd /home/ubuntu/RoadSOS-AI/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Backend runs on `http://localhost:5000`. Verify with `curl http://localhost:5000/api/health` — should return `{"status": "ok"}`.

### Start Frontend
```bash
cd /home/ubuntu/RoadSOS-AI/frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

### Browser Setup
- Allow location permission when prompted (required for GPS features)
- Close any notification popups before recording
- No API keys needed — all features have offline fallbacks

## Devin Secrets Needed

None required for basic testing. All features work with offline fallbacks.

Optional: `OPENAI_API_KEY` in backend `.env` for live AI assistant responses.

## Test Flow

Test pages in this order to follow the hackathon demo flow:

### 1. SOS Home Page (`/`)
- Verify "RoadSOS AI" title, red "HELP NOW" button, "Voice Activate" button, 112/108/100 emergency cards
- Click HELP NOW → verify "EMERGENCY ACTIVE" title, timer counting, GPS coordinates, "SOS ACTIVE" badge in navbar
- Click "Cancel Emergency" → verify return to idle state

### 2. GPS Map (`/map`)
- Verify OpenStreetMap tiles load (not blank/gray)
- Verify red user location marker on map
- Verify hospital facility cards in sidebar with distance (km), Call, and Route buttons
- Expect ~10 hospitals (RML Hospital, Sir Ganga Ram, Lok Nayak, Safdarjung, AIIMS, etc.)

### 3. AI Assistant (`/assistant`)
- Verify welcome message with "online" badge
- Verify quick prompt buttons and language selector (EN/HI/TE/TA/NE)
- Click "What are emergency numbers?" → verify response lists 108, 100, 101, 1091, 112
- Without OpenAI key, responses show "offline" badge — this is expected

### 4. Severity Prediction (`/severity`)
- Verify upload area with placeholder text
- Upload any image file → verify preview appears
- Click "Predict Severity" → verify result card with severity level (Low/Medium/High), confidence %, colored progress bar, recommended actions
- Model is simulated — severity is randomly weighted (HIGH 50%, MEDIUM 30%, LOW 20%)

### 5. Analytics Dashboard (`/analytics`)
- Verify 4 summary cards: Total Accidents (YTD), Fatalities, Avg Response Time, Peak Danger
- Verify stacked bar chart with monthly data and High/Medium/Low legend
- Verify hotspot rankings with location names and incident counts

### 6. BLE Relay (`/ble`)
- Click "Scan for Devices" → verify 3 simulated devices appear (Nearby Phone A, Emergency Beacon, Nearby Phone B) with signal strength
- Click "Broadcast SOS" → verify communication log shows broadcasting + relay + acknowledgment messages
- Web Bluetooth API might not be available in the test environment — the simulation fallback is the expected behavior

### 7. Navigation
- Verify all 6 nav links visible: SOS, Map, AI Assistant, Severity, Analytics, BLE Relay
- Verify active page has distinct background/border styling in navbar

## Known Behaviors

- **Offline fallbacks**: Without OpenAI key or when API calls fail, all pages degrade gracefully with cached/simulated data
- **BLE simulation**: Web Bluetooth requires HTTPS + user gesture in production; dev environment uses simulation
- **Severity model**: Returns simulated predictions — actual YOLOv8 model training is separate
- **Geolocation**: Browser provides real GPS coordinates; if location is denied, features still work with default coords
- **No CI**: Repo has no CI configured. Run `cd frontend && npm run build` to verify build passes
