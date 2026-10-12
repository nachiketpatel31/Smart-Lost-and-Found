import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-slate-200"></div>
    <div className="p-5 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/5"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse border-b border-slate-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);
