import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Upload, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import { CAMPUS_CONFIG, isWithinCampusGeofence } from '../config/campusConfig';

const CATEGORIES = ['Bags', 'Mobile Phones', 'Wallets', 'ID Cards', 'Books', 'Watches', 'Keys', 'Earphones', 'Laptops', 'Other'];

const ReportFound = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Wallets',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    identifyingFeatures: ''
  });

  const [locationData, setLocationData] = useState({
    locationName: 'Library',
    location: 'Library',
    specificLocation: '',
    latitude: CAMPUS_CONFIG.center.latitude,
    longitude: CAMPUS_CONFIG.center.longitude,
    locationSource: 'campus_selection'
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const checkDuplicates = async () => {
    if (!formData.itemName || formData.itemName.length < 3) return;
    try {
      const res = await api.post('/items/check-duplicates', {
        type: 'found',
        itemName: formData.itemName,
        category: formData.category,
        location: locationData.locationName
      });
      if (res.data.success && res.data.hasDuplicates) {
        setDuplicates(res.data.duplicates);
      } else {
        setDuplicates([]);
      }
    } catch (err) {
      console.error('Duplicate check error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (locationData.latitude !== null && locationData.longitude !== null) {
      if (!isWithinCampusGeofence(locationData.latitude, locationData.longitude)) {
        return setError('Please select a location within the GSFC University campus boundary.');
      }
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      data.append('location', locationData.locationName || locationData.location);
      data.append('locationName', locationData.locationName || locationData.location);
      data.append('specificLocation', locationData.specificLocation || '');
      if (locationData.latitude !== null) data.append('latitude', locationData.latitude);
      if (locationData.longitude !== null) data.append('longitude', locationData.longitude);
      data.append('locationSource', locationData.locationSource || 'campus_selection');

      images.forEach((file) => data.append('images', file));

      const res = await api.post('/items/found', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        navigate(`/item/${res.data.item._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Report a Found Item</h1>
            <p className="text-xs text-slate-500">Report an item discovered or turned in on campus.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" /> Similar Reports Found!
            </div>
            <p className="text-xs text-amber-700">Check if someone already submitted a lost report for this item:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {duplicates.map((d) => (
                <Link
                  key={d._id}
                  to={`/item/${d._id}`}
                  target="_blank"
                  className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 hover:bg-amber-100"
                >
                  {d.reportId}: {d.itemName} ↗
                </Link>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Found Item Title *</label>
              <input
                type="text"
                name="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                onBlur={checkDuplicates}
                placeholder="e.g. Black Leather Wallet found near Desk #14"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date Found *</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Integrated Location & Campus Map Selector */}
          <LocationPicker
            locationData={locationData}
            onChange={(newData) => setLocationData(newData)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Approximate Time</label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g. 15:00 PM"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Identifying Features</label>
              <input
                type="text"
                name="identifyingFeatures"
                value={formData.identifyingFeatures}
                onChange={handleChange}
                placeholder="e.g. Contains student ID card, blue lanyard"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
              <textarea
                name="description"
                rows="3"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the condition and circumstances of finding the item..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              ></textarea>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Item Photographs *</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-600 transition-colors bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Upload photograph of found item</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="found-image-upload"
                />
                <label
                  htmlFor="found-image-upload"
                  className="mt-3 inline-block px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100"
                >
                  Select Files
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Submit Found Item Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportFound;
