import React, { useState, useEffect } from 'react';
import { PackageCheck, CheckCircle2, Search } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

const AdminHandovers = () => {
  const [handovers, setHandovers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // New Handover Modal State
  const [claimIdInput, setClaimIdInput] = useState('');
  const [handoverNoteInput, setHandoverNoteInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchHandovers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/handovers?page=${page}&limit=10`);
      if (res.data.success) {
        setHandovers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, [page]);

  const handleCompleteHandover = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/handovers', {
        claimId: claimIdInput,
        handoverNote: handoverNoteInput
      });
      if (res.data.success) {
        setModalOpen(false);
        setClaimIdInput('');
        setHandoverNoteInput('');
        fetchHandovers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Handover failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Physical Return Handover Desk</h1>
          <p className="text-xs text-slate-500">Record and verify physical return handovers of verified items</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
        >
          <PackageCheck className="w-4 h-4" /> Record New Handover
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 bg-slate-100 animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Claim ID</th>
                  <th className="p-4">Claimant Name</th>
                  <th className="p-4">Handed Over By</th>
                  <th className="p-4">Handover Date</th>
                  <th className="p-4">Handover Note</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {handovers.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{h.item?.itemName}</td>
                    <td className="p-4 font-mono font-semibold text-slate-500">{h.claim?.claimId}</td>
                    <td className="p-4 text-slate-700">{h.claimant?.name} ({h.claimant?.collegeId})</td>
                    <td className="p-4 text-slate-600">{h.handedOverBy?.name}</td>
                    <td className="p-4 text-slate-500">{new Date(h.handoverDate).toLocaleString()}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{h.handoverNote}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Record Handover Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Record Physical Handover</h3>
            <p className="text-xs text-slate-500">
              Enter MongoDB Object ID or Claim ID of an APPROVED claim to complete physical handover.
            </p>

            <form onSubmit={handleCompleteHandover} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Approved Claim ID *</label>
                <input
                  type="text"
                  required
                  value={claimIdInput}
                  onChange={(e) => setClaimIdInput(e.target.value)}
                  placeholder="e.g. 65f... or CLM-2026-000001"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Handover Verification Note</label>
                <input
                  type="text"
                  value={handoverNoteInput}
                  onChange={(e) => setHandoverNoteInput(e.target.value)}
                  placeholder="e.g. Verified student identity card and signature at Main Security Gate Office."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Mark Handover Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHandovers;
