import React from 'react';
import {
  AlertOctagon,
  ScanLine,
  Layers,
  Bell,
  Car,
  ChevronRight,
  Shield,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { User, VehicleContactRequest } from '../types';

interface DashboardProps {
  user: User;
  activeRequests: VehicleContactRequest[];
  onEmergencyBlockedClick: () => void;
  onScanClick: () => void;
  onRequestsClick: () => void;
  onNotificationsClick: () => void;
  onManageSubscription: () => void;
  onViewVehicle: () => void;
  onRequestSelect: (req: VehicleContactRequest) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  activeRequests,
  onEmergencyBlockedClick,
  onScanClick,
  onRequestsClick,
  onNotificationsClick,
  onManageSubscription,
  onViewVehicle,
  onRequestSelect
}) => {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Bike': return '🏍️';
      case 'Car': return '🚗';
      case 'Scooter': return '🛵';
      case 'Auto': return '🛺';
      case 'Van': return '🚐';
      case 'Truck': return '🚚';
      default: return '🚗';
    }
  };

  const formattedExpiry = new Date(user.subscription_expiry).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-5 pb-24 text-white">
      {/* User Greeting Section */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400">Welcome back,</span>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Hello, {user.full_name.split(' ')[0]}
          </h2>
          <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {user.vehicle_id}
          </div>
        </div>

        <button
          onClick={onViewVehicle}
          className="relative group p-0.5 rounded-2xl ring-2 ring-indigo-500/30 hover:ring-indigo-500 transition"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-12 h-12 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
              {user.full_name.charAt(0)}
            </div>
          )}
        </button>
      </div>

      {/* My Vehicle Card (Matching Screen 4) */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-xl relative overflow-hidden">
        {/* Subtle vehicle backdrop watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-indigo-950/40 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              My Vehicle
            </span>
            <div className="text-xl font-black font-mono tracking-widest text-white mt-0.5">
              {user.number_plate}
            </div>
            <div className="text-xs text-indigo-300 font-medium mt-0.5 flex items-center gap-1">
              <span>{getVehicleIcon(user.vehicle_type)}</span>
              <span>{user.vehicle_type}</span>
            </div>
          </div>

          <div className="text-4xl filter drop-shadow-lg p-1 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            {getVehicleIcon(user.vehicle_type)}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Subscription:</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              {user.subscription_status}
            </span>
            <span className="text-[10px] text-slate-500">till {formattedExpiry}</span>
          </div>

          <button
            onClick={onManageSubscription}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Main Action: MY VEHICLE IS BLOCKED (Primary Emergency Action) */}
      <button
        onClick={onEmergencyBlockedClick}
        className="w-full text-left p-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-2xl shadow-indigo-600/30 border border-indigo-400/30 transition-all transform active:scale-[0.98] group relative overflow-hidden"
      >
        <div className="absolute right-0 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  My Vehicle Is Blocked
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-indigo-900">
                  Priority
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                Scan number plate and contact owner
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Quick 4 Action Grid (Matching Screen 4) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Scan Number Plate */}
        <button
          onClick={onScanClick}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
              Scan Number Plate
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Instant camera ANPR</p>
          </div>
        </button>

        {/* My Requests */}
        <button
          onClick={onRequestsClick}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition">
              My Requests
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {activeRequests.length > 0 ? `${activeRequests.length} active` : 'View movement logs'}
            </p>
          </div>
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
              Notifications
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Alerts & movements</p>
          </div>
        </button>

        {/* My Vehicle */}
        <button
          onClick={onViewVehicle}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left flex flex-col justify-between group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
              My Vehicle
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">{user.vehicle_id}</p>
          </div>
        </button>
      </div>

      {/* Active Blocking Requests (Multiple Blocking Vehicles - Workflow #11) */}
      {activeRequests.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Movement Requests ({activeRequests.length})
              </h3>
            </div>
            <button
              onClick={onRequestsClick}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeRequests.slice(0, 3).map(req => (
              <div
                key={req.id}
                onClick={() => onRequestSelect(req)}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-700/60 flex items-center justify-center text-lg">
                    {getVehicleIcon(req.target_vehicle_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono text-white">
                        {req.target_number_plate}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({req.target_owner_name})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ID: {req.target_vehicle_id}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : req.status === 'SEEN'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {req.status === 'ACCEPTED'
                      ? 'Moving now'
                      : req.status === 'SEEN'
                      ? 'Seen'
                      : 'Request Sent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Guarantee Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Zero Phone Exposure</h4>
          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
            Your personal phone number is never shown to other vehicle owners. All communications are private.
          </p>
        </div>
      </div>
    </div>
  );
};
