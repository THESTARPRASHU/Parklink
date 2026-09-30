import React, { useState } from 'react';
import { X, ShieldCheck, Check, Smartphone, CreditCard, Building2, Lock } from 'lucide-react';

interface RazorpayModalProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({ amount, onSuccess, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess(`pay_${Date.now().toString(36).toUpperCase()}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95">
        {/* Razorpay Brand Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-indigo-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">Razorpay Checkout</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                  SECURE
                </span>
              </div>
              <p className="text-[10px] text-blue-200">ParkLink Technologies India</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Payable</span>
            <div className="text-2xl font-black text-white">₹{amount}.00</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Plan:</span>
            <span className="text-xs font-bold text-indigo-400">ParkLink 1-Month Basic</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-4 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">Select Payment Method:</span>

          {/* UPI */}
          <div
            onClick={() => setSelectedMethod('upi')}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              selectedMethod === 'upi'
                ? 'bg-indigo-600/15 border-indigo-500 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">UPI / QR (Google Pay, PhonePe, Paytm)</p>
                <p className="text-[10px] text-slate-400">Instant verification via VPA</p>
              </div>
            </div>
            {selectedMethod === 'upi' && <Check className="w-4 h-4 text-indigo-400" />}
          </div>

          {selectedMethod === 'upi' && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="Enter UPI ID (e.g. mobile@upi)"
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>
          )}

          {/* Cards */}
          <div
            onClick={() => setSelectedMethod('card')}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              selectedMethod === 'card'
                ? 'bg-indigo-600/15 border-indigo-500 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Credit / Debit Card</p>
                <p className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            {selectedMethod === 'card' && <Check className="w-4 h-4 text-indigo-400" />}
          </div>

          {/* Netbanking */}
          <div
            onClick={() => setSelectedMethod('netbanking')}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              selectedMethod === 'netbanking'
                ? 'bg-indigo-600/15 border-indigo-500 text-white'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Netbanking</p>
                <p className="text-[10px] text-slate-400">SBI, HDFC, ICICI, Axis & all Indian banks</p>
              </div>
            </div>
            {selectedMethod === 'netbanking' && <Check className="w-4 h-4 text-indigo-400" />}
          </div>
        </div>

        {/* Footer pay button */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ₹{amount}.00 Securely
              </>
            )}
          </button>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit SSL Encrypted • PCI DSS Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
