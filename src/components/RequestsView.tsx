import React, { useState } from 'react';
import {
  Layers,
  Search,
  MessageSquare,
  Phone,
  CheckCircle,
  Clock,
  Check,
  Eye,
  ChevronRight,
  Car,
  CheckCheck
} from 'lucide-react';
import { VehicleContactRequest, RequestStatus } from '../types';

interface RequestsViewProps {
  requests: VehicleContactRequest[];
  onSelectRequest: (req: VehicleContactRequest) => void;
  onMarkResolved: (reqId: string) => Promise<void>;
  onNewScan: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onSelectRequest,
  onMarkResolved,
  onNewScan
}) => {
  const [filter, setFilter] = useState<'Active' | 'Resolved' | 'Sent'>('Active');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    // Filter type
    if (filter === 'Active' && (req.status === 'RESOLVED' || req.status === 'DECLINED')) return false;
    if (filter === 'Resolved' && req.status !== 'RESOLVED') return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        req.target_number_plate.toLowerCase().includes(q) ||
        req.target_owner_name.toLowerCase().includes(q) ||
        req.target_vehicle_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Bike': return '🏍️';
      case 'Car': return '🚗';
      case 'Scooter': return '🛵';
      case 'Auto': return '🛺';
      default: return '🚗';
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> Resolved
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1">
            <Check className="w-3 h-3" /> Moving now
          </span>
        );
      case 'SEEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Seen
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Request Sent
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-24 text-white">
      {/* Top Header (Matching Screen 10) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">My Requests</h2>
          <p className="text-xs text-slate-400">Track all vehicles blocking your path</p>
        </div>

        <button
          onClick={onNewScan}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Filter Tabs (Matching Screen 10) */}
      <div className="flex items-center gap-2">
        {(['Active', 'Resolved', 'Sent'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by plate, name, or vehicle ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition"
        />
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">No {filter.toLowerCase()} requests found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            When you scan blocking vehicle number plates, their progress will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition space-y-3 shadow-md"
            >
              <div
                onClick={() => onSelectRequest(req)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-slate-700/60 flex items-center justify-center text-xl shrink-0">
                    {getVehicleIcon(req.target_vehicle_type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-white tracking-wide truncate">
                        {req.target_number_plate}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-slate-300 font-semibold truncate mt-0.5">
                      {req.target_owner_name} •{' '}
                      <span className="font-mono text-indigo-400">{req.target_vehicle_id}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              </div>

              {/* Message excerpt */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 text-xs text-slate-300 italic border border-slate-850">
                "{req.message}"
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onSelectRequest(req)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Chat
                </button>

                {req.status !== 'RESOLVED' && (
                  <button
                    onClick={() => onMarkResolved(req.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Vehicle Moved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
