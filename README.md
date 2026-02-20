# Smart Crime Management System

A full-stack web application for crime management, FIR tracking, and region-based alerts.

## Tech Stack
- **Frontend**: React.js + Vite
- **Backend**: Firebase (Firestore + Auth + Storage)
- **Email Alerts**: EmailJS (client-side)
- **AI Module**: Python Flask (optional)

## Setup

### 1. Firebase Configuration
Replace the placeholder values in `.env.local` with your Firebase project credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Console Setup
1. **Authentication**: Enable Email/Password sign-in method
2. **Firestore**: Create database, then deploy the `firestore.rules`
3. **Storage**: Enable Firebase Storage

### 3. EmailJS (Optional — for email alerts)
1. Go to https://www.emailjs.com and create a free account
2. Create an Email Service (Gmail recommended)
3. Create a template with these variables: `{{to_email}}`, `{{station_name}}`, `{{fir_id}}`, `{{crime_type}}`, `{{location}}`, `{{description}}`, `{{citizen_name}}`, `{{date_time}}`
4. Fill in the EmailJS env vars in `.env.local`

### 4. Run Frontend
```bash
cd /Users/mac/Desktop/crime
npm run dev
```

### 5. Run Flask AI API (Optional)
```bash
cd flask_api
pip install -r requirements.txt
python app.py
```

## Roles
| Role | Default Dashboard | Capabilities |
|------|-------------------|-------------|
| **Admin** | `/admin` | Assign FIRs, manage officers/stations, view analytics |
| **Officer** | `/officer` | View & update assigned cases, criminal records |
| **Citizen** | `/citizen` | Submit FIRs, track status |

## Project Structure
```
src/
├── contexts/          # AuthContext, NotificationContext
├── firebase/          # Firebase config
├── pages/
│   ├── admin/         # AdminDashboard, AllFIRs, Officers, Stations
│   ├── officer/       # OfficerDashboard
│   ├── citizen/       # CitizenDashboard, SubmitFIR, MyFIRs
│   └── shared/        # CriminalRecords, Analytics
├── services/          # firestoreService, storageService, alertService
└── components/        # Sidebar, Navbar, ProtectedRoute
flask_api/
├── app.py             # Flask REST API
├── classifier.py      # ML crime classifier
└── requirements.txt
```

## Features
- 🔐 Role-Based Authentication (Admin, Officer, Citizen)
- 📋 FIR Submission with Evidence Upload
- 🗂️ Case Management with Officer Assignment
- 🚔 Criminal Records Database
- 🔔 Automated Station Alerts (in-app + email)
- 📊 Analytics Dashboard (4 Chart.js charts)
- 🤖 AI Crime Type Classifier (Flask)
