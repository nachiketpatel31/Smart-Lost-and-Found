import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Eye, MapPin } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import CampusMap from '../../components/CampusMap';
import { CAMPUS_CONFIG } from '../../config/campusConfig';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending Verification');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review & Action Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'view'
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/claims?status=${statusFilter}&page=${page}&limit=10`);
      if (res.data.success) {
        setClaims(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, page]);

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/claims/${selectedClaim._id}/approve`, { adminNote });
      if (res.data.success) {
        setSelectedClaim(null);
        setActionType(null);
        fetchClaims();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/claims/${selectedClaim._id}/reject`, { adminNote });
      if (res.data.success) {
        setSelectedClaim(null);
        setActionType(null);
        fetchClaims();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const claimItem = selectedClaim?.item;
  const hasCoords = claimItem && claimItem.latitude !== null && claimItem.longitude !== null;
  const itemPos = hasCoords ? [claimItem.latitude, claimItem.longitude] : [CAMPUS_CONFIG.center.latitude, CAMPUS_CONFIG.center.longitude];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Claim Verification Portal</h1>
          <p className="text-xs text-slate-500">Review ownership evidence and location reports side-by-side</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl pt-2">
        {['Pending Verification', 'Approved', 'Rejected', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            className={`px-5 py-3 font-bold text-xs border-b-2 transition-colors ${
              statusFilter === st
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 bg-slate-100 animate-pulse"></div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No claims found under status "{statusFilter}".</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Claim ID</th>
                  <th className="p-4">Target Item</th>
                  <th className="p-4">Claimant Name</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-500">{claim.claimId}</td>
                    <td className="p-4 font-bold text-slate-900">{claim.item?.itemName || 'Item'}</td>
                    <td className="p-4 text-slate-700">{claim.claimant?.name} ({claim.claimant?.collegeId})</td>
                    <td className="p-4 text-slate-500">{new Date(claim.submittedAt).toLocaleDateString()}</td>
                    <td className="p-4"><StatusBadge status={claim.status} /></td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedClaim(claim); setActionType('view'); setAdminNote(''); }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Evidence & Location
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Side-by-side Evidence & Location Review Modal */}
      {selectedClaim && actionType === 'view' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs text-slate-400">{selectedClaim.claimId}</span>
                <h3 className="text-xl font-extrabold text-slate-900">Claim Evidence & Location Verification</h3>
              </div>
              <StatusBadge status={selectedClaim.status} />
            </div>

            {/* Claimant Info & Item Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Target Item Details</span>
                <p className="font-bold text-slate-900 text-sm">{selectedClaim.item?.itemName}</p>
                <p className="text-slate-600">Report ID: {selectedClaim.item?.reportId}</p>
                <p className="text-slate-600">Location: {selectedClaim.item?.locationName || selectedClaim.item?.location}</p>
                <p className="text-slate-600">Specific: {selectedClaim.item?.specificLocation || 'None'}</p>
                {selectedClaim.item?.latitude && (
                  <p className="font-mono text-[10px] text-indigo-600 font-bold">
                    Coordinates: {selectedClaim.item?.latitude}, {selectedClaim.item?.longitude} ({selectedClaim.item?.locationSource})
                  </p>
                )}
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">Claimant Credentials</span>
                <p className="font-bold text-slate-900 text-sm">{selectedClaim.claimant?.name}</p>
                <p className="text-slate-600">Student ID: {selectedClaim.claimant?.collegeId}</p>
                <p className="text-slate-600">Email: {selectedClaim.claimant?.email}</p>
                <p className="text-slate-600">Phone: {selectedClaim.claimant?.phone}</p>
              </div>
            </div>

            {/* Interactive Campus Map View in Admin Review */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs block">Item Report Campus Location Map:</span>
              <CampusMap
                center={itemPos}
                zoom={17}
                markerPosition={itemPos}
                readOnly={true}
                popupText={`<strong>${claimItem?.itemName}</strong><br/>${claimItem?.locationName || claimItem?.location}`}
                height="220px"
              />
            </div>

            {/* Ownership Reason & Evidence Photos */}
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Claimant's Ownership Description:</span>
                <p className="text-slate-700 leading-relaxed">{selectedClaim.ownershipDescription}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Verification Details & Serial Numbers:</span>
                <p className="text-slate-700 leading-relaxed">{selectedClaim.evidenceDetails || 'None provided'}</p>
              </div>

              {selectedClaim.evidenceImages && selectedClaim.evidenceImages.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-2">Uploaded Ownership Evidence Photos:</span>
                  <div className="flex flex-wrap gap-3">
                    {selectedClaim.evidenceImages.map((img, i) => (
                      <img key={i} src={img} alt="Evidence" className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Note Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Admin Verification Note / Decision Reason</label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Verified serial number matches invoice proof submitted."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Close View
              </button>

              {selectedClaim.status === 'Pending Verification' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject Claim
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Claim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
