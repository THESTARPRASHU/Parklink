import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Car, LogIn } from 'lucide-react';

interface OnboardingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onGetStarted, onSignIn }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "Stuck because of someone's vehicle?",
      desc: "Connect with vehicle owners instantly without sharing your personal number.",
      badge: "Emergency Unblock",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Scan License Plate in 2 Seconds",
      desc: "Point your camera at any blocking bike, car, auto or truck plate to find the owner privately.",
      badge: "AI Plate Recognition",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "100% Privacy Protected",
      desc: "In-app alerts and masked relay calling. Never expose your personal phone number.",
      badge: "Zero Phone Leaks",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const current = slides[slide];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between max-w-md mx-auto relative overflow-hidden text-white">
      {/* Background visual with gradient overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.image}
          alt="Vehicle unblock"
          className="w-full h-3/5 object-cover object-center filter brightness-50 contrast-125 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-950/90 to-transparent" />
      </div>

      {/* Header Brand */}
      <div className="relative z-10 pt-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3h8a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5H9v8H6V3zm3 3v4h5a2 2 0 0 0 0-4H9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">ParkLink</h1>
            <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Vehicle Reach</p>
          </div>
        </div>

        <button
          onClick={onSignIn}
          className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 shadow-sm"
        >
          <LogIn className="w-3.5 h-3.5 text-indigo-400" />
          Sign In
        </button>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 px-6 pb-10 pt-4 flex flex-col">
        {/* Feature Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold w-fit mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          {current.badge}
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight min-h-[72px]">
          {current.title}
        </h2>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed min-h-[48px]">
          {current.desc}
        </p>

        {/* Google Continue Action */}
        <button
          onClick={onGetStarted}
          className="w-full py-3.5 px-4 mb-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2.5"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Carousel Dots */}
        <div className="flex items-center gap-2 mt-2 mb-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={slide < slides.length - 1 ? () => setSlide(slide + 1) : onGetStarted}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <span>{slide < slides.length - 1 ? 'Next' : 'Register Vehicle'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Already registered?{' '}
          <button onClick={onSignIn} className="text-indigo-400 font-bold hover:underline">
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};
