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
