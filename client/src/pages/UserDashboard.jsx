import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Search, Sparkles, CheckCircle2, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { DashboardStatsSkeleton } from '../components/SkeletonLoader';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ lost: 0, found: 0, claims: 0, matches: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [lostRes, foundRes, claimsRes, matchesRes] = await Promise.all([
          api.get('/items/my?type=lost&limit=5'),
          api.get('/items/my?type=found&limit=5'),
          api.get('/claims/my'),
          api.get('/matches/my')
        ]);

        const lostCount = lostRes.data.pagination?.total || 0;
        const foundCount = foundRes.data.pagination?.total || 0;
        const claimsCount = claimsRes.data.data?.length || 0;
        const matchesCount = matchesRes.data.data?.length || 0;

        setStats({ lost: lostCount, found: foundCount, claims: claimsCount, matches: matchesCount });
        setRecentReports([...(lostRes.data.data || []), ...(foundRes.data.data || [])].slice(0, 5));
      } catch (err) {
        console.error('Failed to load user dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Student Control Center</span>
          <h1 className="text-3xl font-extrabold mt-1">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-indigo-100 mt-1">
            Student ID: <code className="bg-white/10 px-2 py-0.5 rounded font-mono">{user?.collegeId}</code> | Phone: {user?.phone}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow hover:bg-indigo-50 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" /> Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" /> Report Found
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link to="/my-reports" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">My Lost Reports</span>
              <FileQuestion className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.lost}</p>
          </Link>

          <Link to="/my-reports" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">My Found Reports</span>
              <Search className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.found}</p>
          </Link>

          <Link to="/potential-matches" className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all bg-purple-50/30">
            <div className="flex items-center justify-between text-purple-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Potential Matches</span>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-extrabold text-purple-950">{stats.matches}</p>
          </Link>

          <Link to="/my-claims" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">My Claims</span>
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.claims}</p>
          </Link>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">My Recent Submissions</h3>
          <Link to="/my-reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">You have not submitted any item reports yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{r.reportId}</td>
                    <td className="p-3 font-bold text-slate-900">{r.itemName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{r.location}</td>
                    <td className="p-3"><StatusBadge status={r.status} /></td>
                    <td className="p-3">
                      <Link to={`/item/${r._id}`} className="text-indigo-600 hover:underline font-semibold">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
