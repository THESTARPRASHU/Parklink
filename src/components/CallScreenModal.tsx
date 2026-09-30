import React, { useState, useEffect } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Lock,
  PhoneCall
} from 'lucide-react';
import { PublicVehicleProfile } from '../types';

interface CallScreenModalProps {
  profile: PublicVehicleProfile;
  onEndCall: () => void;
}

export const CallScreenModal: React.FC<CallScreenModalProps> = ({ profile, onEndCall }) => {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [callState, setCallState] = useState<'CONNECTING' | 'CONNECTED'>('CONNECTING');

  useEffect(() => {
    // Simulate connection delay then start timer
    const connectTimer = setTimeout(() => {
      setCallState('CONNECTED');
    }, 1500);

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between items-center text-white max-w-md mx-auto p-8">
      {/* Top Banner (Matching Screen 8) */}
      <div className="text-center pt-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Your number is private</span>
        </div>
        <h2 className="text-sm font-semibold text-slate-400">Calling via ParkLink Relay</h2>
      </div>

      {/* Center Avatar & Info (Matching Screen 8) */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-1 shadow-2xl shadow-indigo-600/40 animate-pulse-subtle">
            <div className="w-full h-full rounded-full bg-slate-900 border-2 border-indigo-400 flex items-center justify-center text-3xl font-black text-white">
              {profile.owner_name.charAt(0)}
            </div>
          </div>
          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow">
              {profile.vehicle_type}
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">{profile.owner_name}</h3>
        <p className="text-xs font-mono font-bold text-indigo-400 mt-1">
          {profile.vehicle_id} • {profile.masked_number_plate}
        </p>

        {/* Timer */}
        <div className="mt-4 text-sm font-mono text-slate-300 font-semibold flex items-center gap-2">
          {callState === 'CONNECTING' ? (
            <span className="text-indigo-400 animate-pulse">Establishing secure relay...</span>
          ) : (
            <span className="text-emerald-400 tracking-wider font-bold">
              {formatTime(seconds)}
            </span>
          )}
        </div>
      </div>

      {/* Call Actions (Matching Screen 8) */}
      <div className="w-full space-y-6 pb-6">
        <div className="flex items-center justify-center gap-6">
          {/* Mute */}
          <button
            onClick={() => setMuted(!muted)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 ${
              muted
                ? 'bg-rose-500/20 border border-rose-500 text-rose-300'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[9px] mt-1 font-semibold">Mute</span>
          </button>

          {/* Speaker */}
          <button
            onClick={() => setSpeaker(!speaker)}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 ${
              speaker
                ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-300'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {speaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[9px] mt-1 font-semibold">Speaker</span>
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 active:scale-95 transition"
            aria-label="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-500">
          Masked call active. Neither your personal number nor the owner's number is visible.
        </p>
      </div>
    </div>
  );
};
