import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import AppHeader from '../layout/AppHeader'
import AppFooter from '../layout/AppFooter'
import LandlordSidebar from '../layout/LandlordSidebar'

export const LOGIN_REQUIRED_MESSAGE = 'Bạn cần đăng nhập để truy cập trang này.'

export function AuthenticatedShell({ children }) {
  const { isLandlord } = useAuth()
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {isLandlord ? (
          <Box sx={{ display: 'flex', flex: 1, alignItems: 'stretch', minHeight: 0 }}>
            <LandlordSidebar />
            <Box
              component="main"
              sx={{
                flex: 1,
                minWidth: 0,
                px: { xs: 1, sm: 1.5, md: 2 },
                py: { xs: 1.5, md: 2 },
              }}
            >
              {children}
            </Box>
          </Box>
        ) : (
          <Box component="main" sx={{ flex: 1, px: { xs: 1, sm: 1.5 }, py: { xs: 1.5, md: 2 } }}>
            {children}
          </Box>
        )}
      </Box>
      <AppFooter />
    </Box>
  )
}

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Đang tải…</Typography>
        </Stack>
      </Box>
    )
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search || ''}`
    return (
      <Navigate
        to="/login"
        replace
        state={{ from, message: LOGIN_REQUIRED_MESSAGE }}
      />
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>
}

export default ProtectedRoute
