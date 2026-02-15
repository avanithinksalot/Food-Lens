# Implementation Plan - AI-Based Food Safety Risk Assessment Platform

## 1. Project Setup
- [ ] Initialize Project Directory Structure
  - [ ] `frontend/` (Next.js)
  - [ ] `backend/` (FastAPI)
  - [ ] `database/` (SQL Scripts / Schema)
- [ ] Setup Version Control (Git)

## 2. Backend Foundation (Node.js & Express)
- [ ] Initialize Node.js Project in `backend/`
- [ ] Install Dependencies (`express`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `multer`, `sequelize`, `sqlite3`)
- [ ] Setup Express Server Structure
- [ ] Define Database Models (Sequelize)
  - [ ] `User`, `Role`, `Subscription`
  - [ ] `Scan`, `ScanImage`, `CropType`
- [ ] Implement Authentication System
  - [ ] JWT Token generation
  - [ ] Login/Signup endpoints
  - [ ] Role-based middleware

## 3. Frontend Foundation (Next.js)
- [ ] Initialize Next.js App (No Tailwind, using CSS Modules/Vanilla CSS as per protocols)
- [ ] Setup Global Styles (Variables for Colors, Typography, Glassmorphism effects)
- [ ] Create Layout & Navigation Structure (Responsive)
- [ ] Setup API Client (Axios/Fetch wrapper)

## 4. Phase 1: Authentication & Dashboard
- [x] **Backend**: User Registration & Login APIs
- [x] **Frontend**: Login & Signup Pages
- [x] **Frontend**: Role-based Dashboard redirection (Farmer/Vendor/Retailer views)

## 5. Phase 2: Image Upload & Preprocessing
- [x] **Backend**: `/analyze-image` stub endpoint
- [x] **Backend**: Image upload handling (Multer logic ready, currently using mock)
- [x] **Frontend**: Upload Component (Drag & drop, Preview)

## 6. Phase 3: AI Modules (Mocked initially)
- [x] **Disease Detection Engine**: Mock JSON response first.
- [x] **Residue Risk**: Placeholder logic.
- [x] **Unified Scoring**: Weighted formula implementation (Mocked).

## 7. Phase 4: Reports & Analytics
- [x] **Backend**: Generate PDF endpoint (`pdfkit`).
- [x] **Frontend**: Visualization (Charts for trends - Dashboard UI).

## 8. Final Polish
- [ ] AESthtics Audit (Animations, transitions).
- [ ] Deployment Prep.
