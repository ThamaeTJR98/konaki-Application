
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

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize Map only once
    if (!mapInstance.current) {
        const defaultCenter = center ? [center.lat, center.lng] : [-29.60, 28.20]; // Center of Lesotho
        
        mapInstance.current = window.L.map(mapRef.current).setView(defaultCenter, 9);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
    }

    // Clear existing markers
    mapInstance.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.icon) {
            mapInstance.current.removeLayer(layer);
        }
    });

    // Custom Icons
    const createIcon = (color: string, emoji: string) => {
        return window.L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    const landIcon = createIcon('#15803d', '🌱'); // Green-700
    const equipmentIcon = createIcon('#ea580c', '🚜'); // Orange-600

    // Add Markers
    listings.forEach(listing => {
        if (listing.coordinates) {
            const marker = window.L.marker(
                [listing.coordinates.lat, listing.coordinates.lng],
                { 
                    icon: listing.category === 'EQUIPMENT' ? equipmentIcon : landIcon 
                }
            ).addTo(mapInstance.current);

            // Simple Popup
            const popupContent = `
                <div style="font-family: sans-serif; min-width: 150px;">
                    <strong style="display:block; margin-bottom: 4px; color: #1c1917;">${listing.type}</strong>
                    <span style="font-size: 12px; color: #57534e;">${listing.district}</span>
                    <br/>
                    <button id="view-btn-${listing.id}" style="margin-top: 8px; background: #15803d; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 100%;">Sheba (View)</button>
                </div>
            `;
            
            marker.bindPopup(popupContent);

            marker.on('popupopen', () => {
                const btn = document.getElementById(`view-btn-${listing.id}`);
                if (btn) {
                    btn.onclick = () => onSelectListing(listing);
                }
            });
        }
    });

    // Cleanup on unmount
    return () => {
        // We keep the instance alive for performance if re-rendering often, 
        // but fully destroying is safer to avoid mem leaks in this specific setup.
        // mapInstance.current.remove();
        // mapInstance.current = null;
    };
  }, [listings, center, onSelectListing]);

  return <div ref={mapRef} className="w-full h-full z-0" />;
};

export default MapComponent;
