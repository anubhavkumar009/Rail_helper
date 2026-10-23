<div align="center">

# 🚆 Rail Helper

### Next-Gen Indian Railways Transit & Passenger Information System

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*A full-stack, responsive Indian Railways passenger assistant and tracking application. Built with high-efficiency in-memory caching, offline fallback resilience, real-time live boards, quota-saving station lookups, and one-tap emergency helplines.*

[Live Web Demo](https://rail-helper.vercel.app) • [Backend API Proxy](https://rail-helper.onrender.com) • [Report Bug](https://github.com/anubhavkumar009/Rail_helper/issues)

---

</div>

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI & CLI)](#1-backend-setup-fastapi--cli)
  - [2. Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
- [Backend API Endpoints](#-backend-api-endpoints)
- [Caching & Quota Optimization](#-caching--quota-optimization)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**Rail Helper** provides a modern, fast, and unified web interface to interact with Indian Railway data. Designed to overcome frequent rate limits and monthly quota constraints of transit APIs, Rail Helper employs a **two-tier caching mechanism** (Client SessionStorage + Server In-Memory LRU/TTL) alongside an offline local station lookup database.

Whether tracking train delays on running trains, verifying seat confirmation chances across quotas, or finding instant platform updates, Rail Helper delivers a polished glassmorphism UI with zero-friction navigation.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📍 **Live Train Status** | Real-time GPS/cellular train tracking, delay metrics, running speed (km/h), coach layout position, and next/previous halt alerts. |
| 🗓️ **Train Schedule & Route** | Complete halt-by-halt timetable, arrival/departure schedules, stop duration, cumulative distance, and origin/destination markers. |
| 🔄 **Trains Between Stations** | Search all running trains connecting any two stations, showing journey duration, day-wise frequency, and total halts. |
| 💺 **Multi-Day Seat Availability** | Dynamic 6-day availability matrix across travel classes (`1A`, `2A`, `3A`, `3E`, `CC`, `SL`, `2S`) and quotas (`GN`, `TQ`, `LD`, `SS`). |
| 🔍 **Zero-Quota Station Search** | Built-in offline mapping for 500+ major Indian stations with instant fuzzy search by station code, name, city, or state. |
| 🚉 **Station Trains Directory** | Comprehensive list of all trains originating, terminating, or halting at any selected railway station. |
| 🕒 **Station Live Arrival/Departure Board** | Virtual airport-style railway station board with 2h, 4h, and 8h time windows, platform numbers, and delay tracking. |
| 🚨 **Passenger Safety & Emergency Modal** | One-tap dialing for **Rail Madad (139)**, **RPF Police (182 / 112)**, and **Medical Emergency (138 / 108)** with IVRS guide & SMS syntax. |
| 💻 **Terminal CLI App** | Includes an interactive Python CLI (`app.py`) for command-line users without needing a browser. |

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│       React 19 Frontend        │         │      FastAPI Proxy Backend     │
│   (Vite + Tailwind CSS v4)     │ ──HTTP─▶│      (Python 3.10+ Async)      │
│  - SessionStorage TTL Cache    │         │  - In-Memory Response Caching  │
│  - Lucide Icons & Responsive   │         │  - Local Station Code Lookup   │
└────────────────────────────────┘         └───────────────┬────────────────┘
                                                           │ Bearer Token
                                                           ▼
                                            ┌───────────────────────────────┐
                                            │      RailRadar v1 API         │
                                            │  (Live Indian Railway Data)   │
                                            └───────────────────────────────┘
```

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom animations and Glassmorphism
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State & Caching**: Custom SessionStorage caching engine with configurable TTL

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI)
- **Data Fetching**: [Requests](https://requests.readthedocs.io/)
- **Environment Management**: [python-dotenv](https://github.com/theskumar/python-dotenv)
- **Resilience**: Dynamic fallback mock data generator for testing during API outages

---

## 📂 Repository Structure

```text
Rail_helper/
├── backend/
│   ├── app.py                # Standalone interactive Terminal CLI application
│   ├── server.py             # FastAPI backend server with caching & CORS
│   ├── requirements.txt      # Python backend dependencies
│   └── .env                  # Backend secrets (ignored by Git)
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React UI components
│   │   │   ├── EmergencyModal.jsx       # 24x7 Rail Madad & Safety modal
│   │   │   ├── LiveBoard.jsx            # Station live departure/arrival board
│   │   │   ├── LiveTrainStatus.jsx      # GPS tracking & status timeline
│   │   │   ├── Navbar.jsx               # Navigation bar & quick helpline access
│   │   │   ├── SeatAvailability.jsx     # Class & Quota seat calendar
│   │   │   ├── StationAutocomplete.jsx  # Smart station search input
│   │   │   ├── StationSearch.jsx        # Search and browse stations
│   │   │   ├── StationTrains.jsx        # Trains passing through a station
│   │   │   ├── TrainSchedule.jsx        # Timetable & halt sequence
│   │   │   └── TrainsBetween.jsx        # Inter-city train discovery
│   │   ├── utils/
│   │   │   └── cache.js      # SessionStorage caching utility
│   │   ├── api.js            # Axios client & station database
│   │   ├── App.jsx           # Main application entry & tab router
│   │   ├── App.css           # Custom styling rules
│   │   ├── index.css         # Tailwind base styles
│   │   └── main.jsx          # React DOM root
│   ├── package.json          # Node dependencies and build scripts
│   ├── vite.config.js        # Vite build & proxy configuration
│   ├── tailwind.config.js    # Tailwind configuration
│   └── vercel.json           # Vercel deployment configuration
├── .gitignore                # Git exclusions (.venv, node_modules, .env)
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher ([Download](https://nodejs.org/))
- **Python**: `v3.10` or higher ([Download](https://www.python.org/))
- **Git**: ([Download](https://git-scm.com/))

---

### 1. Backend Setup (FastAPI & CLI)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anubhavkumar009/Rail_helper.git
   cd Rail_helper
   ```

2. **Create and activate a Python virtual environment:**
   - **Windows:**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\activate
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Configure environment variables:**
   Create a `backend/.env` file with your credentials:
   ```env
   RAILRADAR_API_KEY=your_railradar_api_key_here
   RAILRADAR_BASE_URL=https://api.railradar.in/v1
   PORT=8000
   HOST=0.0.0.0
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Start the FastAPI backend server:**
   ```bash
   cd backend
   python server.py
   # Or using uvicorn directly:
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend will be running at `http://localhost:8000` with Swagger documentation at `http://localhost:8000/docs`.

6. *(Optional)* **Run the Terminal CLI:**
   ```bash
   python backend/app.py
   ```

---

### 2. Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Configure frontend environment variables:**
   Create a `frontend/.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 📡 Backend API Endpoints

All backend endpoints are prefixed with `/api` and feature automatic in-memory caching:

| Method | Endpoint | Description | Cache Duration |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Check proxy server status and cached query count | None |
| `GET` | `/api/trains/{train_number}/live` | Live train running status & GPS location | 2 minutes (120s) |
| `GET` | `/api/trains/{train_number}/schedule` | Train timetable and route stop details | 24 hours (86,400s) |
| `GET` | `/api/trains/between` | Trains running between `source` and `destination` | 1 hour (3,600s) |
| `GET` | `/api/trains/{train_number}/seats` | Seat availability for given date, class, and quota | 15 minutes (900s) |
| `GET` | `/api/stations/search` | Search stations by query (`q`) | 7 days (604,800s) |
| `GET` | `/api/stations/{station_code}/trains` | List all trains passing through a station | 6 hours (21,600s) |
| `GET` | `/api/stations/{station_code}/live` | Live station arrivals/departures board | 2 minutes (120s) |

---

## ⚡ Caching & Quota Optimization

To safeguard external API allowances and deliver fast response times, Rail Helper incorporates multi-level optimizations:

1. **Local Station Resolver**: Common stations like `NDLS`, `MMCT`, `HWH`, `BSB`, and `MAS` are mapped instantly in Python without triggering external lookup requests.
2. **Tiered TTL In-Memory Cache**: Fixed schedules are cached for up to 24 hours, while dynamic live positions are refreshed every 2 minutes.
3. **Frontend Client Caching**: Client-side state transitions use `sessionStorage` with automatic expiration to prevent duplicate network calls when switching between tabs.
4. **Mock Fallback Engine**: If the external API quota is exceeded or offline, the server gracefully serves structured mock data for uninterrupted evaluation and testing.

---

## 🌐 Deployment Guide

### Deploying the Frontend on Vercel
1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Set the **Root Directory** to `frontend`.
4. Configure Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api-url.com/api`
5. Deploy! (Included `vercel.json` handles Single Page Application rewrites automatically).

### Deploying the Backend on Render
1. Create a new **Web Service** in [Render](https://render.com/).
2. Select your repository and configure:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `RAILRADAR_API_KEY`: `your_key`
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

<div align="center">

Made with ❤️ for Indian Railway commuters and travelers.

</div>
