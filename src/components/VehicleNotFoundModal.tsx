import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Search,
  Share2,
  FileText,
  CheckCircle2,
  PlusCircle,
  X
} from 'lucide-react';

interface VehicleNotFoundModalProps {
  searchedPlate: string;
  onBack: () => void;
  onManualEdit: () => void;
  onRegisterVehicle: () => void;
  onScanAnother: () => void;
}

export const VehicleNotFoundModal: React.FC<VehicleNotFoundModalProps> = ({
  searchedPlate,
  onBack,
  onManualEdit,
  onRegisterVehicle,
  onScanAnother
}) => {
  const [noticeSent, setNoticeSent] = useState(false);
  const [noticeText, setNoticeText] = useState('Vehicle is currently blocking parking exit.');

  const handleSendNotice = () => {
    setNoticeSent(true);
    setTimeout(() => {
      // Keep notice active for feedback
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white max-w-md mx-auto p-5 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Unregistered Vehicle</span>
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center text-center my-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Owner Not Registered Yet</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            We searched for number plate:
          </p>
          <div className="mt-2 inline-block px-4 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 font-mono font-black text-lg text-amber-300 tracking-widest shadow-inner">
            {searchedPlate}
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          The owner of this vehicle has not linked their plate to ParkLink yet. You can leave an anonymous unblock notice or verify the number plate.
        </p>

        {/* Unblock notice card */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Digital Unblock Notice
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Anonymous</span>
          </div>

          {noticeSent ? (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Unblock notice logged!</p>
                <p className="text-[10px] text-emerald-200">Notice reference #UNB-{Math.floor(1000 + Math.random() * 9000)} created for plate {searchedPlate}.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={noticeText}
                onChange={e => setNoticeText(e.target.value)}
                placeholder="Notice note (e.g. Please move vehicle)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendNotice}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow"
              >
                Log Unblock Alert
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onManualEdit}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-white transition flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-indigo-400" />
          Edit Plate or Try Manual Entry
        </button>

        <button
          onClick={onScanAnother}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900/60 hover:bg-slate-850 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          Scan Another Blocking Vehicle
        </button>
      </div>
    </div>
  );
};
