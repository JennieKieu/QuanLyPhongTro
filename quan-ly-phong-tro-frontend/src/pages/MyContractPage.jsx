import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Divider,
} from '@mui/material'
import { contractService } from '../services/contractService'

const MyContractPage = () => {
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContract()
  }, [])

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await contractService.getMyContract()
      setContract(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Bạn chưa có hợp đồng đang hoạt động')
      } else {
        setError('Không thể tải thông tin hợp đồng')
      }
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">{error}</Alert>
      </Container>
    )
  }

  if (!contract) {
    return null
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Hợp đồng của tôi
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Số hợp đồng
          </Typography>
          <Typography variant="body1">{contract.contractNumber || '-'}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Phòng
          </Typography>
          <Typography variant="body1">{contract.roomNumber}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Ngày bắt đầu
          </Typography>
          <Typography variant="body1">
            {new Date(contract.startDate).toLocaleDateString('vi-VN')}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Ngày kết thúc
          </Typography>
          <Typography variant="body1">
            {new Date(contract.endDate).toLocaleDateString('vi-VN')}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Giá thuê hàng tháng
          </Typography>
          <Typography variant="body1">
            {new Intl.NumberFormat('vi-VN').format(contract.monthlyRent)} đ
          </Typography>
        </Box>

        {contract.deposit && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Tiền cọc
            </Typography>
            <Typography variant="body1">
              {new Intl.NumberFormat('vi-VN').format(contract.deposit)} đ
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Trạng thái
          </Typography>
          <Typography
            variant="body1"
            color={
              contract.status === 'Active'
                ? 'success.main'
                : contract.status === 'Pending'
                ? 'warning.main'
                : 'error.main'
            }
          >
            {contract.status === 'Active'
              ? 'Đang hoạt động'
              : contract.status === 'Pending'
              ? 'Chờ duyệt'
              : contract.status}
          </Typography>
        </Box>

        {contract.terms && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Điều khoản
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {contract.terms}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default MyContractPage
