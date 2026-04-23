import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { tenantService } from '../services/tenantService'

const LIST_ROWS_PER_PAGE = 10

const TenantsPage = () => {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTenant, setEditingTenant] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    identityCard: '',
    address: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
  })
  const [page, setPage] = useState(0)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      const data = await tenantService.getAll()
      setTenants(data)
    } catch (err) {
      setError('Không thể tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (tenant) => {
    setEditingTenant(tenant)
    setFormData({
      fullName: tenant.fullName || '',
      phone: tenant.phone || '',
      identityCard: tenant.identityCard || '',
      address: tenant.address || '',
      gender: tenant.gender || '',
      emergencyContact: tenant.emergencyContact || '',
      emergencyPhone: tenant.emergencyPhone || '',
    })
    setOpenDialog(true)
  }

  const closeDialog = () => {
    setOpenDialog(false)
    setEditingTenant(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editingTenant) return

    try {
      await tenantService.updateById(editingTenant.id, formData)
      closeDialog()
      loadTenants()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật khách hàng')
    }
  }

  const keyword = searchTerm.trim().toLowerCase()
  const filteredTenants = tenants.filter((tenant) => {
    if (!keyword) return true
    return (
      tenant.fullName?.toLowerCase().includes(keyword) ||
      tenant.email?.toLowerCase().includes(keyword) ||
      tenant.phone?.toLowerCase().includes(keyword) ||
      tenant.identityCard?.toLowerCase().includes(keyword) ||
      tenant.address?.toLowerCase().includes(keyword)
    )
  })

  useEffect(() => {
    setPage(0)
  }, [searchTerm])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredTenants.length / LIST_ROWS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [filteredTenants.length])

  const pagedTenants = filteredTenants.slice(
    page * LIST_ROWS_PER_PAGE,
    page * LIST_ROWS_PER_PAGE + LIST_ROWS_PER_PAGE
  )

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 2 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          color: '#fff',
          backgroundImage:
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Quản lý khách thuê
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Theo dõi thông tin khách hàng, dữ liệu liên hệ và hồ sơ cá nhân theo chuẩn nghiệp vụ.
        </Typography>
      </Paper>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Quản lý khách hàng</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Tìm kiếm khách hàng"
        placeholder="Tên, email, số điện thoại, CMND/CCCD..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredTenants.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có khách hàng nào</Paper>
        ) : (
          <Stack spacing={2}>
            {pagedTenants.map((tenant) => (
              <Card key={tenant.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{tenant.fullName}</Typography>
                  <Typography color="text.secondary">{tenant.email}</Typography>
                  <Typography color="text.secondary">SĐT: {tenant.phone}</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    CMND/CCCD: {tenant.identityCard || '-'}
                  </Typography>
                  <Typography variant="body2">Địa chỉ: {tenant.address || '-'}</Typography>
                  <Typography variant="body2">
                    Ngày tạo: {new Date(tenant.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => openEditDialog(tenant)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {filteredTenants.length > 0 && (
          <TablePagination
            component="div"
            count={filteredTenants.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={LIST_ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        )}
      </Box>

      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>CMND/CCCD</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Chưa có khách hàng nào
                </TableCell>
              </TableRow>
            ) : (
              pagedTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.fullName}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone}</TableCell>
                  <TableCell>{tenant.identityCard || '-'}</TableCell>
                  <TableCell>{tenant.address || '-'}</TableCell>
                  <TableCell>
                    {new Date(tenant.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => openEditDialog(tenant)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredTenants.length > 0 && (
          <TablePagination
            component="div"
            count={filteredTenants.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={LIST_ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        )}
      </TableContainer>

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Họ và tên"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="CMND/CCCD"
              value={formData.identityCard}
              onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Giới tính"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              margin="normal"
            >
              <MenuItem value="">Chọn giới tính</MenuItem>
              <MenuItem value="Male">Nam</MenuItem>
              <MenuItem value="Female">Nữ</MenuItem>
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
              label="SĐT liên hệ khẩn cấp"
              value={formData.emergencyPhone}
              onChange={(e) =>
                setFormData({ ...formData, emergencyPhone: e.target.value })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  )
}

export default TenantsPage
