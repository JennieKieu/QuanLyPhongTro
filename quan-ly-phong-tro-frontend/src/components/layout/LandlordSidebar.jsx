import React from 'react'
import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { landlordNavItems } from '../../config/landlordNavItems'

const isNavActive = (pathname, itemPath) => {
  if (itemPath === '/dashboard') return pathname === '/dashboard'
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

const LandlordSidebar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box
      component="nav"
      aria-label="Menu quản trị"
      sx={{
        width: 280,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        borderRight: '1px solid #e2e8f5',
        bgcolor: 'rgba(255,255,255,.88)',
        backdropFilter: 'blur(8px)',
        minHeight: '100%',
      }}
    >
      <Box sx={{ px: 2.25, py: 2.5 }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: 1, fontWeight: 700 }}
        >
          Quản trị nhà trọ
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ color: 'primary.main', fontWeight: 800, mt: 0.5 }}
        >
          Chủ trọ
        </Typography>
        <Chip
          label="Landlord"
          color="primary"
          size="small"
          sx={{ mt: 1.2, borderRadius: 1 }}
        />
      </Box>
      <Divider />
      <List sx={{ py: 1.25, px: 1.25, flex: 1 }}>
        {landlordNavItems.map(({ path, label, Icon }) => {
          const selected = isNavActive(pathname, path)
          return (
            <ListItemButton
              key={path}
              selected={selected}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  boxShadow: '0 8px 16px rgba(30,94,255,.28)',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: selected ? 'inherit' : 'primary.main',
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontWeight: selected ? 700 : 600,
                  fontSize: '0.92rem',
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export default LandlordSidebar
