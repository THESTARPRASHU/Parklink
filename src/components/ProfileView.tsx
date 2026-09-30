import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  Car,
  Hash,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Edit2,
  Camera,
  CheckCheck,
  LogOut
} from 'lucide-react';
import { User, VehicleType } from '../types';

interface ProfileViewProps {
  user: User;
  onUpdateProfile: (updated: Partial<User>) => Promise<void>;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
  onOpenSettings,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.full_name);
  const [vehicleType, setVehicleType] = useState<VehicleType>(user.vehicle_type);
  const [copiedId, setCopiedId] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.vehicle_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({ full_name: name, vehicle_type: vehicleType });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">My Profile</h2>
          <p className="text-xs text-slate-400">Personal details & vehicle registration</p>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
        >
          Settings
        </button>
      </div>

      {/* Avatar & Vehicle ID Header (Matching Screen 13) */}
      <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-md relative">
        <div className="relative mb-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-black text-white ring-4 ring-indigo-500/30">
              {user.full_name.charAt(0)}
            </div>
          )}

          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-md">
            <Camera className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-lg font-black text-white">{user.full_name}</h3>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-400">
            Vehicle ID: {user.vehicle_id}
          </span>
          <button
            onClick={handleCopyId}
            className="text-slate-400 hover:text-white"
            title="Copy Vehicle ID"
          >
            {copiedId ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Details Card (Matching Screen 13) */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4">
        {/* Name Field */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Name
          </span>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500 text-xs text-white outline-none"
            />
          ) : (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs font-bold text-white">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>{user.full_name}</span>
            </div>
          )}
        </div>

        {/* Mobile Number with Lock (Privacy protected) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Mobile Number
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private (Encrypted)
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-white">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{user.phone_number}</span>
            </div>
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Vehicle Type
          </span>
          {isEditing ? (
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value as VehicleType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500 text-xs text-white outline-none"
            >
              {['Bike', 'Car', 'Scooter', 'Auto', 'Van', 'Truck', 'Bus', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-white">
              <div className="flex items-center gap-2.5 font-bold">
                <Car className="w-4 h-4 text-indigo-400" />
                <span>{user.vehicle_type}</span>
              </div>
            </div>
          )}
        </div>

        {/* Number Plate */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Number Plate
          </span>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono font-bold text-white tracking-wider">
            <div className="flex items-center gap-2.5">
              <Hash className="w-4 h-4 text-slate-500" />
              <span>{user.number_plate}</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
              Registered
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Sign Out Action */}
      {onLogout && (
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Sign Out of Account
          </button>
        </div>
      )}
    </div>
  );
};
