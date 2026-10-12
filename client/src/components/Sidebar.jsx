import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileQuestion,
  Search,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Users,
  CheckCircle2,
  PackageCheck,
  MessageSquareHeart,
  History,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const userLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Report Lost Item', path: '/report-lost', icon: FileQuestion },
    { label: 'Report Found Item', path: '/report-found', icon: Search },
    { label: 'My Reports', path: '/my-reports', icon: ClipboardList },
    { label: 'Potential Matches', path: '/potential-matches', icon: Sparkles },
    { label: 'My Claims', path: '/my-claims', icon: CheckCircle2 }
  ];

  const adminLinks = [
    { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'All Items Registry', path: '/admin/items', icon: ClipboardList },
    { label: 'Claims Verification', path: '/admin/claims', icon: ShieldCheck },
    { label: 'Physical Handovers', path: '/admin/handovers', icon: PackageCheck },
    { label: 'Potential Matches', path: '/admin/matches', icon: Sparkles },
    { label: 'User Feedback', path: '/admin/feedback', icon: MessageSquareHeart },
    { label: 'Audit Log Trail', path: '/admin/audit-logs', icon: History }
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block shrink-0">
      <div className="mb-6 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          {isAdmin ? 'Administrator Portal' : 'User Control Center'}
        </span>
        <span className="text-xs font-semibold text-slate-700 block mt-0.5">
          {isAdmin ? 'Campus Security Desk' : 'Student Portal'}
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? isAdmin
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60 shadow-sm'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? (isAdmin ? 'text-amber-700' : 'text-white') : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
