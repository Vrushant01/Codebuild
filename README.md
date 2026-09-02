# MEDIREACH - Full-Stack Healthcare Platform

MEDIREACH is a comprehensive, production-grade healthcare accessibility platform featuring multi-role access (Patients, Doctors, Receptionists, Healthcare Organizations, and Platform Administrators).

## Architecture

- **`Codebuild/`**: Modern React + TypeScript + Vite + Tailwind CSS frontend with multilingual support (English & Gujarati), interactive map discovery, real-time consultation management, and responsive portals for all roles.
- **`server/`**: Express + TypeScript + MongoDB Atlas + Socket.IO + Razorpay backend with atomic double-booking prevention, pay-per-patient incremental billing, and real-time WebRTC/Socket signaling.

## Getting Started

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd Codebuild
npm install
npm run dev
```

## Features
- **Patient Portal**: AI Symptom checker, Leaflet GPS hospital & clinic discovery, booking, allergies passport, and telemedicine.
- **Doctor Portal**: Daily schedule, real-time consultation queue, patient history, and platform lead attribution.
- **Receptionist Portal**: Front desk operations, walk-in patient registration, attendance check-in, and provider availability.
- **Organization Portal**: Departmental analytics, doctor management, staff permissions, and automated Razorpay billing ledger.
- **Platform Admin Portal**: Platform settings, multi-hospital verification, and system metrics.
