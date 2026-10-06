import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../../services/api';
import MatchCard from '../../components/MatchCard';

const AdminMatches = () => {
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Campus-Wide Potential Matches</h1>
        <p className="text-xs text-slate-500">Monitor potential item matches flagged by the Hybrid Similarity Engine</p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
      ) : matches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No system suggested matches currently pending review.
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

export default AdminMatches;
