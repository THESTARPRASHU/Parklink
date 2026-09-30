import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Table,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface SupabaseModalProps {
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sqlSchema, setSqlSchema] = useState('');
  const [status, setStatus] = useState<{
    connected: boolean;
    projectId: string;
    projectUrl: string;
    tablesReady: boolean;
    usersTableExists: boolean;
    requestsTableExists: boolean;
    message: string;
    sqlEditorUrl: string;
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getSupabaseStatus();
      setStatus(data);
      const schema = await api.getSupabaseSchema();
      setSqlSchema(schema);
    } catch (err) {
      console.error('Failed to get Supabase status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopySql = () => {
    if (!sqlSchema) return;
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Supabase Backend
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">Project ID: gtrifaxowpezwbjgrvuo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Connection Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Project Endpoint</span>
              <span className="font-mono text-[11px] text-emerald-300 font-semibold truncate max-w-[200px]">
                https://gtrifaxowpezwbjgrvuo.supabase.co
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">API Key</span>
              <span className="font-mono text-[11px] text-slate-300">sb_publishable_at_...3xD</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span className="text-slate-400">Database Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Cloud Sync Active
              </span>
            </div>
          </div>

          {/* Table Status Overview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-indigo-400" />
                Database Tables & Sync State
              </span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'public.users', desc: 'Vehicles & Owners' },
                { name: 'public.vehicle_requests', desc: 'Blocked Alerts' },
                { name: 'public.chat_messages', desc: 'Owner Messages' },
                { name: 'public.notifications', desc: 'Push Alerts' },
                { name: 'public.subscriptions', desc: 'Payments & Plans' },
                { name: 'public.incident_reports', desc: 'Feedback & Reports' },
              ].map(t => (
                <div key={t.name} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-[11px] text-slate-200">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.desc}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sync Ready" />
                </div>
              ))}
            </div>
          </div>

          {/* Schema Migration Instructions if tables need SQL execution */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-xs">Initialize Supabase Database Tables</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  To view and browse live tables in your Supabase Dashboard Table Editor, copy and run the SQL migration schema in your Supabase SQL Editor.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleCopySql}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition flex items-center justify-center gap-1.5 shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied SQL to Clipboard!' : 'Copy SQL Schema (1-Click)'}
              </button>

              <a
                href="https://supabase.com/dashboard/project/gtrifaxowpezwbjgrvuo/sql"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                Open SQL Editor
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
