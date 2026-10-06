import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const SubmitClaim = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [ownershipDescription, setOwnershipDescription] = useState('');
  const [evidenceDetails, setEvidenceDetails] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${itemId}`);
        if (res.data.success) {
          setItem(res.data.item);
        }
      } catch (err) {
        setError('Failed to load item report for claim.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('itemId', itemId);
      data.append('ownershipDescription', ownershipDescription);
      data.append('evidenceDetails', evidenceDetails);
      evidenceImages.forEach((file) => data.append('evidenceImages', file));

      const res = await api.post('/claims', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        navigate('/my-claims');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Submit Ownership Claim</h1>
            <p className="text-xs text-slate-500">Provide confidential ownership proof to campus security admins.</p>
          </div>
        </div>

        {item && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
            {item.images && item.images[0] && (
              <img src={item.images[0]} alt={item.itemName} className="w-16 h-16 object-cover rounded-xl shrink-0" />
            )}
            <div>
              <span className="font-mono text-[10px] text-slate-400">{item.reportId}</span>
              <h3 className="font-bold text-slate-900 text-sm">{item.itemName}</h3>
              <p className="text-xs text-slate-500">Location Found: {item.location}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Why do you believe this item belongs to you? *
            </label>
            <textarea
              required
              rows="3"
              value={ownershipDescription}
              onChange={(e) => setOwnershipDescription(e.target.value)}
              placeholder="Describe where and when you lost it, contents inside, unique scratch/mark..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Supporting Verification Details (IDs, Serial #, Invoice Details)
            </label>
            <textarea
              rows="2"
              value={evidenceDetails}
              onChange={(e) => setEvidenceDetails(e.target.value)}
              placeholder="e.g. Student ID number inside wallet, purchase order number, laptop serial #..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Upload Ownership Evidence Photo (Receipts, Box, ID Card)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setEvidenceImages(Array.from(e.target.files))}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Submit Claim for Admin Verification'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitClaim;
