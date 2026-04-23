import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { roomService } from '../services/roomService'

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5201'
const resolveImageUrl = (url) => (url?.startsWith('http') ? url : `${API_ORIGIN}${url}`)

const LIST_ROWS_PER_PAGE = 10
const MAX_UPLOAD_IMAGES = 10

const RoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 'Tầng trệt',
    area: '',
    monthlyRent: '',
    description: '',
    minLeaseMonths: '',
    depositAmount: '',
    status: 'Available',
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls(previewUrls)
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imageFiles])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const data = await roomService.getAll()
      setRooms(data)
    } catch (err) {
      setError('Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (room = null) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        roomNumber: room.roomNumber,
        floor: room.floor || 'Tầng trệt',
        area: room.area.toString(),
        monthlyRent: room.monthlyRent.toString(),
        description: room.description || '',
        minLeaseMonths: room.minLeaseMonths?.toString() || '',
        depositAmount: room.depositAmount?.toString() || '',
        status: room.status || 'Available',
      })
      setImageFiles([])
    } else {
      setEditingRoom(null)
      setFormData({
        roomNumber: '',
        floor: 'Tầng trệt',
        area: '',
        monthlyRent: '',
        description: '',
        minLeaseMonths: '',
        depositAmount: '',
        status: 'Available',
      })
      setImageFiles([])
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingRoom(null)
    setFormData({
      roomNumber: '',
      floor: 'Tầng trệt',
      area: '',
      monthlyRent: '',
      description: '',
      minLeaseMonths: '',
      depositAmount: '',
      status: 'Available',
    })
    setImageFiles([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const minLeaseMonths = formData.minLeaseMonths
        ? parseInt(formData.minLeaseMonths, 10)
        : null
      const payload = new FormData()
      payload.append('roomNumber', formData.roomNumber)
      payload.append('floor', formData.floor || 'Tầng trệt')
      payload.append('area', formData.area)
      payload.append('monthlyRent', formData.monthlyRent)
      if (formData.description) payload.append('description', formData.description)
      if (minLeaseMonths) payload.append('minLeaseMonths', minLeaseMonths.toString())
      if (formData.depositAmount) payload.append('depositAmount', formData.depositAmount)
      if (
        editingRoom &&
        (formData.status === 'Available' || formData.status === 'Maintenance')
      ) {
        payload.append('status', formData.status)
      }
      imageFiles.forEach((file) => payload.append('images', file))
      if (editingRoom) {
        await roomService.update(editingRoom.id, payload)
      } else {
        await roomService.create(payload)
      }
      handleCloseDialog()
      loadRooms()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleImageFilesChange = (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > MAX_UPLOAD_IMAGES) {
      setError(`Chỉ được chọn tối đa ${MAX_UPLOAD_IMAGES} ảnh mỗi lần.`)
      setImageFiles(selected.slice(0, MAX_UPLOAD_IMAGES))
      return
    }
    setImageFiles(selected)
  }

  const handleDelete = async (id) => {
    const room = rooms.find((r) => r.id === id)
    if (room && (room.status === 'Occupied' || room.status === 'Reserved')) {
      setError('Không thể xóa phòng ở trạng thái Đã thuê hoặc Giữ chỗ.')
      return
    }
    if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
      try {
        await roomService.delete(id)
        loadRooms()
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa phòng')
      }
    }
  }

  const keyword = searchTerm.trim().toLowerCase()
  const filteredRooms = rooms.filter((room) => {
    const matchesKeyword =
      !keyword ||
      room.roomNumber?.toLowerCase().includes(keyword) ||
      room.description?.toLowerCase().includes(keyword)
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    return matchesKeyword && matchesStatus
  })

  useEffect(() => {
    setPage(0)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredRooms.length / LIST_ROWS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [filteredRooms.length])

  const pagedRooms = filteredRooms.slice(
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

  const isReadOnlyEdit =
    !!editingRoom &&
    (editingRoom.status === 'Occupied' || editingRoom.status === 'Reserved')

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 2 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2.5,
          color: '#fff',
          backgroundImage:
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Quản lý phòng trọ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Theo dõi trạng thái phòng, giá thuê, thời hạn tối thiểu và hình ảnh phòng theo thời gian thực.
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
        <Typography variant="h4">Quản lý phòng trọ</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Thêm phòng
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
          label="Tìm kiếm phòng"
          placeholder="Số phòng, mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          select
          label="Trạng thái"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: { xs: '100%', md: 220 } }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="Available">Trống</MenuItem>
          <MenuItem value="Reserved">Giữ chỗ (chờ cọc)</MenuItem>
          <MenuItem value="Occupied">Đã thuê</MenuItem>
          <MenuItem value="Maintenance">Bảo trì</MenuItem>
        </TextField>
      </Stack>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredRooms.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có phòng nào</Paper>
        ) : (
          <Stack spacing={2}>
            {pagedRooms.map((room) => (
              <Card key={room.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{room.roomNumber}</Typography>
                  {room.imageUrls && room.imageUrls.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Box
                        component="img"
                        src={resolveImageUrl(room.imageUrls[0])}
                        alt={room.roomNumber}
                        sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }}
                      />
                      {room.imageUrls.slice(1, 4).map((url) => (
                        <Box
                          key={url}
                          component="img"
                          src={resolveImageUrl(url)}
                          alt="Phòng"
                          sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
                        />
                      ))}
                    </Box>
                  )}
                  <Typography color="text.secondary">
                    Số tầng: {room.floor || 'Tầng trệt'}
                  </Typography>
                  <Typography color="text.secondary">
                    Diện tích: {room.area} m²
                  </Typography>
                  <Typography color="text.secondary">
                    Giá thuê: {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ
                  </Typography>
                  <Typography color="text.secondary">
                    Tối thiểu thuê: {room.minLeaseMonths ? `${room.minLeaseMonths} tháng` : 'Không ràng buộc'}
                  </Typography>
                  <Typography color="text.secondary">
                    Tiền cọc: {room.depositAmount ? `${new Intl.NumberFormat('vi-VN').format(room.depositAmount)} đ` : '-'}
                  </Typography>
                  <Typography
                    sx={{ mt: 1 }}
                    color={
                      room.status === 'Available'
                        ? 'success.main'
                        : room.status === 'Occupied'
                        ? 'error.main'
                        : room.status === 'Reserved'
                        ? 'info.main'
                        : 'warning.main'
                    }
                  >
                    {room.status === 'Available'
                      ? 'Trống'
                      : room.status === 'Occupied'
                      ? 'Đã thuê'
                      : room.status === 'Reserved'
                      ? 'Giữ chỗ (chờ cọc)'
                      : 'Bảo trì'}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    Mô tả: {room.description || '-'}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => handleOpenDialog(room)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(room.id)}
                          disabled={room.status === 'Occupied' || room.status === 'Reserved'}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {filteredRooms.length > 0 && (
          <TablePagination
            component="div"
            count={filteredRooms.length}
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
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Số phòng</TableCell>
              <TableCell>Diện tích (m²)</TableCell>
              <TableCell>Số tầng</TableCell>
              <TableCell>Giá thuê/tháng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tối thiểu thuê</TableCell>
              <TableCell>Tiền cọc</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Chưa có phòng nào
                </TableCell>
              </TableRow>
            ) : (
              pagedRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.roomNumber}</TableCell>
                <TableCell>{room.area}</TableCell>
                <TableCell>{room.floor || 'Tầng trệt'}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ
                </TableCell>
                <TableCell>
                  <Typography
                    color={
                      room.status === 'Available'
                        ? 'success.main'
                        : room.status === 'Occupied'
                        ? 'error.main'
                        : room.status === 'Reserved'
                        ? 'info.main'
                        : 'warning.main'
                    }
                  >
                    {room.status === 'Available'
                      ? 'Trống'
                      : room.status === 'Occupied'
                      ? 'Đã thuê'
                      : room.status === 'Reserved'
                      ? 'Giữ chỗ (chờ cọc)'
                      : 'Bảo trì'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {room.minLeaseMonths ? `${room.minLeaseMonths} tháng` : '-'}
                </TableCell>
                <TableCell>
                  {room.depositAmount
                    ? `${new Intl.NumberFormat('vi-VN').format(room.depositAmount)} đ`
                    : '-'}
                </TableCell>
                <TableCell>
                  {room.imageUrls && room.imageUrls.length > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="img"
                        src={resolveImageUrl(room.imageUrls[0])}
                        alt={room.roomNumber}
                        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                      />
                      {room.imageUrls.length > 1 && (
                        <Typography variant="body2" color="text.secondary">
                          +{room.imageUrls.length - 1}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{room.description || '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Sửa">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(room)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(room.id)}
                        disabled={room.status === 'Occupied' || room.status === 'Reserved'}
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
        {filteredRooms.length > 0 && (
          <TablePagination
            component="div"
            count={filteredRooms.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={LIST_ROWS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        )}
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
          </DialogTitle>
          <DialogContent>
            {editingRoom &&
              (editingRoom.status === 'Available' ||
                editingRoom.status === 'Maintenance') && (
                <TextField
                  select
                  fullWidth
                  label="Trạng thái phòng"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  margin="normal"
                  disabled={isReadOnlyEdit}
                >
                  <MenuItem value="Available">Trống</MenuItem>
                  <MenuItem value="Maintenance">Bảo trì</MenuItem>
                </TextField>
              )}
            <TextField
              fullWidth
              label="Số phòng"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              margin="normal"
              required
              disabled={isReadOnlyEdit}
            />
            <TextField
              fullWidth
              label="Số tầng"
              value={formData.floor}
              onChange={(e) =>
                setFormData({ ...formData, floor: e.target.value })
              }
              margin="normal"
              placeholder="Ví dụ: Tầng trệt, Lầu 1, Lầu 2..."
              required
              disabled={isReadOnlyEdit}
            />
            <TextField
              fullWidth
              label="Diện tích (m²)"
              type="number"
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
              margin="normal"
              required
              disabled={isReadOnlyEdit}
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
              disabled={isReadOnlyEdit}
            />
          <TextField
            fullWidth
            label="Tiền cọc"
            type="number"
            value={formData.depositAmount}
            onChange={(e) =>
              setFormData({ ...formData, depositAmount: e.target.value })
            }
            margin="normal"
            disabled={isReadOnlyEdit}
          />
          <TextField
            select
            fullWidth
            label="Thời gian thuê"
            value={formData.minLeaseMonths}
            onChange={(e) =>
              setFormData({ ...formData, minLeaseMonths: e.target.value })
            }
            margin="normal"
            required
            disabled={isReadOnlyEdit}
          >
            <MenuItem value="6">6 tháng</MenuItem>
            <MenuItem value="12">1 năm</MenuItem>
            <MenuItem value="24">2 năm</MenuItem>
            <MenuItem value="36">3 năm</MenuItem>
          </TextField>
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              disabled={isReadOnlyEdit}
            />
          {editingRoom?.imageUrls?.length > 0 && (
            <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {editingRoom.imageUrls.map((url) => (
                <Box
                  key={url}
                  component="img"
                  src={resolveImageUrl(url)}
                  alt="Phòng"
                  sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover' }}
                />
              ))}
            </Box>
          )}
          <Button variant="outlined" component="label" sx={{ mt: 1 }} disabled={isReadOnlyEdit}>
            Chọn ảnh từ máy
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImageFilesChange}
            />
          </Button>
          {imagePreviewUrls.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {imagePreviewUrls.map((url, idx) => (
                <Box
                  key={`${url}-${idx}`}
                  component="img"
                  src={url}
                  alt={`preview-${idx + 1}`}
                  sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover' }}
                />
              ))}
            </Box>
          )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {isReadOnlyEdit ? 'Đóng' : 'Hủy'}
            </Button>
            {!isReadOnlyEdit && (
              <Button type="submit" variant="contained">
                {editingRoom ? 'Cập nhật' : 'Thêm'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  )
}

export default RoomsPage
