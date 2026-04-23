import React, { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { invoiceService } from '../services/invoiceService'

const invoiceTypeLabel = (t) => (t === 'Deposit' ? 'Cọc phòng' : 'Hàng tháng')

const formatInvoicePeriod = (invoice) => {
  if (invoice.invoiceType === 'Deposit') return '—'
  return `${invoice.month}/${invoice.year}`
}

const getServiceFee = (invoice) => {
  if ((invoice.invoiceType || 'Monthly') !== 'Monthly') return 0
  const fee =
    Number(invoice.totalAmount || 0) -
    Number(invoice.roomRent || 0) -
    Number(invoice.electricityAmount || 0) -
    Number(invoice.waterAmount || 0)
  return fee > 0 ? fee : 0
}

const MyInvoicesPage = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await invoiceService.getMyInvoices()
      setInvoices(data)
    } catch (err) {
      setError('Không thể tải danh sách hóa đơn')
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
    <Container maxWidth="xl" sx={{ mt: 1, mb: 2 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          color: '#fff',
          backgroundImage:
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Hóa đơn của tôi
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Theo dõi hóa đơn thuê phòng, tình trạng thanh toán và hạn đến kỳ một cách rõ ràng.
        </Typography>
      </Paper>
      <Typography variant="h4" gutterBottom>
        Hóa đơn của tôi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {invoices.length === 0 ? (
        <Alert severity="info">Bạn chưa có hóa đơn nào</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loại</TableCell>
                <TableCell>Tháng/Năm</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Tiền phòng</TableCell>
                <TableCell>Tiền điện</TableCell>
                <TableCell>Tiền nước</TableCell>
                <TableCell>Tiền dịch vụ</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Hạn thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoiceTypeLabel(invoice.invoiceType || 'Monthly')}</TableCell>
                  <TableCell>{formatInvoicePeriod(invoice)}</TableCell>
                  <TableCell>{invoice.roomNumber}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(invoice.roomRent)} đ
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      invoice.electricityAmount
                    )}{' '}
                    đ
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      invoice.waterAmount
                    )}{' '}
                    đ
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(getServiceFee(invoice))} đ
                  </TableCell>
                  <TableCell>
                    <strong>
                      {new Intl.NumberFormat('vi-VN').format(
                        invoice.totalAmount
                      )}{' '}
                      đ
                    </strong>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        invoice.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'
                      }
                      color={invoice.status === 'Paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}

export default MyInvoicesPage
