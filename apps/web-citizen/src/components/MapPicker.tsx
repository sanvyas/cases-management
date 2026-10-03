import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

const DEFAULT_CENTER: [number, number] = [26.8467, 80.9462];
const DEFAULT_ZOOM = 13;

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
}

export function MapPicker({ initialLat, initialLng, onSelect, onClose }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const updateMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        className: '',
        html: '<div style="width:32px;height:32px;background:#C24E33;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current?.getLatLng();
        if (pos) {
          setSelectedCoords({ lat: pos.lat, lng: pos.lng });
          reverseGeocode(pos.lat, pos.lng);
        }
      });
    }
    setSelectedCoords({ lat, lng });
    mapInstanceRef.current.setView([lat, lng], 16);
  }, []);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'hi,en' },
      });
      const data = await res.json();
      if (data.display_name) {
        setSelectedAddress(data.display_name);
      } else {
        setSelectedAddress(`${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`);
      }
    } catch {
      setSelectedAddress(`${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`);
    }
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: initialLat && initialLng ? [initialLat, initialLng] : DEFAULT_CENTER,
      zoom: initialLat ? 16 : DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      updateMarker(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    if (initialLat && initialLng) {
      updateMarker(initialLat, initialLng);
      reverseGeocode(initialLat, initialLng);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [initialLat, initialLng, updateMarker]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'hi,en' } }
      );
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lon);
        updateMarker(parsedLat, parsedLng);
        setSelectedAddress(display_name);
      }
    } catch { /* network error */ }
    setSearching(false);
  }

  function handleMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMarker(pos.coords.latitude, pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => { /* denied */ },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white" style={{ borderBottom: '1px solid #EADFD2' }}>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center flex-none"
        >
          <span className="material-symbols-rounded text-2xl">close</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-extrabold">नक्शे पर जगह चुनें</div>
          <div className="text-xs text-dark-muted">Choose location on map</div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2 bg-white flex gap-2">
        <div className="flex-1 relative">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-xl text-dark-muted">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="जगह खोजें · Search location..."
            className="w-full h-11 rounded-xl border-2 border-cream-darker bg-cream pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="h-11 px-4 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-1"
        >
          {searching ? (
            <span className="material-symbols-rounded text-lg animate-spin">sync</span>
          ) : (
            <span className="material-symbols-rounded text-lg">search</span>
          )}
        </button>
        <button
          onClick={handleMyLocation}
          className="h-11 w-11 rounded-xl bg-cream-dark flex items-center justify-center flex-none"
          title="My location"
        >
          <span className="material-symbols-rounded text-xl text-primary">my_location</span>
        </button>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1" />

      {/* Selected location footer */}
      {selectedCoords && (
        <div className="bg-white px-4 py-3 flex flex-col gap-2" style={{ borderTop: '1px solid #EADFD2' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-xl text-primary">location_on</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-dark truncate">{selectedAddress || 'Loading...'}</div>
              <div className="text-xs text-dark-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {selectedCoords.lat.toFixed(5)}°N, {selectedCoords.lng.toFixed(5)}°E
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelect(selectedCoords.lat, selectedCoords.lng, selectedAddress)}
            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-2xl">check</span>
            यह जगह चुनें · Select this location
          </button>
        </div>
      )}
    </div>
  );
}
