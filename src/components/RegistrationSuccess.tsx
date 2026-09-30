import React, { useState } from 'react';
import { Check, Copy, CheckCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface RegistrationSuccessProps {
  user: User;
  onContinue: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ user, onContinue }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.vehicle_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Bike': return '🏍️';
      case 'Car': return '🚗';
      case 'Scooter': return '🛵';
      case 'Auto': return '🛺';
      case 'Truck': return '🚚';
      case 'Bus': return '🚌';
      default: return '🚗';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white max-w-md mx-auto flex flex-col justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center pt-6">
        {/* Success Circle */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 animate-in zoom-in-75">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">
          Vehicle Registered Successfully!
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          Your vehicle is now connected to the ParkLink privacy unblocking network.
        </p>

        {/* Vehicle Preview Card */}
        <div className="w-full mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-800 border border-indigo-500/30 flex items-center justify-center text-3xl shrink-0">
              {getVehicleIcon(user.vehicle_type)}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Owner</span>
              <p className="text-sm font-bold text-white truncate">{user.full_name}</p>

              <div className="mt-1 flex items-center gap-3">
                <div>
                  <span className="text-[9px] uppercase text-slate-500 font-semibold">Type</span>
                  <p className="text-xs text-indigo-300 font-medium">{user.vehicle_type}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-500 font-semibold">Number Plate</span>
                  <p className="text-xs font-mono font-bold text-white tracking-wider">{user.number_plate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle ID Highlight Box */}
        <div className="w-full mt-5 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 text-center">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
            Your Unique Vehicle ID
          </span>

          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-2xl font-black font-mono tracking-widest text-white px-3 py-1 bg-slate-900/80 rounded-xl border border-indigo-500/40">
              {user.vehicle_id}
            </span>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 shadow-md shadow-indigo-600/30"
              title="Copy Vehicle ID"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private identifier • Phone number hidden</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="pt-6 pb-2">
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
