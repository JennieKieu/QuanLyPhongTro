import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, isLandlord, isTenant } = useAuth()
  const navigate = useNavigate()

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chào mừng, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Vai trò: {isLandlord ? 'Chủ trọ' : 'Người thuê'}
      </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {isLandlord && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Quản lý phòng</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/rooms')}
                      sx={{ mt: 2 }}
                    >
                      Xem phòng
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Quản lý khách hàng</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/tenants')}
                      sx={{ mt: 2 }}
                    >
                      Xem khách hàng
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Quản lý hợp đồng</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/contracts')}
                      sx={{ mt: 2 }}
                    >
                      Xem hợp đồng
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Quản lý hóa đơn</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/invoices')}
                      sx={{ mt: 2 }}
                    >
                      Xem hóa đơn
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Quản lý điện/nước</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/utilities')}
                      sx={{ mt: 2 }}
                    >
                      Nhập chỉ số
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {isTenant && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Xem phòng trống</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/rooms/available')}
                      sx={{ mt: 2 }}
                    >
                      Tìm phòng
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Hợp đồng của tôi</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/my-contract')}
                      sx={{ mt: 2 }}
                    >
                      Xem hợp đồng
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Hóa đơn của tôi</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/my-invoices')}
                      sx={{ mt: 2 }}
                    >
                      Xem hóa đơn
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Thông tin tài khoản</Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/profile')}
                  sx={{ mt: 2 }}
                >
                  Xem profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard

