import React, { useState, useEffect } from 'react';
import { Star, MessageSquareHeart } from 'lucide-react';
import api from '../../services/api';

const AdminFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/feedback');
        if (res.data.success) {
          setFeedbackList(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load feedback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">User Recovery Feedback</h1>
        <p className="text-xs text-slate-500">Reviews and star ratings submitted by students after item recovery</p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No user feedback reviews submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((f) => (
            <div key={f._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{f.user?.name || 'Student'}</span>
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < f.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{f.comment}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Recovered Item: {f.item?.itemName}</span>
                <span>{new Date(f.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
