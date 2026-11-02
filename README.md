# SmartMove - City Bus Transit & Ticketing System

SmartMove is a modern full-stack public transit management and passenger ticketing web application designed for city transit networks (Chandigarh Transport Undertaking - CTU).

## 🚀 Key Features

- **Live Bus Fleet Tracking:**
  - Real-time GPS tracking for active transit buses and route polylines.
  - Integration with **Google Maps Platform** (`@vis.gl/react-google-maps`) and clean **OpenStreetMap** engine.
  - **Live User Geolocation ("Locate Me"):** Detects passenger's real-time location, accuracy radar, and calculates walking distance and ETA to approaching buses.

- **Smart Transit Booking & Dynamic Fare Pricing:**
  - Search routes and real-time schedules across city transit hubs (ISBT 17, PGI Hospital, Sector 43, Railway Station, Airport Express).
  - Seat selection layout with bus classes: *AC Electric Volvo (₹100)*, *Premium AC (₹80)*, *Standard Express (₹50)*.
  - Multi-passenger fare computation with GST and passenger safety cess breakdown.

- **Scan & Pay QR Scanner:**
  - In-app camera scanner powered by `window.BarcodeDetector` and live camera stream (`getUserMedia`).
  - Animated laser reticle, flashlight toggle, and camera flip.
  - One-click quick test presets to scan bus terminal, bus stop, or conductor POS QR codes.
  - Instant ticket payment via SmartMove Wallet, UPI (Google Pay, PhonePe, Paytm), and Credit/Debit cards.

- **Digital E-Tickets & Passes:**
  - Digitally signed QR code tickets for bus boarding.
  - Operations portal with Conductor handheld ticket validator scanner.
  - Digital commuter passes (Student SmartPass, Daily Commuter, SuperPass).

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Maps:** Google Maps JavaScript API, `@vis.gl/react-google-maps`, Leaflet & OpenStreetMap
- **State Management:** React Context API & Redux Toolkit
- **Icons & Effects:** Lucide React, Canvas Confetti
- **QR Codes:** `qrcode`, native `BarcodeDetector`

## 🏁 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pruthviraj799/FSD_bus_ticket.git
   cd FSD_bus_ticket
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Google Maps API key (or use the zero-cost Maps Demo Key):
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```
