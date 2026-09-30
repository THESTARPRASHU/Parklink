-- ================================================================
-- Supabase Database Schema for ParkLink Vehicle Unblock Platform
-- Project ID: gtrifaxowpezwbjgrvuo
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gtrifaxowpezwbjgrvuo/sql
-- ================================================================

-- 1. USERS & VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  number_plate TEXT NOT NULL,
  normalized_number_plate TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'ACTIVE',
  subscription_plan TEXT DEFAULT 'BASIC',
  subscription_start TIMESTAMPTZ DEFAULT NOW(),
  subscription_expiry TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  account_status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant number plate lookup
CREATE INDEX IF NOT EXISTS idx_users_normalized_plate ON public.users(normalized_number_plate);
CREATE INDEX IF NOT EXISTS idx_users_vehicle_id ON public.users(vehicle_id);

-- 2. VEHICLE CONTACT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_requests (
  id TEXT PRIMARY KEY,
  requester_vehicle_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  target_vehicle_id TEXT NOT NULL,
  target_owner_name TEXT NOT NULL,
  target_number_plate TEXT NOT NULL,
  target_vehicle_type TEXT NOT NULL,
  request_type TEXT DEFAULT 'BLOCKED_VEHICLE',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'SENT',
  status_timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vehicle_requests_target ON public.vehicle_requests(target_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_requester ON public.vehicle_requests(requester_vehicle_id);

-- 3. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  sender_vehicle_id TEXT NOT NULL,
  text TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_request ON public.chat_messages(request_id);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  recipient_vehicle_id TEXT NOT NULL,
  request_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'BLOCK_ALERT',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_vehicle_id);

-- 5. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount NUMERIC DEFAULT 99,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'ACTIVE',
  payment_id TEXT,
  payment_method TEXT DEFAULT 'UPI',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INCIDENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id TEXT PRIMARY KEY,
  reporter_vehicle_id TEXT NOT NULL,
  reported_vehicle_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable public API key access for web app queries
-- ================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Allow anon key full operations for ParkLink app
DROP POLICY IF EXISTS "Anon public access for users" ON public.users;
CREATE POLICY "Anon public access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for vehicle_requests" ON public.vehicle_requests;
CREATE POLICY "Anon public access for vehicle_requests" ON public.vehicle_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for chat_messages" ON public.chat_messages;
CREATE POLICY "Anon public access for chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for notifications" ON public.notifications;
CREATE POLICY "Anon public access for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for subscriptions" ON public.subscriptions;
CREATE POLICY "Anon public access for subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access for incident_reports" ON public.incident_reports;
CREATE POLICY "Anon public access for incident_reports" ON public.incident_reports FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- INITIAL SEED DATA
-- Pre-populates registered vehicles so searches and unblocking work immediately
-- ================================================================

INSERT INTO public.users (id, vehicle_id, full_name, phone_number, vehicle_type, number_plate, normalized_number_plate, subscription_status, subscription_plan)
VALUES
  ('usr_prashanth', 'PK-7A92K4', 'Prashanth', '+91 9876543210', 'Bike', 'KA01AB1234', 'KA01AB1234', 'ACTIVE', 'PREMIUM'),
  ('usr_rahul', 'PK-9M21ZA', 'Rahul Sharma', '+91 9845011223', 'Car', 'KA05CD5678', 'KA05CD5678', 'ACTIVE', 'BASIC'),
  ('usr_suresh', 'PK-3K82PQ', 'Suresh Patel', '+91 9741234567', 'Scooter', 'KA03XY7890', 'KA03XY7890', 'ACTIVE', 'BASIC'),
  ('usr_vikram', 'PK-7Y61ZL', 'Vikram Singh', '+91 9811223344', 'Auto', 'KA02MN4567', 'KA02MN4567', 'ACTIVE', 'BASIC'),
  ('usr_rajesh', 'PK-4X72PL', 'Rajesh Kumar', '+91 9900112233', 'Truck', 'KA04TR1122', 'KA04TR1122', 'ACTIVE', 'BASIC'),
  ('usr_anita', 'PK-8F29KQ', 'Anita Roy', '+91 9888776655', 'Bus', 'KA01BS5555', 'KA01BS5555', 'ACTIVE', 'BASIC')
ON CONFLICT (id) DO NOTHING;
