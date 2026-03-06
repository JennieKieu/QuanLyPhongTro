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
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { utilityService } from '../services/utilityService'
import { roomService } from '../services/roomService'

const UtilitiesPage = () => {
  const [utilities, setUtilities] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricityIndex: '',
    waterIndex: '',
    electricityUnitPrice: '3000',
    waterUnitPrice: '15000',
  })

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
    try {
      await utilityService.create({
        roomId: parseInt(formData.roomId),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        electricityIndex: parseInt(formData.electricityIndex),
        waterIndex: parseInt(formData.waterIndex),
        electricityUnitPrice: formData.electricityUnitPrice
          ? parseFloat(formData.electricityUnitPrice)
          : null,
        waterUnitPrice: formData.waterUnitPrice
          ? parseFloat(formData.waterUnitPrice)
          : null,
      })
      setOpenDialog(false)
      setFormData({
        roomId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        electricityIndex: '',
        waterIndex: '',
        electricityUnitPrice: '3000',
        waterUnitPrice: '15000',
      })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo chỉ số')
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
        <Typography variant="h4">Quản lý điện/nước</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Nhập chỉ số
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {utilities.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>Chưa có dữ liệu</Paper>
        ) : (
          <Stack spacing={2}>
            {utilities.map((utility) => (
              <Card key={utility.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    Phòng {utility.roomNumber} - {utility.month}/{utility.year}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2">
                    Điện: {utility.electricityIndex} -{' '}
                    {new Intl.NumberFormat('vi-VN').format(utility.electricityUnitPrice)} đ/kWh
                  </Typography>
                  <Typography variant="body2">
                    Nước: {utility.waterIndex} -{' '}
                    {new Intl.NumberFormat('vi-VN').format(utility.waterUnitPrice)} đ/m³
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Ngày nhập: {new Date(utility.recordedAt).toLocaleDateString('vi-VN')}
                  </Typography>
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
              <TableCell>Phòng</TableCell>
              <TableCell>Tháng/Năm</TableCell>
              <TableCell>Chỉ số điện</TableCell>
              <TableCell>Chỉ số nước</TableCell>
              <TableCell>Đơn giá điện</TableCell>
              <TableCell>Đơn giá nước</TableCell>
              <TableCell>Ngày nhập</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {utilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              utilities.map((utility) => (
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
                    {new Date(utility.recordedAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Nhập chỉ số điện/nước</DialogTitle>
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
                  {room.roomNumber}
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
            <TextField
              fullWidth
              label="Chỉ số điện"
              type="number"
              value={formData.electricityIndex}
              onChange={(e) =>
                setFormData({ ...formData, electricityIndex: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Chỉ số nước"
              type="number"
              value={formData.waterIndex}
              onChange={(e) =>
                setFormData({ ...formData, waterIndex: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Đơn giá điện (đ/kWh)"
              type="number"
              value={formData.electricityUnitPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  electricityUnitPrice: e.target.value,
                })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Đơn giá nước (đ/m³)"
              type="number"
              value={formData.waterUnitPrice}
              onChange={(e) =>
                setFormData({ ...formData, waterUnitPrice: e.target.value })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
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
