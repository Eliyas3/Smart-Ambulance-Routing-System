import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// Fix leaflet icon
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nearestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const AmbulanceTracker = ({ coordinates, isMoving }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;
    
    // Reset position if route changes
    setCurrentIdx(0);
  }, [coordinates]);

  useEffect(() => {
    if (!isMoving || !coordinates || coordinates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIdx(prev => {
        if (prev < coordinates.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev; // Stop at destination
        }
      });
    }, 100); // 100ms per coordinate step for fast impressive simulation
    
    return () => clearInterval(interval);
  }, [coordinates, isMoving]);

  if (!coordinates || coordinates.length === 0 || currentIdx >= coordinates.length) return null;

  const pos = coordinates[currentIdx];

  const ambulanceIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/48/000000/ambulance.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <Marker position={[pos.lat, pos.lng]} icon={ambulanceIcon} zIndexOffset={1000}>
      <Popup autoPan={false}>Ambulance En Route...</Popup>
    </Marker>
  );
};

const RoutingMachine = ({ userLoc, targetLoc, onRouteFound, setRouteCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLoc || !targetLoc) return;

    try {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLoc.lat, userLoc.lng),
          L.latLng(targetLoc.lat, targetLoc.lng),
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: true,
        show: false, // Hide the turn-by-turn text box from the map
        lineOptions: {
          styles: [{ color: '#2563eb', weight: 5 }]
        },
        altLineOptions: {
          styles: [{ color: '#94a3b8', weight: 4, dashArray: '5, 5' }]
        },
        createMarker: () => null
      }).addTo(map);

      routingControl.on('routesfound', function(e) {
        if (e.routes && e.routes.length > 0) {
          if (onRouteFound) onRouteFound(e.routes);
          if (setRouteCoords) setRouteCoords(e.routes[0].coordinates);
        }
      });

      return () => {
        try {
          if (map && routingControl) {
            map.removeControl(routingControl);
          }
        } catch(e) {}
      };
    } catch(e) {
      console.error(e);
    }
  }, [map, userLoc, targetLoc]);

  return null;
};

const MapClick = ({ setUserLoc }) => {
  useMapEvents({
    click(e) {
      setUserLoc({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const MapComponent = ({ userLocation, setUserLocation, nearestHospital, otherHospitals = [], onRouteFound, isAmbulanceMoving }) => {
  // Center roughly on NYC if no user location
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [40.730610, -73.935242];
  const [routeCoords, setRouteCoords] = useState([]);

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      {/* Satellite mode using Esri World Imagery */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri'
      />

      <MapClick setUserLoc={setUserLocation} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {nearestHospital && (
        <Marker position={[nearestHospital.lat, nearestHospital.lng]} icon={nearestIcon}>
          <Popup>
            <strong>{nearestHospital.name}</strong><br/>
            Nearest Hospital
          </Popup>
        </Marker>
      )}

      {otherHospitals.map(h => (
        <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
          <Popup>
            <strong>{h.name}</strong><br />
            {h.address}
          </Popup>
        </Marker>
      ))}

      {userLocation && nearestHospital && (
        <RoutingMachine userLoc={userLocation} targetLoc={nearestHospital} onRouteFound={onRouteFound} setRouteCoords={setRouteCoords} />
      )}

      {routeCoords && routeCoords.length > 0 && (
        <AmbulanceTracker coordinates={routeCoords} isMoving={isAmbulanceMoving} />
      )}
    </MapContainer>
  );
};

export default MapComponent;
