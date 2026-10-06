import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, MapPin, Tag, RefreshCw } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/items/search?limit=6');
        if (res.data.success) {
          setRecentItems(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch recent items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" /> Smart Campus Reunification Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Lost Something? Found Something? <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-purple-300 to-indigo-200">
              Let's Reunite It.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Centralized college campus lost & found management system equipped with a **Hybrid Image + Metadata Similarity Engine** and secure admin verification.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/report-lost"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" /> Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-5 h-5" /> Report Found Item
            </Link>
            <Link
              to="/search"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <Search className="w-5 h-5" /> Browse Database
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Step Process Workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">How The System Works</h2>
          <p className="text-slate-600 text-sm">
            Complete end-to-end verification pipeline safeguarding privacy while ensuring items reach their rightful owners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {[
            { step: '01', title: 'REPORT', desc: 'Submit report with details & item photo.' },
            { step: '02', title: 'MATCH', desc: 'Hybrid Engine calculates similarity scores.' },
            { step: '03', title: 'CLAIM', desc: 'User submits ownership evidence.' },
            { step: '04', title: 'VERIFY', desc: 'Admin reviews evidence & approves claim.' },
            { step: '05', title: 'RETURN', desc: 'Physical handover & status update.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-500 transition-colors">
              <span className="text-3xl font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">
                {item.step}
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-2">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Campus Listings Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs text-slate-500">Latest lost & found reports across college departments</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-slate-100">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.itemName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No Photograph Uploaded
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'lost' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400">{item.reportId}</span>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.itemName}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" /> {item.category}
                    </span>
                  </div>

                  <Link
                    to={`/item/${item._id}`}
                    className="w-full py-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-medium text-xs rounded-xl text-center block transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
