export type VehicleType = 
  | 'Bike'
  | 'Scooter'
  | 'Car'
  | 'Auto'
  | 'Van'
  | 'Truck'
  | 'Lorry'
  | 'Bus'
  | 'Other';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TRIAL';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export type RequestStatus = 
  | 'SENT' 
  | 'DELIVERED' 
  | 'SEEN' 
  | 'ACCEPTED' 
  | 'RESOLVED' 
  | 'DECLINED';

export type RequestType = 
  | 'BLOCKED_VEHICLE' 
  | 'URGENT_EXIT' 
  | 'GENERAL_CONTACT' 
  | 'CUSTOM_MESSAGE';

export interface User {
  id: string;
  vehicle_id: string;
  full_name: string;
  phone_number: string;
  vehicle_type: VehicleType;
  number_plate: string;
  normalized_number_plate: string;
  subscription_status: SubscriptionStatus;
  subscription_start: string;
  subscription_expiry: string;
  account_status: AccountStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicVehicleProfile {
  vehicle_id: string;
  owner_name: string;
  vehicle_type: VehicleType;
  masked_number_plate: string;
  masked_phone_number: string;
  is_verified: boolean;
  subscription_status: SubscriptionStatus;
}

export interface StatusTimelineEvent {
  status: RequestStatus;
  timestamp: string;
  note?: string;
}

export interface VehicleContactRequest {
  id: string;
  requester_vehicle_id: string;
  requester_name: string;
  target_vehicle_id: string;
  target_owner_name: string;
  target_number_plate: string;
  target_vehicle_type: VehicleType;
  request_type: RequestType;
  message: string;
  status: RequestStatus;
  status_timeline: StatusTimelineEvent[];
  created_at: string;
  resolved_at?: string;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_vehicle_id: string;
  text: string;
  created_at: string;
  is_preset?: boolean;
}

export interface NotificationItem {
  id: string;
  recipient_vehicle_id: string;
  request_id?: string;
  title: string;
  message: string;
  type: 'MOVEMENT_REQUEST' | 'SUBSCRIPTION' | 'REQUEST_RESOLVED' | 'SYSTEM' | 'ACKNOWLEDGED';
  read_status: boolean;
  created_at: string;
}

export interface AbuseReport {
  id: string;
  reporter_vehicle_id: string;
  reported_vehicle_id: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalVehicles: number;
  totalRequests: number;
  resolvedRequests: number;
  pendingRequests: number;
  searchesCount: number;
  abuseReportsCount: number;
}

export interface AdminConfig {
  monthlyPrice: number;
  trialDays: number;
  allowTrial: boolean;
  maskedCallingEnabled: boolean;
}
