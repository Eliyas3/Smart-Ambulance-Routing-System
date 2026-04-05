const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Haversine formula to calculate distance in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = degree => (degree * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// POST to find nearest live hospitals
app.post(['/nearest', '/_backend/nearest'], async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        // Query Overpass API for hospitals within a 15km radius (15000 meters)
        const radius = 15000;
        const overpassQuery = `
            [out:json];
            (
                node["amenity"="hospital"](around:${radius},${lat},${lng});
                way["amenity"="hospital"](around:${radius},${lat},${lng});
                relation["amenity"="hospital"](around:${radius},${lat},${lng});
            );
            out center;
        `;

        const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
            headers: { 'Content-Type': 'text/plain' }
        });

        const elements = response.data.elements || [];
        const liveHospitals = [];

        // Track seen names to avoid duplicates for elements with same names
        const seenNames = new Set();

        elements.forEach((el, index) => {
            // Overpass API returns hospitals without names sometimes, we will fall back to "Unknown Hospital"
            // For routing and display, it's most useful to have named hospitals
            const name = (el.tags && el.tags.name) ? el.tags.name : null;
            
            if (name && !seenNames.has(name)) {
                seenNames.add(name);
                
                // If it's a way/relation, it has center.lat/lon; if node, it has lat/lon
                const hospitalLat = el.lat || (el.center && el.center.lat);
                const hospitalLng = el.lon || (el.center && el.center.lon);
                
                if (hospitalLat && hospitalLng) {
                    liveHospitals.push({
                        id: el.id || index,
                        name: name,
                        address: (el.tags && (el.tags['addr:full'] || el.tags['addr:street'])) || 'Address unavailable',
                        lat: hospitalLat,
                        lng: hospitalLng,
                        available_beds: Math.floor(Math.random() * 50) + 5 // mock random beds since OSM doesn't provide live ones
                    });
                }
            }
        });

        if (liveHospitals.length === 0) {
            return res.json({ nearest: null, alternatives: [], all: [] });
        }

        // Calculate distance and sort
        const hospitalsWithDistance = liveHospitals.map(hospital => {
            const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng);
            return { ...hospital, distance };
        });

        hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json({
            nearest: hospitalsWithDistance[0],            // Top 1
            alternatives: hospitalsWithDistance.slice(1, 2), // Next 1 nearest (Total 2)
            all: hospitalsWithDistance                    // Sorted list of all
        });
    } catch (error) {
        console.error("Overpass API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch live hospital data' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
