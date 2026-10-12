import React from 'react';
import { Sparkles, Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MatchCard = ({ match, onClaim }) => {
  const { lostItem, foundItem, imageSimilarity, metadataSimilarity, overallScore } = match;

  if (!lostItem || !foundItem) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header bar with Similarity badge */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <span className="font-semibold text-sm">Hybrid Engine Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono">
            Meta: {metadataSimilarity}% | Img: {imageSimilarity}%
          </span>
          <span className="bg-amber-400 text-indigo-950 text-sm font-extrabold px-3 py-1 rounded-full shadow">
            {overallScore}% Match
          </span>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Lost Item Column */}
        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                Lost Item Report
              </span>
              <span className="text-xs font-mono text-slate-500">{lostItem.reportId}</span>
            </div>
            {lostItem.images && lostItem.images[0] ? (
              <img
                src={lostItem.images[0]}
                alt={lostItem.itemName}
                className="w-full h-40 object-cover rounded-lg mb-3 shadow-sm"
              />
            ) : (
              <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs mb-3">
                No Image Available
              </div>
            )}
            <h4 className="font-bold text-slate-900 text-lg mb-1">{lostItem.itemName}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 mb-3">{lostItem.description}</p>
          </div>

          <div className="space-y-1 text-xs text-slate-600 border-t border-red-100 pt-3">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-500" />
              <span>Category: {lostItem.category}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Location: {lostItem.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>Date Lost: {new Date(lostItem.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Found Item Column */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Found Item Report
              </span>
              <span className="text-xs font-mono text-slate-500">{foundItem.reportId}</span>
            </div>
            {foundItem.images && foundItem.images[0] ? (
              <img
                src={foundItem.images[0]}
                alt={foundItem.itemName}
                className="w-full h-40 object-cover rounded-lg mb-3 shadow-sm"
              />
            ) : (
              <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs mb-3">
                No Image Available
              </div>
            )}
            <h4 className="font-bold text-slate-900 text-lg mb-1">{foundItem.itemName}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 mb-3">{foundItem.description}</p>
          </div>

          <div className="space-y-1 text-xs text-slate-600 border-t border-emerald-100 pt-3">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Category: {foundItem.category}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Location Found: {foundItem.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Date Found: {new Date(foundItem.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 italic">
          * Potential Match Assistance — Admin verification required before handover.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to={`/item/${foundItem._id}`}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            View Details
          </Link>
          <Link
            to={`/submit-claim/${foundItem._id}`}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            Claim This Item <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
