import React from 'react';

const statusConfig = {
  'Reported': 'bg-blue-100 text-blue-800 border-blue-200',
  'Under Review': 'bg-amber-100 text-amber-800 border-amber-200',
  'Potential Match': 'bg-purple-100 text-purple-800 border-purple-200 font-semibold animate-pulse',
  'Claim Requested': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Verified': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Returned': 'bg-green-100 text-green-900 border-green-300 font-bold',
  'Unclaimed': 'bg-slate-100 text-slate-700 border-slate-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  'Pending Verification': 'bg-amber-100 text-amber-800 border-amber-200',
  'Approved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Completed': 'bg-green-100 text-green-900 border-green-300'
};

const StatusBadge = ({ status }) => {
  const style = statusConfig[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
