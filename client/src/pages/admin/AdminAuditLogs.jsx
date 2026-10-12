import React, { useState, useEffect } from 'react';
import { History, Shield } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/audit-logs?page=${page}&limit=15`);
        if (res.data.success) {
          setLogs(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">System Audit Log Trail</h1>
        <p className="text-xs text-slate-500">Immutable audit log recording critical security and verification actions</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 bg-slate-100 animate-pulse"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-bold text-amber-700">{log.action}</td>
                    <td className="p-4 text-slate-800">{log.performedBy?.name || 'Admin'}</td>
                    <td className="p-4 text-slate-600">{log.targetModel}</td>
                    <td className="p-4 text-slate-700 max-w-sm truncate">{log.details}</td>
                    <td className="p-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default AdminAuditLogs;
