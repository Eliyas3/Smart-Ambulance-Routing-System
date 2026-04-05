# Smart Ambulance Routing Dashboard 🚑

A simple, fast, and modern full-stack web application designed to find and route to the nearest hospital in real-time. Built with React.js, Express, MongoDB/JSON, and Leaflet.

## 📂 Folder Structure

```
sambsys/
│
├── backend/                  # Node.js + Express API
│   ├── package.json
│   ├── data.json             # Static dataset with 7 mock hospitals
│   └── server.js             # Express server logic & Haversine distance calc
│
└── frontend/                 # React frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx          # React initialization
        ├── App.jsx           # Main Dashboard UI & Controller
        ├── MapComponent.jsx  # Leaflet maps and OSRM routing machine
        └── index.css         # Pure CSS minimal, professional styling
```

## 🛠️ Tech Stack & Features

- **Frontend**: React (Vite), pure modern CSS (flexbox, CSS vars), `lucide-react` for beautiful icons.
- **Backend**: Node.js & Express API calculating the shortest distance using the **Haversine formula**.
- **Mapping & Routing**: `Leaflet`, `react-leaflet`, and `leaflet-routing-machine` using the default OSRM demo server for turn-by-turn routing paths. CartoDB map tiles are included for a fast, minimal, professional visual feel. 

## 🚀 Setup Instructions

Follow these instructions to run the application locally on your machine.

### 1. Start the Backend API
The backend calculates the distance to the hospitals and sorts them.

1. Open a new terminal and navigate to the `backend` folder:
   ```bash
   cd desktop/sambsys/backend
   ```
2. Install the necessary dependencies (Express, Cors):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   node server.js
   ```
   *The server will start on `http://localhost:5000`.*

### 2. Start the Frontend Dashboard
The frontend displays the interactive map and modern dashboard UI.

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd desktop/sambsys/frontend
   ```
2. Install the required Node packages (React, Leaflet, Axios, Lucide):
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will launch. Open the `http://localhost:5173` link in your browser.*

## 💡 Usage

- **Determine Start Location**: Click on **"Use My Location"** in the top right to use HTML5 geolocation to place a pin, or simply **click anywhere on the map** to drop a manual custom point.
- **View Dashboard Data**: The UI immediately calls the backend, calculates the nearest hospital, and draws an optimized blue path to it. 
- **Observe the Hierarchy**: The top nearest hospital gets a highlighted card on the right, followed by 2 alternative choices below it.

Enjoy this fast, clean, and resume-ready full-stack application!
