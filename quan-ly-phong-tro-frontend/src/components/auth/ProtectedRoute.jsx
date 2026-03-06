import { Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import AppHeader from '../layout/AppHeader'
import LandlordSidebar from '../layout/LandlordSidebar'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading, isLandlord } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <AppHeader />
      {isLandlord ? (
        <Box sx={{ display: 'flex' }}>
          <LandlordSidebar />
          <Box component="main" sx={{ flex: 1 }}>
            {children}
          </Box>
        </Box>
      ) : (
        children
      )}
    </>
  )
}

export default ProtectedRoute

