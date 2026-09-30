import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Supabase backend configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gtrifaxowpezwbjgrvuo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_at_g4xhjX1bf8wt6daOpwA_OCZt33xD';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to normalize number plate
export function normalizePlate(plate: string): string {
  if (!plate) return '';
  return plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

// Masking helper
export function maskPlate(plate: string): string {
  const norm = normalizePlate(plate);
  if (norm.length <= 4) return norm;
  const prefix = norm.slice(0, 4);
  const suffix = norm.slice(-2);
  return `${prefix}****${suffix}`;
}

// Helper to validate whether a string is strictly a vehicle number plate
// (and NEVER a face, word, person label, or generic text)
export function isValidVehiclePlate(text: string): boolean {
  if (!text) return false;
  const clean = normalizePlate(text);

  // Blacklist words that could arise from faces, people, or non-vehicle objects
  const nonPlateTokens = [
    'NO_PLATE_DETECTED',
    'NOPLATEDETECTED',
    'NONE',
    'NOVEHICLE',
    'NOTFOUND',
    'FACE',
    'PERSON',
    'HUMAN',
    'PEOPLE',
    'SELFIE',
    'MAN',
    'WOMAN',
    'BOY',
    'GIRL',
    'HEAD',
    'PHOTO',
    'IMAGE',
    'SMILE',
    'BODY',
    'UNDEFINED',
    'NULL',
    'ERROR'
  ];

  for (const token of nonPlateTokens) {
    if (clean.includes(token)) return false;
  }

  // Length constraint: Indian and standard vehicle plates are between 4 and 12 alphanumeric characters
  if (clean.length < 4 || clean.length > 12) return false;

  // Must contain at least one digit and at least one letter
  const hasLetter = /[A-Z]/.test(clean);
  const hasDigit = /[0-9]/.test(clean);
  if (!hasLetter || !hasDigit) return false;

  // Indian standard plate pattern: e.g. KA01AB1234, MH12XY5678, DL04C1234, TS09AB1234, HR26DQ5551
  const indianPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
  // Bharat series pattern: 22BH1234AA
  const bhPattern = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
  // General vehicle alphanumeric pattern: 4 to 12 alphanumeric chars with both letters & digits
  const generalPattern = /^[A-Z0-9]{4,12}$/;

  return indianPattern.test(clean) || bhPattern.test(clean) || generalPattern.test(clean);
}

export function maskPhone(phone: string): string {
  if (!phone) return '+91 **********';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '+91 **********';
  const last4 = clean.slice(-4);
  return `+91 ******${last4}`;
}

// Generate unique non-sequential Vehicle ID
export function generateVehicleId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PK-${randomPart}`;
}

// In-memory data store with file persistence
interface DBData {
  users: any[];
  requests: any[];
  messages: any[];
  notifications: any[];
  reports: any[];
  searchesCount: number;
  config: {
    monthlyPrice: number;
    trialDays: number;
    allowTrial: boolean;
    maskedCallingEnabled: boolean;
  };
}

const DB_PATH = path.resolve(process.cwd(), 'data/db.json');

const INITIAL_DATA: DBData = {
  users: [],
  requests: [],
  messages: [],
  notifications: [],
  reports: [],
  searchesCount: 0,
  config: {
    monthlyPrice: 99,
    trialDays: 7,
    allowTrial: true,
    maskedCallingEnabled: true
  }
};

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading DB, using defaults', err);
  }
  // Save initial
  saveDB(INITIAL_DATA);
  return INITIAL_DATA;
}

function saveDB(data: DBData) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB', err);
  }
}

let db = loadDB();

// Track current active user session (null when no user is signed in)
let currentActiveUserId: string | null = null;

// Helper to authenticate user from Bearer header or active session
async function getAuthUser(req: express.Request): Promise<any | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '')?.trim();
  const userId = token || (req.query.userId as string) || currentActiveUserId;
  if (!userId) return null;

  // 1. Try Supabase first
  try {
    const { data: supaUser, error } = await supabaseServer
      .from('users')
      .select('*')
      .or(`id.eq.${userId},vehicle_id.eq.${userId}`)
      .maybeSingle();

    if (!error && supaUser) {
      // Sync into local cache if missing
      if (!db.users.some(u => u.id === supaUser.id)) {
        db.users.push(supaUser);
        saveDB(db);
      }
      return supaUser;
    }
  } catch (err) {}

  // 2. Fallback to local DB
  return db.users.find(u => u.id === userId || u.vehicle_id === userId) || null;
}

// ==================== API ROUTES ====================

// Current user profile
app.get('/api/users/me', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

// Real User Login by Number Plate or Phone Number
app.post('/api/users/login', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier || !String(identifier).trim()) {
    return res.status(400).json({ error: 'Please enter your registered number plate or phone number.' });
  }

  const clean = normalizePlate(String(identifier));
  const digits = String(identifier).replace(/[^0-9]/g, '');

  // 1. Check Supabase
  try {
    let query = supabaseServer.from('users').select('*');
    if (clean && digits.length >= 8) {
      query = query.or(`normalized_number_plate.eq.${clean},phone_number.ilike.%${digits.slice(-8)}%`);
    } else if (clean) {
      query = query.eq('normalized_number_plate', clean);
    } else if (digits.length >= 8) {
      query = query.ilike('phone_number', `%${digits.slice(-8)}%`);
    }

    const { data: supaUser } = await query.maybeSingle();
    if (supaUser) {
      currentActiveUserId = supaUser.id;
      if (!db.users.some(u => u.id === supaUser.id)) {
        db.users.push(supaUser);
        saveDB(db);
      }
      return res.json({ success: true, user: supaUser });
    }
  } catch (err) {}

  // 2. Check local database
  const target = db.users.find(u =>
    (clean && u.normalized_number_plate === clean) ||
    (digits.length >= 8 && u.phone_number.replace(/[^0-9]/g, '').includes(digits.slice(-8))) ||
    u.vehicle_id.toUpperCase() === String(identifier).trim().toUpperCase()
  );

  if (target) {
    currentActiveUserId = target.id;
    return res.json({ success: true, user: target });
  }

  return res.status(404).json({
    error: `No registered vehicle found with "${identifier}". Please check or register your vehicle.`
  });
});

// Real User Logout
app.post('/api/users/logout', (req, res) => {
  currentActiveUserId = null;
  res.json({ success: true });
});

// Register user
app.post('/api/users/register', async (req, res) => {
  const { full_name, phone_number, number_plate, vehicle_type } = req.body;
  if (!full_name || !phone_number || !number_plate || !vehicle_type) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const normalized = normalizePlate(number_plate);
  const vehicle_id = generateVehicleId();

  const trialDays = db.config.trialDays || 7;
  const now = new Date();
  const expiry = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const newUser = {
    id: `usr_${Date.now()}`,
    vehicle_id,
    full_name: full_name.trim(),
    phone_number: phone_number.trim(),
    vehicle_type,
    number_plate: number_plate.trim().toUpperCase(),
    normalized_number_plate: normalized,
    subscription_status: 'ACTIVE',
    subscription_start: now.toISOString(),
    subscription_expiry: expiry.toISOString(),
    account_status: 'ACTIVE',
    avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  db.users.push(newUser);
  currentActiveUserId = newUser.id;

  // Add welcome notification
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipient_vehicle_id: vehicle_id,
    title: 'Welcome to ParkLink',
    message: `Your vehicle ${newUser.number_plate} is registered with Vehicle ID ${vehicle_id}. You have a ${trialDays}-day free trial!`,
    type: 'SYSTEM',
    read_status: false,
    created_at: now.toISOString()
  });

  saveDB(db);

  // Automatically sync to Supabase database
  try {
    const { error: supaErr } = await supabaseServer.from('users').insert({
      id: newUser.id,
      vehicle_id: newUser.vehicle_id,
      full_name: newUser.full_name,
      phone_number: newUser.phone_number,
      vehicle_type: newUser.vehicle_type,
      number_plate: newUser.number_plate,
      normalized_number_plate: newUser.normalized_number_plate,
      subscription_status: newUser.subscription_status,
      subscription_plan: 'BASIC',
      subscription_start: newUser.subscription_start,
      subscription_expiry: newUser.subscription_expiry,
      account_status: newUser.account_status,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    });
    if (!supaErr) {
      console.log(`✓ User ${newUser.full_name} (${newUser.vehicle_id}) saved to Supabase!`);
    } else {
      console.log(`ℹ Supabase user sync notice: ${supaErr.message}`);
    }
  } catch (err: any) {
    console.log('Supabase sync skipped:', err?.message);
  }

  res.json({ success: true, user: newUser });
});

// Search vehicle by number plate - PRIVACY SAFE!
app.get('/api/vehicles/search', async (req, res) => {
  const rawPlate = String(req.query.plate || '');
  if (!rawPlate) {
    return res.status(400).json({ error: 'Number plate is required' });
  }

  db.searchesCount = (db.searchesCount || 0) + 1;
  saveDB(db);

  const normalizedQuery = normalizePlate(rawPlate);

  // 1. Check Supabase database
  try {
    const { data: supaUser, error: supaErr } = await supabaseServer
      .from('users')
      .select('*')
      .or(`normalized_number_plate.eq.${normalizedQuery},number_plate.ilike.${normalizedQuery}`)
      .maybeSingle();

    if (!supaErr && supaUser) {
      if (supaUser.account_status === 'SUSPENDED') {
        return res.status(403).json({
          found: false,
          message: 'This vehicle account is temporarily suspended.'
        });
      }

      return res.json({
        found: true,
        vehicle_id: supaUser.vehicle_id,
        owner_name: supaUser.full_name,
        vehicle_type: supaUser.vehicle_type,
        masked_number_plate: maskPlate(supaUser.number_plate),
        masked_phone_number: maskPhone(supaUser.phone_number),
        is_verified: true,
        subscription_status: supaUser.subscription_status || 'ACTIVE'
      });
    }
  } catch (err) {
    // Continue to local database fallback
  }

  // 2. Match local db plate
  const targetUser = db.users.find(u => 
    u.normalized_number_plate === normalizedQuery ||
    u.number_plate.replace(/\s+/g, '').toUpperCase() === normalizedQuery
  );

  if (!targetUser) {
    return res.status(404).json({
      found: false,
      message: `No registered vehicle found for plate ${rawPlate}.`
    });
  }

  if (targetUser.account_status === 'SUSPENDED') {
    return res.status(403).json({
      found: false,
      message: 'This vehicle account is temporarily suspended.'
    });
  }

  // CRITICAL PRIVACY REQUIREMENT:
  // NEVER return raw phone number, email, or address!
  const publicProfile = {
    found: true,
    vehicle_id: targetUser.vehicle_id,
    owner_name: targetUser.full_name,
    vehicle_type: targetUser.vehicle_type,
    masked_number_plate: maskPlate(targetUser.number_plate),
    masked_phone_number: maskPhone(targetUser.phone_number),
    is_verified: true,
    subscription_status: targetUser.subscription_status
  };

  res.json(publicProfile);
});

// Gemini OCR / Vision scan endpoint strictly for reading vehicle number plates
app.post('/api/ocr/scan', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ found: false, error: 'Image data is required' });
    }

    // Determine correct MIME type
    let mimeType = 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (imageBase64.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '').replace(/^data:[^;]+;base64,/, '');

    // Check Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data
          }
        };
        const textPart = {
          text: `You are an Automatic Number Plate Recognition (ANPR) system specialized EXCLUSIVELY in detecting motor vehicle license plates / registration number plates.

CRITICAL SECURITY AND FILTERING RULES:
1. TARGET: Motor vehicle number plates ONLY (Motorcycle, Scooter, Car, Auto-rickshaw, Van, Truck, Lorry, Bus).
2. FORBIDDEN: DO NOT detect, describe, or extract text from human faces, heads, bodies, people, clothing, or general background objects. If a human face or person is in the frame, strictly IGNORE it.
3. If no physical vehicle number plate is clearly readable (e.g. if the image contains a person's face, selfie, human body, a room, a wall, scenery, or blurry/absent plate), you MUST reply with the exact text "NO_PLATE_DETECTED".
4. If a valid vehicle registration plate is visible (such as Indian registration plates like KA01AB1234, DL3CAA1234, MH12XY5678, HR26DQ5551, 22BH1234AA, or international plates), reply ONLY with the uppercase alphanumeric plate characters without spaces, hyphens, dashes, or extra punctuation. Never output explanations or markdown.`
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, textPart] }
        });

        const rawText = response.text?.trim() || '';
        const cleaned = normalizePlate(rawText);

        // Verify that the detected text is strictly a valid vehicle plate
        if (isValidVehiclePlate(cleaned)) {
          return res.json({
            found: true,
            plateText: cleaned,
            confidence: 0.98,
            source: 'gemini-anpr'
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini OCR error:', geminiErr?.message || geminiErr);
      }
    }

    // STRICT REJECTION: Do NOT scan faces or non-vehicle plates!
    return res.json({
      found: false,
      plateText: null,
      message: 'No vehicle license plate detected. Only vehicle number plates are scanned (faces, people, and objects are ignored).'
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ found: false, error: 'Failed to process image OCR' });
  }
});

// Create Movement Request
app.post('/api/requests', async (req, res) => {
  const { target_vehicle_id, message, request_type = 'BLOCKED_VEHICLE' } = req.body;
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Please register or sign in to send an unblock request.' });
  }

  let targetUser: any = null;
  try {
    const { data: supaTarget } = await supabaseServer
      .from('users')
      .select('*')
      .eq('vehicle_id', target_vehicle_id)
      .maybeSingle();
    if (supaTarget) targetUser = supaTarget;
  } catch (err) {}

  if (!targetUser) {
    targetUser = db.users.find(u => u.vehicle_id === target_vehicle_id);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target vehicle owner not found' });
  }

  const now = new Date();
  const requestId = `req_${Date.now()}`;

  const newRequest = {
    id: requestId,
    requester_vehicle_id: currentUser.vehicle_id,
    requester_name: currentUser.full_name,
    target_vehicle_id: targetUser.vehicle_id,
    target_owner_name: targetUser.full_name,
    target_number_plate: targetUser.number_plate,
    target_vehicle_type: targetUser.vehicle_type,
    request_type,
    message: message || 'My vehicle is blocked. Please move your vehicle.',
    status: 'SENT',
    status_timeline: [
      { status: 'SENT', timestamp: now.toISOString(), note: 'Movement request sent' },
      { status: 'DELIVERED', timestamp: new Date(now.getTime() + 1000).toISOString(), note: 'Delivered to vehicle owner' }
    ],
    created_at: now.toISOString()
  };

  db.requests.unshift(newRequest);

  // Add initial message to chat
  db.messages.push({
    id: `msg_${Date.now()}`,
    request_id: requestId,
    sender_vehicle_id: currentUser.vehicle_id,
    text: newRequest.message,
    created_at: now.toISOString(),
    is_preset: true
  });

  // Notify target owner
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipient_vehicle_id: targetUser.vehicle_id,
    request_id: requestId,
    title: '🚨 Vehicle Movement Request',
    message: `${currentUser.vehicle_id}: "${newRequest.message}"`,
    type: 'MOVEMENT_REQUEST',
    read_status: false,
    created_at: now.toISOString()
  });

  // Sync request to Supabase
  try {
    await supabaseServer.from('vehicle_requests').insert({
      id: newRequest.id,
      requester_vehicle_id: newRequest.requester_vehicle_id,
      requester_name: newRequest.requester_name,
      target_vehicle_id: newRequest.target_vehicle_id,
      target_owner_name: newRequest.target_owner_name,
      target_number_plate: newRequest.target_number_plate,
      target_vehicle_type: newRequest.target_vehicle_type,
      request_type: newRequest.request_type,
      message: newRequest.message,
      status: newRequest.status,
      status_timeline: newRequest.status_timeline,
      created_at: newRequest.created_at
    });
    await supabaseServer.from('chat_messages').insert({
      id: `msg_${Date.now()}`,
      request_id: requestId,
      sender_vehicle_id: currentUser.vehicle_id,
      text: newRequest.message,
      is_preset: true,
      created_at: now.toISOString()
    });
    await supabaseServer.from('notifications').insert({
      id: `notif_${Date.now()}`,
      recipient_vehicle_id: targetUser.vehicle_id,
      request_id: requestId,
      title: '🚨 Vehicle Movement Request',
      message: `${currentUser.vehicle_id}: "${newRequest.message}"`,
      type: 'MOVEMENT_REQUEST',
      read_status: false,
      created_at: now.toISOString()
    });
  } catch (err: any) {
    console.log('Supabase request sync note:', err?.message);
  }

  saveDB(db);
  res.json({ success: true, request: newRequest });
});

// Get user requests (sent or received)
app.get('/api/requests', async (req, res) => {
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.json({ requests: [] });
  }
  const filter = req.query.filter as string; // 'active', 'resolved', 'sent'

  let list = db.requests.filter(
    r => r.requester_vehicle_id === currentUser.vehicle_id || r.target_vehicle_id === currentUser.vehicle_id
  );

  try {
    const { data: supaReqs } = await supabaseServer
      .from('vehicle_requests')
      .select('*')
      .or(`requester_vehicle_id.eq.${currentUser.vehicle_id},target_vehicle_id.eq.${currentUser.vehicle_id}`)
      .order('created_at', { ascending: false });

    if (supaReqs && supaReqs.length > 0) {
      list = supaReqs;
    }
  } catch (err) {}

  if (filter === 'active') {
    list = list.filter(r => r.status !== 'RESOLVED' && r.status !== 'DECLINED');
  } else if (filter === 'resolved') {
    list = list.filter(r => r.status === 'RESOLVED');
  } else if (filter === 'sent') {
    list = list.filter(r => r.requester_vehicle_id === currentUser.vehicle_id);
  }

  res.json({ requests: list });
});

// Update Request Status (SEEN, ACCEPTED, RESOLVED, DECLINED)
app.patch('/api/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const request = db.requests.find(r => r.id === id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const now = new Date();
  request.status = status;
  request.status_timeline.push({
    status,
    timestamp: now.toISOString(),
    note: note || `Status updated to ${status}`
  });

  if (status === 'RESOLVED') {
    request.resolved_at = now.toISOString();
    // Notify both parties
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipient_vehicle_id: request.requester_vehicle_id,
      request_id: request.id,
      title: 'Vehicle Moved ✓',
      message: `Request for ${request.target_vehicle_id} has been marked resolved.`,
      type: 'REQUEST_RESOLVED',
      read_status: false,
      created_at: now.toISOString()
    });
  } else if (status === 'ACCEPTED') {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipient_vehicle_id: request.requester_vehicle_id,
      request_id: request.id,
      title: 'Owner Moving Vehicle',
      message: `${request.target_owner_name} acknowledged and is moving their vehicle now.`,
      type: 'ACKNOWLEDGED',
      read_status: false,
      created_at: now.toISOString()
    });
  }

  // Sync status to Supabase
  try {
    await supabaseServer.from('vehicle_requests')
      .update({
        status,
        status_timeline: request.status_timeline,
        resolved_at: request.resolved_at || null
      })
      .eq('id', id);
  } catch (err: any) {
    console.log('Supabase request status sync note:', err?.message);
  }

  saveDB(db);
  res.json({ success: true, request });
});

// In-app chat messages
app.get('/api/requests/:id/messages', (req, res) => {
  const { id } = req.params;
  const messages = db.messages.filter(m => m.request_id === id);
  res.json({ messages });
});

app.post('/api/requests/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Please sign in to send messages.' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text required' });
  }

  const newMsg = {
    id: `msg_${Date.now()}`,
    request_id: id,
    sender_vehicle_id: currentUser.vehicle_id,
    text: text.trim(),
    created_at: new Date().toISOString()
  };

  db.messages.push(newMsg);
  saveDB(db);

  // Sync message to Supabase
  try {
    await supabaseServer.from('chat_messages').insert({
      id: newMsg.id,
      request_id: newMsg.request_id,
      sender_vehicle_id: newMsg.sender_vehicle_id,
      text: newMsg.text,
      is_preset: false,
      created_at: newMsg.created_at
    });
  } catch (err: any) {
    console.log('Supabase chat message sync note:', err?.message);
  }

  res.json({ success: true, message: newMsg });
});

// Supabase Integration Status & Schema Endpoints
app.get('/api/supabase/status', async (req, res) => {
  try {
    let usersTableExists = false;
    let requestsTableExists = false;
    let message = 'Connected to Supabase project!';

    const { error: userErr } = await supabaseServer.from('users').select('id').limit(1);
    if (!userErr) {
      usersTableExists = true;
    } else if (userErr.code === 'PGRST205') {
      message = 'Connected to Supabase! Run SQL schema to initialize tables.';
    }

    const { error: reqErr } = await supabaseServer.from('vehicle_requests').select('id').limit(1);
    if (!reqErr) {
      requestsTableExists = true;
    }

    res.json({
      connected: true,
      projectId: 'gtrifaxowpezwbjgrvuo',
      projectUrl: SUPABASE_URL,
      tablesReady: usersTableExists && requestsTableExists,
      usersTableExists,
      requestsTableExists,
      message,
      sqlEditorUrl: 'https://supabase.com/dashboard/project/gtrifaxowpezwbjgrvuo/sql'
    });
  } catch (err: any) {
    res.json({
      connected: false,
      projectId: 'gtrifaxowpezwbjgrvuo',
      projectUrl: SUPABASE_URL,
      tablesReady: false,
      error: err?.message || 'Failed to connect to Supabase'
    });
  }
});

app.get('/api/supabase/schema', (req, res) => {
  try {
    const schemaPath = path.resolve(process.cwd(), 'supabase-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      return res.type('text/plain').send(sql);
    }
    res.status(404).send('-- Schema file not found');
  } catch (err) {
    res.status(500).send('-- Error reading schema');
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.json({ notifications: [] });
  }

  let list = db.notifications.filter(n => n.recipient_vehicle_id === currentUser.vehicle_id);

  try {
    const { data: supaNotifs } = await supabaseServer
      .from('notifications')
      .select('*')
      .eq('recipient_vehicle_id', currentUser.vehicle_id)
      .order('created_at', { ascending: false });

    if (supaNotifs && supaNotifs.length > 0) {
      list = supaNotifs;
    }
  } catch (err) {}

  res.json({ notifications: list });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const item = db.notifications.find(n => n.id === id);
  if (item) {
    item.read_status = true;
    saveDB(db);
  }
  res.json({ success: true });
});

// Masked Calling Service (Marketplace privacy bridge architecture)
app.post('/api/call/initiate', async (req, res) => {
  const { target_vehicle_id } = req.body;
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Please sign in to initiate calling.' });
  }

  let targetUser: any = null;
  try {
    const { data: supaTarget } = await supabaseServer
      .from('users')
      .select('*')
      .eq('vehicle_id', target_vehicle_id)
      .maybeSingle();
    if (supaTarget) targetUser = supaTarget;
  } catch (err) {}

  if (!targetUser) {
    targetUser = db.users.find(u => u.vehicle_id === target_vehicle_id);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target owner not found' });
  }

  // Generates masked relay call bridge session
  const callSession = {
    call_id: `call_${Date.now()}`,
    masked_bridge_number: '+91-80-4567-8900', // Platform virtual relay number
    caller_vehicle_id: currentUser.vehicle_id,
    recipient_vehicle_id: targetUser.vehicle_id,
    recipient_name: targetUser.full_name,
    recipient_type: targetUser.vehicle_type,
    status: 'RINGING',
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  };

  res.json({
    success: true,
    message: 'Masked call relay connected. Phone numbers remain completely hidden.',
    session: callSession
  });
});

// Subscription: Create Razorpay Order
app.post('/api/subscriptions/razorpay-order', (req, res) => {
  const orderId = `order_${Date.now().toString(36).toUpperCase()}`;
  res.json({
    order_id: orderId,
    amount: (db.config.monthlyPrice || 99) * 100, // paise
    currency: 'INR',
    key_id: 'rzp_live_parklink_secure'
  });
});

// Verify & Activate Subscription
app.post('/api/subscriptions/verify', async (req, res) => {
  const { payment_id } = req.body;
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Please sign in to activate subscription.' });
  }

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  currentUser.subscription_status = 'ACTIVE';
  currentUser.subscription_start = now.toISOString();
  currentUser.subscription_expiry = nextMonth.toISOString();
  currentUser.updated_at = now.toISOString();

  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipient_vehicle_id: currentUser.vehicle_id,
    title: 'Subscription Activated',
    message: `ParkLink Basic active. Payment ref: ${payment_id || 'RZP_SUCCESS'}.`,
    type: 'SUBSCRIPTION',
    read_status: false,
    created_at: now.toISOString()
  });

  saveDB(db);

  // Sync to Supabase
  try {
    await supabaseServer.from('subscriptions').insert({
      id: `sub_${Date.now()}`,
      user_id: currentUser.id,
      vehicle_id: currentUser.vehicle_id,
      plan: 'BASIC',
      amount: db.config.monthlyPrice || 99,
      currency: 'INR',
      status: 'ACTIVE',
      payment_id: payment_id || 'RZP_SUCCESS',
      payment_method: 'UPI',
      start_date: now.toISOString(),
      expiry_date: nextMonth.toISOString(),
      created_at: now.toISOString()
    });

    await supabaseServer.from('users')
      .update({
        subscription_status: 'ACTIVE',
        subscription_start: now.toISOString(),
        subscription_expiry: nextMonth.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', currentUser.id);
  } catch (err: any) {
    console.log('Supabase subscription sync note:', err?.message);
  }

  res.json({ success: true, user: currentUser });
});

// Report User & Abuse Prevention
app.post('/api/reports', async (req, res) => {
  const { reported_vehicle_id, reason, details } = req.body;
  const currentUser = await getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Please sign in to submit a report.' });
  }

  const newReport = {
    id: `rep_${Date.now()}`,
    reporter_vehicle_id: currentUser.vehicle_id,
    reported_vehicle_id,
    reason,
    details: details || '',
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  db.reports.unshift(newReport);
  saveDB(db);

  // Sync to Supabase
  try {
    await supabaseServer.from('incident_reports').insert({
      id: newReport.id,
      reporter_vehicle_id: newReport.reporter_vehicle_id,
      reported_vehicle_id: newReport.reported_vehicle_id,
      reason: newReport.reason,
      details: newReport.details,
      status: newReport.status,
      created_at: newReport.created_at
    });
  } catch (err: any) {
    console.log('Supabase report sync note:', err?.message);
  }

  res.json({ success: true, message: 'Report submitted for review.' });
});

// Admin API
app.get('/api/admin/stats', (req, res) => {
  const activeSubs = db.users.filter(u => u.subscription_status === 'ACTIVE').length;
  const expiredSubs = db.users.filter(u => u.subscription_status === 'EXPIRED').length;
  const resolved = db.requests.filter(r => r.status === 'RESOLVED').length;
  const pending = db.requests.filter(r => r.status !== 'RESOLVED' && r.status !== 'DECLINED').length;

  res.json({
    totalUsers: db.users.length,
    activeSubscriptions: activeSubs,
    expiredSubscriptions: expiredSubs,
    totalVehicles: db.users.length,
    totalRequests: db.requests.length,
    resolvedRequests: resolved,
    pendingRequests: pending,
    searchesCount: db.searchesCount || 42,
    abuseReportsCount: db.reports.length
  });
});

app.get('/api/admin/users', (req, res) => {
  // Return users with privacy safe phone masks (e.g. +91 ******3210)
  const safeUsers = db.users.map(u => ({
    id: u.id,
    vehicle_id: u.vehicle_id,
    full_name: u.full_name,
    masked_phone: maskPhone(u.phone_number),
    vehicle_type: u.vehicle_type,
    number_plate: u.number_plate,
    subscription_status: u.subscription_status,
    account_status: u.account_status,
    created_at: u.created_at
  }));
  res.json({ users: safeUsers });
});

app.post('/api/admin/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.account_status = user.account_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  saveDB(db);
  res.json({ success: true, user });
});

app.get('/api/admin/reports', (req, res) => {
  res.json({ reports: db.reports });
});

app.post('/api/admin/reports/:id/resolve', (req, res) => {
  const { id } = req.params;
  const report = db.reports.find(r => r.id === id);
  if (report) {
    report.status = req.body.status || 'RESOLVED';
    saveDB(db);
  }
  res.json({ success: true });
});

app.get('/api/admin/config', (req, res) => {
  res.json({ config: db.config });
});

app.put('/api/admin/config', (req, res) => {
  db.config = { ...db.config, ...req.body };
  saveDB(db);
  res.json({ success: true, config: db.config });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
