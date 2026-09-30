import React, { useEffect } from 'react';
import { Bell, AlertOctagon, X, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { VehicleContactRequest } from '../types';

interface OwnerNotificationModalProps {
  request: VehicleContactRequest;
  onClose: () => void;
  onRespondMoving: () => void;
  onRespondFiveMinutes: () => void;
  onMessageRequester: () => void;
}

export const OwnerNotificationModal: React.FC<OwnerNotificationModalProps> = ({
  request,
  onClose,
  onRespondMoving,
  onRespondFiveMinutes,
  onMessageRequester
}) => {
  useEffect(() => {
    // Vibrate device if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white relative overflow-hidden">
        {/* Top close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header (Matching Screen 9) */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
            P
          </div>
          <span className="text-xs font-bold text-slate-300">ParkLink Alert</span>
          <span className="text-[10px] text-slate-500">• now</span>
        </div>

        {/* Center Alert Bell (Matching Screen 9) */}
        <div className="flex flex-col items-center text-center my-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/20 mb-3 animate-pulse">
            <Bell className="w-8 h-8 fill-current" />
          </div>

          <h3 className="text-lg font-black text-white">Vehicle Movement Request</h3>
          <p className="text-xs text-slate-400 mt-0.5">Someone needs to access their vehicle.</p>
        </div>

        {/* Request details box */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 mb-5">
          <div className="flex items-center justify-between text-slate-400">
            <span>From Blocked Vehicle:</span>
            <span className="font-mono font-bold text-indigo-400">{request.requester_vehicle_id}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Message:</span>
            <p className="text-slate-200 italic font-medium">"{request.message}"</p>
          </div>
        </div>

        {/* Action Buttons (Matching Screen 9) */}
        <div className="space-y-2.5">
          <button
            onClick={onRespondMoving}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            I'm Moving My Vehicle
          </button>

          <button
            onClick={onRespondFiveMinutes}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            I'll Move in 5 Minutes
          </button>

          <button
            onClick={onMessageRequester}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message Requester
          </button>
        </div>
      </div>
    </div>
  );
};
