import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  AlertTriangle,
  Settings,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  RefreshCw,
  Sparkles,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, AdminConfig, AbuseReport } from '../types';
import { SupabaseModal } from './SupabaseModal';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'stats' | 'users' | 'reports' | 'config'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [config, setConfig] = useState<AdminConfig>({
    monthlyPrice: 99,
    trialDays: 7,
    allowTrial: true,
    maskedCallingEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u, r, c] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getAdminConfig()
      ]);
      setStats(s);
      setUsers(u);
      setReports(r);
      setConfig(c);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUser = async (id: string) => {
    try {
      await api.toggleUserStatus(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveReport = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await api.resolveAdminReport(id, status);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateAdminConfig(config);
      setConfig(updated);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 pb-24 text-white max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Admin Portal
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                Staff Only
              </span>
            </h2>
            <p className="text-xs text-slate-400">System metrics, users & abuse control</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Supabase Database Connection Strip */}
      <div 
        onClick={() => setShowSupabaseModal(true)}
        className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 hover:border-emerald-500/60 transition cursor-pointer flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Supabase Cloud Database</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-emerald-300 font-mono">gtrifaxowpezwbjgrvuo • Live Connected</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
          Manage ↗
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        {[
          { key: 'stats', label: 'Metrics' },
          { key: 'users', label: 'Users' },
          { key: 'reports', label: `Reports (${reports.length})` },
          { key: 'config', label: 'Pricing' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              tab === t.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STATS */}
      {tab === 'stats' && stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
              <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Registered accounts</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Subs</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats.activeSubscriptions}</div>
              <span className="text-[10px] text-slate-500">₹99/mo subscribers</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Requests</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">{stats.totalRequests}</div>
              <span className="text-[10px] text-slate-400">{stats.resolvedRequests} unblocked & resolved</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Plate Searches</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{stats.searchesCount}</div>
              <span className="text-[10px] text-slate-500">ANPR / OCR lookups</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Operational Status</h4>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Pending Requests</span>
              <span className="font-bold text-amber-400">{stats.pendingRequests} in progress</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
              <span className="text-slate-400">Abuse Reports</span>
              <span className="font-bold text-rose-400">{stats.abuseReportsCount} flagged</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400">Telephony Relay</span>
              <span className="font-bold text-emerald-400">Active (Masked Mode)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {users.length} registered vehicles</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Lock className="w-3 h-3" /> Phone numbers masked
            </span>
          </div>

          <div className="space-y-2.5">
            {users.map(u => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{u.full_name}</span>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{u.vehicle_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {u.number_plate} • {u.vehicle_type} • {u.masked_phone}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Sub: {u.subscription_status}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        u.account_status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {u.account_status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleUser(u.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    u.account_status === 'ACTIVE'
                      ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                  }`}
                >
                  {u.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No active abuse reports</p>
              <p className="text-xs text-slate-500 mt-1">
                The community is safe and unblock requests are running smoothly.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      {rep.reason.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        rep.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Reported Vehicle: <span className="font-mono font-bold text-white">{rep.reported_vehicle_id}</span>
                  </p>
                  {rep.details && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-xl">
                      "{rep.details}"
                    </p>
                  )}

                  {rep.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
                      >
                        Take Action & Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRICING & CONFIG */}
      {tab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Subscription & Trial Settings</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monthly Subscription Price (₹ INR)
            </label>
            <input
              type="number"
              value={config.monthlyPrice}
              onChange={e => setConfig({ ...config, monthlyPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Free Trial Duration (Days)
            </label>
            <input
              type="number"
              value={config.trialDays}
              onChange={e => setConfig({ ...config, trialDays: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Allow Free Trial</span>
              <span className="text-[10px] text-slate-400">Give new vehicle registrations instant access</span>
            </div>
            <input
              type="checkbox"
              checked={config.allowTrial}
              onChange={e => setConfig({ ...config, allowTrial: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
          >
            {configSaved ? 'Saved Successfully ✓' : 'Save Configuration'}
          </button>
        </form>
      )}

      {/* Supabase Connection Modal */}
      {showSupabaseModal && (
        <SupabaseModal onClose={() => setShowSupabaseModal(false)} />
      )}
    </div>
  );
};
