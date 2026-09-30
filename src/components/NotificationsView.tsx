import React from 'react';
import {
  Bell,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Sparkles,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllRead
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'MOVEMENT_REQUEST':
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
        );
      case 'SUBSCRIPTION':
        return (
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'REQUEST_RESOLVED':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'ACKNOWLEDGED':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4 pb-24 text-white">
      {/* Top Header (Matching Screen 11) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-400">Alerts, updates and movement logs</p>
        </div>

        {notifications.some(n => !n.read_status) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">No notifications yet</p>
          <p className="text-xs text-slate-500 mt-1">
            You'll receive alerts here when someone sends you a vehicle movement request.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick(notif)}
              className={`p-3.5 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer ${
                notif.read_status
                  ? 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                  : 'bg-slate-900 border-indigo-500/40 text-white shadow-md shadow-indigo-600/10 ring-1 ring-indigo-500/20'
              }`}
            >
              {getIcon(notif.type)}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {getTimeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read_status && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
