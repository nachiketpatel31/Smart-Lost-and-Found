import React from 'react';
import { MapPin, X, Navigation } from 'lucide-react';

const LocationPermissionModal = ({ isOpen, onClose, onAllow }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Navigation className="w-7 h-7 animate-bounce" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-900">📍 Location Permission</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed px-2">
            Smart Lost & Found wants to use your current location to identify where the item was lost or found on the GSFC University campus.
          </p>
          <p className="mt-2 text-[11px] text-slate-400 italic">
            Your location will be captured only for this report. We do NOT track your movement in the background.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAllow}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" /> Allow Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
