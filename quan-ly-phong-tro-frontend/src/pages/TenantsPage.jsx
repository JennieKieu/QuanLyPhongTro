import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material'
import { tenantService } from '../services/tenantService'

const TenantsPage = () => {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Quản lý khách hàng</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {tenants.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có khách hàng nào</Paper>
        ) : (
          <Stack spacing={2}>
            {tenants.map((tenant) => (
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
                </CardContent>
              </Card>
            ))}
          </Stack>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Chưa có khách hàng nào
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.fullName}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone}</TableCell>
                  <TableCell>{tenant.identityCard || '-'}</TableCell>
                  <TableCell>{tenant.address || '-'}</TableCell>
                  <TableCell>
                    {new Date(tenant.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}

export default TenantsPage
