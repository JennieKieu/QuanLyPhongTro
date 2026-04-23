import React, { useState } from 'react'
import {
  AppBar,
  Avatar,
  Badge,
  Toolbar,
  Box,
  Button,
  Container,
  Stack,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { landlordNavItems } from '../../config/landlordNavItems'
import logoHeader from '../../image/Logo_header.png'

const AppHeader = () => {
  const { user, logout, isLandlord, isTenant } = useAuth()
  const navigate = useNavigate()
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/dashboard')
  }

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null)
  }

  const handleGoProfile = () => {
    handleCloseUserMenu()
    navigate('/profile')
  }

  const handleMobileNav = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const landlordDrawerItems = landlordNavItems.map((item) => ({
    label: item.drawerLabel,
    path: item.path,
  }))
  const tenantItems = [
    { label: 'Xem phòng', path: '/rooms/available' },
    { label: 'Điều khoản thuê', path: '/dieu-khoan-thue-tro' },
    { label: 'Hợp đồng', path: '/my-contract' },
    { label: 'Hóa đơn', path: '/my-invoices' },
  ]
  const headerItems = isTenant ? tenantItems : []
  const drawerItems = isLandlord ? landlordDrawerItems : tenantItems

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
            minHeight: { xs: 62, md: 72 },
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: 'auto', md: 220 } }}>
            <Box
              component={Link}
              to="/dashboard"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <Box
                component="img"
                src={logoHeader}
                alt="Logo"
                sx={{ height: { xs: 38, md: 48 }, width: 'auto', cursor: 'pointer' }}
              />
              <Box sx={{ ml: 1.5, display: { xs: 'none', sm: 'block' } }}>
                
                  <Button
                    color="inherit"
                    size="small"
                    sx={{ pointerEvents: 'none', fontWeight: 700, color: 'text.secondary' }}
                  >
                    Nền tảng quản lý phòng trọ
                  </Button>
                
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            {headerItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' } }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ minWidth: { xs: 'auto', md: 240 }, justifyContent: 'flex-end' }}
          >
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', lg: 'none' }, color: 'primary.main' }}
              aria-label="Mở menu"
            >
              <MenuIcon />
            </IconButton>
            <Button
              onClick={handleOpenUserMenu}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                textTransform: 'none',
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '0.95rem', md: '1rem' },
                borderRadius: 3,
                px: 1.25,
                py: 0.75,
                border: '1px solid #e2e8f5',
              }}
            >
              {user?.fullName || user?.email}
            </Button>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleGoProfile}>Thông tin tài khoản</MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu()
                  handleLogout()
                }}
              >
                Đăng xuất
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>

    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      PaperProps={{ sx: { width: 300 } }}
      sx={{ display: { xs: 'block', lg: 'none' } }}
    >
      <Box sx={{ pt: 3, pb: 2, px: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <PersonOutlineIcon fontSize="small" />
        </Avatar>
        <Box sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.95rem' }}>
          {user?.fullName || user?.email}
        </Box>
      </Box>
      <Divider />
        <List>
          {drawerItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleMobileNav(item.path)}
            sx={{ color: '#163C57', fontWeight: 600 }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={() => handleMobileNav('/profile')} sx={{ color: '#163C57', fontWeight: 600 }}>
          <ListItemText primary="Thông tin tài khoản" />
        </ListItemButton>
        <ListItemButton
          onClick={() => {
            setMobileOpen(false)
            handleLogout()
          }}
          sx={{ color: '#163C57', fontWeight: 600 }}
        >
          <ListItemText primary="Đăng xuất" />
        </ListItemButton>
      </List>
    </Drawer>
    </>
  )
}

export default AppHeader
