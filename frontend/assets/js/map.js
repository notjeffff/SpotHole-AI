import { fetchPotholes } from './api.js';

let mapInstance = null;
let markersLayer = null;

export async function initMap() {
    console.log("Initializing Interactive Map");
    
    // Make sure Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error("Leaflet is not loaded.");
        return;
    }
    
    // Initialize map if not already initialized
    if (!mapInstance) {
        mapInstance = L.map('map').setView([40.7128, -74.0060], 13); // Default NYC

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapInstance);
        
        markersLayer = L.layerGroup().addTo(mapInstance);
    }
    
    await refreshMapData();
    
    // Auto refresh every 15 seconds only if tab is visible
    setInterval(() => {
        if (!document.hidden && document.getElementById('view-map').style.display !== 'none') {
            refreshMapData();
        }
    }, 15000);
}

async function refreshMapData() {
    if (!markersLayer) return;
    
    const potholes = await fetchPotholes();
    markersLayer.clearLayers();
    
    potholes.forEach(p => {
        // Determine color based on status/severity
        let color = '#2563eb'; // blue - verified/detected
        if (p.status === 'active') color = '#f59e0b'; // orange
        if (p.status === 'resolved') color = '#10b981'; // green
        if (p.severity === 'high' || p.severity === 'critical') color = '#ef4444'; // red
        
        const markerHtml = `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`;
        const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-leaflet-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });
        
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
                    <strong style="color: #fff;">#PH-${p.id}</strong>
                    <span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: #333; color: ${color}; text-transform: uppercase;">${p.status}</span>
                </div>
                <div style="font-size: 0.85rem; color: #a1a1aa; line-height: 1.5;">
                    <div><span style="color: #fff;">Severity:</span> ${p.severity || 'Unknown'}</div>
                    <div><span style="color: #fff;">Confidence:</span> ${p.confidence_score ? Math.round(p.confidence_score * 100) + '%' : 'N/A'}</div>
                    <div><span style="color: #fff;">Detections:</span> ${p.source_count}</div>
                    <div><span style="color: #fff;">Last Seen:</span> ${new Date(p.last_detected_at).toLocaleTimeString()}</div>
                    <div style="margin-top: 4px; font-size: 0.75rem; color: #71717a;">${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>
                </div>
            </div>
        `;
        
        // Use a custom popup to inherit dark mode nicely or just use inline styles
        marker.bindPopup(popupContent, {
            className: 'dark-popup'
        });
        
        markersLayer.addLayer(marker);
    });
    
    // Fit bounds if we have markers
    // if (potholes.length > 0) {
    //     const group = new L.featureGroup(markersLayer.getLayers());
    //     mapInstance.fitBounds(group.getBounds().pad(0.1));
    // }
}
