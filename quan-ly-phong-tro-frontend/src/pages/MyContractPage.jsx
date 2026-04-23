import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Divider,
  TextField,
  Stack,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  CircularProgress,
} from '@mui/material'
import { EventBusy, DescriptionOutlined } from '@mui/icons-material'
import { contractService } from '../services/contractService'

const LIST_ROWS_PER_PAGE = 10

const statusLabel = (status) => {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Pending') return 'Chờ chủ trọ duyệt'
  if (status === 'AwaitingDeposit') return 'Chờ thanh toán cọc — hợp đồng chưa có hiệu lực'
  if (status === 'Expired') return 'Hết hạn'
  if (status === 'Rejected') return 'Từ chối'
  if (status === 'Terminated') return 'Đã chấm dứt'
  return status
}

const statusChipColor = (status) => {
  if (status === 'Active') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'AwaitingDeposit') return 'info'
  if (status === 'Expired' || status === 'Rejected' || status === 'Terminated') return 'default'
  return 'default'
}

function ContractCard({
  contract,
  onTerminate,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 2,
        borderRadius: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} flexWrap="wrap" gap={1}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="h6" fontWeight={700} component="h2">
              {contract.contractNumber || 'Hợp đồng'}
            </Typography>
            <Chip
              size="small"
              label={statusLabel(contract.status)}
              color={statusChipColor(contract.status)}
              variant={contract.status === 'Active' ? 'filled' : 'outlined'}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Phòng <strong>{contract.roomNumber}</strong>
          </Typography>
        </Box>
        {contract.status === 'Active' && (
          <Button
            size="small"
            color="warning"
            variant="outlined"
            startIcon={<EventBusy />}
            onClick={() => onTerminate(contract)}
            sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
          >
            Chấm dứt hợp đồng
          </Button>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.25}>
        <Typography variant="body2">
          <strong>Ngày bắt đầu:</strong> {new Date(contract.startDate).toLocaleDateString('vi-VN')}
        </Typography>
        <Typography variant="body2">
          <strong>Ngày kết thúc:</strong> {new Date(contract.endDate).toLocaleDateString('vi-VN')}
        </Typography>
        <Typography variant="body2">
          <strong>Giá thuê / tháng:</strong>{' '}
          {new Intl.NumberFormat('vi-VN').format(contract.monthlyRent)} đ
        </Typography>
        {contract.deposit != null && contract.deposit > 0 && (
          <Box>
            <Typography variant="body2">
              <strong>Tiền cọc:</strong> {new Intl.NumberFormat('vi-VN').format(contract.deposit)} đ
              {contract.depositPaid > 0 && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  (đã thu: {new Intl.NumberFormat('vi-VN').format(contract.depositPaid)} đ)
                </Typography>
              )}
            </Typography>
            {contract.depositRefundedAt && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Hoàn cọc đã ghi nhận: {new Intl.NumberFormat('vi-VN').format(contract.depositRefundedAmount || 0)} đ
                {' — '}
                {new Date(contract.depositRefundedAt).toLocaleString('vi-VN')}
                {contract.depositRefundNotes && (
                  <Typography component="span" variant="body2" display="block" sx={{ mt: 0.5 }}>
                    {contract.depositRefundNotes}
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
        )}
        {contract.rentalTermsAcceptedAt && (
          <Typography variant="caption" color="text.secondary" display="block">
            Đã xác nhận điều khoản thuê trọ:{' '}
            {new Date(contract.rentalTermsAcceptedAt).toLocaleString('vi-VN')}
          </Typography>
        )}
        {contract.endedAt &&
          (contract.status === 'Terminated' || contract.status === 'Expired') && (
            <Typography variant="body2" color="text.secondary">
              {contract.status === 'Expired'
                ? 'Ngày hệ thống ghi nhận hết hạn:'
                : 'Ngày hệ thống ghi nhận chấm dứt:'}{' '}
              {new Date(contract.endedAt).toLocaleString('vi-VN')}
            </Typography>
          )}
        {contract.status === 'Terminated' && contract.terminationInitiatedBy && (
          <Typography variant="body2">
            <strong>Chấm dứt bởi:</strong>{' '}
            {contract.terminationInitiatedBy === 'Landlord' ? 'Chủ trọ' : 'Bạn (người thuê)'}
          </Typography>
        )}
        {contract.status === 'Terminated' && contract.terminationReason && (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            <strong>Lý do:</strong> {contract.terminationReason}
          </Typography>
        )}
      </Stack>

      {contract.status === 'AwaitingDeposit' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Chủ trọ sẽ tạo hóa đơn cọc. Sau khi cọc được xác nhận thanh toán đủ, hợp đồng mới chuyển sang đang hoạt động.
        </Alert>
      )}

      {contract.terms && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1 }}>
            <DescriptionOutlined fontSize="small" color="action" />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
              Điều khoản
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
            {contract.terms}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

const MyContractPage = () => {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [openTenantTerminate, setOpenTenantTerminate] = useState(false)
  const [tenantTerminateContract, setTenantTerminateContract] = useState(null)
  const [tenantTerminateReason, setTenantTerminateReason] = useState('')

  useEffect(() => {
    loadContract()
  }, [])

  const loadContract = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await contractService.getMyContract()
      setContracts(Array.isArray(data) ? data : data ? [data] : [])
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Bạn chưa có hợp đồng')
      } else {
        setError('Không thể tải thông tin hợp đồng')
      }
      setContracts([])
    } finally {
      setLoading(false)
    }
  }

  const keyword = searchTerm.trim().toLowerCase()
  const filteredContracts = useMemo(
    () =>
      contracts.filter((contract) => {
        const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
        const matchesKeyword =
          !keyword ||
          (contract.contractNumber || '').toLowerCase().includes(keyword) ||
          (contract.roomNumber || '').toLowerCase().includes(keyword) ||
          statusLabel(contract.status).toLowerCase().includes(keyword)
        return matchesStatus && matchesKeyword
      }),
    [contracts, keyword, statusFilter]
  )

  useEffect(() => {
    setPage(0)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredContracts.length / LIST_ROWS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [filteredContracts.length])

  const pagedContracts = useMemo(
    () =>
      filteredContracts.slice(
        page * LIST_ROWS_PER_PAGE,
        page * LIST_ROWS_PER_PAGE + LIST_ROWS_PER_PAGE
      ),
    [filteredContracts, page]
  )

  const openTenantTerminateDialog = (contract) => {
    setTenantTerminateContract(contract)
    setTenantTerminateReason('')
    setOpenTenantTerminate(true)
  }

  const submitTenantTerminate = async () => {
    if (!tenantTerminateContract) return
    const reason = tenantTerminateReason.trim()
    if (!reason) {
      setError('Vui lòng nhập lý do chấm dứt.')
      return
    }
    try {
      await contractService.terminateAsTenant(tenantTerminateContract.id, { reason })
      setOpenTenantTerminate(false)
      setTenantTerminateContract(null)
      setTenantTerminateReason('')
      setError('')
      await loadContract()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu chấm dứt')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Đang tải hợp đồng…</Typography>
        </Stack>
      </Container>
    )
  }

  if (contracts.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            Hợp đồng của tôi
          </Typography>
          <Alert severity="info">{error || 'Bạn chưa có hợp đồng nào trên hệ thống.'}</Alert>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 2, px: { xs: 1.5, sm: 2.5 } }}>
      <Box
        sx={{
          borderRadius: 2,
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'primary.contrastText',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          Hợp đồng của tôi
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.92, maxWidth: 720 }}>
          Theo dõi trạng thái từng hợp đồng, tiền cọc và có thể gửi chấm dứt khi hợp đồng đang hoạt động.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label="Tìm kiếm"
            placeholder="Mã hợp đồng, số phòng, trạng thái…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            select
            size="small"
            label="Trạng thái"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="Active">Đang hoạt động</MenuItem>
            <MenuItem value="AwaitingDeposit">Chờ thanh toán cọc</MenuItem>
            <MenuItem value="Pending">Chờ chủ trọ duyệt</MenuItem>
            <MenuItem value="Expired">Hết hạn</MenuItem>
            <MenuItem value="Terminated">Đã chấm dứt</MenuItem>
            <MenuItem value="Rejected">Từ chối</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}
            sx={{ whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Xóa lọc
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
          Khớp bộ lọc: {filteredContracts.length} / {contracts.length} hợp đồng
        </Typography>
      </Paper>

      {!filteredContracts.length ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Không tìm thấy hợp đồng phù hợp với bộ lọc hiện tại.
        </Alert>
      ) : (
        <>
          {pagedContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} onTerminate={openTenantTerminateDialog} />
          ))}
          <TablePagination
            component="div"
            count={filteredContracts.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={LIST_ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }}
          />
        </>
      )}

      <Dialog open={openTenantTerminate} onClose={() => setOpenTenantTerminate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chấm dứt hợp đồng</DialogTitle>
        <DialogContent>
          {tenantTerminateContract && (() => {
            const end = new Date(tenantTerminateContract.endDate)
            end.setHours(0, 0, 0, 0)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isBeforeEnd = today < end
            const willForfeit =
              isBeforeEnd && Number(tenantTerminateContract.depositPaid || 0) > 0
            return (
              <>
                {willForfeit && (
                  <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                    Bạn đang chấm dứt <strong>trước ngày kết thúc</strong> ghi trên hợp đồng và đã có cọc đã thu. Theo
                    điều khoản thuê trọ trên hệ thống, <strong>tiền cọc sẽ không được hoàn</strong> (ghi nhận tự động).
                  </Alert>
                )}
                {!willForfeit && isBeforeEnd && (
                  <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                    Bạn chấm dứt trước ngày kết thúc; hiện chưa có cọc đã thu để áp dụng mất cọc.
                  </Alert>
                )}
                {!isBeforeEnd && (
                  <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                    Ngày hiện tại đã đạt hoặc sau ngày kết thúc trên hợp đồng — hệ thống không áp dụng mất cọc tự động;
                    chủ trọ có thể quyết toán hoàn cọc (nếu có) riêng.
                  </Alert>
                )}
              </>
            )
          })()}
          <TextField
            fullWidth
            label="Lý do chấm dứt"
            multiline
            minRows={3}
            value={tenantTerminateReason}
            onChange={(e) => setTenantTerminateReason(e.target.value)}
            margin="normal"
            placeholder="Ví dụ: Chuyển công tác, không còn nhu cầu thuê…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTenantTerminate(false)}>Hủy</Button>
          <Button variant="contained" color="warning" onClick={submitTenantTerminate}>
            Gửi chấm dứt
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MyContractPage
