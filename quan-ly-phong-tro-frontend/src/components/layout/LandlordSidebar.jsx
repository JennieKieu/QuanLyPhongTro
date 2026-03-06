import React from 'react'
import { Box, List, ListItemButton, ListItemText, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const LandlordSidebar = () => {
  const navigate = useNavigate()
  const items = [
    { label: 'Quản lý phòng', path: '/rooms' },
    { label: 'Quản lý khách hàng', path: '/tenants' },
    { label: 'Quản lý hợp đồng', path: '/contracts' },
    { label: 'Quản lý hóa đơn', path: '/invoices' },
    { label: 'Quản lý điện/nước', path: '/utilities' },
  ]

  return (
    <Box
      sx={{
        width: 240,
        display: { xs: 'none', md: 'block' },
        borderRight: '1px solid #e5e7eb',
        bgcolor: '#ffffff',
      }}
    >
      <Box sx={{ px: 2, py: 2, color: '#163C57', fontWeight: 700 }}>
        Chức năng quản lý
      </Box>
      <Divider />
      <List sx={{ py: 0 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{ color: '#163C57', fontWeight: 600 }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

export default LandlordSidebar
