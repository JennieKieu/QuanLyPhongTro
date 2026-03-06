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
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { roomService } from '../services/roomService'

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5201'
const resolveImageUrl = (url) => (url?.startsWith('http') ? url : `${API_ORIGIN}${url}`)

const RoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [formData, setFormData] = useState({
    roomNumber: '',
    area: '',
    monthlyRent: '',
    description: '',
    minLeaseMonths: '',
    depositAmount: '',
  })
  const [imageFiles, setImageFiles] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadRooms()
  }, [])

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
        area: room.area.toString(),
        monthlyRent: room.monthlyRent.toString(),
        description: room.description || '',
        minLeaseMonths: room.minLeaseMonths?.toString() || '',
        depositAmount: room.depositAmount?.toString() || '',
      })
      setImageFiles([])
    } else {
      setEditingRoom(null)
      setFormData({
        roomNumber: '',
        area: '',
        monthlyRent: '',
        description: '',
        minLeaseMonths: '',
        depositAmount: '',
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
      area: '',
      monthlyRent: '',
      description: '',
      minLeaseMonths: '',
      depositAmount: '',
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
      payload.append('area', formData.area)
      payload.append('monthlyRent', formData.monthlyRent)
      if (formData.description) payload.append('description', formData.description)
      if (minLeaseMonths) payload.append('minLeaseMonths', minLeaseMonths.toString())
      if (formData.depositAmount) payload.append('depositAmount', formData.depositAmount)
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

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
      try {
        await roomService.delete(id)
        loadRooms()
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa phòng')
      }
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

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {rooms.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có phòng nào</Paper>
        ) : (
          <Stack spacing={2}>
            {rooms.map((room) => (
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
                        : 'warning.main'
                    }
                  >
                    {room.status === 'Available'
                      ? 'Trống'
                      : room.status === 'Occupied'
                      ? 'Đã thuê'
                      : 'Bảo trì'}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    Mô tả: {room.description || '-'}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button size="small" variant="outlined" onClick={() => handleOpenDialog(room)}>
                      Sửa
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(room.id)}>
                      Xóa
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Số phòng</TableCell>
              <TableCell>Diện tích (m²)</TableCell>
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
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.roomNumber}</TableCell>
                <TableCell>{room.area}</TableCell>
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
                        : 'warning.main'
                    }
                  >
                    {room.status === 'Available'
                      ? 'Trống'
                      : room.status === 'Occupied'
                      ? 'Đã thuê'
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
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(room)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Số phòng"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              margin="normal"
              required
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
            label="Tiền cọc"
            type="number"
            value={formData.depositAmount}
            onChange={(e) =>
              setFormData({ ...formData, depositAmount: e.target.value })
            }
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Thời gian thuê tối thiểu"
            value={formData.minLeaseMonths}
            onChange={(e) =>
              setFormData({ ...formData, minLeaseMonths: e.target.value })
            }
            margin="normal"
          >
            <MenuItem value="">Không ràng buộc</MenuItem>
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
          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Chọn ảnh từ máy
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            />
          </Button>
          {imageFiles.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {imageFiles.map((file) => (
                <Box
                  key={file.name}
                  component="img"
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover' }}
                />
              ))}
            </Box>
          )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingRoom ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  )
}

export default RoomsPage
