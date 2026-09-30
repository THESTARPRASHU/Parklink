# 🚗 ParkLink — Privacy-First Vehicle Reach & Unblock Network

> **Instant, zero-leak communication with blocking vehicle owners using AI License Plate Recognition and Masked Virtual Relay Calling.**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8e7cc3.svg)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e.svg)](https://supabase.com/)

---

## 📌 Problem Statement

In crowded cities, residential societies, corporate IT parks, and commercial markets, **blocked vehicles** are an everyday crisis:
* Traditional paper notes or windscreen phone stickers expose personal numbers to harassment, spam, and stalking.
* Honking causes neighborhood disturbance and rarely reaches the owner.
* Physical confrontations often escalate unnecessarily.

**ParkLink solves this** by allowing anyone to point their camera at any blocking vehicle's number plate to trigger an instant in-app unblock alert or initiate an encrypted, masked relay phone call — **without either party ever seeing the other's real phone number.**

---

## 🌟 Key Features

### 1. 🔐 Google Sign-In & Profile Photo Linking
* **1-Tap Google Login**: Connect with Google to fetch verified display name and high-resolution profile photo.
* **Separation of Concerns**: Uses the Google avatar exclusively for verified owner identification, then prompts for vehicle details (Plate, Type, Mobile Number).

### 2. 📸 Gemini AI License Plate OCR (ANPR)
* **Instant Camera Recognition**: High-speed plate extraction powered by `@google/genai` (Gemini 2.5 Flash).
* **Indian Plate Normalization**: Handles high-security registration plates (HSRP), irregular spacing, and state codes (`KA05MG1234`, `MH12AB0001`, `DL3CAA1234`).
* **Flashlight & Manual Fallback**: Built-in torch toggle, camera switcher, file upload, and manual plate entry keypad.

### 3. 🛡️ 100% Privacy-Preserving Architecture
* **Masked Phone Proxy**: Initiates outbound calls through a virtual relay bridge (`+91-80-XXXX-XXXX`). Real mobile numbers are never revealed.
* **Public Masking**: Search results only display masked plates (`KA05****78`) and masked contact references.

### 4. ⚡ Instant Unblock Alerts & In-App Chat
* **One-Tap Presets**: "Vehicle is blocked", "Moving in 5 minutes", "I am on my way", "Vehicle unblocked".
* **Real-Time Request Timeline**: Track status through `SENT` ➔ `DELIVERED` ➔ `ACCEPTED` ➔ `RESOLVED`.

### 5. 💳 Razorpay UPI Subscriptions & 7-Day Free Trial
* **Automatic Free Trial**: 7-day trial activated on vehicle registration.
* **Seamless UPI / Card Checkout**: Integrated ₹99/month subscription for unlimited plate scans and priority masked calling.

### 6. 📱 Progressive Web App (PWA)
* Fully installable on iOS and Android devices.
* Offline resilience with local database fallback cache and service worker.

---

## 🏗️ System Architecture

```text
       ┌────────────────────────┐
       │   Mobile / Web Client  │
       │  React 19 + TypeScript │
       └───────────┬────────────┘
                   │
         [REST / WebSocket APIs]
                   │
                   ▼
       ┌────────────────────────┐
       │   Node.js / Express    │
       │   Full-Stack Server    │
       └─────┬────────────┬─────┘
             │            │
             ▼            ▼
  ┌──────────────────┐  ┌──────────────────┐
  │ Google Gemini AI │  │  Supabase Cloud  │
  │ Vision Plate OCR │  │  PostgreSQL DB   │
  └──────────────────┘  └──────────────────┘
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

The backend synchronizes with Supabase using the following table structure:

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `users` | Vehicle owners & profile | `id`, `vehicle_id`, `full_name`, `number_plate`, `phone_number`, `avatar_url`, `subscription_status` |
| `vehicle_requests` | Unblock movement tickets | `id`, `requester_vehicle_id`, `target_vehicle_id`, `status`, `status_timeline` |
| `chat_messages` | In-app request communication | `id`, `request_id`, `sender_vehicle_id`, `text`, `created_at` |
| `notifications` | In-app alerts | `id`, `recipient_vehicle_id`, `title`, `message`, `read_status` |
| `subscriptions` | Payment transactions | `id`, `user_id`, `plan`, `amount`, `payment_id`, `expiry_date` |
| `incident_reports` | Abuse prevention & moderation | `id`, `reporter_vehicle_id`, `reported_vehicle_id`, `reason`, `status` |

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ installed
* Google Gemini API Key (`GEMINI_API_KEY`)
* Supabase Account (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/parklink.git
   cd parklink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize Supabase Schema:**
   Run the SQL statements from `supabase-schema.sql` inside your [Supabase SQL Editor](https://supabase.com/dashboard).

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📡 API Reference

### User & Authentication
* `GET /api/users/me` — Get authenticated user profile
* `POST /api/users/register` — Register vehicle with Google photo & phone number
* `POST /api/users/login` — Sign in via vehicle number plate or phone number
* `POST /api/users/logout` — End user session

### Vehicle Search & AI OCR
* `GET /api/vehicles/search?plate=KA01AB1234` — Search vehicle owner (returns masked privacy profile)
* `POST /api/ocr/scan` — Process base64 camera frame using Gemini Vision OCR

### Movement Requests
* `GET /api/requests?filter=active` — Fetch incoming & outgoing movement requests
* `POST /api/requests` — Submit movement request for a blocking vehicle
* `PATCH /api/requests/:id/status` — Update status (`ACCEPTED`, `MOVING`, `RESOLVED`)

### Privacy Calling & Payments
* `POST /api/call/initiate` — Launch masked relay calling bridge session
* `POST /api/subscriptions/razorpay-order` — Create Razorpay payment order
* `POST /api/subscriptions/verify` — Verify payment & activate subscription

---

## 🔒 Security & Privacy Guarantees

1. **Zero Phone Leakage**: Phone numbers are strictly stored on the backend and never exposed in client API responses.
2. **Normalized Matching**: Plate lookup handles all Indian RTO variations (`KA-05-CD-1234` ➔ `KA05CD1234`).
3. **Report & Blocking**: Users can flag spam or abusive calls, which alerts the administrative dashboard for review.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
