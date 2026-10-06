import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home as HomeIcon, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-200 space-y-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-700">Page Not Found</h2>
          <p className="text-xs text-slate-500">
            Looks like this item or page has gone missing! Don't worry, our campus search engine can help you find your way back.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <HomeIcon className="w-4 h-4" /> Go Home
          </Link>
          <Link
            to="/search"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Search Database
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
