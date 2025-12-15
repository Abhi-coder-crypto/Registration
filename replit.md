# ECG Summit Registration App

## Overview
A registration system for the National Pulmonary Hypertension Symposium. Supports both Replit development and Vercel deployment.

## Architecture
- **Frontend**: Static HTML/CSS/JS in `public/`
- **Backend (Replit)**: Express.js server (`server.js`)
- **Backend (Vercel)**: Serverless functions in `api/`
- **Database**: MongoDB (requires `MONGO_URI` environment variable)

## Recent Changes (Dec 15, 2025)
- Added duplicate email/mobile prevention with user-friendly alerts
- Added double-click prevention on registration button
- Made website mobile responsive (scrollable on mobile, fixed on desktop)
- Changed admin export from CSV to Excel format (.xlsx)

## Pages
- `/` or `/index.html` - User registration form
- `/admin-login.html` - Admin login page
- `/admin-dashboard.html` - Admin dashboard to view registrations and export CSV

## API Endpoints
- `POST /api/register` - Submit registration
- `POST /api/adminLogin` - Admin authentication
- `GET /api/getRegistrations` - Get all registrations (auth required)
- `GET /api/exportExcel` - Export to CSV (auth required)

## Environment Variables Required
- `MONGO_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret for JWT token signing (optional, has default)
- `ADMIN_EMAIL` - Admin login email (optional, defaults to admin@example.com)
- `ADMIN_PASSWORD` - Admin login password (optional, defaults to admin123)

## Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
4. Deploy

The `vercel.json` and `api/` folder are configured for Vercel serverless functions.

## Local Development (Replit)
The server runs on port 5000 and serves static files from the `public/` directory.
