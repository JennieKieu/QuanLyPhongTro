import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { tenantService } from '../services/tenantService'

const ProfilePage = () => {
  const { user, isTenant } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    identityCard: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
  })

  useEffect(() => {
    if (isTenant) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [isTenant])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await tenantService.getMyProfile()
      setProfile(data)
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        identityCard: data.identityCard || '',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: data.gender || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
      })
    } catch (err) {
      setError('Không thể tải thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (isTenant) {
        await tenantService.updateProfile(formData)
      }
      setSuccess('Cập nhật thông tin thành công')
      loadProfile()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Thông tin tài khoản
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1">{user?.email}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Vai trò
          </Typography>
          <Typography variant="body1">
            {user?.role === 'Landlord' ? 'Chủ trọ' : 'Người thuê'}
          </Typography>
        </Box>

        {isTenant && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Thông tin cá nhân
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="CMND/CCCD"
                value={formData.identityCard}
                onChange={(e) =>
                  setFormData({ ...formData, identityCard: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                select
                label="Giới tính"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </TextField>
              <TextField
                fullWidth
                label="Người liên hệ khẩn cấp"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="SĐT người liên hệ"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }
                margin="normal"
              />
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Cập nhật'}
                </Button>
              </Box>
            </form>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default ProfilePage
