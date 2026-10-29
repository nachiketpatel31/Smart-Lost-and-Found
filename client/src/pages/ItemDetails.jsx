import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Tag, Calendar, Clock, ShieldCheck, ArrowRight, History, AlertCircle, Navigation, Compass, Map, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import CampusMap from '../components/CampusMap';
import LocationPermissionModal from '../components/LocationPermissionModal';
import NavigationBanner from '../components/NavigationBanner';
import { CAMPUS_CONFIG, getHaversineDistance } from '../config/campusConfig';

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [claimInfo, setClaimInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live Pedestrian Navigation State
  const [navActive, setNavActive] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [isManualPosition, setIsManualPosition] = useState(false);
  const [isManualPicking, setIsManualPicking] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isArrived, setIsArrived] = useState(false);
  const [isRouteFallback, setIsRouteFallback] = useState(false);
  const [navError, setNavError] = useState('');

  const watchIdRef = useRef(null);
  const lastRouteFetchPosRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        if (res.data.success) {
          setItem(res.data.item);
          setStatusHistory(res.data.statusHistory || []);
          setClaimInfo(res.data.claimInfo || null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load item report details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Clean up location watcher on component unmount
  useEffect(() => {
    return () => {
      stopLiveNavigation();
    };
  }, []);

  // Fetch Route Geometry (Primary: OpenStreetMap Pedestrian/Foot API, Fallback: Direct Walking Path)
  const fetchNavigationRoute = async (uLat, uLng, iLat, iLng) => {
    try {
      // 1. Primary Attempt: Dedicated OpenStreetMap Pedestrian (Foot) Routing Engine
      const pedestrianUrl = `${CAMPUS_CONFIG.routing.pedestrianApiUrl}${uLng},${uLat};${iLng},${iLat}?overview=full&geometries=geojson`;
      const response = await fetch(pedestrianUrl);
      const data = await response.json();

      if (data && data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const geoCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]); // GeoJSON [lng, lat] -> Leaflet [lat, lng]
        setRouteCoordinates(geoCoords);

        const distM = route.distance; // meters
        setDistanceMeters(distM);

        // Recalculate or verify duration for pedestrian walking speed (~1.25 m/s)
        const durMin = distM / (CAMPUS_CONFIG.routing.walkingSpeedMps * 60);
        setDurationMinutes(durMin);
        setIsRouteFallback(false);
        lastRouteFetchPosRef.current = [uLat, uLng];

        return distM;
      } else {
        throw new Error('Pedestrian routing engine returned non-OK response');
      }
    } catch (pedestrianErr) {
      console.warn('Dedicated pedestrian routing API unavailable, trying fallback road overlay:', pedestrianErr.message);
      
      try {
        // 2. Secondary Fallback Attempt: OSRM Driving Overlay
        const fallbackUrl = `${CAMPUS_CONFIG.routing.osrmApiUrl}${uLng},${uLat};${iLng},${iLat}?overview=full&geometries=geojson`;
        const response = await fetch(fallbackUrl);
        const data = await response.json();

        if (data && data.code === 'Ok' && data.routes && data.routes[0]) {
          const route = data.routes[0];
          const geoCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteCoordinates(geoCoords);

          const distM = route.distance;
          setDistanceMeters(distM);
          const durMin = distM / (CAMPUS_CONFIG.routing.walkingSpeedMps * 60);
          setDurationMinutes(durMin);
          setIsRouteFallback(true);
          lastRouteFetchPosRef.current = [uLat, uLng];

          return distM;
        } else {
          throw new Error('Fallback routing service unavailable');
        }
      } catch (fallbackErr) {
        console.warn('External routing services unavailable, using direct pedestrian path fallback:', fallbackErr.message);
        setIsRouteFallback(true);
        const directDistKm = getHaversineDistance(uLat, uLng, iLat, iLng);
        const distM = directDistKm * 1000;
        setDistanceMeters(distM);

        const durMin = distM / (CAMPUS_CONFIG.routing.walkingSpeedMps * 60);
        setDurationMinutes(durMin);
        setRouteCoordinates([[uLat, uLng], [iLat, iLng]]);
        lastRouteFetchPosRef.current = [uLat, uLng];

        return distM;
      }
    }
  };

  // Start Live Navigation (Triggered after user consents in modal)
  const startLiveNavigation = () => {
    setPermissionModalOpen(false);

    if (!navigator.geolocation) {
      setNavError('Geolocation is not supported by your browser.');
      return;
    }

    if (!item || item.latitude === null || item.longitude === null) {
      setNavError('Item report does not have valid map coordinates for navigation.');
      return;
    }

    setNavActive(true);
    setIsManualPosition(false);
    setIsManualPicking(false);
    setIsFollowingUser(true);
    setNavError('');
    lastRouteFetchPosRef.current = null;

    // Start Foreground Geolocation Watcher
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: uLat, longitude: uLng } = pos.coords;
        const uPos = [uLat, uLng];
        setUserPosition(uPos);

        // Immediate Haversine distance and walking ETA update on every GPS position change
        const directDistKm = getHaversineDistance(uLat, uLng, item.latitude, item.longitude);
        const currentDistM = directDistKm * 1000;
        setDistanceMeters(currentDistM);
        setDurationMinutes(currentDistM / (CAMPUS_CONFIG.routing.walkingSpeedMps * 60));

        if (currentDistM <= CAMPUS_CONFIG.routing.arrivalThresholdMeters) {
          setIsArrived(true);
        } else {
          setIsArrived(false);
        }

        // GPS Rerouting Optimization: Only request new API route if moved >= 25m or initial fetch
        const lastPos = lastRouteFetchPosRef.current;
        let shouldFetchRoute = false;
        if (!lastPos) {
          shouldFetchRoute = true;
        } else {
          const movedKm = getHaversineDistance(lastPos[0], lastPos[1], uLat, uLng);
          if (movedKm * 1000 >= CAMPUS_CONFIG.routing.rerouteThresholdMeters) {
            shouldFetchRoute = true;
          }
        }

        if (shouldFetchRoute) {
          await fetchNavigationRoute(uLat, uLng, item.latitude, item.longitude);
        }
      },
      (err) => {
        console.warn('Navigation Geolocation Error:', err.message);
        let errorMsg = '📍 Unable to retrieve location.';
        if (err.code === 1) {
          errorMsg = '📍 Location permission denied. Please allow location access in your browser settings to navigate.';
        } else if (err.code === 2) {
          errorMsg = '📍 Your device could not provide your current location.';
        } else if (err.code === 3) {
          errorMsg = '📍 Location request timed out. Please try again.';
        }
        setNavError(errorMsg);
        stopLiveNavigation();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );
  };

  // Manual Starting Location Selection (Desktop Fallback)
  const handleMapClickForManualStart = async (lat, lng) => {
    if (!isManualPicking || !item || item.latitude === null) return;
    const uPos = [lat, lng];
    setUserPosition(uPos);
    setIsManualPosition(true);
    setIsManualPicking(false);
    setNavActive(true);
    setIsFollowingUser(true);
    setNavError('');

    const directDistKm = getHaversineDistance(lat, lng, item.latitude, item.longitude);
    const currentDistM = directDistKm * 1000;
    setDistanceMeters(currentDistM);
    setDurationMinutes(currentDistM / (CAMPUS_CONFIG.routing.walkingSpeedMps * 60));

    if (currentDistM <= CAMPUS_CONFIG.routing.arrivalThresholdMeters) {
      setIsArrived(true);
    } else {
      setIsArrived(false);
    }

    await fetchNavigationRoute(lat, lng, item.latitude, item.longitude);
  };

  // Stop Navigation & Clear Watcher
  const stopLiveNavigation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavActive(false);
    setUserPosition(null);
    setIsManualPosition(false);
    setIsManualPicking(false);
    setIsFollowingUser(true);
    setRouteCoordinates([]);
    setIsArrived(false);
    lastRouteFetchPosRef.current = null;
  };

  // Locate Single My Location GPS Fix with Explicit User Feedback
  const handleMyLocationFix = () => {
    setIsFollowingUser(true);
    setNavError('');
    if (!navigator.geolocation) {
      setNavError('📍 Geolocation is not supported by your browser.');
      setIsManualPicking(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uPos = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(uPos);
        setIsManualPosition(false);
        setNavError('');
      },
      (err) => {
        console.warn('GPS fix error:', err.message);
        let errorMsg = '📍 Unable to retrieve location automatically.';
        if (err.code === 1) {
          errorMsg = '📍 Location permission denied in browser. Use map selection below to set location.';
        } else if (err.code === 2) {
          errorMsg = '📍 Your device could not provide GPS location. Use map selection below.';
        }
        setNavError(errorMsg);
        setIsManualPicking(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Item Not Found'}</h2>
        <Link to="/search" className="inline-block px-4 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl">
          Back to Search
        </Link>
      </div>
    );
  }

  const isReporter = user && item.reporter && String(user._id) === String(item.reporter._id || item.reporter);
  const isAdmin = user && user.role === 'admin';

  const hasCoords = item.latitude !== null && item.longitude !== null && item.latitude !== undefined;
  const itemMarkerPos = hasCoords ? [item.latitude, item.longitude] : [CAMPUS_CONFIG.center.latitude, CAMPUS_CONFIG.center.longitude];
  const locName = item.locationName || item.location;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                item.type === 'lost' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {item.type} Item Report
              </span>
              <span className="font-mono text-xs text-slate-400 font-semibold">{item.reportId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{item.itemName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={item.status} />
            {item.type === 'found' && item.status !== 'Returned' && item.status !== 'Verified' && (
              <Link
                to={`/submit-claim/${item._id}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                Submit Claim <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Image & Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.itemName}
                className="w-full h-80 object-cover rounded-2xl border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-full h-80 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-semibold">
                No Photographs Uploaded
              </div>
            )}
          </div>

          {/* Metadata Specs */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Item Description</h3>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {item.description}
                </p>
              </div>

              {item.identifyingFeatures && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Identifying Marks</h3>
                  <p className="mt-1 text-xs text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-100 font-medium">
                    {item.identifyingFeatures}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Category</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" /> {item.category}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Campus Location</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" /> {locName}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                  <span className="text-slate-400 block font-semibold">Specific Location Details</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">
                    {item.specificLocation || 'Not specified'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Date</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Approximate Time</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> {item.time || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Safeguard Notice */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ownership Privacy Enforced
              </div>
              <p className="text-[11px] text-emerald-700">
                {isReporter || isAdmin
                  ? `Reporter Contact: ${item.reporter?.name || 'User'} (${item.reporter?.phone || ''}, ${item.reporter?.email || ''})`
                  : 'Contact info is hidden from public view. Handovers are managed securely through the admin verification desk.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Approval & Ownership Verification Information Card */}
      {claimInfo && (
        <div className={`p-6 sm:p-8 rounded-3xl shadow-sm border space-y-4 ${
          claimInfo.status === 'Approved'
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
            : claimInfo.status === 'Rejected'
            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
            : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shadow-md shrink-0 text-white ${
                claimInfo.status === 'Approved'
                  ? 'bg-emerald-600 shadow-emerald-600/20'
                  : claimInfo.status === 'Rejected'
                  ? 'bg-red-600 shadow-red-600/20'
                  : 'bg-indigo-600 shadow-indigo-600/20'
              }`}>
                {claimInfo.status === 'Approved' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : claimInfo.status === 'Rejected' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-full ${
                    claimInfo.status === 'Approved'
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : claimInfo.status === 'Rejected'
                      ? 'bg-red-200/80 text-red-900'
                      : 'bg-indigo-200/80 text-indigo-900'
                  }`}>
                    {claimInfo.status === 'Approved' ? 'Claim Verified & Approved' : `Claim ${claimInfo.status}`}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    {claimInfo.claimId}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {claimInfo.status === 'Approved' ? (
                    claimInfo.isUserClaimant
                      ? '🎉 Your Ownership Claim has been Approved!'
                      : claimInfo.isUserReporter
                      ? '✅ Ownership Verified for Your Reported Item'
                      : '✅ Verified Ownership Claim'
                  ) : claimInfo.status === 'Rejected' ? (
                    'Claim Not Approved'
                  ) : (
                    'Claim Pending Review'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {claimInfo.status === 'Approved' ? (
                    claimInfo.isUserClaimant
                      ? 'Campus security administrators have verified your ownership evidence. Please visit the Campus Security Desk / Admin Office with your College ID to complete the physical handover.'
                      : claimInfo.isUserReporter
                      ? 'The ownership claim for this item has been verified and approved by campus security. The handover process is now underway.'
                      : 'An ownership claim for this item has been verified and approved by campus security.'
                  ) : claimInfo.status === 'Rejected' ? (
                    `Your ownership claim was not approved. Admin note: "${claimInfo.adminNote || 'Insufficient ownership evidence.'}"`
                  ) : (
                    'Your ownership claim has been received and is currently under review by campus security administrators.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {claimInfo.isUserClaimant && (
                <Link
                  to="/my-claims"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  View in My Claims <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {claimInfo.isUserReporter && (
                <Link
                  to="/my-reports"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  View in My Reports <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Decision Details & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 font-semibold block text-[11px]">Verification Status</span>
              <span className={`font-bold flex items-center gap-1 mt-0.5 ${
                claimInfo.status === 'Approved' ? 'text-emerald-700' : 'text-slate-800'
              }`}>
                {claimInfo.status === 'Approved' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
                {claimInfo.status}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 font-semibold block text-[11px]">
                {claimInfo.status === 'Approved' ? 'Approval Date' : 'Submitted Date'}
              </span>
              <span className="font-bold text-slate-800 block mt-0.5">
                {claimInfo.verifiedAt
                  ? new Date(claimInfo.verifiedAt).toLocaleDateString()
                  : claimInfo.submittedAt
                  ? new Date(claimInfo.submittedAt).toLocaleDateString()
                  : 'Recently'}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 font-semibold block text-[11px]">Admin Decision Note</span>
              <span className="font-semibold text-slate-800 block mt-0.5 italic">
                "{claimInfo.adminNote || 'Ownership verified through submitted evidence.'}"
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive GSFC Campus Map View & Live Pedestrian Navigation */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" /> GSFC University Campus Location Map
            </h3>
            <p className="text-xs text-slate-500">
              Approximate location where item was {item.type === 'lost' ? 'lost' : 'found'}
            </p>
          </div>

          {/* Navigation Control Buttons */}
          {hasCoords && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMyLocationFix}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-indigo-600" /> 🎯 Track My Location
              </button>

              {!navActive ? (
                <button
                  type="button"
                  onClick={() => setPermissionModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-amber-300" /> 🧭 Navigate to Item
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopLiveNavigation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  End Navigation
                </button>
              )}
            </div>
          )}
        </div>

        {navError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-red-700 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{navError}</span>
            </div>
            {!navActive && (
              <button
                type="button"
                onClick={() => {
                  setNavError('');
                  setIsManualPicking(true);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
              >
                📍 Select Location on Map
              </button>
            )}
          </div>
        )}

        {isManualPicking && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-center justify-between gap-2 animate-pulse">
            <span>📍 Desktop Fallback Active: Click anywhere on the campus map below to set your starting location.</span>
            <button
              type="button"
              onClick={() => setIsManualPicking(false)}
              className="text-amber-800 underline text-[11px]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Live Navigation Banner */}
        <NavigationBanner
          active={navActive}
          distanceMeters={distanceMeters}
          durationMinutes={durationMinutes}
          isArrived={isArrived}
          isRouteFallback={isRouteFallback}
          isFollowingUser={isFollowingUser}
          onRecenter={handleMyLocationFix}
          onEndNavigation={stopLiveNavigation}
        />

        {/* Leaflet Map with Navigation & Follow Mode */}
        <CampusMap
          center={userPosition || itemMarkerPos}
          zoom={CAMPUS_CONFIG.itemZoom || 18.5}
          markerPosition={itemMarkerPos}
          userPosition={userPosition}
          isManualPosition={isManualPosition}
          isFollowingUser={isFollowingUser}
          onUserPan={() => setIsFollowingUser(false)}
          routeCoordinates={routeCoordinates}
          onMapClick={isManualPicking ? handleMapClickForManualStart : null}
          readOnly={!isManualPicking}
          popupTitle="Reported Item Location"
          itemName={item.itemName}
          locationName={locName}
          specificLocation={item.specificLocation}
          height="520px"
        />

        {hasCoords && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
            <span>Latitude: {item.latitude} | Longitude: {item.longitude}</span>
            <span className="text-[10px] text-slate-400">GSFC University Campus Navigation Engine</span>
          </div>
        )}
      </div>

      {/* Permission Modal for Navigation */}
      <LocationPermissionModal
        isOpen={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        onAllow={startLiveNavigation}
      />

      {/* Audit & Status Transition History */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" /> Status & Audit Timeline
        </h3>

        <div className="space-y-3">
          {statusHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No historical status transitions recorded yet.</p>
          ) : (
            statusHistory.map((h) => (
              <div key={h._id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Status changed to <span className="text-indigo-600">{h.newStatus}</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {h.note && <p className="text-slate-600 mt-1">{h.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
