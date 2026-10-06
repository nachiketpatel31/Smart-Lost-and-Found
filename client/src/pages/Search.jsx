import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Tag, Calendar, Shield, X, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';
import { CAMPUS_CONFIG } from '../config/campusConfig';

const CATEGORIES = ['Bags', 'Mobile Phones', 'Wallets', 'ID Cards', 'Books', 'Watches', 'Keys', 'Earphones', 'Laptops', 'Other'];
const LOCATIONS = ['Main Building', 'Library', 'Canteen', 'Computer Lab', 'Classroom', 'Laboratory', 'Parking Area', 'Hostel', 'Sports Ground', 'Security Office', 'Other'];
const STATUSES = ['Reported', 'Under Review', 'Potential Match', 'Claim Requested', 'Verified', 'Returned', 'Unclaimed', 'Rejected'];

const Search = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [page, setPage] = useState(1);

  const fetchSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (status) params.append('status', status);
      if (userCoords) {
        params.append('lat', userCoords.lat);
        params.append('lng', userCoords.lng);
      }
      params.append('page', page);
      params.append('limit', 9);

      const res = await api.get(`/items/search?${params.toString()}`);
      if (res.data.success) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearch();
  }, [type, category, location, status, userCoords, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSearch();
  };

  const handleNearMeProximity = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setPage(1);
        },
        () => alert('Could not get current location for proximity sorting.')
      );
    }
  };

  const clearFilters = () => {
    setQuery('');
    setType('');
    setCategory('');
    setLocation('');
    setStatus('');
    setUserCoords(null);
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">GSFC University Lost & Found Database</h1>
        <p className="text-sm text-slate-600">Search and filter active reports across all campus locations.</p>
      </div>

      {/* Multi-filter Search Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by item name, description, report ID (e.g. LST-2026-000123)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shrink-0 shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Report Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="">All Types (Lost & Found)</option>
              <option value="lost">Lost Items Only</option>
              <option value="found">Found Items Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Campus Location</label>
            <select
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="">All Campus Locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Item Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-2 gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleNearMeProximity}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> Proximity Sort (Near My GPS)
          </button>

          {(query || type || category || location || status || userCoords) && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 ml-auto"
            >
              <X className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <p className="text-lg font-bold text-slate-800">No reports match your search criteria</p>
          <p className="text-xs text-slate-500">Try adjusting your location or category filters.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.itemName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No Image Provided
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'lost' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{item.reportId}</span>
                      {item.distanceKm !== undefined && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {item.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.itemName}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {item.locationName || item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />{' '}
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Reported by Verified Campus Member</span>
                  </div>

                  <Link
                    to={`/item/${item._id}`}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl text-center block transition-colors shadow-sm"
                  >
                    View Report & Claim
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};

export default Search;
