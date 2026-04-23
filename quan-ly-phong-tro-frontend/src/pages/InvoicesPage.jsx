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
  Tooltip,
} from '@mui/material'
import { Add, CheckCircle, Edit, Delete, PictureAsPdf } from '@mui/icons-material'
import { invoiceService } from '../services/invoiceService'
import { contractService } from '../services/contractService'
import { exportInvoicePdfClient } from '../utils/pdfClient'

const invoiceTypeLabel = (t) => (t === 'Deposit' ? 'Cọc phòng' : 'Hàng tháng')

const formatInvoicePeriod = (invoice) => {
  if (invoice.invoiceType === 'Deposit') return '—'
  return `${invoice.month}/${invoice.year}`
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

const LIST_ROWS_PER_PAGE = 10

const getServiceFee = (invoice) => {
  if ((invoice.invoiceType || 'Monthly') !== 'Monthly') return 0
  const fee =
    Number(invoice.totalAmount || 0) -
    Number(invoice.roomRent || 0) -
    Number(invoice.electricityAmount || 0) -
    Number(invoice.waterAmount || 0)
  return fee > 0 ? fee : 0
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([])
  const [pendingInvoices, setPendingInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [openPayDialog, setOpenPayDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [contracts, setContracts] = useState([])
  const [formData, setFormData] = useState({
    contractId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [payData, setPayData] = useState({
    paymentMethod: 'Cash',
    notes: '',
  })
  const [editData, setEditData] = useState({
    roomRent: '',
    electricityAmount: '',
    waterAmount: '',
    dueDate: '',
  })
  const [page, setPage] = useState(0)

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
    if (!selectedInvoice) return
    try {
      await invoiceService.pay(selectedInvoice.id, {
        amount: Number(selectedInvoice.totalAmount),
        paymentMethod: payData.paymentMethod,
        notes: payData.notes,
      })
      setOpenPayDialog(false)
      setSelectedInvoice(null)
      setPayData({
        paymentMethod: 'Cash',
        notes: '',
      })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thanh toán')
    }
  }

  const handleExportInvoicePdf = async (invoice) => {
    try {
      exportInvoicePdfClient(invoice)
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Không thể xuất PDF hóa đơn')
    }
  }

  const openEditInvoiceDialog = (invoice) => {
    setSelectedInvoice(invoice)
    setEditData({
      roomRent: String(invoice.roomRent ?? 0),
      electricityAmount: String(invoice.electricityAmount ?? 0),
      waterAmount: String(invoice.waterAmount ?? 0),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
    })
    setOpenEditDialog(true)
  }

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return
    try {
      const payload = {
        dueDate: editData.dueDate || null,
      }

      if ((selectedInvoice.invoiceType || 'Monthly') === 'Monthly') {
        payload.roomRent = parseFloat(editData.roomRent || 0)
        payload.electricityAmount = parseFloat(editData.electricityAmount || 0)
        payload.waterAmount = parseFloat(editData.waterAmount || 0)
      }

      await invoiceService.update(selectedInvoice.id, payload)
      setOpenEditDialog(false)
      setSelectedInvoice(null)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hóa đơn')
    }
  }

  const handleDeleteInvoice = async (invoice) => {
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) return
    try {
      await invoiceService.delete(invoice.id)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa hóa đơn')
    }
  }

  const keyword = searchTerm.trim().toLowerCase()
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesKeyword =
      !keyword ||
      invoice.roomNumber?.toLowerCase().includes(keyword) ||
      invoice.tenantName?.toLowerCase().includes(keyword)
    const matchesType = typeFilter === 'all' || (invoice.invoiceType || 'Monthly') === typeFilter
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesMonth =
      monthFilter === 'all' ||
      (invoice.invoiceType !== 'Deposit' && String(invoice.month) === monthFilter)
    const matchesYear =
      yearFilter === 'all' ||
      (invoice.invoiceType !== 'Deposit' && String(invoice.year) === yearFilter)
    return matchesKeyword && matchesType && matchesStatus && matchesMonth && matchesYear
  })

  useEffect(() => {
    setPage(0)
  }, [searchTerm, typeFilter, statusFilter, monthFilter, yearFilter])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredInvoices.length / LIST_ROWS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [filteredInvoices.length])

  const pagedInvoices = filteredInvoices.slice(
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
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Quản lý hóa đơn
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Tạo hóa đơn định kỳ, xác nhận thanh toán và xử lý chứng từ PDF nhanh chóng.
        </Typography>
      </Paper>
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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Tìm kiếm hóa đơn"
          placeholder="Phòng, người thuê..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField select label="Loại" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="Monthly">Hàng tháng</MenuItem>
          <MenuItem value="Deposit">Cọc phòng</MenuItem>
        </TextField>
        <TextField select label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="Pending">Chưa thanh toán</MenuItem>
          <MenuItem value="Overdue">Quá hạn</MenuItem>
          <MenuItem value="Paid">Đã thanh toán</MenuItem>
        </TextField>
        <TextField select label="Tháng" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} sx={{ minWidth: 110 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <MenuItem key={m} value={String(m)}>{m}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Năm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} sx={{ minWidth: 120 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {Array.from(new Set(invoices.map((i) => i.year).filter(Boolean))).sort((a, b) => b - a).map((y) => (
            <MenuItem key={y} value={String(y)}>{y}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredInvoices.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có hóa đơn nào</Paper>
        ) : (
          <Stack spacing={2}>
            {pagedInvoices.map((invoice) => (
              <Card key={invoice.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    {formatInvoicePeriod(invoice)} - Phòng {invoice.roomNumber}{' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      ({invoiceTypeLabel(invoice.invoiceType || 'Monthly')})
                    </Typography>
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
                  <Typography variant="body2">
                    Tiền dịch vụ: {new Intl.NumberFormat('vi-VN').format(getServiceFee(invoice))} đ
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Tổng: <strong>{new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)} đ</strong>
                  </Typography>
                  <Typography variant="body2">
                    Hạn thanh toán: {formatDate(invoice.dueDate)}
                  </Typography>
                  <Typography variant="body2">
                    Ngày tạo: {formatDate(invoice.createdAt)}
                  </Typography>
                  <Typography
                    sx={{ mt: 1 }}
                    color={invoice.status === 'Paid' ? 'success.main' : 'error.main'}
                  >
                    {invoice.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Typography>
                  {invoice.status === 'Pending' && (
                    <Stack direction="column" spacing={1} sx={{ mt: 2, alignItems: 'flex-start' }}>
                      <Tooltip title="Thanh toán">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setPayData({
                              paymentMethod: 'Cash',
                              notes: '',
                            })
                            setOpenPayDialog(true)
                          }}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" onClick={() => openEditInvoiceDialog(invoice)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteInvoice(invoice)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                  {invoice.status === 'Paid' && (
                    <Stack direction="column" spacing={1} sx={{ mt: 2, alignItems: 'flex-start' }}>
                      <Tooltip title="In PDF">
                        <IconButton size="small" onClick={() => handleExportInvoicePdf(invoice)}>
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {filteredInvoices.length > 0 && (
          <TablePagination
            component="div"
            count={filteredInvoices.length}
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
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Loại</TableCell>
              <TableCell>Tháng/Năm</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Người thuê</TableCell>
              <TableCell>Tiền phòng</TableCell>
              <TableCell>Tiền điện</TableCell>
              <TableCell>Tiền nước</TableCell>
              <TableCell>Tiền dịch vụ</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Hạn thanh toán</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  Chưa có hóa đơn nào
                </TableCell>
              </TableRow>
            ) : (
              pagedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoiceTypeLabel(invoice.invoiceType || 'Monthly')}</TableCell>
                  <TableCell>{formatInvoicePeriod(invoice)}</TableCell>
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
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.createdAt)}</TableCell>
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
                    <Stack direction="column" spacing={1} alignItems="flex-end">
                      {invoice.status === 'Paid' && (
                        <Tooltip title="In PDF">
                          <IconButton size="small" onClick={() => handleExportInvoicePdf(invoice)}>
                            <PictureAsPdf fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {invoice.status === 'Pending' && (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setPayData({
                                paymentMethod: 'Cash',
                                notes: '',
                              })
                              setOpenPayDialog(true)
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                          <Tooltip title="Sửa">
                            <IconButton size="small" onClick={() => openEditInvoiceDialog(invoice)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteInvoice(invoice)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredInvoices.length > 0 && (
          <TablePagination
            component="div"
            count={filteredInvoices.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={LIST_ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        )}
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
          <TextField
            fullWidth
            label="Số tiền thanh toán"
            value={
              selectedInvoice
                ? `${new Intl.NumberFormat('vi-VN').format(selectedInvoice.totalAmount)} đ`
                : ''
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

      {/* Edit Invoice Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa hóa đơn</DialogTitle>
        <DialogContent>
          {selectedInvoice && (selectedInvoice.invoiceType || 'Monthly') === 'Monthly' && (
            <>
              <TextField
                fullWidth
                label="Tiền phòng"
                type="number"
                value={editData.roomRent}
                onChange={(e) => setEditData({ ...editData, roomRent: e.target.value })}
                margin="normal"
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Tiền điện"
                type="number"
                value={editData.electricityAmount}
                onChange={(e) => setEditData({ ...editData, electricityAmount: e.target.value })}
                margin="normal"
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Tiền nước"
                type="number"
                value={editData.waterAmount}
                onChange={(e) => setEditData({ ...editData, waterAmount: e.target.value })}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </>
          )}
          <TextField
            fullWidth
            label="Hạn thanh toán"
            type="date"
            value={editData.dueDate}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdateInvoice} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default InvoicesPage
