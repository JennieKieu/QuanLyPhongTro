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
  Paper,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material'
import { Add, CheckCircle } from '@mui/icons-material'
import { invoiceService } from '../services/invoiceService'
import { contractService } from '../services/contractService'

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([])
  const [pendingInvoices, setPendingInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openPayDialog, setOpenPayDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [contracts, setContracts] = useState([])
  const [formData, setFormData] = useState({
    contractId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [payData, setPayData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [invoicesData, pendingData, contractsData] = await Promise.all([
        invoiceService.getAll(),
        invoiceService.getPending(),
        contractService.getActive(),
      ])
      setInvoices(invoicesData)
      setPendingInvoices(pendingData)
      setContracts(contractsData)
    } catch (err) {
      setError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      await invoiceService.generate({
        contractId: parseInt(formData.contractId),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
      })
      setOpenDialog(false)
      setFormData({
        contractId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo hóa đơn')
    }
  }

  const handlePay = async () => {
    try {
      await invoiceService.pay(selectedInvoice.id, {
        amount: parseFloat(payData.amount),
        paymentMethod: payData.paymentMethod,
        notes: payData.notes,
      })
      setOpenPayDialog(false)
      setSelectedInvoice(null)
      setPayData({
        amount: '',
        paymentMethod: 'Cash',
        notes: '',
      })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thanh toán')
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4">Quản lý hóa đơn</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Tạo hóa đơn
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {pendingInvoices.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Có {pendingInvoices.length} hóa đơn chưa thanh toán
        </Alert>
      )}

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {invoices.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có hóa đơn nào</Paper>
        ) : (
          <Stack spacing={2}>
            {invoices.map((invoice) => (
              <Card key={invoice.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    {invoice.month}/{invoice.year} - Phòng {invoice.roomNumber}
                  </Typography>
                  <Typography color="text.secondary">
                    Người thuê: {invoice.tenantName}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    Tiền phòng: {new Intl.NumberFormat('vi-VN').format(invoice.roomRent)} đ
                  </Typography>
                  <Typography variant="body2">
                    Tiền điện: {new Intl.NumberFormat('vi-VN').format(invoice.electricityAmount)} đ
                  </Typography>
                  <Typography variant="body2">
                    Tiền nước: {new Intl.NumberFormat('vi-VN').format(invoice.waterAmount)} đ
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Tổng: <strong>{new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)} đ</strong>
                  </Typography>
                  <Typography
                    sx={{ mt: 1 }}
                    color={invoice.status === 'Paid' ? 'success.main' : 'error.main'}
                  >
                    {invoice.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Typography>
                  {invoice.status === 'Pending' && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        color="success"
                        variant="outlined"
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setPayData({
                            amount: invoice.totalAmount.toString(),
                            paymentMethod: 'Cash',
                            notes: '',
                          })
                          setOpenPayDialog(true)
                        }}
                      >
                        Thanh toán
                      </Button>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tháng/Năm</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Người thuê</TableCell>
              <TableCell>Tiền phòng</TableCell>
              <TableCell>Tiền điện</TableCell>
              <TableCell>Tiền nước</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Chưa có hóa đơn nào
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {invoice.month}/{invoice.year}
                  </TableCell>
                  <TableCell>{invoice.roomNumber}</TableCell>
                  <TableCell>{invoice.tenantName}</TableCell>
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
                    <strong>
                      {new Intl.NumberFormat('vi-VN').format(
                        invoice.totalAmount
                      )}{' '}
                      đ
                    </strong>
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={
                        invoice.status === 'Paid'
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {invoice.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {invoice.status === 'Pending' && (
                      <IconButton
                        color="success"
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setPayData({
                            amount: invoice.totalAmount.toString(),
                            paymentMethod: 'Cash',
                            notes: '',
                          })
                          setOpenPayDialog(true)
                        }}
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleGenerate}>
          <DialogTitle>Tạo hóa đơn</DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Hợp đồng"
              value={formData.contractId}
              onChange={(e) =>
                setFormData({ ...formData, contractId: e.target.value })
              }
              margin="normal"
              required
            >
              {contracts.map((contract) => (
                <MenuItem key={contract.id} value={contract.id}>
                  {contract.roomNumber} - {contract.tenantName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Tháng"
              type="number"
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              margin="normal"
              inputProps={{ min: 1, max: 12 }}
              required
            />
            <TextField
              fullWidth
              label="Năm"
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Tạo
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog
        open={openPayDialog}
        onClose={() => setOpenPayDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thanh toán hóa đơn</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tổng tiền:{' '}
                {new Intl.NumberFormat('vi-VN').format(
                  selectedInvoice.totalAmount
                )}{' '}
                đ
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Số tiền thanh toán"
            type="number"
            value={payData.amount}
            onChange={(e) =>
              setPayData({ ...payData, amount: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            select
            fullWidth
            label="Phương thức thanh toán"
            value={payData.paymentMethod}
            onChange={(e) =>
              setPayData({ ...payData, paymentMethod: e.target.value })
            }
            margin="normal"
            required
          >
            <MenuItem value="Cash">Tiền mặt</MenuItem>
            <MenuItem value="BankTransfer">Chuyển khoản</MenuItem>
            <MenuItem value="Other">Khác</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Ghi chú"
            multiline
            rows={2}
            value={payData.notes}
            onChange={(e) =>
              setPayData({ ...payData, notes: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayDialog(false)}>Hủy</Button>
          <Button onClick={handlePay} variant="contained" color="success">
            Xác nhận thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default InvoicesPage
