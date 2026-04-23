import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MixedAuthLayout from './components/layout/MixedAuthLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import RoomsPage from './pages/RoomsPage'
import TenantsPage from './pages/TenantsPage'
import ContractsPage from './pages/ContractsPage'
import InvoicesPage from './pages/InvoicesPage'
import UtilitiesPage from './pages/UtilitiesPage'
import ReportsPage from './pages/ReportsPage'
import AvailableRoomsPage from './pages/AvailableRoomsPage'
import RentRoomPage from './pages/RentRoomPage'
import RentalTermsPage from './pages/RentalTermsPage'
import MyContractPage from './pages/MyContractPage'
import MyInvoicesPage from './pages/MyInvoicesPage'
import ProfilePage from './pages/ProfilePage'
import theme from './theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dieu-khoan-thue-tro"
              element={
                <MixedAuthLayout>
                  <RentalTermsPage />
                </MixedAuthLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MixedAuthLayout>
                  <Dashboard />
                </MixedAuthLayout>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute requiredRole="Landlord">
                  <RoomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants"
              element={
                <ProtectedRoute requiredRole="Landlord">
                  <TenantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute requiredRole="Landlord">
                  <ContractsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/utilities"
              element={
                <ProtectedRoute requiredRole="Landlord">
                  <UtilitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole="Landlord">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/available"
              element={
                <MixedAuthLayout>
                  <AvailableRoomsPage />
                </MixedAuthLayout>
              }
            />
            <Route
              path="/rooms/rent/:roomId"
              element={
                <ProtectedRoute requiredRole="Tenant">
                  <RentRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-contract"
              element={
                <ProtectedRoute requiredRole="Tenant">
                  <MyContractPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-invoices"
              element={
                <ProtectedRoute requiredRole="Tenant">
                  <MyInvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

