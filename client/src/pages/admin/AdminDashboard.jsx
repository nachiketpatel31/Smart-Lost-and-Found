import React, { useState, useEffect } from 'react';
import { Users, FileQuestion, Search, ShieldCheck, Sparkles, PackageCheck, AlertTriangle, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { DashboardStatsSkeleton } from '../../components/SkeletonLoader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardStatsSkeleton />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Campus Security & Administration</span>
          <h1 className="text-3xl font-extrabold mt-1">Admin Command Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time monitoring of lost & found reports, verification queues, and handover activity.
          </p>
        </div>
      </div>

      {/* 8 Stats Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Total Users</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Lost Reports</span>
            <FileQuestion className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.totalLost || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Found Reports</span>
            <Search className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.totalFound || 0}</p>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-xs font-bold uppercase">Pending Claims</span>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-950">{stats?.pendingClaims || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Verified Claims</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.verifiedClaims || 0}</p>
        </div>

        <div className="bg-green-50/60 p-5 rounded-2xl border border-green-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-green-800">
            <span className="text-xs font-bold uppercase">Returned Items</span>
            <PackageCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-green-950">{stats?.returnedItems || 0}</p>
        </div>

        <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-purple-700">
            <span className="text-xs font-bold uppercase">Potential Matches</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-purple-950">{stats?.potentialMatches || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Unclaimed Items</span>
            <AlertTriangle className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.unclaimedItems || 0}</p>
        </div>
      </div>

      {/* Analytics Category & Location Breakdown Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown bar visual */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Reports Distribution by Category</h3>
          <div className="space-y-3 pt-2">
            {charts?.categoryStats?.map((cat) => {
              const maxCount = charts.categoryStats[0]?.count || 1;
              const pct = Math.round((cat.count / maxCount) * 100);
              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat._id}</span>
                    <span>{cat.count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location breakdown bar visual */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Reports Distribution by Campus Location</h3>
          <div className="space-y-3 pt-2">
            {charts?.locationStats?.map((loc) => {
              const maxCount = charts.locationStats[0]?.count || 1;
              const pct = Math.round((loc.count / maxCount) * 100);
              return (
                <div key={loc._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{loc._id}</span>
                    <span>{loc.count} reports</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-amber-500 h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
