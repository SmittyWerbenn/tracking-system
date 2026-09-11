import { Navigate, Route, HashRouter as Router, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { AuthProvider } from "./store/AuthContext";
import { ShipmentProvider } from "./store/ShipmentContext";

import AccountSettings from "./pages/admin/AccountSettings";
import Dashboard from "./pages/admin/Dashboard";
import CreateShipment from "./pages/admin/CreateShipment";
import Login from "./pages/admin/Login";
import ShipmentList from "./pages/admin/ShipmentList";
import ShipmentDetail from "./pages/admin/ShipmentDetail";
import EmailPreview from "./pages/admin/EmailPreview";
import UpdateTracking from "./pages/admin/UpdateTracking";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Home from "./pages/public/Home";
import TrackingSearch from "./pages/public/TrackingSearch";
import TrackingResult from "./pages/public/TrackingResult";

export default function App() {
  return (
    <AuthProvider>
      <ShipmentProvider>
        <Router>
          <Routes>
            {/* Customer / public site */}
            <Route path="/" element={<Home />} />
            <Route path="/tentang" element={<About />} />
            <Route path="/kontak" element={<Contact />} />
            <Route path="/tracking" element={<TrackingSearch />} />
            <Route path="/tracking/:awb" element={<TrackingResult />} />

            {/* Admin / internal */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/pengiriman"
              element={
                <RequireAuth>
                  <ShipmentList />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/pengiriman/baru"
              element={
                <RequireAuth>
                  <CreateShipment />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/resi/:awb"
              element={
                <RequireAuth>
                  <ShipmentDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/resi/:awb/email"
              element={
                <RequireAuth>
                  <EmailPreview />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/update-tracking/:awb"
              element={
                <RequireAuth>
                  <UpdateTracking />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/pengaturan"
              element={
                <RequireAuth>
                  <AccountSettings />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ShipmentProvider>
    </AuthProvider>
  );
}
