import React from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import GuestShell from './GuestShell'
import { AuthenticatedShell } from '../auth/ProtectedRoute'

/**
 * Trang vừa mở cho khách (chưa đăng nhập) vừa cho user đã đăng nhập (có header/sidebar đầy đủ).
 */
const MixedAuthLayout = ({ children }) => {
  const { loading, isAuthenticated } = useAuth()

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
    return <GuestShell>{children}</GuestShell>
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>
}

export default MixedAuthLayout
