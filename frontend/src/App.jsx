import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Navigation, 
  MapPin, 
  Activity, 
  AlertCircle,
  Map as MapIcon,
  CheckCircle2,
  Search,
  Moon,
  Sun,
  Play
} from 'lucide-react';
import MapComponent from './MapComponent';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeInstructions, setRouteInstructions] = useState(null);
  
  // New States for Search and Target Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);

  // States for interactive features
  const [theme, setTheme] = useState('light');
  const [isAmbulanceMoving, setIsAmbulanceMoving] = useState(false);

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle getting current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  // Fetch nearest hospitals when user location changes
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearest = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post(`${API_URL}/nearest`, {
          lat: userLocation.lat,
          lng: userLocation.lng
        });
        setNearestInfo(response.data);
        setSelectedHospital(response.data.nearest); // Default to absolute nearest
        setRouteInstructions(null);
        setSearchQuery('');
        setIsAmbulanceMoving(false); // Reset ambulance animation
      } catch (err) {
        console.error(err);
        setError('Failed to fetch nearest hospitals data.');
      } finally {
        setLoading(false);
      }
    };

    fetchNearest();
  }, [userLocation]);

  // Derived state for display
  let displayHospitals = [];
  if (nearestInfo && nearestInfo.all) {
    if (searchQuery.trim().length > 0) {
      displayHospitals = nearestInfo.all.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      // Default: show nearest + 1 alternative as requested previously (total 2)
      displayHospitals = [nearestInfo.nearest, ...(nearestInfo.alternatives || [])];
    }
  }

  // To highlight markers properly
  const otherHospitals = nearestInfo && nearestInfo.all ? nearestInfo.all.filter(h => h.id !== selectedHospital?.id) : [];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <h1>
          <Activity size={28} color="var(--primary)" />
          Smart Ambulance Routing
        </h1>
        <div className="controls">
          <button className="btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn primary" onClick={handleCurrentLocation}>
            <Navigation size={18} />
            Use My Location
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Left Side: Map */}
        <div className="map-container">
          <MapComponent 
            userLocation={userLocation} 
            setUserLocation={setUserLocation}
            nearestHospital={selectedHospital} // Acts as routing target
            otherHospitals={otherHospitals} // Show all other hospitals in radius
            onRouteFound={setRouteInstructions}
            isAmbulanceMoving={isAmbulanceMoving}
          />
        </div>

        {/* Right Side: Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Hospitals Nearby</h2>
            <div className="user-location-info" style={{ marginBottom: '1rem' }}>
              <MapPin size={16} />
              {userLocation 
                ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                : 'Click map or set location to begin'}
            </div>
            
            {/* Search Bar */}
            {userLocation && nearestInfo && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search and select a hospital..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}
          </div>

          <div className="hospital-list">
            {error && (
              <div className="message-box" style={{ color: '#ef4444', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
                <AlertCircle size={20} style={{ margin: '0 auto 0.5rem' }} />
                {error}
              </div>
            )}

            {loading && !nearestInfo && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Finding optimal route...</p>
              </div>
            )}

            {!userLocation && !loading && (
              <div className="empty-state">
                <MapIcon className="empty-state-icon" />
                <h3>No Location Set</h3>
                <p>Click "Use My Location" or tap anywhere on the map to find the nearest hospital.</p>
              </div>
            )}

            {nearestInfo && !loading && (
               <>
                {displayHospitals.map((hospital, idx) => {
                  const isSelected = selectedHospital && selectedHospital.id === hospital.id;
                  const isAbsoluteNearest = nearestInfo.nearest && nearestInfo.nearest.id === hospital.id;
                  
                  return (
                    <div 
                      className={`hospital-card ${isSelected ? 'nearest' : ''}`} 
                      key={hospital.id}
                      onClick={() => {
                        setSelectedHospital(hospital);
                        setRouteInstructions(null); // Clear pending routes while calculating new one
                        setIsAmbulanceMoving(false); // Reset ambulance tracking on new route target
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Highlight absolute nearest if it is also the selected one or just to denote it */}
                      {isAbsoluteNearest && (
                        <div className="tag-nearest" style={{ background: isSelected ? 'var(--primary-light)' : 'var(--surface-alt)', color: isSelected ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} />
                          Absolute Nearest
                        </div>
                      )}
                      
                      {/* Display explicit Selected tag if not absolute nearest but selected */}
                      {!isAbsoluteNearest && isSelected && (
                        <div className="tag-nearest">
                          <Navigation size={12} />
                          Target Location
                        </div>
                      )}

                      <div className="hospital-name">{hospital.name}</div>
                      <div className="hospital-info">
                        <div className="info-row">
                          <MapPin size={16} />
                          {hospital.address}
                        </div>
                        <div className="info-row">
                          <Navigation size={16} />
                          <span className="distance" style={{ background: isSelected ? 'var(--primary-light)' : 'var(--surface-alt)' }}>{hospital.distance.toFixed(2)} km away</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Display Route Instructions */}
                {selectedHospital && routeInstructions && Array.isArray(routeInstructions) && (
                  <div className="route-details-panel">
                    <h3 style={{ fontSize: '1rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                      🚦 Traffic-Aware Routing To Target
                    </h3>
                    
                    {routeInstructions.map((route, idx) => (
                      <div key={idx} style={{ marginTop: '0.5rem', background: 'var(--surface)', border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div style={{ fontWeight: '600', color: idx === 0 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                            {idx === 0 ? '⚡ Fastest Route' : '🛣️ Alternative Route'}
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', background: idx === 0 ? 'var(--primary-light)' : 'var(--surface-alt)', color: 'var(--text-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            {Math.round(route.summary.totalDistance / 1000 * 10) / 10} km • {Math.round(route.summary.totalTime / 60)} min
                          </div>
                        </div>
                        
                        {/* Only show full steps for the fastest route to save space */}
                        {idx === 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                            {route.instructions.map((step, stepIdx) => (
                              <div key={stepIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderBottom: stepIdx < route.instructions.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-primary)' }}>{step.text || 'Continue'}</span>
                                <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                                  {step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <button 
                      className="btn primary" 
                      onClick={() => setIsAmbulanceMoving(true)}
                      style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontWeight: 'bold' }}
                    >
                      <Play size={18} />
                      DISPATCH AMBULANCE
                    </button>
                    
                  </div>
                )}
                
                {displayHospitals.length === 0 && searchQuery && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No hospitals match your search.
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
