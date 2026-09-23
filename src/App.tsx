import { Navigate, Route, HashRouter as Router, Routes } from "react-router-dom";
import { RequireAdmin, RequireAuth, RequireSuperadmin, RequireTrackingUpdater } from "./components/RequireAuth";
import { AuditLogProvider } from "./store/AuditLogContext";
import { AuthProvider } from "./store/AuthContext";
import { FeedbackProvider } from "./store/FeedbackContext";
import { FleetProvider } from "./store/FleetContext";
import { LanguageProvider } from "./store/LanguageContext";
import { LocationProvider } from "./store/LocationContext";
import { NotificationProvider } from "./store/NotificationContext";
import { SettingsProvider } from "./store/SettingsContext";
import { ShipmentProvider } from "./store/ShipmentContext";
import { UserManagementProvider } from "./store/UserManagementContext";

import AccountSettings from "./pages/admin/AccountSettings";
import AuditLogPage from "./pages/admin/AuditLogPage";
import CreateShipment from "./pages/admin/CreateShipment";
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
import TruckHistory from "./pages/admin/TruckHistory";
import UpdateTracking from "./pages/admin/UpdateTracking";
import UserManagement from "./pages/admin/UserManagement";
import About from "./pages/public/About";
import CekOngkir from "./pages/public/CekOngkir";
import Contact from "./pages/public/Contact";
import Home from "./pages/public/Home";
import TrackingResult from "./pages/public/TrackingResult";
import TrackingSearch from "./pages/public/TrackingSearch";

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          {/* Customer / public site */}
          <Route path="/" element={<Home />} />
          <Route path="/tentang" element={<About />} />
          <Route path="/kontak" element={<Contact />} />
          <Route path="/cek-ongkir" element={<CekOngkir />} />
          <Route path="/tracking" element={<TrackingSearch />} />
          <Route path="/tracking/:awb" element={<TrackingResult />} />

          {/* Admin / internal */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/admin/pengiriman" element={<RequireAuth><ShipmentList /></RequireAuth>} />
          <Route path="/admin/pengiriman/baru" element={<RequireAdmin><CreateShipment /></RequireAdmin>} />
          <Route path="/admin/resi/:awb" element={<RequireAuth><ShipmentDetail /></RequireAuth>} />
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
          <Route path="/admin/notifikasi" element={<RequireAuth><NotificationCenter /></RequireAuth>} />
          <Route path="/admin/feedback" element={<RequireAuth><FeedbackAdmin /></RequireAuth>} />
          <Route path="/admin/audit-log" element={<RequireAuth><AuditLogPage /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireSuperadmin><UserManagement /></RequireSuperadmin>} />
          <Route path="/admin/pengaturan/tracking" element={<RequireAdmin><SettingsPage /></RequireAdmin>} />
          <Route path="/admin/pengaturan/akun" element={<RequireAuth><AccountSettings /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
