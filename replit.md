# ECG Summit Registration App

## Overview
A registration system for the National Pulmonary Hypertension Symposium. Originally built for Netlify, now adapted to run on Replit.

## Architecture
- **Frontend**: Static HTML/CSS/JS in `public/`
- **Backend**: Express.js server (`server.js`) that handles API routes
- **Database**: MongoDB (requires `MONGO_URI` environment variable)

## API Endpoints
The server provides endpoints that mirror the original Netlify functions:
- `POST /.netlify/functions/register` - Submit registration
- `POST /.netlify/functions/adminLogin` - Admin authentication
- `GET /.netlify/functions/getRegistrations` - Get all registrations (auth required)
- `GET /.netlify/functions/exportExcel` - Export to CSV (auth required)

## Environment Variables Required
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing (optional, has default)
- `ADMIN_EMAIL` - Admin login email (optional, defaults to admin@example.com)
- `ADMIN_PASSWORD` - Admin login password (optional, defaults to admin123)

## Running the App
The server runs on port 5000 and serves static files from the `public/` directory.

## Pages
- `/` or `/index.html` - Registration form
- `/admin-login.html` - Admin login page
- `/admin-dashboard.html` - Admin dashboard to view registrations
