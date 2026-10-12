import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">CampusReunite</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Smart Lost & Found Management System featuring a Hybrid Image + Metadata Similarity Engine for college campuses.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Quick Navigation</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/search" className="hover:text-white transition-colors">
                Search Item Database
              </Link>
            </li>
            <li>
              <Link to="/report-lost" className="hover:text-white transition-colors">
                Report Lost Belongings
              </Link>
            </li>
            <li>
              <Link to="/report-found" className="hover:text-white transition-colors">
                Report Found Items
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition-colors">
                Student Portal Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Campus Locations</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>Central Library & Reading Rooms</li>
            <li>Computer Labs & Engineering Block</li>
            <li>Student Canteen & Food Court</li>
            <li>Sports Complex & Auditorium</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Project & Viva Info</h4>
          <p className="text-slate-400 leading-relaxed mb-3">
            Developed for 5th Semester Advanced Web Technology & Software Engineering Group Project.
          </p>
          <div className="flex items-center gap-2 text-indigo-400 font-medium">
            <Shield className="w-4 h-4" /> Privacy Protected Verification
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>© 2026 Smart Lost & Found System. All rights reserved.</p>
        <p className="flex items-center justify-center gap-1 text-slate-500">
          Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Campus Safety & Fast Item Reunification.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
