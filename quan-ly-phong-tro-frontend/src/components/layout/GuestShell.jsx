import React from 'react'
import { Box } from '@mui/material'
import GuestHeader from './GuestHeader'
import AppFooter from './AppFooter'

const GuestShell = ({ children }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <GuestHeader />
    <Box component="main" sx={{ flex: 1, px: { xs: 1, sm: 1.5 }, py: { xs: 1.5, md: 2 } }}>
      {children}
    </Box>
    <AppFooter />
  </Box>
)

export default GuestShell
