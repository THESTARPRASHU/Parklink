import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Phone,
  Flag,
  Lock,
  Sparkles,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { PublicVehicleProfile } from '../types';

interface VehicleFoundModalProps {
  profile: PublicVehicleProfile;
  onBack: () => void;
  onMessage: () => void;
  onCall: () => void;
  onReport: () => void;
}

export const VehicleFoundModal: React.FC<VehicleFoundModalProps> = ({
  profile,
  onBack,
  onMessage,
  onCall,
  onReport
}) => {
  const getVehicleImage = (type: string) => {
    switch (type) {
      case 'Bike':
        return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80';
      case 'Car':
        return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
      case 'Scooter':
        return 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80';
      case 'Auto':
        return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80';
      default:
        return 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop&q=80';
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white max-w-md mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-white tracking-wide">Vehicle Found</h2>

        <button
          onClick={onReport}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
          title="Report this vehicle"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col space-y-5">
        {/* Vehicle Photo Banner (Matching Screen 6) */}
        <div className="relative rounded-3xl overflow-hidden aspect-video border border-slate-800/80 shadow-2xl bg-slate-900">
          <img
            src={getVehicleImage(profile.vehicle_type)}
            alt={profile.vehicle_type}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Privacy Badge on Photo */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-indigo-400/30 text-[10px] font-bold text-indigo-300 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-indigo-400" />
            Privacy Protected
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white">
              {profile.masked_number_plate}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/80 backdrop-blur-md text-white">
              {profile.vehicle_type}
            </span>
          </div>
        </div>

        {/* Owner Details Card (Matching Screen 6) */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4">
          {/* Owner Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30">
              {profile.owner_name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white flex items-center gap-2 truncate">
                {profile.owner_name}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </h3>
              <p className="text-xs font-mono text-indigo-300 font-bold mt-0.5">
                Vehicle ID: {profile.vehicle_id}
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Vehicle Type
              </span>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{getVehicleIcon(profile.vehicle_type)}</span>
                <span>{profile.vehicle_type}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Number Plate
              </span>
              <div className="font-mono font-bold text-white tracking-wider">
                {profile.masked_number_plate}
              </div>
            </div>
          </div>

          {/* Masked Phone Notice */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-medium">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Mobile Number:</span>
              <span className="font-mono font-bold text-white">{profile.masked_phone_number}</span>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              Masked
            </span>
          </div>
        </div>

        {/* Action Buttons (Matching Screen 6) */}
        <div className="space-y-3 pt-2">
          {/* Message Owner */}
          <button
            onClick={onMessage}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Message Owner
          </button>

          {/* Call Owner (Privacy Relay Calling) */}
          <button
            onClick={onCall}
            className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-bold text-sm active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5 text-emerald-400" />
            Call Owner
          </button>

          {/* Report Button */}
          <button
            onClick={onReport}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-rose-400 transition flex items-center justify-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5" />
            Report suspicious or abandoned vehicle
          </button>
        </div>
      </div>
    </div>
  );
};
