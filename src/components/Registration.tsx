import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Hash, ShieldCheck, Check } from 'lucide-react';
import { VehicleType } from '../types';

interface RegistrationProps {
  onBack: () => void;
  onSubmit: (data: {
    full_name: string;
    phone_number: string;
    number_plate: string;
    vehicle_type: VehicleType;
  }) => Promise<void>;
}

const VEHICLE_OPTIONS: { type: VehicleType; label: string; icon: string }[] = [
  { type: 'Bike', label: 'Bike', icon: '🏍️' },
  { type: 'Car', label: 'Car', icon: '🚗' },
  { type: 'Scooter', label: 'Scooter', icon: '🛵' },
  { type: 'Auto', label: 'Auto', icon: '🛺' },
  { type: 'Van', label: 'Van', icon: '🚐' },
  { type: 'Truck', label: 'Truck', icon: '🚚' },
  { type: 'Lorry', label: 'Lorry', icon: '🚛' },
  { type: 'Bus', label: 'Bus', icon: '🚌' },
  { type: 'Other', label: 'Other', icon: '🚜' }
];

export const Registration: React.FC<RegistrationProps> = ({ onBack, onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [numberPlate, setNumberPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Bike');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const cleanPlate = numberPlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleanPlate.length < 5) {
      setError('Please enter a valid vehicle number plate (e.g. KA01AB1234)');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone_number: phoneNumber.startsWith('+91') ? phoneNumber : `+91 ${cleanPhone.slice(-10)}`,
        number_plate: cleanPlate,
        vehicle_type: vehicleType
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white max-w-md mx-auto flex flex-col p-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3 pt-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">Step 2 of 3</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Register Your Vehicle</h1>
        <p className="mt-1 text-xs text-slate-400">
          Create your account and receive your unique private Vehicle ID.
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span className="font-bold">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Prashanth Kumar"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Mobile Number
              </label>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Never shown publicly
              </span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Number Plate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Vehicle Number Plate
              </label>
              <span className="text-[10px] text-slate-400">e.g. KA01AB1234</span>
            </div>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={numberPlate}
                onChange={e => setNumberPlate(e.target.value.toUpperCase())}
                placeholder="KA01AB1234"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono tracking-wider font-bold text-white placeholder-slate-500 outline-none transition uppercase"
              />
            </div>
          </div>

          {/* Vehicle Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {VEHICLE_OPTIONS.slice(0, 8).map(opt => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setVehicleType(opt.type)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    vehicleType === opt.type
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-[10px] font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Submit */}
        <div className="mt-8 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-[10px] text-slate-500 mt-3">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </form>
    </div>
  );
};
