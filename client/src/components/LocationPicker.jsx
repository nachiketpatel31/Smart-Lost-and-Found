import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Map as MapIcon, AlertCircle } from 'lucide-react';
import { CAMPUS_CONFIG, isWithinCampusGeofence } from '../config/campusConfig';
import CampusMap from './CampusMap';
import LocationPermissionModal from './LocationPermissionModal';

const LocationPicker = ({ locationData, onChange, error }) => {
  const {
    locationName = 'Library',
    specificLocation = '',
    latitude = CAMPUS_CONFIG.center.latitude,
    longitude = CAMPUS_CONFIG.center.longitude,
    locationSource = 'campus_selection'
  } = locationData;

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [geofenceWarning, setGeofenceWarning] = useState('');

  // Validate geofence whenever latitude/longitude change
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      if (!isWithinCampusGeofence(latitude, longitude)) {
        setGeofenceWarning('Please select a location within the university campus boundary.');
      } else {
        setGeofenceWarning('');
      }
    } else {
      setGeofenceWarning('');
    }
  }, [latitude, longitude]);

  // Method A: Dropdown selection (auto-centers map on building coordinates)
  const handleCampusLocationChange = (e) => {
    const selectedName = e.target.value;
    const foundBuilding = CAMPUS_CONFIG.locations.find((l) => l.name === selectedName);

    const newLat = foundBuilding ? foundBuilding.latitude : CAMPUS_CONFIG.center.latitude;
    const newLng = foundBuilding ? foundBuilding.longitude : CAMPUS_CONFIG.center.longitude;

    onChange({
      ...locationData,
      locationName: selectedName,
      location: selectedName,
      latitude: newLat,
      longitude: newLng,
      locationSource: 'campus_selection'
    });
  };

  // Method B: Specific location text
  const handleSpecificLocationChange = (e) => {
    onChange({
      ...locationData,
      specificLocation: e.target.value
    });
  };

  // Method C: Map selection
  const handleMapLocationSelect = (lat, lng) => {
    const latNum = Math.round(lat * 100000) / 100000;
    const lngNum = Math.round(lng * 100000) / 100000;

    onChange({
      ...locationData,
      latitude: latNum,
      longitude: lngNum,
      locationSource: 'map_selection'
    });
  };

  // Method D: GPS Location Trigger
  const handleUseCurrentLocationClick = () => {
    setGpsError('');
    setPermissionModalOpen(true);
  };

  const executeGetLocation = () => {
    setPermissionModalOpen(false);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please select the location manually.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const { latitude: lat, longitude: lng } = position.coords;
        const latNum = Math.round(lat * 100000) / 100000;
        const lngNum = Math.round(lng * 100000) / 100000;

        if (!isWithinCampusGeofence(latNum, lngNum)) {
          setGpsError('Your current GPS location is outside GSFC University campus boundary. Please select a campus location manually.');
        } else {
          setGpsError('');
        }

        onChange({
          ...locationData,
          latitude: latNum,
          longitude: lngNum,
          locationSource: 'current_location'
        });
      },
      (err) => {
        setGpsLoading(false);
        console.warn('Geolocation Error:', err.message);
        setGpsError('Unable to get your location. Please select the location manually using the campus dropdown or map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const markerPos = latitude && longitude ? [latitude, longitude] : [CAMPUS_CONFIG.center.latitude, CAMPUS_CONFIG.center.longitude];

  return (
    <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">GSFC Campus Location Selection</h3>
        </div>

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocationClick}
          disabled={gpsLoading}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          {gpsLoading ? (
            'Getting location...'
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" /> 📍 Use My Current Location
            </>
          )}
        </button>
      </div>

      {/* Geofence & GPS Error Alerts */}
      {geofenceWarning && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-bold">{geofenceWarning}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Method A & Method B Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Method A — Select Campus Location *
          </label>
          <select
            value={locationName}
            onChange={handleCampusLocationChange}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600"
          >
            {CAMPUS_CONFIG.locations.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Method B — Specific Location Details
          </label>
          <input
            type="text"
            value={specificLocation}
            onChange={handleSpecificLocationChange}
            placeholder="e.g. Near Canteen entrance, Library 2nd floor"
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Method C — Interactive Campus Map Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapIcon className="w-4 h-4 text-indigo-600" /> Method C — Pick Location on Campus Map (Street & Satellite)
          </label>
          <span className="text-[10px] text-slate-400">Click anywhere on campus map to place/move marker</span>
        </div>

        <CampusMap
          center={markerPos}
          zoom={CAMPUS_CONFIG.defaultZoom || 17}
          markerPosition={markerPos}
          onMapClick={handleMapLocationSelect}
          onMarkerDragEnd={handleMapLocationSelect}
          popupTitle="Selected Location"
          locationName={locationName}
          specificLocation={specificLocation}
          height="380px"
        />

        {/* Selected Coordinates Readout */}
        <div className="flex flex-wrap items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Selected Location:</span>
            <span className="text-indigo-600 font-bold">{locationName}</span>
            {specificLocation && <span className="text-slate-500 font-medium">({specificLocation})</span>}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>Lat: {latitude ? latitude : 'N/A'}</span>
            <span>Lng: {longitude ? longitude : 'N/A'}</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-600">
              Source: {locationSource.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Pre-permission Modal for GPS */}
      <LocationPermissionModal
        isOpen={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        onAllow={executeGetLocation}
      />
    </div>
  );
};

export default LocationPicker;
