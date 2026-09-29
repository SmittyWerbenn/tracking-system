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
import { ADMIN_BASE_URL, DRIVER_BASE_URL, adminPath, detectPortal, driverPath } from "./utils/urls";

/**
 * On the PUBLIC domain, the /admin and /driver portals must not be reachable
 * under gms-logistics.id - bounce any such path to the correct subdomain,
 * stripping the portal prefix (they now live at the subdomain root).
 * Cross-origin, so use a full navigation.
 */
function HostGuard() {
  const location = useLocation();
  useEffect(() => {
    if (detectPortal() !== "public") return;
    const path = location.pathname;
    if (path.startsWith("/admin")) {
      const rest = path.slice("/admin".length) || "/";
      window.location.replace(ADMIN_BASE_URL + rest + location.search + location.hash);
    } else if (path.startsWith("/driver")) {
      const rest = path.slice("/driver".length) || "/";
      window.location.replace(DRIVER_BASE_URL + rest + location.search + location.hash);
    }
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
  const portal = detectPortal();
  const isAdmin = portal === "admin";
  const isDriver = portal === "driver";

  return (
    <AppProviders>
      <Router>
        <HostGuard />
        <Routes>
          {/* Customer / public site - only on the public domain and localhost */}
          {!isAdmin && !isDriver && (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/tentang" element={<About />} />
              <Route path="/kontak" element={<Contact />} />
              <Route path="/cek-ongkir" element={<CekOngkir />} />
              <Route path="/tracking" element={<TrackingSearch />} />
              <Route path="/tracking/:awb" element={<TrackingResult />} />
            </>
          )}

          {/* Driver portal - fully separate from /admin, own login/layout */}
          {!isAdmin && (
            <>
              <Route path={driverPath("/login")} element={<DriverLogin />} />
              <Route path={driverPath("/")} element={<RequireDriver><DriverDashboard /></RequireDriver>} />
              <Route path={driverPath("/riwayat")} element={<RequireDriver><DriverShipmentHistory /></RequireDriver>} />
              <Route path={driverPath("/shipments/:awb")} element={<RequireDriver><DriverShipmentDetail /></RequireDriver>} />
            </>
          )}

          {/* Admin / internal */}
          {!isDriver && (
            <>
              <Route path={adminPath("/login")} element={<Login />} />
              <Route path={adminPath("/")} element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path={adminPath("/pengiriman")} element={<RequireAuth><ShipmentList /></RequireAuth>} />
              <Route path={adminPath("/pengiriman/baru")} element={<RequireShipmentCreator><CreateShipment /></RequireShipmentCreator>} />
              <Route path={adminPath("/resi/:awb")} element={<RequireAuth><ShipmentDetail /></RequireAuth>} />
              <Route path={adminPath("/tracking/:awb")} element={<RequireAuth><ShipmentTracking /></RequireAuth>} />
              <Route path={adminPath("/resi/:awb/email")} element={<RequireAuth><EmailPreview /></RequireAuth>} />
              <Route path={adminPath("/update-tracking/:awb")} element={<RequireTrackingUpdater><UpdateTracking /></RequireTrackingUpdater>} />
              <Route path={adminPath("/armada")} element={<RequireAuth><FleetList /></RequireAuth>} />
              <Route path={adminPath("/armada/:id")} element={<RequireAuth><TruckHistory /></RequireAuth>} />
              <Route path={adminPath("/kota")} element={<RequireAuth><LocationList /></RequireAuth>} />
              <Route path={adminPath("/customer")} element={<RequireAdmin><CustomerList /></RequireAdmin>} />
              <Route path={adminPath("/notifikasi")} element={<RequireAuth><NotificationCenter /></RequireAuth>} />
              <Route path={adminPath("/feedback")} element={<RequireAuth><FeedbackAdmin /></RequireAuth>} />
              <Route path={adminPath("/audit-log")} element={<RequireAdmin><AuditLogPage /></RequireAdmin>} />
              <Route path={adminPath("/users")} element={<RequireAdmin><UserManagement /></RequireAdmin>} />
              <Route path={adminPath("/pengaturan/tracking")} element={<RequireAdmin><SettingsPage /></RequireAdmin>} />
              <Route path={adminPath("/pengaturan/akun")} element={<RequireAuth><AccountSettings /></RequireAuth>} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
