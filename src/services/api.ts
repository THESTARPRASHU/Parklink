import {
  User,
  PublicVehicleProfile,
  VehicleContactRequest,
  ChatMessage,
  NotificationItem,
  AdminStats,
  AdminConfig,
  AbuseReport,
  VehicleType,
  RequestStatus,
  RequestType
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const userId = localStorage.getItem('parklink_user_id');
  return userId ? { 'Authorization': `Bearer ${userId}` } : {};
}

export const api = {
  // Current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  // Register
  async register(params: {
    full_name: string;
    phone_number: string;
    number_plate: string;
    vehicle_type: VehicleType;
  }): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    if (data.user?.id) {
      localStorage.setItem('parklink_user_id', data.user.id);
    }
    return data;
  },

  // Sign in with vehicle number plate or phone number
  async login(identifier: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'No registered vehicle found');
    }
    const data = await res.json();
    if (data.user?.id) {
      localStorage.setItem('parklink_user_id', data.user.id);
    }
    return data;
  },

  // Sign out
  async logout(): Promise<void> {
    localStorage.removeItem('parklink_user_id');
    localStorage.removeItem('parklink_onboarded');
    try {
      await fetch(`${API_BASE}/users/logout`, { method: 'POST' });
    } catch {}
  },

  // Search vehicle plate
  async searchPlate(plate: string): Promise<PublicVehicleProfile> {
    const res = await fetch(`${API_BASE}/vehicles/search?plate=${encodeURIComponent(plate)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Vehicle not found');
    }
    return res.json();
  },

  // OCR Scan using Gemini
  async scanPlateOCR(imageBase64: string): Promise<{ found: boolean; plateText: string | null; confidence?: number; message?: string; source?: string }> {
    const res = await fetch(`${API_BASE}/ocr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'OCR recognition failed');
    }
    return res.json();
  },

  // Movement requests
  async getRequests(filter?: 'active' | 'resolved' | 'sent'): Promise<VehicleContactRequest[]> {
    const url = filter ? `${API_BASE}/requests?filter=${filter}` : `${API_BASE}/requests`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch requests');
    const data = await res.json();
    return data.requests;
  },

  async createRequest(params: {
    target_vehicle_id: string;
    message: string;
    request_type?: RequestType;
  }): Promise<VehicleContactRequest> {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send request');
    }
    const data = await res.json();
    return data.request;
  },

  async updateRequestStatus(id: string, status: RequestStatus, note?: string): Promise<VehicleContactRequest> {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error('Failed to update status');
    const data = await res.json();
    return data.request;
  },

  // In-app chat
  async getMessages(requestId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/requests/${requestId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.messages;
  },

  async sendMessage(requestId: string, text: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/requests/${requestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to send message');
    const data = await res.json();
    return data.message;
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return data.notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
  },

  // Masked Relay Calling
  async initiateCall(target_vehicle_id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/call/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_vehicle_id })
    });
    if (!res.ok) throw new Error('Failed to initiate privacy call');
    return res.json();
  },

  // Subscription & Razorpay
  async createRazorpayOrder(): Promise<{ order_id: string; amount: number; currency: string; key_id: string }> {
    const res = await fetch(`${API_BASE}/subscriptions/razorpay-order`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async verifySubscription(payment_id: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/subscriptions/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id })
    });
    if (!res.ok) throw new Error('Subscription verification failed');
    return res.json();
  },

  // Report user
  async reportUser(reported_vehicle_id: string, reason: string, details?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reported_vehicle_id, reason, details })
    });
    if (!res.ok) throw new Error('Failed to submit report');
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getAdminUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.users;
  },

  async toggleUserStatus(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-status`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to update user status');
  },

  async getAdminReports(): Promise<AbuseReport[]> {
    const res = await fetch(`${API_BASE}/admin/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    const data = await res.json();
    return data.reports;
  },

  async resolveAdminReport(id: string, status: 'RESOLVED' | 'DISMISSED'): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/reports/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to resolve report');
  },

  async getAdminConfig(): Promise<AdminConfig> {
    const res = await fetch(`${API_BASE}/admin/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    const data = await res.json();
    return data.config;
  },

  async updateAdminConfig(config: Partial<AdminConfig>): Promise<AdminConfig> {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update config');
    const data = await res.json();
    return data.config;
  },

  // Supabase Backend Integration
  async getSupabaseStatus(): Promise<{
    connected: boolean;
    projectId: string;
    projectUrl: string;
    tablesReady: boolean;
    usersTableExists: boolean;
    requestsTableExists: boolean;
    message: string;
    sqlEditorUrl: string;
  }> {
    const res = await fetch(`${API_BASE}/supabase/status`);
    if (!res.ok) throw new Error('Failed to fetch Supabase status');
    return res.json();
  },

  async getSupabaseSchema(): Promise<string> {
    const res = await fetch(`${API_BASE}/supabase/schema`);
    if (!res.ok) throw new Error('Failed to fetch schema');
    return res.text();
  }
};
