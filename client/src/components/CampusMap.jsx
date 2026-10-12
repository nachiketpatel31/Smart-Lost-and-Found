import React, { useEffect, useRef, useState } from 'react';
import { CAMPUS_CONFIG } from '../config/campusConfig';
import { Navigation } from 'lucide-react';

const CampusMap = ({
  center = [CAMPUS_CONFIG.center.latitude, CAMPUS_CONFIG.center.longitude],
  zoom = CAMPUS_CONFIG.defaultZoom,
  markerPosition = null,
  userPosition = null,
  isManualPosition = false,
  isFollowingUser = true,
  onUserPan = null,
  routeCoordinates = [],
  onMarkerDragEnd = null,
  onMapClick = null,
  readOnly = false,
  popupTitle = 'Reported Item Location',
  itemName = '',
  locationName = '',
  specificLocation = '',
  popupText = '',
  height = '520px',
  multipleMarkers = []
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const streetLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const extraMarkersRef = useRef([]);

  const [activeLayer, setActiveLayer] = useState('street'); // 'street' | 'satellite'
  const [leafletLoaded, setLeafletLoaded] = useState(Boolean(window.L));

  // Dynamically load Leaflet CSS & JS if not present
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Add Leaflet CSS
    const existingCss = document.getElementById('leaflet-css');
    if (!existingCss) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    const existingScript = document.getElementById('leaflet-js');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => setLeafletLoaded(true));
    }
  }, []);

  // Custom SVG Marker Icons for Sharp High-Vis Display
  const createItemIcon = (L, color = '#ef4444') => {
    const svgHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
        <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z"/>
        <circle cx="12" cy="12" r="5" fill="#ffffff"/>
      </svg>
    `;
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: svgHtml,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -38]
    });
  };

  // Custom User Blue Location Icon with Pulse Effect (or Orange Pin for Manual Desktop Pick)
  const createUserIcon = (L, isManual = false) => {
    if (isManual) {
      return createItemIcon(L, '#f97316'); // Orange pin for manual starting position
    }
    const svgHtml = `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: pulse 2s infinite;"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
          <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="12" cy="12" r="4" fill="#ffffff"/>
        </svg>
      </div>
    `;
    return L.divIcon({
      className: 'custom-user-marker',
      html: svgHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  // Build Formatted Popup HTML
  const buildPopupHtml = () => {
    if (popupText) return popupText;

    const displayTitle = popupTitle || 'Reported Item Location';
    const displayName = itemName ? `<div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${itemName}</div>` : '';
    const displayLoc = locationName ? `<div style="font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px;">📍 ${locationName}</div>` : '';
    const displaySpec = specificLocation ? `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 2px;">"${specificLocation}"</div>` : '';

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 190px; padding: 4px;">
        <div style="font-size: 10px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">📍 ${displayTitle}</div>
        ${displayName}
        ${displayLoc}
        ${displaySpec}
      </div>
    `;
  };

  // Initialize Map with Dual Basemaps & User Drag Detection
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    const streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | GSFC University Campus'
    });

    const satelliteTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS Community'
    });

    streetLayerRef.current = streetTile;
    satelliteLayerRef.current = satelliteTile;

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: true,
      zoomControl: false, // Disabled default top-left control to prevent overlap with top-left basemap toggle
      layers: [streetTile]
    });

    L.control.layers(
      { 'Street Map': streetTile, 'Satellite Imagery': satelliteTile },
      null,
      { position: 'topright' }
    ).addTo(map);

    // Detect user manual map movement to temporarily pause auto-follow
    map.on('dragstart', () => {
      if (onUserPan) {
        onUserPan();
      }
    });

    mapInstanceRef.current = map;

    if (!readOnly && onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Handle Layer Toggle Switch
  const toggleBasemap = (layerType) => {
    if (!mapInstanceRef.current || !streetLayerRef.current || !satelliteLayerRef.current) return;
    const map = mapInstanceRef.current;

    if (layerType === 'satellite') {
      map.removeLayer(streetLayerRef.current);
      map.addLayer(satelliteLayerRef.current);
      setActiveLayer('satellite');
    } else {
      map.removeLayer(satelliteLayerRef.current);
      map.addLayer(streetLayerRef.current);
      setActiveLayer('street');
    }
  };

  // Update Center & Zoom
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update Primary Item Marker
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const popupHtml = buildPopupHtml();

    if (markerPosition && markerPosition[0] !== null && markerPosition[1] !== null) {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng(markerPosition);
      } else {
        const markerIcon = createItemIcon(L, '#ef4444');
        const marker = L.marker(markerPosition, {
          icon: markerIcon,
          draggable: !readOnly && Boolean(onMarkerDragEnd)
        }).addTo(map);

        if (!readOnly && onMarkerDragEnd) {
          marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            onMarkerDragEnd(lat, lng);
          });
        }

        marker.bindPopup(popupHtml).openPopup();
        markerInstanceRef.current = marker;
      }

      if (markerInstanceRef.current) {
        markerInstanceRef.current.setPopupContent(popupHtml);
      }
    } else if (markerInstanceRef.current) {
      map.removeLayer(markerInstanceRef.current);
      markerInstanceRef.current = null;
    }
  }, [markerPosition, popupText, itemName, locationName, specificLocation, leafletLoaded, readOnly]);

  // Render Blue User Location Marker (or Manual Start Pin) & Handle Follow-User Mode
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (userPosition && userPosition[0] !== null && userPosition[1] !== null) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userPosition);
      } else {
        const userIcon = createUserIcon(L, isManualPosition);
        const marker = L.marker(userPosition, { icon: userIcon }).addTo(map);
        const popupText = isManualPosition
          ? '<strong>📍 Your Selected Starting Point (Manual)</strong>'
          : '<strong>🔵 You (Your Current Location)</strong>';
        marker.bindPopup(popupText);
        userMarkerRef.current = marker;
      }

      // Automatically follow user position if follow mode is active
      if (isFollowingUser) {
        map.panTo(userPosition, { animate: true, duration: 0.5 });
      }
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userPosition, isManualPosition, isFollowingUser, leafletLoaded]);

  // Render Pedestrian Route Polyline (Navigation Mode)
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Fit map bounds to show full route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [routeCoordinates, leafletLoaded]);

  // Render Multiple Extra Item Markers
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    extraMarkersRef.current.forEach((m) => map.removeLayer(m));
    extraMarkersRef.current = [];

    if (multipleMarkers && multipleMarkers.length > 0) {
      multipleMarkers.forEach((item) => {
        if (item.latitude && item.longitude) {
          const color = item.type === 'lost' ? '#ef4444' : '#10b981';
          const markerIcon = createItemIcon(L, color);
          const m = L.marker([item.latitude, item.longitude], { icon: markerIcon }).addTo(map);
          const popupContent = `
            <div style="font-family: system-ui; min-width: 170px; padding: 2px;">
              <div style="font-size: 10px; font-weight: 800; color: ${color}; text-transform: uppercase;">📍 ${item.type.toUpperCase()} ITEM</div>
              <strong style="font-size: 12px; color: #0f172a;">${item.itemName}</strong><br/>
              <span style="font-size: 10px; color: #64748b;">${item.reportId}</span><br/>
              <span style="font-size: 11px; font-weight: 600;">📍 ${item.locationName || item.location}</span>
            </div>
          `;
          m.bindPopup(popupContent);
          extraMarkersRef.current.push(m);
        }
      });
    }
  }, [multipleMarkers, leafletLoaded]);

  // Recenter Map Function
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const targetPos = userPosition || markerPosition || center;
    mapInstanceRef.current.setView(targetPos, CAMPUS_CONFIG.itemZoom || 18.5, {
      animate: true
    });
    if (userMarkerRef.current) {
      userMarkerRef.current.openPopup();
    } else if (markerInstanceRef.current) {
      markerInstanceRef.current.openPopup();
    }
  };

  // Custom Zoom In & Zoom Out Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm w-full" style={{ height }}>
      {/* Floating Dual Basemap Toggle Widget */}
      <div className="absolute top-3 left-3 z-[400] flex bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => toggleBasemap('street')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
            activeLayer === 'street'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          🗺️ Street Map
        </button>
        <button
          type="button"
          onClick={() => toggleBasemap('satellite')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
            activeLayer === 'satellite'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          🛰️ Satellite View
        </button>
      </div>

      {/* Floating Zoom In & Zoom Out Buttons (High-Visibility Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-700">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-indigo-600 text-white font-extrabold text-base rounded-lg transition-all active:scale-95"
        >
          ➕
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-indigo-600 text-white font-extrabold text-base rounded-lg transition-all active:scale-95 border-t border-slate-700/60"
        >
          ➖
        </button>
      </div>

      {/* Floating "Center on Location" Button */}
      {(markerPosition || userPosition) && (
        <button
          type="button"
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-[400] px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg border border-slate-700 flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-400" /> Center Map
        </button>
      )}

      {!leafletLoaded ? (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold animate-pulse">
          Loading GSFC University Campus Map & Satellite Tiles...
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full z-10"></div>
      )}
    </div>
  );
};

export default CampusMap;
