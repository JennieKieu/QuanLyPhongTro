import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const redirectMessage = location.state?.message
  const fromPath = location.state?.from

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      login(response.accessToken, response.user)
      const target = fromPath && fromPath !== '/login' ? fromPath : '/dashboard'
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Paper sx={{ overflow: 'hidden' }}>
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Chào mừng quay lại
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Đăng nhập để quản lý hợp đồng, hóa đơn và theo dõi vận hành nhà trọ.
            </Typography>

            {redirectMessage && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {redirectMessage}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Stack>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2.5, mb: 1 }}
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate('/register')}>
                Chưa có tài khoản? Đăng ký
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                height: '100%',
                minHeight: 520,
                backgroundImage:
                  'linear-gradient(145deg, rgba(30,94,255,.8), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                p: 5,
                color: '#fff',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  Nền tảng quản lý phòng trọ hiện đại
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Tập trung vận hành phòng, hợp đồng, hóa đơn và báo cáo trên một giao diện trực quan.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default LoginPage

