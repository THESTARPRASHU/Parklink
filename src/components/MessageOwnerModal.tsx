import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Lock,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';
import { ChatMessage, PublicVehicleProfile } from '../types';

interface MessageOwnerModalProps {
  targetProfile: PublicVehicleProfile;
  currentUserVehicleId: string;
  messages: ChatMessage[];
  onBack: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onCallClick?: () => void;
}

const PRESET_MESSAGES = [
  '🚨 My vehicle is blocked',
  'Please move your vehicle',
  'I need to leave urgently',
  'Your vehicle is blocking my vehicle',
  'I need to contact you for 2 minutes'
];

export const MessageOwnerModal: React.FC<MessageOwnerModalProps> = ({
  targetProfile,
  currentUserVehicleId,
  messages,
  onBack,
  onSendMessage,
  onCallClick
}) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSendMessage(text.trim());
      setInputText('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white max-w-md mx-auto">
      {/* Top Header (Matching Screen 7) */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm">
              {targetProfile.owner_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {targetProfile.owner_name}
              </h3>
              <p className="text-[10px] font-mono text-indigo-400 font-bold">
                {targetProfile.vehicle_id} • {targetProfile.vehicle_type}
              </p>
            </div>
          </div>
        </div>

        {onCallClick && (
          <button
            onClick={onCallClick}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 transition"
            title="Privacy Call"
          >
            <Phone className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Privacy Notice Banner (Matching Screen 7) */}
      <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center gap-2 text-[11px] text-indigo-300">
        <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>This is a secure chat. Your phone number is not shared.</span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <p className="font-semibold text-slate-400">No messages yet</p>
            <p className="mt-1">Tap a quick message below or type your own to notify the owner.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_vehicle_id === currentUserVehicleId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Quick Chips (Matching Screen 7) */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-800/80 bg-slate-950/95 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {PRESET_MESSAGES.map(chip => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 text-[11px] font-medium text-indigo-200 hover:text-white transition active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Box (Matching Screen 7) */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend(inputText);
          }}
          placeholder="Write a message..."
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition"
        />

        <button
          onClick={() => handleSend(inputText)}
          disabled={!inputText.trim() || sending}
          className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
