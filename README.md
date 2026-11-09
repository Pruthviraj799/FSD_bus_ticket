# 🚌 SmartMove: Intelligent City Bus Transit & Digital E-Ticketing System
### *Full Stack Development (FSD) Project Report & Documentation*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Maps Platform](https://img.shields.io/badge/Google_Maps-Platform_API-4285F4?logo=google-maps&logoColor=white)](https://developers.google.com/maps)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Project Repository:** [https://github.com/Pruthviraj799/FSD_bus_ticket](https://github.com/Pruthviraj799/FSD_bus_ticket)  
**Developer:** Pruthviraj Bhosle ([@Pruthviraj799](https://github.com/Pruthviraj799))  
**Academic Domain:** Full Stack Development (FSD) / Intelligent Transportation Systems (ITS)

---

## 📋 Table of Contents
1. [Project Abstract & Objectives](#-project-abstract--objectives)
2. [Problem Statement & Proposed Solution](#-problem-statement--proposed-solution)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Key Features & Core Modules](#-key-features--core-modules)
   - [1. Real-Time Bus Fleet Tracking & Live Geolocation](#1-real-time-bus-fleet-tracking--live-geolocation)
   - [2. Intelligent Bus Booking & Dynamic Fare Matrix](#2-intelligent-bus-booking--dynamic-fare-matrix)
   - [3. In-App Camera "Scan & Pay" Ticket Scanner](#3-in-app-camera-scan--pay-ticket-scanner)
   - [4. Multi-Channel Payment Gateway](#4-multi-channel-payment-gateway)
   - [5. Conductor Verification & Digital Boarding Passes](#5-conductor-verification--digital-boarding-passes)
5. [Technical Specifications & API Integration](#-technical-specifications--api-integration)
6. [Project Directory Layout](#-project-directory-layout)
7. [Installation & Execution Guide](#-installation--execution-guide)
8. [Testing & Quality Verification](#-testing--quality-verification)
9. [Conclusion & Future Scope](#-conclusion--future-scope)

---

## 📌 Project Abstract & Objectives

**SmartMove** is a full-stack, responsive public transit management and contactless passenger ticketing platform engineered for modern urban transit networks (modeled on the Chandigarh Transport Undertaking — CTU). 

The platform bridges the gap between daily commuters and transit authorities by replacing traditional paper ticketing with an end-to-end digital solution. It unifies **real-time dual-engine fleet telematics**, **passenger geolocation detection**, **camera-assisted QR ticketing**, and **dynamic distance-based fare computation** into a unified web application.

### Core Objectives:
- **Live Fleet Visibility:** Eliminate passenger uncertainty by tracking active transit buses in real-time along polylines with accurate ETAs and live occupancy indicators.
- **Accurate Passenger Localization:** Calculate walking distance and travel time from the passenger's live GPS coordinates to the approaching bus and nearest boarding stop.
- **Fair & Transparent Pricing:** Implement an automated distance and category-based fare matrix charging realistic fares (**₹100** for AC Electric Volvo, **₹80** for Premium AC, **₹50** for Standard Express) with clear tax breakdowns.
- **Contactless Ticketing ("Scan & Pay"):** Enable frictionless ticketing via a smartphone camera that scans bus terminal or conductor QR codes to issue instant digitally verified e-tickets.
- **Operational Portal for Staff:** Supply conductors and depot managers with handheld barcode scanners to validate boarding passes in real time.

---

## ⚡ Problem Statement & Proposed Solution

| Challenge in Traditional Public Transit | Solution Provided by SmartMove |
| :--- | :--- |
| **Unpredictable Bus Arrival:** Commuters wait at bus stops without knowing the vehicle's actual location or delay. | **Dual-Engine Real-Time GPS Tracking:** Google Maps and OpenStreetMap telematics with live coordinate updates and ETAs. |
| **Physical Queue Bottlenecks:** Waiting in long lines for manual cash-based paper tickets. | **Camera "Scan & Pay" & Instant Booking:** Scan terminal QR codes or reserve seats digitally in seconds. |
| **Cash Handling Inefficiencies:** Loose change disputes and lost paper receipts. | **Multi-Modal Digital Payment Gateway:** Instant UPI (GPay/PhonePe/Paytm), 3D-Secure simulated Cards, and SmartMove Wallet. |
| **Fare Fraud & Overcharging:** Discrepancies in manual ticket fares across routes. | **Standardized Fare Engine:** Automated distance-based pricing with explicit GST and passenger safety cess breakdown. |
| **Difficult Ticket Verification:** Manual visual checks prone to counterfeit paper tickets. | **Cryptographic QR Validation:** Staff dashboard equipped with a live camera scanner verifying ticket authenticity. |

---

## 🏛 System Architecture & Data Flow

```
                      ┌──────────────────────────────────────────────┐
                      │              COMMUTER / PASSENGER            │
                      └──────────────────────┬───────────────────────┘
                                             │
                       HTTP / WebSocket / Navigator APIs
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                SMARTMOVE FRONTEND (Vite + React)                       │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│    Presentation Layer    │     State & Business Logic  │       Hardware & Web APIs     │
│  - Tailwind CSS UI       │  - TransitContext (React)   │  - Geolocation API (GPS)      │
│  - Responsive Modals     │  - Redux Toolkit            │  - MediaDevices (Camera)      │
│  - Interactive Charts    │  - LocalStorage Persistence │  - BarcodeDetector API        │
│  - Lucide Icons & Badges │  - Dynamic Fare Calculator  │  - Web Audio API (Chimes)     │
└────────────┬─────────────┴──────────────┬──────────────┴───────────────┬───────────────┘
             │                            │                              │
             ▼                            ▼                              ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌─────────────────────────────┐
│      MAPPING ENGINE      │ │     PAYMENT GATEWAY      │ │     OPERATIONS PORTAL       │
│ - Google Maps JS API     │ │ - Dynamic UPI QR Engine  │ │ - Staff QR Ticket Validator │
│ - @vis.gl/react-google-maps│ - 3D Secure Card Engine  │ │ - Conductor Mobile POS      │
│ - OpenStreetMap / Leaflet│ │ - SmartMove Wallet       │ │ - Live Passenger Manifest   │
└──────────────────────────┘ └──────────────────────────┘ └─────────────────────────────┘
```

---

## 🚀 Key Features & Core Modules

### 1. Real-Time Bus Fleet Tracking & Live Geolocation
- **Dual-Engine Mapping Architecture:**
  - **Google Maps Platform:** Powered by `@vis.gl/react-google-maps` using modern `AdvancedMarkerElement`, vector polylines, real-time traffic layers, and custom InfoWindows.
  - **OpenStreetMap & Leaflet:** High-performance fallback engine styled with clean vector tiles (free of third-party watermarks).
- **"Locate Me" GPS Localization:**
  - Integrates the browser's `navigator.geolocation` API to pinpoint the user's real-time position.
  - Renders a pulsing blue radar marker with an accuracy perimeter.
  - Automatically calculates the straight-line/route distance to approaching buses and provides walking ETAs to the nearest station stop.
- **Interactive Camera Controls:** Quick-pan toggle between **"Locate Me"** (re-centering on the commuter) and **"Center Bus"** (tracking the moving bus).

### 2. Intelligent Bus Booking & Dynamic Fare Matrix
- **Bus Schedule & Route Matrix:** Real-time departures across key transit hubs (ISBT 17, PGI Hospital, Sector 43 ISBT, Railway Station, IT Park, Aerocity Airport).
- **Seat Allocation Map:** 40-seat interactive 2×2 layout with aisle spacing, seat reservation states (Available, Booked, Selected), and real-time occupancy counts.
- **Calibrated Monetary Fare Engine:**
  - **AC Electric Volvo:** **₹100** per seat *(Base Rate: ₹68 + Distance Charge + 5% GST + ₹2 Safety Cess)*
  - **Premium AC:** **₹80** per seat *(Base Rate: ₹55 + Distance Charge + 5% GST + ₹2 Safety Cess)*
  - **Standard Express:** **₹50** per seat *(Base Rate: ₹34 + Distance Charge + 5% GST + ₹2 Safety Cess)*
  - **Airport Express Volvo:** **₹130** per seat
  - *All single-journey tickets enforce realistic monetary fares without unauthorized zero-fare overrides.*

### 3. In-App Camera "Scan & Pay" Ticket Scanner
- **Direct Camera Access:** Accesses mobile/desktop cameras (`navigator.mediaDevices.getUserMedia`) with back-camera (`facingMode: 'environment'`) priority.
- **Hardware-Accelerated Detection:** Employs the native `window.BarcodeDetector` API for real-time video frame QR and barcode decoding.
- **Transit Scanner UI:** Features an animated neon laser sweep, target reticle brackets, flashlight simulation, and camera flip.
- **Interactive Test Presets:** Built-in simulation buttons (*CTU Bus 101 Terminal*, *ISBT 17 Stand*, *Conductor POS*, *Airport Express*) for testing without physical printed QR sheets.
- **Acoustic & Visual Feedback:** Synthesized dual-tone audio chime (Web Audio API) and celebratory particle confetti upon successful scan.

### 4. Multi-Channel Payment Gateway
- **UPI / Dynamic QR Code:** Generates standard `upi://pay` strings encoded into live QR codes scannable by Google Pay, PhonePe, Paytm, and BHIM apps, complete with an instant simulator.
- **Debit / Credit Card Processing:** Virtual ATM card preview with live chip rendering, CVV masking, and 3D Secure OTP verification flow.
- **SmartMove Commuter Wallet:** Pre-loaded digital wallet for 1-click contactless fare deduction and in-modal top-up increments (+₹100, +₹200, +₹500).

### 5. Conductor Verification & Digital Boarding Passes
- **Digitally Signed E-Tickets:** Generates secure tickets containing passenger details, seat numbers, journey date, route metadata, and a verified validation key.
- **Operations Staff Portal:** Equips transit staff and conductors with a camera scanner to scan commuter tickets and mark them as *Boarded*, *Completed*, or *Invalid*.
- **Digital Passes Hub:** Provides monthly subscription passes (Student SmartPass, Daily Commuter, SuperPass) with active validity tracking.

---

## 💻 Technical Specifications & API Integration

| Component | Technology / API | Functionality |
| :--- | :--- | :--- |
| **Framework & Language** | React 18.3.1 + TypeScript 5.5 | Type-safe single-page application (SPA) architecture |
| **Build & Bundler** | Vite 5.4 | Hot Module Replacement (HMR) and optimized rollup production bundles |
| **Styling & Design** | Tailwind CSS 3.4 | Responsive mobile-first UI with custom animations and pastel elevation |
| **Primary Maps SDK** | `@vis.gl/react-google-maps` | Official React wrapper for Google Maps JS API with Advanced Markers |
| **Fallback Maps SDK** | Leaflet 1.9.4 + OpenStreetMap | Clean, watermark-free vector tile rendering |
| **Camera & Video** | `navigator.mediaDevices.getUserMedia` | High-definition live viewfinder stream |
| **Barcode Recognition** | `window.BarcodeDetector` & `qrcode` | Frame-by-frame QR scanning and SVG/Canvas QR generation |
| **Audio Feedback** | Web Audio API (`AudioContext`) | Synthesized electronic scanner chime without external sound assets |
| **State Management** | React Context API + Redux Toolkit | Centralized persistent transit store synchronized with `localStorage` |

---

## 📂 Project Directory Layout

```
external_project2026/
├── public/                     # Static brand assets & transit photography
│   └── assets/                 # Bus hero banners, avatars, and icons
├── src/
│   ├── components/
│   │   ├── dashboard/          # Home dashboard cards
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── LiveTrackingCard.tsx     # Dashboard live tracking widget with GPS
│   │   │   ├── QuickAccessCards.tsx     # Quick action navigation cards
│   │   │   ├── StatisticsRow.tsx        # Monthly savings & CO2 impact stats
│   │   │   └── UpcomingJourneyCard.tsx  # Confirmed ticket preview card
│   │   ├── layout/             # Application shell
│   │   │   ├── Sidebar.tsx              # Desktop/tablet collapsible sidebar
│   │   │   └── TopNavbar.tsx            # Global search, notifications, & wallet
│   │   ├── modals/             # Reusable interactive dialogs
│   │   │   ├── ReceiptModal.tsx         # Payment tax invoice view
│   │   │   ├── ScanToPayModal.tsx       # Camera QR ticket payment scanner
│   │   │   └── TicketModal.tsx          # Full digital boarding pass view
│   │   ├── payment/
│   │   │   └── PaymentGatewayModal.tsx  # PCI-compliant multi-option checkout
│   │   └── tracking/
│   │       └── GoogleMapsTransitTracking.tsx # Full Google Maps engine component
│   ├── context/
│   │   └── TransitContext.tsx  # Global state provider & storage synchronization
│   ├── data/
│   │   └── mockTransitData.ts  # Pre-seeded routes, buses, stops, and schedules
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── BookRidePage.tsx    # Route selection, seat picker & booking
│   │   ├── DashboardPage.tsx   # Commuter overview page
│   │   ├── DigitalPassesPage.tsx
│   │   ├── HelpSupportPage.tsx
│   │   ├── LiveTrackingPage.tsx# Dedicated full-screen tracking suite
│   │   ├── MyTicketsPage.tsx   # Historical and active ticket passes
│   │   ├── ReceiptsPage.tsx    # Transaction and tax history
│   │   └── StaffDashboardPage.tsx # Conductor ticket scanning portal
│   ├── styles/
│   │   └── globals.css         # Custom animations & base utility classes
│   ├── types/
│   │   └── transit.ts          # TypeScript domain interfaces & data types
│   ├── utils/
│   │   └── fareCalculator.ts   # Distance, tax, and fare pricing engine
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # React DOM entry point
├── .env.example                # Template for environment configuration
├── package.json                # Project dependencies & scripts
├── tailwind.config.js          # Tailwind CSS custom themes & color palettes
└── vite.config.ts              # Vite compiler & bundling configuration
```

---

## 🛠 Installation & Execution Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Web Browser:** Modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave) with camera and location permissions enabled.

### Step 1: Clone Repository
```bash
git clone https://github.com/Pruthviraj799/FSD_bus_ticket.git
cd FSD_bus_ticket
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and configure your Google Maps API key (optional — the app includes an OpenStreetMap fallback and an in-app key configurator):
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
> **Prototyping Tip:** You can also click the **"Enter API Key"** button directly on the map in the running application to paste a zero-cost [Google Maps Demo Key](https://mapsplatform.google.com/maps-demo-key) without modifying `.env`.

### Step 4: Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### Step 5: Build for Production
```bash
npm run build
```
Generates optimized production assets in the `dist/` directory.

---

## 🧪 Testing & Quality Verification

| Test Scenario | Steps Executed | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **GPS Geolocation** | Click *"Locate Me"* on tracking map | Browser requests permission; blue pulsing pin renders with distance to bus and walking ETA. | **PASS** |
| **Dynamic Fare Pricing** | Search *ISBT 17 ➔ PGI Hospital* | Fares display **₹100** (Volvo), **₹80** (Premium), and **₹50** (Standard) with no zero-fare overrides. | **PASS** |
| **Camera QR Scanner** | Click *"Scan & Pay"* in navbar | Camera initiates with targeting reticle; scanning test presets plays audio chime and triggers payment. | **PASS** |
| **Seat Booking** | Select seat *14A* and proceed | Real fare (₹100.00) passes into checkout modal; completing payment generates valid digital ticket. | **PASS** |
| **Staff Verification** | Switch role to Staff and scan ticket | Ticket QR is decoded; status updates to *Boarded* with confetti animation. | **PASS** |
| **Multi-Engine Map** | Toggle between Google & OSM | Both engines switch smoothly without missing tile assets or watermarks. | **PASS** |

---

## 🔮 Conclusion & Future Scope

### Project Summary
SmartMove demonstrates a production-grade implementation of modern Full Stack Development practices. By combining declarative React interfaces, responsive Tailwind CSS styling, dual-engine mapping, camera-driven barcode scanning, and state synchronization, the platform provides a complete digital ecosystem for municipal public transit.

### Roadmap & Future Enhancements:
- **Backend API & Microservices:** Implement an Express/NestJS backend backed by PostgreSQL / PostGIS for geospatial route queries.
- **Hardware IoT Integration:** MQTT telemetry streams directly from onboard GPS hardware devices on CTU buses.
- **Native Mobile Apps:** Cross-platform mobile deployment using React Native / Flutter for offline ticket caching.
- **Automated UPI Payment Webhooks:** Live payment reconciliation via Razorpay / Cashfree webhook integration.

---

### 👨‍💻 Developer & Attribution
- **Developer:** Pruthviraj Bhosle ([GitHub Profile](https://github.com/Pruthviraj799))
- **Project URL:** [https://github.com/Pruthviraj799/FSD_bus_ticket](https://github.com/Pruthviraj799/FSD_bus_ticket)
- **Project Category:** Full Stack Development (FSD) Web Application
