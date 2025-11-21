import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LocationPoint } from '../types';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapViewProps {
  path: LocationPoint[];
  currentLocation: LocationPoint | null;
}

// Component to auto-center map
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom()); // Keep zoom, update center
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ path, currentLocation }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-black flex items-center justify-center">Loading Map...</div>;

  const polylinePositions = path.map(p => [p.lat, p.lng] as [number, number]);
  const center: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : [37.7749, -122.4194]; // Default SF

  // Custom pulse icon for current location
  const pulseIcon = divIcon({
    className: 'custom-pulse-icon',
    html: `<div class="relative flex items-center justify-center w-6 h-6">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div className="w-full h-full relative z-0">
       {/* Fog Overlay Simulation (Gradient at top) */}
       <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent z-[400] pointer-events-none" />

      <MapContainer 
        center={center} 
        zoom={16} 
        style={{ width: '100%', height: '100%', background: '#000' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dark Mode Tiles - CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* The "Cleared" Path */}
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ 
            color: '#60a5fa', // blue-400
            weight: 6, 
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }} 
        />

        {/* Inner glow for path */}
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ 
            color: '#93c5fd', // blue-300
            weight: 2, 
            opacity: 1,
          }} 
        />

        {currentLocation && (
          <>
            <Marker position={center} icon={pulseIcon}>
            </Marker>
            <MapUpdater center={center} />
          </>
        )}
      </MapContainer>
      
      {/* Floating stats overlay */}
      <div className="absolute top-12 left-4 right-4 z-[500] flex justify-between items-start pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
           <span className="text-xs font-bold text-zinc-300 tracking-widest">ALTITUDE</span>
           <div className="text-xl font-light text-white">
             {currentLocation?.alt ? Math.round(currentLocation.alt) : '--'} <span className="text-sm font-normal text-zinc-400">m</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
