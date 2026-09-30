import React, { useState } from 'react';
import { LogIn, X, Phone, Car, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface SignInModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  onClose,
  onSuccess,
  onSwitchToRegister
}) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your vehicle number plate or registered phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(identifier.trim());
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'No registered account found with this number plate or phone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sign In to ParkLink</h3>
              <p className="text-[11px] text-slate-400">Access your registered vehicle account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Vehicle Plate or Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value.toUpperCase())}
                placeholder="e.g. KA05MG9999 or 9876543210"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs uppercase tracking-wider outline-none focus:border-indigo-500"
                autoFocus
              />
              <Car className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Enter your vehicle plate or phone number to sign in.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying Account...' : 'Sign In'}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="pt-2 text-center border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-indigo-400 font-bold hover:underline"
            >
              Register Vehicle
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
