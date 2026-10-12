import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, ArrowRight, MessageSquare } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get('/claims/my');
        if (res.data.success) {
          setClaims(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch user claims:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Ownership Claims</h1>
        <p className="text-xs text-slate-500">Track claim verification status and admin decision rationales</p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
      ) : claims.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          You have not submitted any ownership claims yet.
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-semibold">{claim.claimId}</span>
                  <span className="text-xs font-bold text-slate-800">
                    Claim for: {claim.item?.itemName || 'Target Item'}
                  </span>
                </div>
                <StatusBadge status={claim.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Ownership Reason</span>
                  <p className="text-slate-600 leading-relaxed">{claim.ownershipDescription}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Submitted Evidence</span>
                  <p className="text-slate-600 leading-relaxed">{claim.evidenceDetails || 'No additional text evidence provided'}</p>
                </div>
              </div>

              {claim.adminNote && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-700" /> Admin Decision Rationale:
                  </div>
                  <p className="text-amber-800">{claim.adminNote}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</span>
                {claim.item && (
                  <Link to={`/item/${claim.item._id}`} className="text-indigo-600 hover:underline font-bold flex items-center gap-1">
                    View Item Report <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
