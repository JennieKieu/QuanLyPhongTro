import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const RegisterPage = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      await authService.register(formData)
      sessionStorage.setItem('registerFormData', JSON.stringify(formData))
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const dataToSend =
      formData?.email && formData?.fullName && formData?.phone
        ? formData
        : JSON.parse(sessionStorage.getItem('registerFormData') || '{}')

    try {
      const response = await authService.verifyOtp(dataToSend.email, otp, dataToSend)
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken)
        const user = response.user || { email: dataToSend.email, fullName: dataToSend.fullName, phone: dataToSend.phone, role: 'Tenant' }
        localStorage.setItem('user', JSON.stringify(user))
        sessionStorage.removeItem('registerFormData')
        navigate('/dashboard')
      } else if (response.message) {
        setError(response.message + ' (Kiểm tra dữ liệu form đã gửi đủ chưa)')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không đúng')
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
        <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Xác thực OTP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Mã OTP đã được gửi đến email: <strong>{formData.email}</strong>
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleVerifyOtp}>
            <TextField
              fullWidth
              label="Mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2.5, mb: 1 }}
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
            <Button fullWidth variant="text" onClick={() => authService.resendOtp(formData.email)}>
              Gửi lại OTP
            </Button>
          </Box>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Paper sx={{ overflow: 'hidden' }}>
        <Grid container>
          <Grid item xs={12} md={6} sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Tạo tài khoản người thuê
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Sau khi đăng ký, bạn sẽ xác thực OTP để bắt đầu gửi yêu cầu thuê phòng.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate('/login')}>
                Đã có tài khoản? Đăng nhập
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                minHeight: 620,
                height: '100%',
                backgroundImage:
                  'linear-gradient(145deg, rgba(30,94,255,.78), rgba(124,77,255,.72)), url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80)',
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
                  Bắt đầu hành trình thuê phòng đơn giản
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Xem phòng trống, gửi yêu cầu thuê và theo dõi hợp đồng/hóa đơn trên cùng một ứng dụng.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default RegisterPage

