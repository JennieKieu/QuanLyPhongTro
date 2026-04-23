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
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { utilityService } from '../services/utilityService'
import { roomService } from '../services/roomService'

const LIST_ROWS_PER_PAGE = 10

const UtilitiesPage = () => {
  const formatThousandInput = (value) => {
    const digitsOnly = value?.toString().replace(/\D/g, '') || ''
    if (!digitsOnly) return ''
    return new Intl.NumberFormat('vi-VN').format(Number(digitsOnly))
  }

  const parseThousandInput = (value) => {
    const digitsOnly = value?.toString().replace(/\D/g, '') || ''
    return digitsOnly ? Number(digitsOnly) : 0
  }

  const [utilities, setUtilities] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roomFilter, setRoomFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [dialogError, setDialogError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [previousReading, setPreviousReading] = useState(null)
  const [composingField, setComposingField] = useState('')
  const [indexErrors, setIndexErrors] = useState({
    electricityIndex: '',
    waterIndex: '',
  })
  const [formData, setFormData] = useState({
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricityIndex: '',
    waterIndex: '',
    electricityUnitPrice: formatThousandInput('3000'),
    waterUnitPrice: formatThousandInput('15000'),
    serviceFee: formatThousandInput('0'),
  })
  const [page, setPage] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [utilitiesData, roomsData] = await Promise.all([
        utilityService.getAll(),
        roomService.getAll(),
      ])
      setUtilities(utilitiesData)
      setRooms(roomsData)
    } catch (err) {
      setError('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDialogError('')
    try {
      if (indexErrors.electricityIndex || indexErrors.waterIndex) {
        setDialogError(indexErrors.electricityIndex || indexErrors.waterIndex)
        return
      }
      if (!editing && previousReading) {
        const newElectric = parseThousandInput(formData.electricityIndex)
        const newWater = parseThousandInput(formData.waterIndex)
        if (newElectric < previousReading.electricityIndex) {
          setDialogError('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ.')
          return
        }
        if (newWater < previousReading.waterIndex) {
          setDialogError('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ.')
          return
        }
      }

      const payload = {
        roomId: parseInt(formData.roomId),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        electricityIndex: parseThousandInput(formData.electricityIndex),
        waterIndex: parseThousandInput(formData.waterIndex),
        electricityUnitPrice: formData.electricityUnitPrice
          ? parseThousandInput(formData.electricityUnitPrice)
          : null,
        waterUnitPrice: formData.waterUnitPrice
          ? parseThousandInput(formData.waterUnitPrice)
          : null,
        serviceFee: formData.serviceFee ? parseThousandInput(formData.serviceFee) : 0,
      }

      if (editing) {
        await utilityService.update(editing.id, {
          electricityIndex: payload.electricityIndex,
          waterIndex: payload.waterIndex,
          electricityUnitPrice: payload.electricityUnitPrice,
          waterUnitPrice: payload.waterUnitPrice,
          serviceFee: payload.serviceFee,
        })
      } else {
        await utilityService.create(payload)
      }
      setDialogError('')
      setOpenDialog(false)
      setEditing(null)
      setPreviousReading(null)
      setFormData({
        roomId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        electricityIndex: '',
        waterIndex: '',
        electricityUnitPrice: formatThousandInput('3000'),
        waterUnitPrice: formatThousandInput('15000'),
        serviceFee: formatThousandInput('0'),
      })
      loadData()
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Không thể lưu chỉ số')
    }
  }

  const openCreateDialog = () => {
    setEditing(null)
    setPreviousReading(null)
    setIndexErrors({ electricityIndex: '', waterIndex: '' })
    setFormData({
      roomId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      electricityIndex: '',
      waterIndex: '',
      electricityUnitPrice: formatThousandInput('3000'),
      waterUnitPrice: formatThousandInput('15000'),
      serviceFee: formatThousandInput('0'),
    })
    setDialogError('')
    setOpenDialog(true)
  }

  const openEditDialog = (utility) => {
    setEditing(utility)
    setPreviousReading(null)
    setIndexErrors({ electricityIndex: '', waterIndex: '' })
    setFormData({
      roomId: utility.roomId?.toString() || '',
      month: utility.month,
      year: utility.year,
      electricityIndex: formatThousandInput(utility.electricityIndex.toString()),
      waterIndex: formatThousandInput(utility.waterIndex.toString()),
      electricityUnitPrice: formatThousandInput(utility.electricityUnitPrice.toString()),
      waterUnitPrice: formatThousandInput(utility.waterUnitPrice.toString()),
      serviceFee: formatThousandInput((utility.serviceFee ?? 0).toString()),
    })
    setDialogError('')
    setOpenDialog(true)
  }

  const closeDialog = () => {
    setOpenDialog(false)
    setDialogError('')
    setIndexErrors({ electricityIndex: '', waterIndex: '' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi chỉ số này?')) return
    try {
      await utilityService.delete(id)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa chỉ số')
    }
  }

  const handleCreateFormChange = (field, value) => {
    const nextFormData = { ...formData, [field]: value }
    setFormData(nextFormData)

    if (
      editing ||
      !nextFormData.roomId ||
      !nextFormData.month ||
      !nextFormData.year
    ) {
      setPreviousReading(null)
      setIndexErrors({ electricityIndex: '', waterIndex: '' })
      return
    }

    const roomIdNum = parseInt(nextFormData.roomId, 10)
    const monthNum = parseInt(nextFormData.month, 10)
    const yearNum = parseInt(nextFormData.year, 10)

    const previous = utilities
      .filter(
        (u) =>
          u.roomId === roomIdNum &&
          (u.year < yearNum || (u.year === yearNum && u.month < monthNum))
      )
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })[0]

    const nextPreviousReading = previous || null
    setPreviousReading(nextPreviousReading)
    validateIndexErrors(nextFormData, nextPreviousReading)
  }

  const validateIndexErrors = (nextFormData, nextPreviousReading) => {
    if (editing || !nextPreviousReading) {
      setIndexErrors({ electricityIndex: '', waterIndex: '' })
      return
    }

    const nextErrors = { electricityIndex: '', waterIndex: '' }
    if (
      nextFormData.electricityIndex &&
      parseThousandInput(nextFormData.electricityIndex) <
        nextPreviousReading.electricityIndex
    ) {
      nextErrors.electricityIndex =
        'Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ.'
    }
    if (
      nextFormData.waterIndex &&
      parseThousandInput(nextFormData.waterIndex) < nextPreviousReading.waterIndex
    ) {
      nextErrors.waterIndex = 'Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ.'
    }

    setIndexErrors(nextErrors)
  }

  const handleFormattedInputChange = (field, value) => {
    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: composingField === field ? value : formatThousandInput(value),
      }
      if (field === 'electricityIndex' || field === 'waterIndex') {
        validateIndexErrors(nextFormData, previousReading)
      }
      return nextFormData
    })
  }

  const handleCompositionStart = (field) => {
    setComposingField(field)
  }

  const handleCompositionEnd = (field, value) => {
    setComposingField('')
    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [field]: formatThousandInput(value),
      }
      if (field === 'electricityIndex' || field === 'waterIndex') {
        validateIndexErrors(nextFormData, previousReading)
      }
      return nextFormData
    })
  }

  const oldElectricityIndex = previousReading?.electricityIndex ?? 0
  const oldWaterIndex = previousReading?.waterIndex ?? 0
  const hasNewElectricityInput = !!formData.electricityIndex
  const hasNewWaterInput = !!formData.waterIndex
  const newElectricityIndex = parseThousandInput(formData.electricityIndex)
  const newWaterIndex = parseThousandInput(formData.waterIndex)
  const electricityUsed = hasNewElectricityInput
    ? newElectricityIndex - oldElectricityIndex
    : null
  const waterUsed = hasNewWaterInput ? newWaterIndex - oldWaterIndex : null
  const keyword = searchTerm.trim().toLowerCase()
  const filteredUtilities = utilities.filter((utility) => {
    const matchesKeyword =
      !keyword ||
      utility.roomNumber?.toLowerCase().includes(keyword) ||
      String(utility.month).includes(keyword) ||
      String(utility.year).includes(keyword)
    const matchesRoom = roomFilter === 'all' || String(utility.roomId) === roomFilter
    const matchesMonth = monthFilter === 'all' || String(utility.month) === monthFilter
    const matchesYear = yearFilter === 'all' || String(utility.year) === yearFilter
    return matchesKeyword && matchesRoom && matchesMonth && matchesYear
  })

  useEffect(() => {
    setPage(0)
  }, [searchTerm, roomFilter, monthFilter, yearFilter])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredUtilities.length / LIST_ROWS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [filteredUtilities.length])

  const pagedUtilities = filteredUtilities.slice(
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
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Quản lý điện, nước, dịch vụ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Ghi chỉ số theo kỳ, chuẩn hóa đơn giá và kiểm soát chi phí vận hành từng phòng.
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
        <Typography variant="h4">Quản lý điện, nước và dịch vụ phòng</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          Nhập chỉ số
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Tìm kiếm chỉ số"
          placeholder="Phòng, tháng, năm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField select label="Phòng" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {rooms.map((r) => (
            <MenuItem key={r.id} value={String(r.id)}>{r.roomNumber}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Tháng" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} sx={{ minWidth: 110 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <MenuItem key={m} value={String(m)}>{m}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Năm" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} sx={{ minWidth: 120 }}>
          <MenuItem value="all">Tất cả</MenuItem>
          {Array.from(new Set(utilities.map((u) => u.year))).sort((a, b) => b - a).map((y) => (
            <MenuItem key={y} value={String(y)}>{y}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredUtilities.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có dữ liệu</Paper>
        ) : (
          <Stack spacing={2}>
            {pagedUtilities.map((utility) => (
              <Card key={utility.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    Phòng {utility.roomNumber} - {utility.month}/{utility.year}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    Chỉ số điện mới: {utility.electricityIndex} -{' '}
                    {new Intl.NumberFormat('vi-VN').format(utility.electricityUnitPrice)} đ/kWh
                  </Typography>
                  <Typography variant="body2">
                    Chỉ số nước mới: {utility.waterIndex} -{' '}
                    {new Intl.NumberFormat('vi-VN').format(utility.waterUnitPrice)} đ/m³
                  </Typography>
                  <Typography variant="body2">
                    Dịch vụ phòng:{' '}
                    {new Intl.NumberFormat('vi-VN').format(utility.serviceFee)} đ/tháng
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Ngày nhập: {new Date(utility.recordedAt).toLocaleDateString('vi-VN')}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => openEditDialog(utility)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(utility.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {filteredUtilities.length > 0 && (
          <TablePagination
            component="div"
            count={filteredUtilities.length}
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
              <TableCell>Phòng</TableCell>
              <TableCell>Tháng/Năm</TableCell>
              <TableCell>Chỉ số điện mới</TableCell>
              <TableCell>Chỉ số nước mới</TableCell>
              <TableCell>Đơn giá điện</TableCell>
              <TableCell>Đơn giá nước</TableCell>
              <TableCell>Tiền dịch vụ phòng</TableCell>
              <TableCell>Ngày nhập</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUtilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              pagedUtilities.map((utility) => (
                <TableRow key={utility.id}>
                  <TableCell>{utility.roomNumber}</TableCell>
                  <TableCell>
                    {utility.month}/{utility.year}
                  </TableCell>
                  <TableCell>{utility.electricityIndex}</TableCell>
                  <TableCell>{utility.waterIndex}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      utility.electricityUnitPrice
                    )}{' '}
                    đ/kWh
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      utility.waterUnitPrice
                    )}{' '}
                    đ/m³
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      utility.serviceFee
                    )}{' '}
                    đ/tháng
                  </TableCell>
                  <TableCell>
                    {new Date(utility.recordedAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(utility)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(utility.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredUtilities.length > 0 && (
          <TablePagination
            component="div"
            count={filteredUtilities.length}
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
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editing ? 'Cập nhật chỉ số điện/nước' : 'Nhập chỉ số điện/nước (cũ/mới)'}
          </DialogTitle>
          <DialogContent>
            {dialogError && (
              <Alert
                severity="error"
                sx={{ mb: 1 }}
                onClose={() => setDialogError('')}
              >
                {dialogError}
              </Alert>
            )}
            <TextField
              select
              fullWidth
              label="Phòng"
              value={formData.roomId}
              onChange={(e) => handleCreateFormChange('roomId', e.target.value)}
              margin="normal"
              required
              disabled={!!editing}
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.roomNumber}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Tháng"
              type="number"
              value={formData.month}
              onChange={(e) => handleCreateFormChange('month', e.target.value)}
              margin="normal"
              inputProps={{ min: 1, max: 12 }}
              required
              disabled={!!editing}
            />
            <TextField
              fullWidth
              label="Năm"
              type="number"
              value={formData.year}
              onChange={(e) => handleCreateFormChange('year', e.target.value)}
              margin="normal"
              required
              disabled={!!editing}
            />
            <TextField
              fullWidth
              label="Chỉ số điện cũ"
              type="text"
              value={formatThousandInput(oldElectricityIndex)}
              margin="normal"
              InputProps={{ readOnly: true }}
              disabled
              helperText={
                previousReading
                  ? `Lấy từ ${previousReading.month}/${previousReading.year}`
                  : 'Chưa có tháng trước, mặc định = 0'
              }
            />
            <TextField
              fullWidth
              label="Chỉ số điện mới"
              type="text"
              value={formData.electricityIndex}
              onChange={(e) =>
                handleFormattedInputChange('electricityIndex', e.target.value)
              }
              onCompositionStart={() => handleCompositionStart('electricityIndex')}
              onCompositionEnd={(e) =>
                handleCompositionEnd('electricityIndex', e.target.value)
              }
              margin="normal"
              required
              error={!!indexErrors.electricityIndex}
              helperText={
                indexErrors.electricityIndex ||
                (electricityUsed === null
                  ? 'Nhập chỉ số mới để tính số điện tiêu thụ.'
                  : `Số điện tiêu thụ: ${new Intl.NumberFormat('vi-VN').format(electricityUsed)} kWh`)
              }
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth
              label="Chỉ số nước cũ"
              type="text"
              value={formatThousandInput(oldWaterIndex)}
              margin="normal"
              InputProps={{ readOnly: true }}
              disabled
              helperText={
                previousReading
                  ? `Lấy từ ${previousReading.month}/${previousReading.year}`
                  : 'Chưa có tháng trước, mặc định = 0'
              }
            />
            <TextField
              fullWidth
              label="Chỉ số nước mới"
              type="text"
              value={formData.waterIndex}
              onChange={(e) =>
                handleFormattedInputChange('waterIndex', e.target.value)
              }
              onCompositionStart={() => handleCompositionStart('waterIndex')}
              onCompositionEnd={(e) =>
                handleCompositionEnd('waterIndex', e.target.value)
              }
              margin="normal"
              required
              error={!!indexErrors.waterIndex}
              helperText={
                indexErrors.waterIndex ||
                (waterUsed === null
                  ? 'Nhập chỉ số mới để tính số nước tiêu thụ.'
                  : `Số nước tiêu thụ: ${new Intl.NumberFormat('vi-VN').format(waterUsed)} m³`)
              }
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth
              label="Đơn giá điện (đ/kWh)"
              type="text"
              value={formData.electricityUnitPrice}
              onChange={(e) =>
                handleFormattedInputChange('electricityUnitPrice', e.target.value)
              }
              onCompositionStart={() =>
                handleCompositionStart('electricityUnitPrice')
              }
              onCompositionEnd={(e) =>
                handleCompositionEnd('electricityUnitPrice', e.target.value)
              }
              margin="normal"
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth
              label="Đơn giá nước (đ/m³)"
              type="text"
              value={formData.waterUnitPrice}
              onChange={(e) =>
                handleFormattedInputChange('waterUnitPrice', e.target.value)
              }
              onCompositionStart={() => handleCompositionStart('waterUnitPrice')}
              onCompositionEnd={(e) =>
                handleCompositionEnd('waterUnitPrice', e.target.value)
              }
              margin="normal"
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              fullWidth
              label="Tiền dịch vụ phòng (wifi, rác, dọn vệ sinh) /tháng"
              type="text"
              value={formData.serviceFee}
              onChange={(e) =>
                handleFormattedInputChange('serviceFee', e.target.value)
              }
              onCompositionStart={() => handleCompositionStart('serviceFee')}
              onCompositionEnd={(e) =>
                handleCompositionEnd('serviceFee', e.target.value)
              }
              margin="normal"
              inputProps={{ inputMode: 'numeric' }}
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

export default UtilitiesPage
