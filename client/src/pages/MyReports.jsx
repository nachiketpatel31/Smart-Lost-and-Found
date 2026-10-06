import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PlusCircle, Search, Calendar, MapPin } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const MyReports = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('lost');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/my?type=${activeTab}&page=${page}&limit=8`);
      if (res.data.success) {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [activeTab, page]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Item Reports</h1>
          <p className="text-xs text-slate-500">Track and manage your reported lost and found items</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/report-lost"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Search className="w-4 h-4" /> Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('lost'); setPage(1); }}
          className={`px-6 py-3 font-bold text-xs border-b-2 transition-colors ${
            activeTab === 'lost'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Lost Items
        </button>
        <button
          onClick={() => { setActiveTab('found'); setPage(1); }}
          className={`px-6 py-3 font-bold text-xs border-b-2 transition-colors ${
            activeTab === 'found'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Found Items
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No {activeTab} item reports found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-500">{item.reportId}</td>
                    <td className="p-4 font-bold text-slate-900">{item.itemName}</td>
                    <td className="p-4 text-slate-600">{item.category}</td>
                    <td className="p-4 text-slate-600">{item.location}</td>
                    <td className="p-4 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="p-4"><StatusBadge status={item.status} /></td>
                    <td className="p-4">
                      <Link
                        to={`/item/${item._id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold rounded-lg transition-colors"
                      >
                        Track Status
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};

export default MyReports;
