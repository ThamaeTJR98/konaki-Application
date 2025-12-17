
import React, { useEffect, useRef } from 'react';
import { Listing } from '../types';

// Declare Leaflet globally as we are loading via CDN
declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  center?: { lat: number, lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({ listings, onSelectListing, center }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Safety check for Leaflet
    if (!window.L) {
        console.warn("Leaflet (window.L) is not available.");
        return;
    }

    // Initialize Map only once
    if (!mapInstance.current) {
        const defaultCenter = center ? [center.lat, center.lng] : [-29.60, 28.20]; // Center of Lesotho
        
        mapInstance.current = window.L.map(mapRef.current).setView(defaultCenter, 9);

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance.current);
        
        // Load Leaflet.markercluster CSS dynamically if not present
        if (!document.getElementById('marker-cluster-css')) {
            const link = document.createElement('link');
            link.id = 'marker-cluster-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
            document.head.appendChild(link);
            
            const link2 = document.createElement('link');
            link2.rel = 'stylesheet';
            link2.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
            document.head.appendChild(link2);
        }

        // Load Leaflet.markercluster JS dynamically
        if (!window.L.MarkerClusterGroup) {
             const script = document.createElement('script');
             script.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
             script.onload = () => {
                 // Re-trigger effect or handle ready state
             };
             document.head.appendChild(script);
        }
    }

    // Debounce to allow script loading
    const timer = setTimeout(() => {
        if (!mapInstance.current) return;

        // Clear existing markers layer
        if (markersLayer.current) {
            mapInstance.current.removeLayer(markersLayer.current);
        }

        // Custom Icons
        const createIcon = (color: string, emoji: string) => {
            return window.L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); font-size: 18px;">${emoji}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
        };

        const landIcon = createIcon('#15803d', '🌱'); 
        const equipmentIcon = createIcon('#ea580c', '🚜');

        // Create Cluster Group if library loaded, else normal LayerGroup
        if (window.L.MarkerClusterGroup) {
            markersLayer.current = new window.L.MarkerClusterGroup({
                showCoverageOnHover: false,
                iconCreateFunction: function(cluster: any) {
                    return window.L.divIcon({ 
                        html: `<div style="background-color: #15803d; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 4px solid #dcfce7;">${cluster.getChildCount()}</div>`, 
                        className: 'my-cluster', 
                        iconSize: window.L.point(40, 40) 
                    });
                }
            });
        } else {
            markersLayer.current = window.L.layerGroup();
        }

        listings.forEach(listing => {
            if (listing.coordinates) {
                const marker = window.L.marker(
                    [listing.coordinates.lat, listing.coordinates.lng],
                    { 
                        icon: listing.category === 'EQUIPMENT' ? equipmentIcon : landIcon 
                    }
                );

                // Styled Popup
                const popupContent = `
                    <div style="font-family: 'Rubik', sans-serif; min-width: 200px; padding: 4px;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                             <span style="font-size:20px;">${listing.category === 'EQUIPMENT' ? '🚜' : '🌱'}</span>
                             <div>
                                <strong style="display:block; color: #1c1917; font-size:14px; line-height:1.2;">${listing.type}</strong>
                                <span style="font-size: 11px; color: #57534e; text-transform:uppercase; letter-spacing:0.5px; font-weight:bold;">${listing.district}</span>
                             </div>
                        </div>
                        <p style="font-size:12px; color:#44403c; margin:0 0 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${listing.description}</p>
                        <button id="view-btn-${listing.id}" style="
                            background: #15803d; 
                            color: white; 
                            border: none; 
                            padding: 8px 12px; 
                            border-radius: 8px; 
                            font-size: 12px; 
                            font-weight: 600; 
                            cursor: pointer; 
                            width: 100%;
                            transition: background 0.2s;
                        ">
                            Sheba (View Details)
                        </button>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                marker.on('popupopen', () => {
                    const btn = document.getElementById(`view-btn-${listing.id}`);
                    if (btn) {
                        btn.onclick = () => onSelectListing(listing);
                    }
                });

                markersLayer.current.addLayer(marker);
            }
        });

        mapInstance.current.addLayer(markersLayer.current);

    }, 100);

    return () => clearTimeout(timer);

  }, [listings, center, onSelectListing]);

  // Render a placeholder if L is missing at first render (though it should be loaded from index.html)
  if (typeof window !== 'undefined' && !window.L) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
              <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-stone-300 border-t-green-600 rounded-full animate-spin mb-2"></div>
                  <span className="text-xs font-bold">Loading Map...</span>
              </div>
          </div>
      );
  }

  return <div ref={mapRef} className="w-full h-full z-0 outline-none" />;
};

export default MapComponent;
