import React, { useState, useEffect } from 'react';
import { Sparkles, Info } from 'lucide-react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';

const PotentialMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matches/my');
        if (res.data.success) {
          setMatches(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-purple-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" /> Hybrid Similarity Engine
          </div>
          <h1 className="text-3xl font-extrabold">Potential Item Matches</h1>
          <p className="text-xs text-purple-200">
            System generated similarity scoring combining image feature metrics & campus metadata matching.
          </p>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Match Assistance Safeguard:</p>
          <p>
            Similarity scores assist in identifying candidate matches. Final ownership is verified by campus security admins after review of submitted evidence.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
      ) : matches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No potential matches identified for your reported items yet.
        </div>
      ) : (
        <div className="space-y-8">
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PotentialMatches;
