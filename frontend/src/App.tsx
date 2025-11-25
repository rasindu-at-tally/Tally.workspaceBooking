import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { MyBookings } from '@/pages/MyBookings';
import { ManageDesks } from '@/pages/admin/ManageDesks';
import { AllBookings } from '@/pages/admin/AllBookings';
import { AuditLogs } from '@/pages/admin/AuditLogs';
import { FloorPlanDesigner } from '@/pages/admin/FloorPlanDesigner';
import MeetingRooms from '@/pages/MeetingRooms';
import MyRoomBookings from '@/pages/MyRoomBookings';
import SmartRecommendations from '@/pages/SmartRecommendations';
import ManageMeetingRooms from '@/pages/admin/ManageMeetingRooms';
import { PrivateRoute } from '@/components/PrivateRoute';
import { isAuthenticated } from '@/lib/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated() ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/meeting-rooms"
            element={
              <PrivateRoute>
                <MeetingRooms />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-room-bookings"
            element={
              <PrivateRoute>
                <MyRoomBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/smart-recommendations"
            element={
              <PrivateRoute>
                <SmartRecommendations />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/desks"
            element={
              <PrivateRoute requireAdmin>
                <ManageDesks />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <PrivateRoute requireAdmin>
                <AllBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <PrivateRoute requireAdmin>
                <AuditLogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/floor-plan"
            element={
              <PrivateRoute requireAdmin>
                <FloorPlanDesigner />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/meeting-rooms"
            element={
              <PrivateRoute requireAdmin>
                <ManageMeetingRooms />
              </PrivateRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

