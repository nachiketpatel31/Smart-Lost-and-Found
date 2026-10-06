import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MessageSquareHeart, AlertCircle } from 'lucide-react';
import api from '../services/api';

const FeedbackForm = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/feedback', {
        itemId,
        rating,
        comment
      });

      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6 text-center">
        <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto">
          <MessageSquareHeart className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Recovery Feedback</h1>
          <p className="text-xs text-slate-500 mt-1">
            How was your experience recovering your item through Smart Lost & Found?
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 text-center">Rating Star Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Feedback & Review *</label>
            <textarea
              required
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the speed of recovery, campus security assistance..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Submit Experience Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
