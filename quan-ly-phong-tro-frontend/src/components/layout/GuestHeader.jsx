import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate, Link } from 'react-router-dom'
import logoHeader from '../../image/Logo_header.png'

const navItems = [
  { label: 'Trang chủ', path: '/dashboard' },
  { label: 'Phòng trống', path: '/rooms/available' },
  { label: 'Điều khoản thuê', path: '/dieu-khoan-thue-tro' },
]

const GuestHeader = () => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const go = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,.9)',
          color: 'text.primary',
          borderBottom: '1px solid #dbe4f6',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 72 },
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box component={Link} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Box
                component="img"
                src={logoHeader}
                alt="Logo"
                sx={{ height: { xs: 38, md: 48 }, width: 'auto' }}
              />
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Đăng ký
              </Button>
            </Stack>

            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'primary.main' }}
              aria-label="Mở menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ pt: 2, px: 2, pb: 1, fontWeight: 700, color: '#163C57' }}>Menu</Box>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItemButton key={item.path} onClick={() => go(item.path)} sx={{ color: '#163C57', fontWeight: 600 }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={() => go('/login')} sx={{ color: '#163C57', fontWeight: 600 }}>
            <ListItemText primary="Đăng nhập" />
          </ListItemButton>
          <ListItemButton onClick={() => go('/register')} sx={{ color: '#163C57', fontWeight: 600 }}>
            <ListItemText primary="Đăng ký" />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  )
}

export default GuestHeader
