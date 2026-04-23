import React, { useState, useEffect, useMemo } from 'react'
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
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material'
import {
  Check,
  Close,
  Add,
  Visibility,
  PictureAsPdf,
  Autorenew,
  EventBusy,
  Savings,
} from '@mui/icons-material'
import { contractService } from '../services/contractService'
import { tenantService } from '../services/tenantService'
import { roomService } from '../services/roomService'
import { exportContractPdfClient } from '../utils/pdfClient'

const statusLabel = (status) => {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Pending') return 'Chờ duyệt'
  if (status === 'AwaitingDeposit') return 'Chờ thu cọc'
  if (status === 'Expired') return 'Hết hạn'
  if (status === 'Terminated') return 'Đã chấm dứt'
  if (status === 'Rejected') return 'Từ chối'
  return status
}

const canRecordDepositRefund = (contract) =>
  (contract.status === 'Expired' || contract.status === 'Terminated') &&
  Number(contract.depositPaid || 0) > 0 &&
  !contract.depositRefundedAt

/** Tab danh sách hợp đồng (không còn lọc trạng thái riêng). */
const CONTRACT_TAB = {
  ALL: 0,
  PENDING: 1,
  AWAITING_DEPOSIT: 2,
  ACTIVE: 3,
  EXPIRING: 4,
  EXPIRED: 5,
  TERMINATED: 6,
  REJECTED: 7,
}

/** YYYY-MM-DD + số tháng → YYYY-MM-DD (tránh lệch múi giờ) */
const addMonthsToIsoDate = (isoDate, months) => {
  if (!isoDate || !months || months < 1) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  start.setMonth(start.getMonth() + months)
  const yy = start.getFullYear()
  const mm = String(start.getMonth() + 1).padStart(2, '0')
  const dd = String(start.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** Thời hạn hợp đồng (tháng): theo phòng hoặc mặc định 12 nếu chưa cấu hình. */
const leaseMonthsForRoom = (room) => {
  if (!room) return 12
  const m = Number(room.minLeaseMonths)
  return m > 0 ? m : 12
}

const LIST_ROWS_PER_PAGE = 10

/** Ngày tối thiểu cho input type="date" (theo giờ máy người dùng). */
const localDateInputToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const ContractsPage = () => {
  const [tab, setTab] = useState(0)
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [openDialog, setOpenDialog] = useState(false)
  const [openApproveDialog, setOpenApproveDialog] = useState(false)
  const [openExtendDialog, setOpenExtendDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [detailContract, setDetailContract] = useState(null)
  const [selectedContract, setSelectedContract] = useState(null)
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [optionsLoaded, setOptionsLoaded] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [formData, setFormData] = useState({
    roomId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    terms: '',
    notes: '',
    contractNumber: '',
  })
  const [approveData, setApproveData] = useState({
    monthlyRent: '',
  })
  const [extendData, setExtendData] = useState({ extendMonths: 1 })
  const [openRefundDialog, setOpenRefundDialog] = useState(false)
  const [refundTarget, setRefundTarget] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundNotes, setRefundNotes] = useState('')
  const [openTerminateDialog, setOpenTerminateDialog] = useState(false)
  const [terminateTargetId, setTerminateTargetId] = useState(null)
  const [terminateReason, setTerminateReason] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    loadData()
  }, [tab])

  useEffect(() => {
    if (openDialog) {
      loadOptions()
    }
  }, [openDialog])

  const loadData = async () => {
    try {
      setLoading(true)
      let data = []
      if (tab === CONTRACT_TAB.ALL) {
        data = await contractService.getAll()
      } else if (tab === CONTRACT_TAB.PENDING) {
        data = await contractService.getPending()
      } else if (tab === CONTRACT_TAB.AWAITING_DEPOSIT) {
        data = await contractService.getAwaitingDeposit()
      } else if (tab === CONTRACT_TAB.ACTIVE) {
        data = await contractService.getActive()
      } else if (tab === CONTRACT_TAB.EXPIRING) {
        data = await contractService.getExpiringSoon(30)
      } else {
        const all = await contractService.getAll()
        const want =
          tab === CONTRACT_TAB.EXPIRED
            ? 'Expired'
            : tab === CONTRACT_TAB.TERMINATED
            ? 'Terminated'
            : 'Rejected'
        data = all.filter((c) => c.status === want)
      }
      setContracts(data)
    } catch (err) {
      setError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const loadOptions = async () => {
    if (optionsLoaded || optionsLoading) return
    try {
      setOptionsLoading(true)
      const [tenantsData, roomsData] = await Promise.all([
        tenantService.getAll(),
        roomService.getAvailable(),
      ])
      setTenants(tenantsData)
      setRooms(roomsData)
      setOptionsLoaded(true)
    } catch (err) {
      setError('Không thể tải danh sách phòng/người thuê')
    } finally {
      setOptionsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedContract) return
    const hadDeposit = Number(selectedContract.deposit || 0) > 0
    try {
      await contractService.approve(selectedContract.id, {
        monthlyRent: parseFloat(approveData.monthlyRent),
      })
      setOpenApproveDialog(false)
      setSelectedContract(null)
      setError('')
      setSuccessMessage(
        hadDeposit
          ? 'Đã duyệt. Hệ thống đã tạo hóa đơn cọc — vào Quản lý hóa đơn để xác nhận thanh toán.'
          : 'Đã duyệt hợp đồng.'
      )
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt hợp đồng')
    }
  }

  const handleOpenDetailDialog = (contract) => {
    setDetailContract(contract)
    setOpenDetailDialog(true)
  }

  const handleExportContractPdf = async (contract) => {
    if (!contract || contract.status !== 'Active') return
    try {
      exportContractPdfClient(contract)
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Không thể xuất PDF hợp đồng')
    }
  }

  const handleOpenExtendDialog = (contract) => {
    setSelectedContract(contract)
    setExtendData({ extendMonths: 1 })
    setOpenExtendDialog(true)
  }

  const handleExtend = async () => {
    if (!selectedContract) return
    try {
      await contractService.extend(selectedContract.id, {
        extendMonths: parseInt(extendData.extendMonths, 10),
      })
      setOpenExtendDialog(false)
      setSelectedContract(null)
      setSuccessMessage('Gia hạn hợp đồng thành công.')
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gia hạn hợp đồng')
    }
  }

  const openTerminateLandlordDialog = (contractId) => {
    setTerminateTargetId(contractId)
    setTerminateReason('')
    setOpenTerminateDialog(true)
  }

  const submitTerminateLandlord = async () => {
    const id = terminateTargetId
    if (id == null) return
    const reason = terminateReason.trim()
    if (!reason) {
      setError('Vui lòng nhập lý do chấm dứt hợp đồng.')
      return
    }
    try {
      await contractService.terminate(id, { reason })
      setOpenTerminateDialog(false)
      setTerminateTargetId(null)
      setTerminateReason('')
      setSuccessMessage(
        'Đã chấm dứt hợp đồng. Nếu đã thu cọc, vui lòng ghi nhận hoàn cọc cho khách khi đã bàn giao phòng.'
      )
      loadData()
      if (detailContract && detailContract.id === id) {
        setOpenDetailDialog(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể chấm dứt hợp đồng')
    }
  }

  const openRefundDialogFor = (contract) => {
    setRefundTarget(contract)
    const max = Number(contract.depositPaid || 0)
    const existing =
      contract.depositRefundedAt != null ? Number(contract.depositRefundedAmount ?? 0) : max
    setRefundAmount(String(existing))
    setRefundNotes(contract.depositRefundNotes || '')
    setOpenRefundDialog(true)
  }

  const handleSubmitRefund = async () => {
    if (!refundTarget) return
    const amt = parseFloat(String(refundAmount).replace(',', '.'))
    if (Number.isNaN(amt) || amt < 0) {
      setError('Nhập số tiền hoàn hợp lệ (≥ 0).')
      return
    }
    const max = Number(refundTarget.depositPaid || 0)
    if (amt > max) {
      setError(`Số tiền hoàn không được vượt quá cọc đã thu (${new Intl.NumberFormat('vi-VN').format(max)} đ).`)
      return
    }
    const targetId = refundTarget.id
    try {
      await contractService.recordDepositRefund(targetId, {
        refundedAmount: amt,
        notes: refundNotes.trim() || undefined,
      })
      setOpenRefundDialog(false)
      setRefundTarget(null)
      setSuccessMessage('Đã ghi nhận hoàn cọc.')
      loadData()
      if (detailContract && detailContract.id === targetId) {
        setOpenDetailDialog(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể ghi nhận hoàn cọc')
    }
  }

  /** @returns {'ok'|'cancel'|'error'} */
  const handleReject = async (id) => {
    if (!window.confirm('Bạn có chắc muốn từ chối hợp đồng này?')) {
      return 'cancel'
    }
    try {
      await contractService.reject(id)
      loadData()
      return 'ok'
    } catch (err) {
      setError('Không thể từ chối hợp đồng')
      return 'error'
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const selectedRoom = rooms.find(
        (room) => room.id === parseInt(formData.roomId, 10)
      )
      const depositAmount = selectedRoom?.depositAmount ?? null
      const minStart = localDateInputToday()
      if (formData.startDate < minStart) {
        setError('Ngày bắt đầu thuê không được trước ngày hiện tại.')
        return
      }
      if (
        selectedRoom?.minLeaseMonths &&
        formData.startDate &&
        formData.endDate
      ) {
        const minEnd = new Date(formData.startDate)
        minEnd.setMonth(minEnd.getMonth() + Number(selectedRoom.minLeaseMonths))
        const endDateCheck = new Date(formData.endDate)
        if (endDateCheck < minEnd) {
          setError(
            `Thời gian thuê là ${selectedRoom.minLeaseMonths} tháng.`
          )
          return
        }
      }
      await contractService.create({
        roomId: parseInt(formData.roomId, 10),
        tenantId: parseInt(formData.tenantId, 10),
        startDate: formData.startDate,
        endDate: formData.endDate,
        monthlyRent: parseFloat(formData.monthlyRent),
        deposit: depositAmount,
        terms: formData.terms.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        contractNumber: formData.contractNumber.trim() || undefined,
      })
      const hadDeposit = depositAmount != null && Number(depositAmount) > 0
      setOpenDialog(false)
      setFormData({
        roomId: '',
        tenantId: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        terms: '',
        notes: '',
        contractNumber: '',
      })
      setError('')
      setSuccessMessage(
        hadDeposit
          ? 'Đã tạo hợp đồng và hóa đơn cọc. Vào Quản lý hóa đơn để xác nhận thanh toán.'
          : 'Đã tạo hợp đồng.'
      )
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo hợp đồng')
    }
  }

  const sortedContracts = useMemo(
    () =>
      [...contracts].sort((a, b) => {
        const aTime = new Date(a.createdAt || a.startDate).getTime()
        const bTime = new Date(b.createdAt || b.startDate).getTime()
        return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime
      }),
    [contracts, sortOrder]
  )

  useEffect(() => {
    setPage(0)
  }, [tab, sortOrder])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(sortedContracts.length / LIST_ROWS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [sortedContracts.length])

  const pagedContracts = sortedContracts.slice(
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

  /** Tab Tất cả / Chờ duyệt: duyệt & từ chối cho Pending */
  const showPendingContractActions =
    tab === CONTRACT_TAB.PENDING || tab === CONTRACT_TAB.ALL
  /** Tab Tất cả / Đang HĐ / Sắp hết hạn: gia hạn cho Active (API chỉ yêu cầu Active) */
  const showExtendContractActions =
    tab === CONTRACT_TAB.EXPIRING ||
    tab === CONTRACT_TAB.ALL ||
    tab === CONTRACT_TAB.ACTIVE
  const showTerminateAction =
    tab === CONTRACT_TAB.ALL ||
    tab === CONTRACT_TAB.ACTIVE ||
    tab === CONTRACT_TAB.EXPIRING
  const hasActionColumn = true

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 2 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          color: '#fff',
          backgroundImage:
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Quản lý hợp đồng
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Duyệt hợp đồng, theo dõi cọc, gia hạn hoặc chấm dứt theo từng trạng thái nghiệp vụ.
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
        <Typography variant="h4">Quản lý hợp đồng</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Tạo hợp đồng
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Tất cả" />
        <Tab label="Chờ duyệt" />
        <Tab label="Chờ thu cọc" />
        <Tab label="Đang hoạt động" />
        <Tab label="Sắp hết hạn (30 ngày)" />
        <Tab label="Hết hạn" />
        <Tab label="Đã chấm dứt" />
        <Tab label="Từ chối" />
      </Tabs>
      <TextField
        select
        fullWidth
        label="Sắp xếp theo ngày"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        size="small"
        sx={{ mb: 2, maxWidth: { xs: '100%', sm: 280 } }}
      >
        <MenuItem value="newest">Mới đến cũ</MenuItem>
        <MenuItem value="oldest">Cũ đến mới</MenuItem>
      </TextField>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {sortedContracts.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có hợp đồng nào</Paper>
        ) : (
          <Stack spacing={2}>
            {pagedContracts.map((contract) => (
              <Card key={contract.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{contract.contractNumber || 'Hợp đồng'}</Typography>
                  <Typography color="text.secondary">Phòng: {contract.roomNumber}</Typography>
                  <Typography color="text.secondary">Người thuê: {contract.tenantName}</Typography>
                  <Typography color="text.secondary">SĐT: {contract.tenantPhone || '-'}</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    Bắt đầu: {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </Typography>
                  <Typography variant="body2">
                    Kết thúc: {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                  </Typography>
                  <Typography variant="body2">
                    Giá thuê: {new Intl.NumberFormat('vi-VN').format(contract.monthlyRent)} đ
                  </Typography>
                  {contract.deposit != null && contract.deposit > 0 && (
                    <Typography variant="body2">
                      Tiền cọc: {new Intl.NumberFormat('vi-VN').format(contract.deposit)} đ
                      {contract.depositPaid > 0 && (
                        <> (đã thu: {new Intl.NumberFormat('vi-VN').format(contract.depositPaid)} đ)</>
                      )}
                    </Typography>
                  )}
                  <Typography
                    sx={{ mt: 1 }}
                    color={
                      contract.status === 'Active'
                        ? 'success.main'
                        : contract.status === 'Pending'
                        ? 'warning.main'
                        : contract.status === 'AwaitingDeposit'
                        ? 'info.main'
                        : 'error.main'
                    }
                  >
                    {statusLabel(contract.status)}
                  </Typography>
                  {hasActionColumn && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}
                    >
                      <Tooltip title="Chi tiết">
                        <IconButton size="small" onClick={() => handleOpenDetailDialog(contract)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {contract.status === 'Active' && (
                        <Tooltip title="In PDF">
                          <IconButton size="small" onClick={() => handleExportContractPdf(contract)}>
                            <PictureAsPdf fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {showTerminateAction && contract.status === 'Active' && (
                        <Tooltip title="Chấm dứt hợp đồng (có lý do)">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => openTerminateLandlordDialog(contract.id)}
                          >
                            <EventBusy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canRecordDepositRefund(contract) && (
                        <Tooltip title="Ghi nhận hoàn cọc">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => openRefundDialogFor(contract)}
                          >
                            <Savings fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {showPendingContractActions && contract.status === 'Pending' && (
                        <>
                          <Tooltip title="Duyệt">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedContract(contract)
                                setApproveData({
                                  monthlyRent: contract.monthlyRent.toString(),
                                })
                                setOpenApproveDialog(true)
                              }}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(contract.id)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {contract.status === 'AwaitingDeposit' && (
                        <Tooltip title="Từ chối / hủy (hoàn phòng)">
                          <IconButton size="small" color="error" onClick={() => handleReject(contract.id)}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {showExtendContractActions && contract.status === 'Active' && (
                        <Tooltip title="Gia hạn">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenExtendDialog(contract)}
                          >
                            <Autorenew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {sortedContracts.length > 0 && (
          <TablePagination
            component="div"
            count={sortedContracts.length}
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
              <TableCell>Số hợp đồng</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Người thuê</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Giá thuê/tháng</TableCell>
              <TableCell>Tiền cọc</TableCell>
              <TableCell>Trạng thái</TableCell>
              {hasActionColumn && <TableCell align="right">Thao tác</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedContracts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasActionColumn ? 9 : 8}
                  align="center"
                >
                  Chưa có hợp đồng nào
                </TableCell>
              </TableRow>
            ) : (
              pagedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contractNumber || '-'}</TableCell>
                  <TableCell>{contract.roomNumber}</TableCell>
                  <TableCell>{contract.tenantName}</TableCell>
                  <TableCell>{contract.tenantPhone || '-'}</TableCell>
                  <TableCell>
                    {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      contract.monthlyRent
                    )}{' '}
                    đ
                  </TableCell>
                  <TableCell>
                    {contract.deposit != null && contract.deposit > 0
                      ? `${new Intl.NumberFormat('vi-VN').format(contract.deposit)} đ`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={
                        contract.status === 'Active'
                          ? 'success.main'
                          : contract.status === 'Pending'
                          ? 'warning.main'
                          : contract.status === 'AwaitingDeposit'
                          ? 'info.main'
                          : 'error.main'
                      }
                    >
                      {statusLabel(contract.status)}
                    </Typography>
                  </TableCell>
                  {hasActionColumn && (
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', rowGap: 1 }}
                      >
                        <Tooltip title="Chi tiết">
                          <IconButton size="small" onClick={() => handleOpenDetailDialog(contract)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {contract.status === 'Active' && (
                          <Tooltip title="In PDF">
                            <IconButton size="small" onClick={() => handleExportContractPdf(contract)}>
                              <PictureAsPdf fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {showTerminateAction && contract.status === 'Active' && (
                          <Tooltip title="Chấm dứt hợp đồng (có lý do)">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => openTerminateLandlordDialog(contract.id)}
                            >
                              <EventBusy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canRecordDepositRefund(contract) && (
                          <Tooltip title="Ghi nhận hoàn cọc">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => openRefundDialogFor(contract)}
                            >
                              <Savings fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {showPendingContractActions && contract.status === 'Pending' && (
                          <>
                            <Tooltip title="Duyệt">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedContract(contract)
                                  setApproveData({
                                    monthlyRent: contract.monthlyRent.toString(),
                                  })
                                  setOpenApproveDialog(true)
                                }}
                              >
                                <Check fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Từ chối">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(contract.id)}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {contract.status === 'AwaitingDeposit' && (
                          <Tooltip title="Từ chối / hủy (hoàn phòng)">
                            <IconButton size="small" color="error" onClick={() => handleReject(contract.id)}>
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {showExtendContractActions && contract.status === 'Active' && (
                          <Tooltip title="Gia hạn">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenExtendDialog(contract)}
                            >
                              <Autorenew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {sortedContracts.length > 0 && (
          <TablePagination
            component="div"
            count={sortedContracts.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={LIST_ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        )}
      </TableContainer>

      {/* Create Dialog — luồng chủ trọ: AwaitingDeposit nếu có cọc phòng, Active nếu không */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreate}>
          <DialogTitle>Tạo hợp đồng (chủ trọ)</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
              Hợp đồng tạo từ đây không qua &quot;Chờ duyệt&quot;. Nếu phòng có tiền cọc, hệ thống tự tạo hóa đơn cọc,
              trạng thái <strong>Chờ thu cọc</strong> cho đến khi thanh toán đủ trên Quản lý hóa đơn. Không có cọc thì
              hợp đồng <strong>Đang hoạt động</strong> ngay.
            </Alert>
            <TextField
              select
              fullWidth
              label="Phòng"
              value={formData.roomId}
              onChange={(e) => {
                const roomIdStr = e.target.value
                const room = rooms.find((r) => r.id === parseInt(roomIdStr, 10))
                setFormData((prev) => {
                  const next = {
                    ...prev,
                    roomId: roomIdStr,
                    monthlyRent: room ? String(room.monthlyRent) : prev.monthlyRent,
                  }
                  if (room && prev.startDate) {
                    next.endDate = addMonthsToIsoDate(
                      prev.startDate,
                      leaseMonthsForRoom(room)
                    )
                  } else {
                    next.endDate = ''
                  }
                  return next
                })
              }}
              margin="normal"
              required
              disabled={optionsLoading}
            >
              {rooms.length === 0 && !optionsLoading ? (
                <MenuItem value="" disabled>
                  Không có phòng trống
                </MenuItem>
              ) : (
                rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.roomNumber} — {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ/tháng
                  </MenuItem>
                ))
              )}
            </TextField>
            {formData.roomId && (
              <Stack spacing={0.5} sx={{ mt: 0.5, mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {(() => {
                    const selected = rooms.find(
                      (room) => room.id === parseInt(formData.roomId, 10)
                    )
                    return selected?.minLeaseMonths && Number(selected.minLeaseMonths) > 0
                      ? `Thời hạn theo phòng: ${selected.minLeaseMonths} tháng — ngày kết thúc tự tính từ ngày bắt đầu (đã khóa).`
                      : 'Phòng chưa cấu hình thời hạn tối thiểu — ngày kết thúc mặc định +12 tháng từ ngày bắt đầu (đã khóa).'
                  })()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(() => {
                    const selected = rooms.find(
                      (room) => room.id === parseInt(formData.roomId, 10)
                    )
                    const dep = selected?.depositAmount
                    return dep != null && Number(dep) > 0
                      ? `Tiền cọc theo phòng: ${new Intl.NumberFormat('vi-VN').format(dep)} đ (hệ thống dùng giá trị này; sau đó thu qua hóa đơn cọc).`
                      : 'Không yêu cầu cọc theo phòng — hợp đồng kích hoạt ngay sau khi tạo.'
                  })()}
                </Typography>
              </Stack>
            )}
            <TextField
              select
              fullWidth
              label="Người thuê"
              value={formData.tenantId}
              onChange={(e) =>
                setFormData({ ...formData, tenantId: e.target.value })
              }
              margin="normal"
              required
              disabled={optionsLoading}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.fullName} — {tenant.email}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Số hợp đồng (tùy chọn)"
              value={formData.contractNumber}
              onChange={(e) =>
                setFormData({ ...formData, contractNumber: e.target.value })
              }
              margin="normal"
              placeholder="Để trống để hệ thống tự sinh"
              helperText="Dùng khi bạn muốn trùng số với hợp đồng giấy."
            />
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                const start = e.target.value
                const selected = rooms.find((r) => r.id === parseInt(formData.roomId, 10))
                setFormData((prev) => {
                  const next = { ...prev, startDate: start }
                  if (selected && start) {
                    next.endDate = addMonthsToIsoDate(start, leaseMonthsForRoom(selected))
                  } else {
                    next.endDate = ''
                  }
                  return next
                })
              }}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: localDateInputToday() }}
              helperText="Không được chọn ngày trước hôm nay."
              required
            />
            <TextField
              fullWidth
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={() => {}}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiInputBase-input': { cursor: 'default' },
              }}
            />
            <TextField
              fullWidth
              label="Giá thuê / tháng"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) =>
                setFormData({ ...formData, monthlyRent: e.target.value })
              }
              margin="normal"
              required
              inputProps={{ min: 0, step: '1000' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">đ</InputAdornment>,
              }}
              helperText="Mặc định theo giá phòng; có thể chỉnh nếu thỏa thuận khác."
            />
            <TextField
              fullWidth
              label="Điều khoản"
              multiline
              rows={3}
              value={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Ghi chú nội bộ"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              margin="normal"
              placeholder="Không bắt buộc"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={optionsLoading}>
              Tạo hợp đồng
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Duyệt hợp đồng</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Giá thuê/tháng"
            type="number"
            value={approveData.monthlyRent}
            onChange={(e) =>
              setApproveData({ ...approveData, monthlyRent: e.target.value })
            }
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Hủy</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Duyệt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog
        open={openExtendDialog}
        onClose={() => setOpenExtendDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Gia hạn hợp đồng</DialogTitle>
        <DialogContent>
          {selectedContract && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Hợp đồng {selectedContract.contractNumber || selectedContract.id} - phòng {selectedContract.roomNumber}
            </Typography>
          )}
          <TextField
            fullWidth
            type="number"
            label="Số tháng gia hạn"
            value={extendData.extendMonths}
            onChange={(e) => setExtendData({ extendMonths: e.target.value })}
            margin="normal"
            inputProps={{ min: 1 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExtendDialog(false)}>Hủy</Button>
          <Button onClick={handleExtend} variant="contained">
            Xác nhận gia hạn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết hợp đồng</DialogTitle>
        <DialogContent>
          {detailContract && (
            <Stack spacing={1.2} sx={{ mt: 1 }}>
              <Typography><strong>Số hợp đồng:</strong> {detailContract.contractNumber || '-'}</Typography>
              <Typography><strong>Phòng:</strong> {detailContract.roomNumber}</Typography>
              <Typography><strong>Người thuê:</strong> {detailContract.tenantName}</Typography>
              <Typography><strong>SĐT:</strong> {detailContract.tenantPhone || '-'}</Typography>
              <Typography>
                <strong>Ngày bắt đầu:</strong> {new Date(detailContract.startDate).toLocaleDateString('vi-VN')}
              </Typography>
              <Typography>
                <strong>Ngày kết thúc:</strong> {new Date(detailContract.endDate).toLocaleDateString('vi-VN')}
              </Typography>
              <Typography>
                <strong>Giá thuê/tháng:</strong> {new Intl.NumberFormat('vi-VN').format(detailContract.monthlyRent)} đ
              </Typography>
              <Typography>
                <strong>Tiền cọc:</strong>{' '}
                {detailContract.deposit != null
                  ? `${new Intl.NumberFormat('vi-VN').format(detailContract.deposit)} đ`
                  : '-'}
              </Typography>
              <Typography>
                <strong>Đã thu cọc:</strong> {new Intl.NumberFormat('vi-VN').format(detailContract.depositPaid || 0)} đ
              </Typography>
              {detailContract.depositRefundedAt && (
                <>
                  <Typography>
                    <strong>Đã hoàn cọc (ghi nhận):</strong>{' '}
                    {new Intl.NumberFormat('vi-VN').format(detailContract.depositRefundedAmount || 0)} đ —{' '}
                    {new Date(detailContract.depositRefundedAt).toLocaleString('vi-VN')}
                  </Typography>
                  {detailContract.depositRefundNotes && (
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      <strong>Ghi chú hoàn cọc:</strong> {detailContract.depositRefundNotes}
                    </Typography>
                  )}
                </>
              )}
              {detailContract.rentalTermsAcceptedAt && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Đồng ý điều khoản thuê trọ:</strong>{' '}
                  {new Date(detailContract.rentalTermsAcceptedAt).toLocaleString('vi-VN')}
                </Typography>
              )}
              {detailContract.endedAt &&
                (detailContract.status === 'Terminated' || detailContract.status === 'Expired') && (
                  <Typography variant="body2">
                    <strong>
                      {detailContract.status === 'Expired'
                        ? 'Ngày hệ thống ghi nhận hết hạn:'
                        : 'Ngày hệ thống ghi nhận chấm dứt:'}
                    </strong>{' '}
                    {new Date(detailContract.endedAt).toLocaleString('vi-VN')}
                  </Typography>
                )}
              {detailContract.status === 'Terminated' && detailContract.terminationInitiatedBy && (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Chấm dứt bởi:</strong>{' '}
                  {detailContract.terminationInitiatedBy === 'Landlord' ? 'Chủ trọ' : 'Người thuê'}
                </Typography>
              )}
              {detailContract.status === 'Terminated' && detailContract.terminationReason && (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Lý do chấm dứt:</strong> {detailContract.terminationReason}
                </Typography>
              )}
              <Typography><strong>Trạng thái:</strong> {statusLabel(detailContract.status)}</Typography>
              <Typography>
                <strong>Ngày tạo:</strong> {new Date(detailContract.createdAt).toLocaleDateString('vi-VN')}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>Điều khoản:</strong> {detailContract.terms || '-'}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>Ghi chú:</strong> {detailContract.notes || '-'}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          {detailContract && detailContract.status === 'Active' && (
            <Button
              color="warning"
              variant="outlined"
              startIcon={<EventBusy />}
              onClick={() => {
                openTerminateLandlordDialog(detailContract.id)
                setOpenDetailDialog(false)
              }}
            >
              Chấm dứt hợp đồng
            </Button>
          )}
          {detailContract && detailContract.status === 'Active' && (
            <Button
              color="primary"
              variant="outlined"
              startIcon={<Autorenew />}
              onClick={() => {
                handleOpenExtendDialog(detailContract)
                setOpenDetailDialog(false)
              }}
            >
              Gia hạn
            </Button>
          )}
          {detailContract && detailContract.status === 'Pending' && (
            <>
              <Button
                color="success"
                variant="outlined"
                startIcon={<Check />}
                onClick={() => {
                  setSelectedContract(detailContract)
                  setApproveData({ monthlyRent: detailContract.monthlyRent.toString() })
                  setOpenDetailDialog(false)
                  setOpenApproveDialog(true)
                }}
              >
                Duyệt
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<Close />}
                onClick={async () => {
                  const r = await handleReject(detailContract.id)
                  if (r === 'ok') setOpenDetailDialog(false)
                }}
              >
                Từ chối
              </Button>
            </>
          )}
          {detailContract && detailContract.status === 'AwaitingDeposit' && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<Close />}
              onClick={async () => {
                const r = await handleReject(detailContract.id)
                if (r === 'ok') setOpenDetailDialog(false)
              }}
            >
              Từ chối / hủy
            </Button>
          )}
          {detailContract && canRecordDepositRefund(detailContract) && (
            <Button
              color="secondary"
              variant="outlined"
              startIcon={<Savings />}
              onClick={() => {
                openRefundDialogFor(detailContract)
                setOpenDetailDialog(false)
              }}
            >
              Ghi nhận hoàn cọc
            </Button>
          )}
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTerminateDialog}
        onClose={() => setOpenTerminateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chấm dứt hợp đồng (chủ trọ)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Phòng sẽ chuyển trống nếu không còn hợp đồng khác. Bắt buộc ghi lý do. Sau khi chấm dứt, nếu đã thu cọc
            bạn có thể ghi nhận hoàn cọc cho khách (theo thỏa thuận thực tế).
          </Typography>
          <TextField
            fullWidth
            label="Lý do chấm dứt"
            multiline
            minRows={3}
            value={terminateReason}
            onChange={(e) => setTerminateReason(e.target.value)}
            required
            placeholder="Ví dụ: Thu hồi phòng để sửa chữa; vi phạm điều khoản; thỏa thuận chấm dứt sớm..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTerminateDialog(false)}>Hủy</Button>
          <Button variant="contained" color="warning" onClick={submitTerminateLandlord}>
            Xác nhận chấm dứt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRefundDialog}
        onClose={() => setOpenRefundDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ghi nhận hoàn tiền cọc</DialogTitle>
        <DialogContent>
          {refundTarget && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Hợp đồng {refundTarget.contractNumber || refundTarget.id} — Cọc đã thu:{' '}
                {new Intl.NumberFormat('vi-VN').format(refundTarget.depositPaid || 0)} đ. Nhập số tiền thực tế trả lại
                khách (0 nếu khấu trừ hết).
              </Typography>
              <TextField
                fullWidth
                label="Số tiền hoàn cho khách"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                inputProps={{ min: 0, step: '1000' }}
                required
              />
              <TextField
                fullWidth
                label="Ghi chú (khấu trừ, lý do...)"
                multiline
                minRows={2}
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRefundDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmitRefund}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ContractsPage
