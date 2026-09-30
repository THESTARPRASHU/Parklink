import React from 'react';
import { Bell, ShieldCheck, Car } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  unreadCount: number;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  unreadCount,
  onNotificationsClick,
  onProfileClick,
  onAdminClick
}) => {
  return (
    <header className="px-4 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 3h8a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5H9v8H6V3zm3 3v4h5a2 2 0 0 0 0-4H9z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
            ParkLink
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </span>
          <span className="text-[9px] font-semibold tracking-wider uppercase text-indigo-400">
            Privacy Unblock
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {onAdminClick && (
          <button
            onClick={onAdminClick}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[10px] font-bold text-slate-300 transition"
            title="Open Admin Dashboard"
          >
            Admin
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        {user && (
          <button
            onClick={onProfileClick}
            className="relative rounded-xl overflow-hidden ring-2 ring-indigo-500/40 hover:ring-indigo-500 transition active:scale-95"
            aria-label="Profile"
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-9 h-9 object-cover rounded-xl"
              />
            ) : (
              <div className="w-9 h-9 bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {user.full_name.charAt(0)}
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
