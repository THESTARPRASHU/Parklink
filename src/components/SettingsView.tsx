import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Layers,
  Bell,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  Info,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Lock,
  Database
} from 'lucide-react';
import { SupabaseModal } from './SupabaseModal';

interface SettingsViewProps {
  onBack: () => void;
  onNavigateTab: (tab: 'subscription' | 'requests') => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onNavigateTab,
  onOpenNotifications,
  onOpenAdmin,
  onLogout
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'sub',
      icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
      label: 'Subscription',
      action: () => onNavigateTab('subscription')
    },
    {
      id: 'supabase',
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      label: 'Supabase Database',
      badge: 'Connected',
      action: () => setActiveModal('supabase')
    },
    {
      id: 'req',
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      label: 'My Requests',
      action: () => onNavigateTab('requests')
    },
    {
      id: 'notif',
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      label: 'Notifications',
      action: onOpenNotifications
    },
    {
      id: 'privacy',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      label: 'Privacy & Security',
      action: () => setActiveModal('privacy')
    },
    {
      id: 'help',
      icon: <HelpCircle className="w-5 h-5 text-sky-400" />,
      label: 'Help & Support',
      action: () => setActiveModal('help')
    },
    {
      id: 'report',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      label: 'Report a Problem',
      action: () => setActiveModal('report')
    },
    {
      id: 'about',
      icon: <Info className="w-5 h-5 text-indigo-400" />,
      label: 'About ParkLink',
      action: () => setActiveModal('about')
    },
    {
      id: 'admin',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      label: 'Admin Portal & Analytics',
      action: onOpenAdmin
    }
  ];

  return (
    <div className="space-y-4 pb-24 text-white">
      {/* Top Header (Matching Screen 14) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Settings</h2>
          <p className="text-xs text-slate-400">Account settings and preferences</p>
        </div>
      </div>

      {/* Settings Menu List */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 divide-y divide-slate-800/80 overflow-hidden shadow-lg">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={item.action}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-850 transition text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-white">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout / Switch Account
        </button>
      </div>

      {/* Privacy modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <Lock className="w-5 h-5" />
              Privacy & Zero-Leak Architecture
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ParkLink is engineered from the ground up to protect personal identity. Your mobile number is never stored in public indices or visible in plate search results. All calls are routed through relay telephony bridges, and chat runs through end-to-end authorized sessions.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-indigo-600 font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white space-y-4">
            <h3 className="font-bold text-base text-white">How ParkLink Works</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>1. <strong>Blocked:</strong> Open app and tap "My Vehicle is Blocked".</p>
              <p>2. <strong>Scan:</strong> Point camera at blocking vehicle's number plate.</p>
              <p>3. <strong>Connect:</strong> Send an instant movement alert or start a masked call.</p>
              <p>4. <strong>Unblock:</strong> Once moved, mark request resolved.</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-indigo-600 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h3 className="font-black text-lg text-white">ParkLink</h3>
              <p className="text-xs text-indigo-400 font-semibold">Version 1.0.0 (Production PWA)</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The premier emergency vehicle unblocking and privacy communication network. Works across Bikes, Scooters, Cars, Autos, Trucks, and all vehicle types.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-indigo-600 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Supabase Database Modal */}
      {activeModal === 'supabase' && (
        <SupabaseModal onClose={() => setActiveModal(null)} />
      )}

      {/* Report Modal */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white space-y-4">
            <h3 className="font-bold text-base text-white">Report a Problem</h3>
            <p className="text-xs text-slate-300">
              Experiencing an issue with plate scanning or unblocking? Our team reviews all reports 24/7.
            </p>
            <textarea
              placeholder="Describe the issue you encountered..."
              className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
