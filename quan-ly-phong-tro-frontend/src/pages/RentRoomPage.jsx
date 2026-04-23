import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
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
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Stack,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Close,
  ArrowBack,
  HomeWorkOutlined,
  LayersOutlined,
  StraightenOutlined,
  PaymentsOutlined,
  CalendarMonthOutlined,
} from '@mui/icons-material'
import { contractService } from '../services/contractService'
import { roomService } from '../services/roomService'

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5201'
const resolveImageUrl = (url) => (url?.startsWith('http') ? url : `${API_ORIGIN}${url}`)

const localDateInputToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const InfoRow = ({ icon: Icon, label, children, emphasize }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1 }}>
    <Icon sx={{ fontSize: 22, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant={emphasize ? 'h6' : 'body1'} fontWeight={emphasize ? 700 : 500} color="text.primary">
        {children}
      </Typography>
    </Box>
  </Stack>
)

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
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    loadRoom()
  }, [roomId])

  const loadRoom = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await roomService.getById(roomId)
      setRoom(data)
      if (data?.imageUrls?.length) {
        setSelectedIndex(0)
      }
    } catch (err) {
      setError('Không thể tải thông tin phòng')
      setRoom(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!termsAccepted) {
        setError('Vui lòng đọc và tích chọn đồng ý điều khoản thuê trọ.')
        setSubmitting(false)
        return
      }

      const minStart = localDateInputToday()
      if (formData.startDate && formData.startDate < minStart) {
        setError('Ngày bắt đầu thuê không được trước ngày hiện tại.')
        setSubmitting(false)
        return
      }

      const hasFixedDuration = !!room?.minLeaseMonths && Number(room.minLeaseMonths) > 0

      let payloadEndDate = formData.endDate

      if (hasFixedDuration) {
        if (!formData.startDate) {
          setError('Vui lòng chọn ngày bắt đầu.')
          setSubmitting(false)
          return
        }
        const start = new Date(formData.startDate)
        const fixedEnd = new Date(start)
        fixedEnd.setMonth(fixedEnd.getMonth() + Number(room.minLeaseMonths))
        payloadEndDate = fixedEnd.toISOString().slice(0, 10)
      } else if (room?.minLeaseMonths && formData.startDate && formData.endDate) {
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
        roomId: parseInt(roomId, 10),
        startDate: formData.startDate,
        endDate: payloadEndDate,
        deposit: room?.depositAmount ? parseFloat(room.depositAmount) : 0,
        notes: formData.notes,
        termsAccepted: true,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/my-contract')
      }, 2200)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu thuê phòng')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="primary" />
          <Typography color="text.secondary">Đang tải thông tin phòng…</Typography>
        </Stack>
      </Container>
    )
  }

  if (!room) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rooms/available')} sx={{ mb: 2 }}>
          Về danh sách phòng trống
        </Button>
        <Alert severity="error">{error || 'Không tìm thấy phòng.'}</Alert>
      </Container>
    )
  }

  if (room.status && room.status !== 'Available') {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rooms/available')} sx={{ mb: 2 }}>
          Về danh sách phòng trống
        </Button>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Phòng <strong>{room.roomNumber}</strong> hiện không còn ở trạng thái <strong>Trống</strong> (trạng thái:{' '}
          {room.status === 'Occupied'
            ? 'Đã thuê'
            : room.status === 'Reserved'
            ? 'Giữ chỗ'
            : room.status === 'Maintenance'
            ? 'Bảo trì'
            : room.status}
          ). Vui lòng chọn phòng khác.
        </Alert>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Yêu cầu thuê phòng đã được gửi. Vui lòng chờ chủ trọ duyệt.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bạn sẽ được chuyển tới trang <strong>Hợp đồng của tôi</strong> sau vài giây.
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/my-contract')}>
            Xem hợp đồng ngay
          </Button>
        </Paper>
      </Container>
    )
  }

  const images = room.imageUrls || []

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 3, px: { xs: 1.5, sm: 2.5 } }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2,
          borderRadius: 3,
          color: '#fff',
          backgroundImage:
            'linear-gradient(135deg, rgba(30,94,255,.86), rgba(124,77,255,.78)), url(https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Gửi yêu cầu thuê phòng
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Điền thông tin thuê và xác nhận điều khoản để hệ thống tạo yêu cầu cho chủ trọ duyệt.
        </Typography>
      </Paper>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/rooms/available')}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        Danh sách phòng trống
      </Button>

      <Typography variant="h4" component="h1" fontWeight={800} gutterBottom sx={{ color: 'primary.main' }}>
        Đăng ký thuê phòng {room.roomNumber}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
        Điền ngày bắt đầu và ghi chú (nếu có). Sau khi gửi, chủ trọ sẽ xem xét và duyệt hợp đồng.
      </Typography>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={7}>
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {images.length > 0 ? (
              <>
                <Box sx={{ position: 'relative', bgcolor: 'grey.100' }}>
                  <Box
                    component="img"
                    src={resolveImageUrl(images[selectedIndex] || images[0])}
                    alt={`Phòng ${room.roomNumber}`}
                    onClick={() => setPreviewOpen(true)}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: { xs: 240, sm: 320 },
                      objectFit: 'cover',
                      cursor: 'zoom-in',
                      display: 'block',
                    }}
                  />
                  {images.length > 1 && (
                    <>
                      <IconButton
                        aria-label="Ảnh trước"
                        onClick={() =>
                          setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                        }
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: 12,
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.92)',
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                        }}
                        size="small"
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        aria-label="Ảnh sau"
                        onClick={() =>
                          setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                        }
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          right: 12,
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.92)',
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                        }}
                        size="small"
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}
                  <Chip
                    label={`${selectedIndex + 1} / ${images.length}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      bgcolor: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, p: 1.5, flexWrap: 'wrap', bgcolor: 'grey.50' }}>
                  {images.map((url, index) => (
                    <Box
                      key={`${url}-${index}`}
                      component="img"
                      src={resolveImageUrl(url)}
                      alt=""
                      loading="lazy"
                      onClick={() => setSelectedIndex(index)}
                      sx={{
                        width: 64,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border:
                          selectedIndex === index ? '2px solid' : '1px solid',
                        borderColor: selectedIndex === index ? 'primary.main' : 'divider',
                        opacity: selectedIndex === index ? 1 : 0.85,
                        '&:hover': { opacity: 1 },
                      }}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: { xs: 200, sm: 260 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <HomeWorkOutlined sx={{ fontSize: 48, opacity: 0.5 }} />
                  <Typography variant="body2">Chưa có ảnh minh họa</Typography>
                </Stack>
              </Box>
            )}

            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  Thông tin phòng
                </Typography>
                <Chip label="Đang trống" color="success" size="small" variant="outlined" />
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <InfoRow icon={StraightenOutlined} label="Diện tích">
                {room.area} m²
              </InfoRow>
              <InfoRow icon={LayersOutlined} label="Số tầng">
                {room.floor || 'Tầng trệt'}
              </InfoRow>
              <InfoRow icon={PaymentsOutlined} label="Giá thuê / tháng" emphasize>
                {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ
              </InfoRow>
              <InfoRow icon={PaymentsOutlined} label="Tiền cọc">
                {room.depositAmount
                  ? `${new Intl.NumberFormat('vi-VN').format(room.depositAmount)} đ`
                  : 'Không yêu cầu cọc'}
              </InfoRow>
              {room.minLeaseMonths ? (
                <InfoRow icon={CalendarMonthOutlined} label="Thời hạn thuê tối thiểu">
                  {room.minLeaseMonths} tháng
                </InfoRow>
              ) : null}
              {room.description ? (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Mô tả
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {room.description}
                  </Typography>
                </>
              ) : null}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            variant="outlined"
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              position: { md: 'sticky' },
              top: { md: 16 },
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Thông tin đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nên đọc{' '}
              <Link component={RouterLink} to="/dieu-khoan-thue-tro" target="_blank" rel="noopener">
                điều khoản thuê trọ
              </Link>{' '}
              trước khi gửi.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Ngày bắt đầu thuê"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                const value = e.target.value
                let newEndDate = formData.endDate
                if (room?.minLeaseMonths && Number(room.minLeaseMonths) > 0 && value) {
                  const start = new Date(value)
                  const fixedEnd = new Date(start)
                  fixedEnd.setMonth(fixedEnd.getMonth() + Number(room.minLeaseMonths))
                  newEndDate = fixedEnd.toISOString().slice(0, 10)
                }
                setFormData({ ...formData, startDate: value, endDate: newEndDate })
              }}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: localDateInputToday() }}
              helperText="Không được chọn ngày trước hôm nay."
              required
            />
            {room?.minLeaseMonths && Number(room.minLeaseMonths) > 0 ? (
              <TextField
                fullWidth
                label="Ngày kết thúc (tự tính)"
                type="date"
                value={formData.endDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
                margin="normal"
                helperText={`Theo thời hạn tối thiểu ${room.minLeaseMonths} tháng từ ngày bắt đầu.`}
                disabled
              />
            ) : (
              <TextField
                fullWidth
                label="Ngày kết thúc dự kiến"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            )}
            <TextField
              fullWidth
              label="Ghi chú gửi chủ trọ"
              multiline
              minRows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              margin="normal"
              placeholder="Ví dụ: Dự kiến chuyển vào cuối tháng, cần xem phòng thực tế…"
            />
            <FormControlLabel
              sx={{ mt: 2, alignItems: 'flex-start', mr: 0 }}
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  color="primary"
                  sx={{ pt: 0.25 }}
                />
              }
              label={
                <Typography variant="body2" component="span">
                  Tôi đã đọc và đồng ý với{' '}
                  <Link component={RouterLink} to="/dieu-khoan-thue-tro" target="_blank" rel="noopener">
                    điều khoản thuê trọ
                  </Link>{' '}
                  (gồm chấm dứt hợp đồng và xử lý tiền cọc).
                </Typography>
              }
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/rooms/available')}
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {submitting ? 'Đang gửi…' : 'Gửi yêu cầu thuê'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: '#000' }}>
          <IconButton
            aria-label="Đóng"
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 1 }}
          >
            <Close />
          </IconButton>
          {images.length > 1 && (
            <>
              <IconButton
                aria-label="Ảnh trước"
                onClick={() =>
                  setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                }
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 8,
                  transform: 'translateY(-50%)',
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  zIndex: 1,
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                aria-label="Ảnh sau"
                onClick={() =>
                  setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                }
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  zIndex: 1,
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
          <Box
            component="img"
            src={resolveImageUrl(images[selectedIndex] || images[0] || '')}
            alt="Xem ảnh lớn"
            sx={{ width: '100%', height: 'auto', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default RentRoomPage
