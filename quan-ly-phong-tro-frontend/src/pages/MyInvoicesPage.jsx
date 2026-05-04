import React, { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material'
import { PaymentsOutlined } from '@mui/icons-material'
import bankTransferQrImage from '../image/Thanhtoannganhang.jpg'
import vnPayQrImage from '../image/thanhtoanvidientu.jpg'
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

const statusChip = (invoice) => {
  if (invoice.status === 'Paid') {
    return <Chip label="Đã thanh toán" color="success" size="small" />
  }
  if (invoice.status === 'Overdue') {
    return <Chip label="Quá hạn" color="error" size="small" variant="outlined" />
  }
  return <Chip label="Chưa thanh toán" color="warning" size="small" variant="outlined" />
}

const MyInvoicesPage = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openPayDialog, setOpenPayDialog] = useState(false)
  const [openQrDialog, setOpenQrDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [payData, setPayData] = useState({
    paymentMethod: 'BankTransfer',
    notes: '',
  })

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

  const openPay = (invoice) => {
    setSelectedInvoice(invoice)
    setPayData({ paymentMethod: 'BankTransfer', notes: '' })
    setOpenPayDialog(true)
  }

  const handlePay = async () => {
    if (!selectedInvoice) return
    try {
      await invoiceService.pay(selectedInvoice.id, {
        amount: Number(selectedInvoice.totalAmount),
        paymentMethod: payData.paymentMethod,
        notes: payData.notes,
      })
      setOpenPayDialog(false)
      setOpenQrDialog(false)
      setSelectedInvoice(null)
      setPayData({ paymentMethod: 'BankTransfer', notes: '' })
      await loadInvoices()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thanh toán')
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return
    if (payData.paymentMethod === 'BankTransfer' || payData.paymentMethod === 'VnPay') {
      setOpenQrDialog(true)
      return
    }
    await handlePay()
  }

  const getQrPaymentImage = () => {
    if (payData.paymentMethod === 'BankTransfer') return bankTransferQrImage
    if (payData.paymentMethod === 'VnPay') return vnPayQrImage
    return null
  }

  const getQrPaymentTitle = () => {
    if (payData.paymentMethod === 'BankTransfer') return 'Quét mã chuyển khoản ngân hàng'
    if (payData.paymentMethod === 'VnPay') return 'Quét mã thanh toán VNPay'
    return 'Thanh toán'
  }

  const canPayOnline = (invoice) => invoice.status !== 'Paid'

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Đang tải hóa đơn…</Typography>
        </Stack>
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
          Theo dõi hóa đơn thuê phòng và thanh toán online (VNPay / chuyển khoản giả lập).
        </Typography>
      </Paper>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
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
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>Loại</TableCell>
                <TableCell>Tháng/Năm</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell align="right">Tiền phòng</TableCell>
                <TableCell align="right">Tiền điện</TableCell>
                <TableCell align="right">Tiền nước</TableCell>
                <TableCell align="right">Tiền dịch vụ</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell>Hạn thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thanh toán</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoiceTypeLabel(invoice.invoiceType || 'Monthly')}</TableCell>
                  <TableCell>{formatInvoicePeriod(invoice)}</TableCell>
                  <TableCell>{invoice.roomNumber}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN').format(invoice.roomRent)} đ
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN').format(invoice.electricityAmount)} đ
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN').format(invoice.waterAmount)} đ
                  </TableCell>
                  <TableCell align="right">{new Intl.NumberFormat('vi-VN').format(getServiceFee(invoice))} đ</TableCell>
                  <TableCell align="right">
                    <strong>{new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)} đ</strong>
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{statusChip(invoice)}</TableCell>
                  <TableCell align="center">
                    {canPayOnline(invoice) ? (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PaymentsOutlined />}
                        onClick={() => openPay(invoice)}
                        sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        Thanh toán
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openPayDialog} onClose={() => setOpenPayDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thanh toán hóa đơn</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Số tiền thanh toán"
            value={
              selectedInvoice ? `${new Intl.NumberFormat('vi-VN').format(selectedInvoice.totalAmount)} đ` : ''
            }
            margin="normal"
            InputProps={{ readOnly: true }}
            helperText="Thanh toán đủ theo tổng hóa đơn."
          />
          <TextField
            select
            fullWidth
            label="Phương thức thanh toán"
            value={payData.paymentMethod}
            onChange={(e) => setPayData({ ...payData, paymentMethod: e.target.value })}
            margin="normal"
            required
          >
            <MenuItem value="BankTransfer">Chuyển khoản (QR giả lập)</MenuItem>
            <MenuItem value="VnPay">VNPay (QR giả lập)</MenuItem>
            <MenuItem value="Other">Khác</MenuItem>
          </TextField>
          {(payData.paymentMethod === 'BankTransfer' || payData.paymentMethod === 'VnPay') && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Chọn &quot;Xác nhận thanh toán&quot; để mở mã QR và dùng nút &quot;Tôi đã thanh toán&quot; để giả lập giao dịch
              thành công.
            </Alert>
          )}
          <TextField
            fullWidth
            label="Ghi chú (tùy chọn)"
            multiline
            rows={2}
            value={payData.notes}
            onChange={(e) => setPayData({ ...payData, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayDialog(false)}>Hủy</Button>
          <Button onClick={handleConfirmPayment} variant="contained" color="success">
            Xác nhận thanh toán
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{getQrPaymentTitle()}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Số tiền: {selectedInvoice ? new Intl.NumberFormat('vi-VN').format(selectedInvoice.totalAmount) : 0} đ
            </Typography>
            {getQrPaymentImage() && (
              <Box
                component="img"
                src={getQrPaymentImage()}
                alt="Mã QR thanh toán"
                sx={{
                  width: '100%',
                  maxWidth: 320,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}
            
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Đóng</Button>
          <Button onClick={handlePay} variant="contained" color="success">
            Tôi đã thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyInvoicesPage
