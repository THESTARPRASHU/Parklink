import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  Clock
} from 'lucide-react';
import { User } from '../types';
import { RazorpayModal } from './RazorpayModal';

interface SubscriptionViewProps {
  user: User;
  onSubscribeSuccess: (paymentId: string) => Promise<void>;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onSubscribeSuccess }) => {
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formattedExpiry = new Date(user.subscription_expiry).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePaymentSuccess = async (paymentId: string) => {
    setRazorpayOpen(false);
    setLoading(true);
    try {
      await onSubscribeSuccess(paymentId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 text-white">
      {/* Header (Matching Screen 12) */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Subscription</h2>
        <p className="text-xs text-slate-400">Manage your ParkLink vehicle protection plan</p>
      </div>

      {/* Main Plan Card (Matching Screen 12) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/80 via-indigo-950/80 to-purple-950/80 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Monthly Plan
            </span>
            <h3 className="text-2xl font-black text-white mt-0.5">ParkLink Basic</h3>
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-indigo-950 shadow-md">
            Most Popular
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-white">₹99</span>
          <span className="text-xs text-indigo-200 font-medium">/ month</span>
        </div>

        <p className="text-xs text-indigo-200/80 mt-1">
          7-Day free trial included for every newly registered vehicle.
        </p>

        {/* Benefits Checklist (Matching Screen 12) */}
        <div className="mt-6 space-y-3">
          {[
            'Unlimited number plate searches',
            'Unlimited vehicle movement requests',
            'In-app instant messaging',
            'Privacy-protected masked calling',
            'Multi-vehicle support'
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-slate-100">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          <button
            onClick={() => setRazorpayOpen(true)}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-indigo-950 font-black text-sm shadow-xl shadow-black/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <span>Subscribe for ₹99/Month</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Plan Status Card (Matching Screen 12) */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-md">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Current Plan
        </span>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Status:</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {user.subscription_status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valid until <span className="text-white font-semibold">{formattedExpiry}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Modal */}
      {razorpayOpen && (
        <RazorpayModal
          amount={99}
          onSuccess={handlePaymentSuccess}
          onClose={() => setRazorpayOpen(false)}
        />
      )}
    </div>
  );
};
