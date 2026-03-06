import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material'
import { ChevronLeft, ChevronRight, Close } from '@mui/icons-material'
import { contractService } from '../services/contractService'
import { roomService } from '../services/roomService'

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5201'
const resolveImageUrl = (url) => (url?.startsWith('http') ? url : `${API_ORIGIN}${url}`)

const RentRoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  })

  useEffect(() => {
    loadRoom()
  }, [roomId])

  const loadRoom = async () => {
    try {
      setLoading(true)
      const data = await roomService.getById(roomId)
      setRoom(data)
      if (data?.imageUrls?.length) {
        setSelectedIndex(0)
      }
    } catch (err) {
      setError('Không thể tải thông tin phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (room?.minLeaseMonths && formData.startDate && formData.endDate) {
        const minEnd = new Date(formData.startDate)
        minEnd.setMonth(minEnd.getMonth() + Number(room.minLeaseMonths))
        const endDate = new Date(formData.endDate)
        if (endDate < minEnd) {
          setError(`Thời gian thuê tối thiểu là ${room.minLeaseMonths} tháng.`)
          setSubmitting(false)
          return
        }
      }
      await contractService.rentRoom({
        roomId: parseInt(roomId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        deposit: room?.depositAmount ? parseFloat(room.depositAmount) : 0,
        notes: formData.notes,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/my-contract')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu thuê phòng')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  if (!room) {
    return (
      <Container>
        <Alert severity="error">Không tìm thấy phòng</Alert>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="success">
            Yêu cầu thuê phòng đã được gửi. Vui lòng chờ chủ trọ duyệt.
          </Alert>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Thuê phòng {room.roomNumber}
        </Typography>
        {room.imageUrls && room.imageUrls.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={resolveImageUrl(room.imageUrls[selectedIndex] || room.imageUrls[0])}
                alt={`Phòng ${room.roomNumber}`}
                onClick={() => setPreviewOpen(true)}
                sx={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid #e5e7eb',
                  cursor: 'zoom-in',
                }}
              />
              {room.imageUrls.length > 1 && (
                <>
                  <IconButton
                    onClick={() =>
                      setSelectedIndex((prev) =>
                        prev === 0 ? room.imageUrls.length - 1 : prev - 1
                      )
                    }
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: 8,
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.85)',
                    }}
                    size="small"
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      setSelectedIndex((prev) =>
                        prev === room.imageUrls.length - 1 ? 0 : prev + 1
                      )
                    }
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      right: 8,
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.85)',
                    }}
                    size="small"
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {room.imageUrls.map((url, index) => (
                <Box
                  key={url}
                  component="img"
                  src={resolveImageUrl(url)}
                  alt="Thumbnail"
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    width: 56,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: selectedIndex === index ? '2px solid #163C57' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Diện tích:</strong> {room.area} m²
          </Typography>
          <Typography variant="body1">
            <strong>Giá thuê:</strong>{' '}
            {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ/tháng
          </Typography>
          <Typography variant="body1">
            <strong>Tiền cọc:</strong>{' '}
            {room.depositAmount
              ? `${new Intl.NumberFormat('vi-VN').format(room.depositAmount)} đ`
              : 'Không yêu cầu'}
          </Typography>
          {room.minLeaseMonths && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Thời gian thuê tối thiểu: {room.minLeaseMonths} tháng
            </Typography>
          )}
          {room.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {room.description}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
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
            label="Ghi chú"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            margin="normal"
            placeholder="Ví dụ: Tôi muốn thuê phòng này vì..."
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/rooms/available')}
              fullWidth
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
        <DialogContent sx={{ p: 1, position: 'relative', bgcolor: '#000' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}
          >
            <Close />
          </IconButton>
          {room?.imageUrls?.length > 1 && (
            <>
              <IconButton
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === 0 ? room.imageUrls.length - 1 : prev - 1
                  )
                }
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 8,
                  transform: 'translateY(-50%)',
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === room.imageUrls.length - 1 ? 0 : prev + 1
                  )
                }
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
          <Box
            component="img"
            src={resolveImageUrl(room?.imageUrls?.[selectedIndex] || room?.imageUrls?.[0] || '')}
            alt="Preview"
            sx={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default RentRoomPage
