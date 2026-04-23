import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import {
  Chip,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Link,
  Alert,
  CardMedia,
  TextField,
  Stack,
  TablePagination,
} from '@mui/material'
import { roomService } from '../services/roomService'

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5201'
const resolveImageUrl = (url) => (url?.startsWith('http') ? url : `${API_ORIGIN}${url}`)

/** 5 cột × 4 dòng mỗi trang */
const GRID_COLS = 5
const GRID_ROWS = 4
const ROOMS_PER_PAGE = GRID_COLS * GRID_ROWS

const AvailableRoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const data = await roomService.getAvailable()
      setRooms(data)
    } catch (err) {
      setError('Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }

  const queryFromUrl = new URLSearchParams(location.search).get('q')?.trim() || ''
  const query = (searchTerm || queryFromUrl).trim().toLowerCase()
  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        if (!query) return true
        return (
          room.roomNumber?.toLowerCase().includes(query) ||
          room.description?.toLowerCase().includes(query)
        )
      }),
    [rooms, query]
  )

  useEffect(() => {
    setPage(0)
  }, [query])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredRooms.length / ROOMS_PER_PAGE) - 1)
    setPage((p) => (p > maxPage ? maxPage : p))
  }, [filteredRooms.length])

  const pagedRooms = filteredRooms.slice(
    page * ROOMS_PER_PAGE,
    page * ROOMS_PER_PAGE + ROOMS_PER_PAGE
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
      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2.2, sm: 2.8 },
          borderRadius: 3,
          color: '#fff',
          backgroundImage:
            'linear-gradient(120deg, rgba(30,94,255,.88), rgba(124,77,255,.82)), url(https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Phòng trống
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Khám phá phòng phù hợp theo ngân sách và vị trí, gửi yêu cầu thuê ngay trong vài bước.
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Nên đọc{' '}
        <Link component={RouterLink} to="/dieu-khoan-thue-tro">
          điều khoản thuê trọ
        </Link>{' '}
        trước khi gửi yêu cầu thuê phòng.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Tìm kiếm phòng"
          placeholder="Số phòng, mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault()
          }}
        />
        <Button variant="outlined" onClick={() => setSearchTerm('')}>
          Xóa lọc
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {filteredRooms.length === 0 ? (
        <Alert severity="info">
          {query ? 'Không tìm thấy phòng phù hợp' : 'Hiện tại không có phòng trống'}
        </Alert>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              },
            }}
          >
            {pagedRooms.map((room) => (
              <Card
                key={room.id}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {room.imageUrls && room.imageUrls.length > 0 && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={resolveImageUrl(room.imageUrls[0])}
                    alt={`Phòng ${room.roomNumber}`}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flex: 1 }}>
                  <Chip
                    label={`Phòng ${room.roomNumber}`}
                    color="primary"
                    size="small"
                    sx={{ mb: 1, fontWeight: 700 }}
                  />
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Vị trí: {room.floor || 'Tầng trệt'}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Diện tích: {room.area} m²
                  </Typography>
                  <Typography variant="subtitle1" color="primary" fontWeight={700}>
                    {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ/tháng
                  </Typography>
                  {room.minLeaseMonths && (
                    <Typography variant="body2" color="text.secondary">
                      Tối thiểu thuê: {room.minLeaseMonths} tháng
                    </Typography>
                  )}
                  {room.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={room.description}
                    >
                      {room.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/rooms/rent/${room.id}`)}
                  >
                    Thuê phòng
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
          <TablePagination
            component="div"
            count={filteredRooms.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={ROOMS_PER_PAGE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}
          />
        </>
      )}
    </Container>
  )
}

export default AvailableRoomsPage
