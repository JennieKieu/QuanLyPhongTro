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
} from '@mui/material'
import { Check, Close, Add } from '@mui/icons-material'
import { contractService } from '../services/contractService'
import { tenantService } from '../services/tenantService'
import { roomService } from '../services/roomService'

const ContractsPage = () => {
  const [tab, setTab] = useState(0)
  const [contracts, setContracts] = useState([])
  const [pendingContracts, setPendingContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [openApproveDialog, setOpenApproveDialog] = useState(false)
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
    deposit: '',
    terms: '',
  })
  const [approveData, setApproveData] = useState({
    monthlyRent: '',
    terms: '',
  })


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
      if (tab === 0) {
        const data = await contractService.getAll()
        setContracts(data)
      } else {
        const data = await contractService.getPending()
        setPendingContracts(data)
      }
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
    try {
      await contractService.approve(selectedContract.id, {
        monthlyRent: parseFloat(approveData.monthlyRent),
        terms: approveData.terms,
      })
      setOpenApproveDialog(false)
      setSelectedContract(null)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt hợp đồng')
    }
  }

  const handleReject = async (id) => {
    if (window.confirm('Bạn có chắc muốn từ chối hợp đồng này?')) {
      try {
        await contractService.reject(id)
        loadData()
      } catch (err) {
        setError('Không thể từ chối hợp đồng')
      }
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const selectedRoom = rooms.find(
        (room) => room.id === parseInt(formData.roomId, 10)
      )
      const depositAmount = selectedRoom?.depositAmount ?? null
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
            `Thời gian thuê tối thiểu là ${selectedRoom.minLeaseMonths} tháng.`
          )
          return
        }
      }
      await contractService.create({
        roomId: parseInt(formData.roomId),
        tenantId: parseInt(formData.tenantId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        monthlyRent: parseFloat(formData.monthlyRent),
        deposit: depositAmount,
        terms: formData.terms,
      })
      setOpenDialog(false)
      setFormData({
        roomId: '',
        tenantId: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        deposit: '',
        terms: '',
      })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo hợp đồng')
    }
  }

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  const displayContracts = tab === 0 ? contracts : pendingContracts

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

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Tất cả hợp đồng" />
        <Tab label="Chờ duyệt" />
      </Tabs>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {displayContracts.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có hợp đồng nào</Paper>
        ) : (
          <Stack spacing={2}>
            {displayContracts.map((contract) => (
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
                  <Typography
                    sx={{ mt: 1 }}
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
                      : contract.status === 'Rejected'
                      ? 'Từ chối'
                      : contract.status}
                  </Typography>
                  {tab === 1 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        color="success"
                        variant="outlined"
                        onClick={() => {
                          setSelectedContract(contract)
                          setApproveData({
                            monthlyRent: contract.monthlyRent.toString(),
                            terms: contract.terms || '',
                          })
                          setOpenApproveDialog(true)
                        }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleReject(contract.id)}
                      >
                        Từ chối
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
              <TableCell>Số hợp đồng</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Người thuê</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Giá thuê/tháng</TableCell>
              <TableCell>Trạng thái</TableCell>
              {tab === 1 && <TableCell align="right">Thao tác</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayContracts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tab === 1 ? 8 : 7}
                  align="center"
                >
                  Chưa có hợp đồng nào
                </TableCell>
              </TableRow>
            ) : (
              displayContracts.map((contract) => (
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
                    <Typography
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
                        : contract.status === 'Rejected'
                        ? 'Từ chối'
                        : contract.status}
                    </Typography>
                  </TableCell>
                  {tab === 1 && (
                    <TableCell align="right">
                      <IconButton
                        color="success"
                        onClick={() => {
                          setSelectedContract(contract)
                          setApproveData({
                            monthlyRent: contract.monthlyRent.toString(),
                            terms: contract.terms || '',
                          })
                          setOpenApproveDialog(true)
                        }}
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleReject(contract.id)}
                      >
                        <Close />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreate}>
          <DialogTitle>Tạo hợp đồng mới</DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Phòng"
              value={formData.roomId}
              onChange={(e) =>
                setFormData({ ...formData, roomId: e.target.value })
              }
              margin="normal"
              required
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.roomNumber} - {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ/tháng
                </MenuItem>
              ))}
            </TextField>
            {formData.roomId && (
              <Typography variant="body2" color="text.secondary">
                {(() => {
                  const selected = rooms.find(
                    (room) => room.id === parseInt(formData.roomId, 10)
                  )
                  return selected?.minLeaseMonths
                    ? `Thời gian thuê tối thiểu: ${selected.minLeaseMonths} tháng`
                    : 'Không ràng buộc thời gian thuê tối thiểu'
                })()}
              </Typography>
            )}
          {formData.roomId && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {(() => {
                const selected = rooms.find(
                  (room) => room.id === parseInt(formData.roomId, 10)
                )
                return selected?.depositAmount
                  ? `Tiền cọc: ${new Intl.NumberFormat('vi-VN').format(selected.depositAmount)} đ`
                  : 'Tiền cọc: Không yêu cầu'
              })()}
            </Typography>
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
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.fullName} - {tenant.email}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Giá thuê/tháng"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) =>
                setFormData({ ...formData, monthlyRent: e.target.value })
              }
              margin="normal"
              required
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Tạo
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
          <TextField
            fullWidth
            label="Điều khoản"
            multiline
            rows={3}
            value={approveData.terms}
            onChange={(e) =>
              setApproveData({ ...approveData, terms: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Hủy</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Duyệt
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ContractsPage
