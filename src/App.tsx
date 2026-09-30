import React, { useState, useEffect } from 'react';
import {
  User,
  PublicVehicleProfile,
  VehicleContactRequest,
  ChatMessage,
  NotificationItem
} from './types';
import { api } from './services/api';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { Onboarding } from './components/Onboarding';
import { Registration } from './components/Registration';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { Dashboard } from './components/Dashboard';
import { PlateScanner } from './components/PlateScanner';
import { VehicleFoundModal } from './components/VehicleFoundModal';
import { MessageOwnerModal } from './components/MessageOwnerModal';
import { CallScreenModal } from './components/CallScreenModal';
import { OwnerNotificationModal } from './components/OwnerNotificationModal';
import { RequestsView } from './components/RequestsView';
import { NotificationsView } from './components/NotificationsView';
import { SubscriptionView } from './components/SubscriptionView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportUserModal } from './components/ReportUserModal';
import { SignInModal } from './components/SignInModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff, AlertTriangle } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();

  // App flow states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('parklink_onboarded') === 'true';
  });
  const [registrationMode, setRegistrationMode] = useState<boolean>(false);
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
  const [newlyRegisteredUser, setNewlyRegisteredUser] = useState<User | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Data states
  const [activeRequests, setActiveRequests] = useState<VehicleContactRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modal flow states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [foundProfile, setFoundProfile] = useState<PublicVehicleProfile | null>(null);
  const [activeChatRequest, setActiveChatRequest] = useState<VehicleContactRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingNotificationReq, setIncomingNotificationReq] = useState<VehicleContactRequest | null>(null);
  const [reportingVehicleId, setReportingVehicleId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Initial data fetch
  const refreshAppData = async () => {
    try {
      const [user, reqs, notifs] = await Promise.all([
        api.getCurrentUser(),
        api.getRequests('active'),
        api.getNotifications()
      ]);
      setCurrentUser(user);
      setActiveRequests(reqs);
      setNotifications(notifs);
    } catch (e: any) {
      console.warn('Initial data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3500);
  };

  // Onboarding -> Registration
  const handleGetStarted = () => {
    setRegistrationMode(true);
  };

  // Complete Registration
  const handleRegistrationSubmit = async (data: {
    full_name: string;
    phone_number: string;
    number_plate: string;
    vehicle_type: any;
    avatar_url?: string;
    email?: string;
  }) => {
    const res = await api.register(data);
    setCurrentUser(res.user);
    setNewlyRegisteredUser(res.user);
    setRegistrationMode(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem('parklink_onboarded', 'true');
    await refreshAppData();
  };

  // Post-registration continue
  const handleRegistrationContinue = () => {
    setNewlyRegisteredUser(null);
    setActiveTab('home');
  };

  // Plate scanning handler
  const handlePlateDetected = async (rawPlate: string) => {
    setIsScannerOpen(false);
    try {
      const profile = await api.searchPlate(rawPlate);
      setFoundProfile(profile);
    } catch (err: any) {
      showToast(err.message || 'No registered owner found for this plate.');
    }
  };

  // Message owner from search result
  const handleMessageFoundOwner = async () => {
    if (!foundProfile || !currentUser) return;

    try {
      // Create request if not already present
      const req = await api.createRequest({
        target_vehicle_id: foundProfile.vehicle_id,
        message: 'My vehicle is blocked. Please move your vehicle.'
      });

      const msgs = await api.getMessages(req.id);
      setActiveChatRequest(req);
      setChatMessages(msgs);
      setFoundProfile(null);
      await refreshAppData();
    } catch (err: any) {
      showToast(err.message || 'Failed to start communication');
    }
  };

  // Call owner via privacy relay
  const handleCallOwner = async () => {
    if (!foundProfile) return;
    try {
      await api.initiateCall(foundProfile.vehicle_id);
      setIsCalling(true);
    } catch (err: any) {
      showToast(err.message || 'Unable to connect privacy call');
    }
  };

  // Send in-app chat message
  const handleSendMessage = async (text: string) => {
    if (!activeChatRequest) return;
    const newMsg = await api.sendMessage(activeChatRequest.id, text);
    setChatMessages(prev => [...prev, newMsg]);
  };

  // Mark request resolved
  const handleMarkResolved = async (reqId: string) => {
    await api.updateRequestStatus(reqId, 'RESOLVED', 'Vehicle unblocked and moved');
    await refreshAppData();
    showToast('Movement request resolved. Vehicle unblocked! ✓');
  };

  // Subscription verification
  const handleSubscribeSuccess = async (paymentId: string) => {
    const res = await api.verifySubscription(paymentId);
    setCurrentUser(res.user);
    await refreshAppData();
    showToast('Subscription active! Unlimited searches & calls enabled. ✓');
  };

  // Profile update
  const handleUpdateProfile = async (updated: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
      showToast('Profile updated successfully ✓');
    }
  };

  // Real user sign out
  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveRequests([]);
    setNotifications([]);
    setHasCompletedOnboarding(false);
    setIsSettingsOpen(false);
    setIsAdminOpen(false);
    showToast('Signed out successfully.');
  };

  // Owner responds to movement request
  const handleOwnerRespondMoving = async () => {
    if (!incomingNotificationReq) return;
    await api.updateRequestStatus(incomingNotificationReq.id, 'ACCEPTED', 'Owner acknowledged and is moving vehicle');
    setIncomingNotificationReq(null);
    await refreshAppData();
    showToast('Movement acknowledged! Requester has been notified.');
  };

  const handleOwnerRespondFiveMinutes = async () => {
    if (!incomingNotificationReq) return;
    await api.updateRequestStatus(incomingNotificationReq.id, 'ACCEPTED', 'Owner will move vehicle in 5 minutes');
    setIncomingNotificationReq(null);
    await refreshAppData();
    showToast('Acknowledged! Requester informed: Moving in 5 minutes.');
  };

  // Loading state
  if (loading && !currentUser && localStorage.getItem('parklink_user_id')) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl shadow-xl shadow-indigo-600/30 mb-3 animate-bounce">
          P
        </div>
        <p className="text-sm font-bold text-slate-300">Loading ParkLink...</p>
      </div>
    );
  }

  // 1. Onboarding / Sign In Flow (Screen 1)
  if (!currentUser && !registrationMode && !newlyRegisteredUser) {
    return (
      <>
        <Onboarding
          onGetStarted={handleGetStarted}
          onSignIn={() => setIsSignInOpen(true)}
        />
        {isSignInOpen && (
          <SignInModal
            onClose={() => setIsSignInOpen(false)}
            onSuccess={async (user) => {
              setCurrentUser(user);
              setIsSignInOpen(false);
              setHasCompletedOnboarding(true);
              localStorage.setItem('parklink_onboarded', 'true');
              await refreshAppData();
              showToast(`Welcome back, ${user.full_name}!`);
            }}
            onSwitchToRegister={() => {
              setIsSignInOpen(false);
              setRegistrationMode(true);
            }}
          />
        )}
      </>
    );
  }

  // 2. Registration Flow (Screen 2)
  if (registrationMode) {
    return (
      <Registration
        onBack={() => setRegistrationMode(false)}
        onSubmit={handleRegistrationSubmit}
      />
    );
  }

  // 3. Registration Success Flow (Screen 3)
  if (newlyRegisteredUser) {
    return (
      <RegistrationSuccess
        user={newlyRegisteredUser}
        onContinue={handleRegistrationContinue}
      />
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed top-2 inset-x-4 z-50 p-2.5 rounded-xl bg-amber-500/90 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md">
          <WifiOff className="w-4 h-4" />
          Offline Mode — Using local vehicle cache
        </div>
      )}

      {/* Floating Error Toast */}
      {errorToast && (
        <div className="fixed top-14 inset-x-4 z-50 p-3 rounded-2xl bg-indigo-950/95 border border-indigo-500/50 text-white text-xs font-semibold shadow-2xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* PWA In-App Install Banner */}
      <PWAInstallBanner />

      {/* Main Top Header */}
      <Header
        user={currentUser}
        unreadCount={unreadNotifsCount}
        onNotificationsClick={() => {
          setIsSettingsOpen(false);
          setIsAdminOpen(false);
          setActiveTab('requests');
        }}
        onProfileClick={() => {
          setIsSettingsOpen(false);
          setIsAdminOpen(false);
          setActiveTab('profile');
        }}
        onAdminClick={() => setIsAdminOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4">
        {isAdminOpen ? (
          <AdminDashboard onBack={() => setIsAdminOpen(false)} />
        ) : isSettingsOpen ? (
          <SettingsView
            onBack={() => setIsSettingsOpen(false)}
            onNavigateTab={tab => {
              setIsSettingsOpen(false);
              setActiveTab(tab);
            }}
            onOpenNotifications={() => {
              setIsSettingsOpen(false);
              setActiveTab('requests');
            }}
            onOpenAdmin={() => {
              setIsSettingsOpen(false);
              setIsAdminOpen(true);
            }}
            onLogout={handleLogout}
          />
        ) : activeTab === 'home' && currentUser ? (
          <Dashboard
            user={currentUser}
            activeRequests={activeRequests}
            onEmergencyBlockedClick={() => setIsScannerOpen(true)}
            onScanClick={() => setIsScannerOpen(true)}
            onRequestsClick={() => setActiveTab('requests')}
            onNotificationsClick={() => setActiveTab('requests')}
            onManageSubscription={() => setActiveTab('subscription')}
            onViewVehicle={() => setActiveTab('profile')}
            onRequestSelect={async req => {
              const msgs = await api.getMessages(req.id);
              setActiveChatRequest(req);
              setChatMessages(msgs);
            }}
          />
        ) : activeTab === 'requests' ? (
          <div className="space-y-6">
            <RequestsView
              requests={activeRequests}
              onSelectRequest={async req => {
                const msgs = await api.getMessages(req.id);
                setActiveChatRequest(req);
                setChatMessages(msgs);
              }}
              onMarkResolved={handleMarkResolved}
              onNewScan={() => setIsScannerOpen(true)}
            />
            <div className="pt-2 border-t border-slate-800/80">
              <NotificationsView
                notifications={notifications}
                onNotificationClick={async notif => {
                  if (notif.request_id) {
                    const req = activeRequests.find(r => r.id === notif.request_id);
                    if (req) {
                      const msgs = await api.getMessages(req.id);
                      setActiveChatRequest(req);
                      setChatMessages(msgs);
                    }
                  }
                  await api.markNotificationRead(notif.id);
                  await refreshAppData();
                }}
                onMarkAllRead={async () => {
                  for (const n of notifications) {
                    await api.markNotificationRead(n.id);
                  }
                  await refreshAppData();
                }}
              />
            </div>
          </div>
        ) : activeTab === 'subscription' && currentUser ? (
          <SubscriptionView
            user={currentUser}
            onSubscribeSuccess={handleSubscribeSuccess}
          />
        ) : activeTab === 'profile' && currentUser ? (
          <ProfileView
            user={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
          />
        ) : null}
      </main>

      {/* Bottom Navigation */}
      {!isAdminOpen && !isSettingsOpen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={tab => {
            setIsSettingsOpen(false);
            setIsAdminOpen(false);
            setActiveTab(tab);
          }}
          onScanClick={() => setIsScannerOpen(true)}
          activeRequestsCount={activeRequests.length}
        />
      )}

      {/* Screen 5: Number Plate Scanner Modal */}
      {isScannerOpen && (
        <PlateScanner
          onBack={() => setIsScannerOpen(false)}
          onPlateDetected={handlePlateDetected}
        />
      )}

      {/* Screen 6: Vehicle Found Modal (Privacy-Safe Profile) */}
      {foundProfile && (
        <VehicleFoundModal
          profile={foundProfile}
          onBack={() => setFoundProfile(null)}
          onMessage={handleMessageFoundOwner}
          onCall={handleCallOwner}
          onReport={() => setReportingVehicleId(foundProfile.vehicle_id)}
        />
      )}

      {/* Screen 7: In-App Message Owner Modal */}
      {activeChatRequest && (
        <MessageOwnerModal
          targetProfile={{
            vehicle_id: activeChatRequest.target_vehicle_id,
            owner_name: activeChatRequest.target_owner_name,
            vehicle_type: activeChatRequest.target_vehicle_type,
            masked_number_plate: activeChatRequest.target_number_plate,
            masked_phone_number: '+91 ******3210',
            is_verified: true,
            subscription_status: 'ACTIVE'
          }}
          currentUserVehicleId={currentUser?.vehicle_id || ''}
          messages={chatMessages}
          onBack={() => setActiveChatRequest(null)}
          onSendMessage={handleSendMessage}
          onCallClick={handleCallOwner}
        />
      )}

      {/* Screen 8: Call Screen Modal (Privacy Relay) */}
      {isCalling && foundProfile && (
        <CallScreenModal
          profile={foundProfile}
          onEndCall={() => setIsCalling(false)}
        />
      )}

      {/* Screen 9: Simulated Owner Notification Modal */}
      {incomingNotificationReq && (
        <OwnerNotificationModal
          request={incomingNotificationReq}
          onClose={() => setIncomingNotificationReq(null)}
          onRespondMoving={handleOwnerRespondMoving}
          onRespondFiveMinutes={handleOwnerRespondFiveMinutes}
          onMessageRequester={async () => {
            const msgs = await api.getMessages(incomingNotificationReq.id);
            setActiveChatRequest(incomingNotificationReq);
            setChatMessages(msgs);
            setIncomingNotificationReq(null);
          }}
        />
      )}

      {/* Abuse Reporting Modal */}
      {reportingVehicleId && (
        <ReportUserModal
          reportedVehicleId={reportingVehicleId}
          onClose={() => setReportingVehicleId(null)}
          onSubmit={async (reason, details) => {
            await api.reportUser(reportingVehicleId, reason, details);
            showToast('Abuse report submitted. Thank you for keeping the platform safe.');
          }}
        />
      )}
    </div>
  );
}
