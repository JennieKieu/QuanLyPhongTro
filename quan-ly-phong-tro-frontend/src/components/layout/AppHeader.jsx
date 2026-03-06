import React, { useState } from 'react'
import {
  AppBar,
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
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoHeader from '../../image/Logo_header.png'

const AppHeader = () => {
  const { user, logout, isLandlord, isTenant } = useAuth()
  const navigate = useNavigate()
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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

  const landlordItems = [
    { label: 'Xem phòng', path: '/rooms' },
    { label: 'Khách hàng', path: '/tenants' },
    { label: 'Hợp đồng', path: '/contracts' },
    { label: 'Hóa đơn', path: '/invoices' },
    { label: 'Điện/Nước', path: '/utilities' },
  ]
  const tenantItems = [
    { label: 'Xem phòng', path: '/rooms/available' },
    { label: 'Hợp đồng', path: '/my-contract' },
    { label: 'Hóa đơn', path: '/my-invoices' },
  ]
  const headerItems = isTenant ? tenantItems : []
  const drawerItems = isLandlord ? landlordItems : tenantItems

  return (
    <>
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        color: '#163C57',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, md: 72 },
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: 'auto', md: 180 } }}>
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
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#163C57' }}
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
                fontWeight: 600,
                color: '#163C57',
                fontSize: { xs: '0.95rem', md: '1rem' },
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
      PaperProps={{ sx: { width: 280 } }}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <Box sx={{ pt: 3, pb: 2, px: 2 }}>
        <Box sx={{ color: '#163C57', fontWeight: 600, fontSize: '0.95rem' }}>
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
