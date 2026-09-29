import { useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RequireAdmin, RequireAuth, RequireDriver, RequireShipmentCreator, RequireTrackingUpdater } from "./components/RequireAuth";
import { AuditLogProvider } from "./store/AuditLogContext";
import { AuthProvider } from "./store/AuthContext";
import { FeedbackProvider } from "./store/FeedbackContext";
import { FleetProvider } from "./store/FleetContext";
import { HelpContactProvider } from "./store/HelpContactContext";
import { LanguageProvider } from "./store/LanguageContext";
import { LocationProvider } from "./store/LocationContext";
import { NotificationProvider } from "./store/NotificationContext";
import { SettingsProvider } from "./store/SettingsContext";
import { ShipmentProvider } from "./store/ShipmentContext";
import { UserManagementProvider } from "./store/UserManagementContext";

import AccountSettings from "./pages/admin/AccountSettings";
import AuditLogPage from "./pages/admin/AuditLogPage";
import CreateShipment from "./pages/admin/CreateShipment";
import CustomerList from "./pages/admin/CustomerList";
import Dashboard from "./pages/admin/Dashboard";
import EmailPreview from "./pages/admin/EmailPreview";
import FeedbackAdmin from "./pages/admin/FeedbackAdmin";
import FleetList from "./pages/admin/FleetList";
import LocationList from "./pages/admin/LocationList";
import Login from "./pages/admin/Login";
import NotificationCenter from "./pages/admin/NotificationCenter";
import SettingsPage from "./pages/admin/SettingsPage";
import ShipmentDetail from "./pages/admin/ShipmentDetail";
import ShipmentList from "./pages/admin/ShipmentList";
import ShipmentTracking from "./pages/admin/ShipmentTracking";
import TruckHistory from "./pages/admin/TruckHistory";
import UpdateTracking from "./pages/admin/UpdateTracking";
import UserManagement from "./pages/admin/UserManagement";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverLogin from "./pages/driver/DriverLogin";
import DriverShipmentDetail from "./pages/driver/DriverShipmentDetail";
import DriverShipmentHistory from "./pages/driver/DriverShipmentHistory";
import About from "./pages/public/About";
import CekOngkir from "./pages/public/CekOngkir";
import Contact from "./pages/public/Contact";
import Home from "./pages/public/Home";
import TrackingResult from "./pages/public/TrackingResult";
import TrackingSearch from "./pages/public/TrackingSearch";
import { ADMIN_BASE_URL, DRIVER_BASE_URL, detectPortal } from "./utils/urls";

/**
 * Root "/" resolves per-origin: the public site shows the company profile,
 * while the admin/driver subdomains land directly on their portals (the
 * public Home page is meaningless there). Localhost and legacy hosts keep
 * the public Home so local dev and the transition window still work.
 */
function RootPortal() {
  const portal = detectPortal();
  if (portal === "admin") return <Navigate to="/admin" replace />;
  if (portal === "driver") return <Navigate to="/driver" replace />;
  return <Home />;
}

/**
 * On the PUBLIC domain, the /admin and /driver portals must not be reachable
 * under gms-logistics.id - bounce any such path to the correct subdomain,
 * preserving the rest of the URL. Cross-origin, so use a full navigation.
 */
function HostGuard() {
  const location = useLocation();
  useEffect(() => {
    if (detectPortal() !== "public") return;
    const path = location.pathname;
    if (!path.startsWith("/admin") && !path.startsWith("/driver")) return;
    const rest = path + location.search + location.hash;
    const target = path.startsWith("/admin") ? ADMIN_BASE_URL : DRIVER_BASE_URL;
    window.location.replace(target + rest);
  }, [location]);
  return null;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <HelpContactProvider>
        <AuthProvider>
          <AuditLogProvider>
            <NotificationProvider>
              <FeedbackProvider>
                <FleetProvider>
                  <LocationProvider>
                    <UserManagementProvider>
                      <SettingsProvider>
                        <ShipmentProvider>{children}</ShipmentProvider>
                      </SettingsProvider>
                    </UserManagementProvider>
                  </LocationProvider>
                </FleetProvider>
              </FeedbackProvider>
            </NotificationProvider>
          </AuditLogProvider>
        </AuthProvider>
      </HelpContactProvider>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Router>
      <HostGuard />
      <Routes>
      {/* Customer / public site */}
      <Route path="/" element={<RootPortal />} />
          <Route path="/tentang" element={<About />} />
          <Route path="/kontak" element={<Contact />} />
          <Route path="/cek-ongkir" element={<CekOngkir />} />
          <Route path="/tracking" element={<TrackingSearch />} />
          <Route path="/tracking/:awb" element={<TrackingResult />} />

          {/* Driver portal - fully separate from /admin, own login/layout */}
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver" element={<RequireDriver><DriverDashboard /></RequireDriver>} />
          <Route path="/driver/riwayat" element={<RequireDriver><DriverShipmentHistory /></RequireDriver>} />
          <Route
            path="/driver/shipments/:awb"
            element={
              <RequireDriver>
                <DriverShipmentDetail />
              </RequireDriver>
            }
          />

          {/* Admin / internal */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/admin/pengiriman" element={<RequireAuth><ShipmentList /></RequireAuth>} />
          <Route path="/admin/pengiriman/baru" element={<RequireShipmentCreator><CreateShipment /></RequireShipmentCreator>} />
          <Route path="/admin/resi/:awb" element={<RequireAuth><ShipmentDetail /></RequireAuth>} />
          <Route path="/admin/tracking/:awb" element={<RequireAuth><ShipmentTracking /></RequireAuth>} />
          <Route path="/admin/resi/:awb/email" element={<RequireAuth><EmailPreview /></RequireAuth>} />
          <Route
            path="/admin/update-tracking/:awb"
            element={
              <RequireTrackingUpdater>
                <UpdateTracking />
              </RequireTrackingUpdater>
            }
          />

          <Route path="/admin/armada" element={<RequireAuth><FleetList /></RequireAuth>} />
          <Route path="/admin/armada/:id" element={<RequireAuth><TruckHistory /></RequireAuth>} />
          <Route path="/admin/kota" element={<RequireAuth><LocationList /></RequireAuth>} />
          <Route path="/admin/customer" element={<RequireAdmin><CustomerList /></RequireAdmin>} />
          <Route path="/admin/notifikasi" element={<RequireAuth><NotificationCenter /></RequireAuth>} />
          <Route path="/admin/feedback" element={<RequireAuth><FeedbackAdmin /></RequireAuth>} />
          <Route path="/admin/audit-log" element={<RequireAdmin><AuditLogPage /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><UserManagement /></RequireAdmin>} />
          <Route path="/admin/pengaturan/tracking" element={<RequireAdmin><SettingsPage /></RequireAdmin>} />
          <Route path="/admin/pengaturan/akun" element={<RequireAuth><AccountSettings /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
