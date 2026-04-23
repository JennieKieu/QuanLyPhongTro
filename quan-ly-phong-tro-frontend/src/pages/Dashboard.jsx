import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@mui/material'
import PersonOutline from '@mui/icons-material/PersonOutline'
import ExploreOutlined from '@mui/icons-material/ExploreOutlined'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import GavelOutlined from '@mui/icons-material/GavelOutlined'
import LoginOutlined from '@mui/icons-material/LoginOutlined'
import AppRegistrationOutlined from '@mui/icons-material/AppRegistrationOutlined'
import { useAuth } from '../context/AuthContext'
import { landlordNavItems } from '../config/landlordNavItems'

const guestShortcuts = [
  {
    path: '/rooms/available',
    title: 'Phòng trống',
    description: 'Xem phòng đang cho thuê và giá thuê',
    Icon: ExploreOutlined,
  },
  {
    path: '/dieu-khoan-thue-tro',
    title: 'Điều khoản thuê trọ',
    description: 'Quy định chung trước khi thuê phòng',
    Icon: GavelOutlined,
  },
  {
    path: '/login',
    title: 'Đăng nhập',
    description: 'Đã có tài khoản — vào khu vực người thuê',
    Icon: LoginOutlined,
  },
  {
    path: '/register',
    title: 'Đăng ký',
    description: 'Tạo tài khoản để gửi yêu cầu thuê phòng',
    Icon: AppRegistrationOutlined,
  },
]

const tenantShortcuts = [
  {
    path: '/rooms/available',
    title: 'Tìm phòng trống',
    description: 'Xem phòng đang cho thuê và đăng ký thuê',
    Icon: ExploreOutlined,
  },
  {
    path: '/dieu-khoan-thue-tro',
    title: 'Điều khoản thuê trọ',
    description: 'Quy định chung khi thuê phòng',
    Icon: GavelOutlined,
  },
  {
    path: '/my-contract',
    title: 'Hợp đồng của tôi',
    description: 'Theo dõi hợp đồng và chấm dứt (nếu cần)',
    Icon: DescriptionOutlined,
  },
  {
    path: '/my-invoices',
    title: 'Hóa đơn của tôi',
    description: 'Tiền phòng, điện nước và hạn thanh toán',
    Icon: ReceiptLongOutlined,
  },
]

const ShortcutCard = ({ title, description, Icon, onClick }) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      '&:hover': {
        boxShadow: 2,
        borderColor: 'primary.light',
      },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: '100%', alignItems: 'stretch' }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 48,
              height: 48,
              borderRadius: 1.5,
            }}
          >
            <Icon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {description}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="primary" fontWeight={600} sx={{ mt: 'auto', pt: 1 }}>
          Mở trang →
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
)

const Dashboard = () => {
  const { user, isLandlord, isTenant, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const landlordCards = landlordNavItems.filter((item) => item.path !== '/dashboard')

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          borderRadius: 2,
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}CC 0%, ${theme.palette.secondary.main}B8 100%), url(https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'primary.contrastText',
          boxShadow: 2,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {!isAuthenticated
            ? 'Chào mừng đến với nhà trọ'
            : `Xin chào, ${user?.fullName || user?.email}!`}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 640 }}>
          {!isAuthenticated &&
            'Bạn có thể xem phòng trống và điều khoản thuê mà không cần đăng nhập. Đăng nhập để xem hợp đồng, hóa đơn và gửi yêu cầu thuê phòng.'}
          {isAuthenticated && isLandlord &&
            'Bảng điều khiển quản lý nhà trọ — chọn chức năng bên dưới hoặc dùng menu bên trái.'}
          {isAuthenticated && isTenant &&
            'Khu vực dành cho người thuê — tìm phòng, xem hợp đồng và hóa đơn của bạn.'}
        </Typography>
        {isAuthenticated && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, opacity: 0.85 }}>
            Vai trò: <strong>{isLandlord ? 'Chủ trọ' : 'Người thuê'}</strong>
          </Typography>
        )}
      </Box>

      {!isAuthenticated && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
            Bắt đầu nhanh
          </Typography>
          <Grid container spacing={2.5}>
            {guestShortcuts.map(({ path, title, description, Icon }) => (
              <Grid item xs={12} sm={6} md={6} key={path}>
                <ShortcutCard
                  title={title}
                  description={description}
                  Icon={Icon}
                  onClick={() => navigate(path)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {isLandlord && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
            Chức năng quản lý
          </Typography>
          <Grid container spacing={2.5}>
            {landlordCards.map(({ path, label, description, Icon }) => (
              <Grid item xs={12} sm={6} lg={4} key={path}>
                <ShortcutCard
                  title={label}
                  description={description}
                  Icon={Icon}
                  onClick={() => navigate(path)}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} lg={4}>
              <ShortcutCard
                title="Tài khoản"
                description="Đổi mật khẩu và thông tin cá nhân"
                Icon={PersonOutline}
                onClick={() => navigate('/profile')}
              />
            </Grid>
          </Grid>
        </>
      )}

      {isTenant && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>
            Dành cho bạn
          </Typography>
          <Grid container spacing={2.5}>
            {tenantShortcuts.map(({ path, title, description, Icon }) => (
              <Grid item xs={12} sm={6} md={6} key={path}>
                <ShortcutCard
                  title={title}
                  description={description}
                  Icon={Icon}
                  onClick={() => navigate(path)}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={6}>
              <ShortcutCard
                title="Tài khoản"
                description="Thông tin cá nhân và bảo mật"
                Icon={PersonOutline}
                onClick={() => navigate('/profile')}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}

export default Dashboard
