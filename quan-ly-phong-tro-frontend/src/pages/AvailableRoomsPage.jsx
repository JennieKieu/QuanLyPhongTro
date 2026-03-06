import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CardMedia,
} from '@mui/material'
import { roomService } from '../services/roomService'

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5201'
const resolveImageUrl = (url) => (url?.startsWith('http') ? url : `${API_ORIGIN}${url}`)

const AvailableRoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Phòng trống
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {rooms.length === 0 ? (
        <Alert severity="info">Hiện tại không có phòng trống</Alert>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card>
                {room.imageUrls && room.imageUrls.length > 0 && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={resolveImageUrl(room.imageUrls[0])}
                    alt={`Phòng ${room.roomNumber}`}
                  />
                )}
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Phòng {room.roomNumber}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Diện tích: {room.area} m²
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('vi-VN').format(room.monthlyRent)} đ/tháng
                  </Typography>
                  {room.minLeaseMonths && (
                    <Typography variant="body2" color="text.secondary">
                      Tối thiểu thuê: {room.minLeaseMonths} tháng
                    </Typography>
                  )}
                  {room.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {room.description}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/rooms/rent/${room.id}`)}
                  >
                    Thuê phòng
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default AvailableRoomsPage
