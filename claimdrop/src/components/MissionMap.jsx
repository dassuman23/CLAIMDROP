import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Custom Marker for the Rider (using Lucide Navigation icon logic)
const riderIcon = new L.DivIcon({
  className: 'custom-rider-icon',
  html: `<div style="transform: rotate(45deg); color: #16a34a;">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2">
             <polygon points="3 11 22 2 13 21 11 13 3 11" />
           </svg>
         </div>`,
  iconSize: [32, 32],
});

export default function MissionMap({ riderPos, storePos }) {
  return (
    <div className="h-[300px] w-full rounded-[2rem] overflow-hidden shadow-inner border border-slate-200">
      <MapContainer center={[storePos.lat, storePos.lng]} zoom={15} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {/* Store Location */}
        <Marker position={[storePos.lat, storePos.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>

        {/* Rider Location */}
        {riderPos && (
          <Marker position={[riderPos.lat, riderPos.lng]} icon={riderIcon} />
        )}
      </MapContainer>
    </div>
  );
}