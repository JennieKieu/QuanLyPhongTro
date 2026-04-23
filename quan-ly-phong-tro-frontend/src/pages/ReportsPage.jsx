import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { reportService } from '../services/reportService'

const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v || 0)
const chartColors = ['#2e7d32', '#0288d1', '#ed6c02', '#d32f2f', '#7b1fa2', '#1976d2']
const shortCurrency = (value) => {
  const n = Number(value || 0)
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} triệu`
  return fmt(n)
}

const ReportsPage = () => {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  const yearOptions = useMemo(() => {
    const y = now.getFullYear()
    return [y - 2, y - 1, y, y + 1]
  }, [now])

  const loadReport = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await reportService.getSummary({ month, year })
      setReport(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải báo cáo thống kê')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [month, year])

  if (loading) {
    return (
      <Container>
        <Typography>Đang tải báo cáo...</Typography>
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
            'linear-gradient(120deg, rgba(30,94,255,.9), rgba(124,77,255,.75)), url(https://images.unsplash.com/photo-1551281044-8b2d4f6d3f86?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Báo cáo tổng quan nhà trọ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95 }}>
          Theo dõi doanh thu, trạng thái phòng và hóa đơn theo tháng để ra quyết định vận hành.
        </Typography>
      </Paper>
      <Typography variant="h4" gutterBottom>
        Báo cáo thống kê hệ thống
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, maxWidth: 420 }}>
        <TextField
          select
          fullWidth
          label="Tháng"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <MenuItem key={m} value={m}>
              Tháng {m}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Năm"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {report && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Biểu đồ doanh thu theo tháng ({report.period.year})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Doanh thu thuần đã thanh toán: hóa đơn tháng + hóa đơn cọc (theo tháng phát hành) trừ hoàn cọc ghi nhận trong tháng
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={report.yearlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => shortCurrency(v)} />
                    <Tooltip formatter={(v) => `${fmt(v)} đ`} labelFormatter={(l) => `Tháng ${l}`} />
                    <Legend formatter={() => 'Doanh thu'} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2e7d32"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Tỷ trọng trạng thái phòng
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Phân bổ số phòng theo trạng thái vận hành hiện tại
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Đã thuê', value: report.overview.occupiedRooms },
                        { name: 'Giữ chỗ', value: report.overview.reservedRooms },
                        { name: 'Trống', value: report.overview.availableRooms },
                        { name: 'Bảo trì', value: report.overview.maintenanceRooms },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={85}
                      label
                    >
                      {chartColors.map((c, i) => (
                        <Cell key={c + i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${fmt(v)} phòng`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Trạng thái hóa đơn kỳ {report.period.month}/{report.period.year}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hóa đơn tháng của kỳ + hóa đơn cọc tạo trong tháng/năm đã chọn
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { name: 'Đã thanh toán', value: report.invoices.paidInvoices },
                      { name: 'Chưa thanh toán', value: report.invoices.pendingInvoices },
                      { name: 'Quá hạn', value: report.invoices.overdueInvoices },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(v) => `${fmt(v)} hóa đơn`} />
                    <Bar dataKey="value">
                      <Cell fill="#2e7d32" />
                      <Cell fill="#ed6c02" />
                      <Cell fill="#d32f2f" />
                      <LabelList dataKey="value" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 320 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Top công nợ khách thuê
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  6 khách thuê có tổng nợ cao nhất trong hệ thống
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={report.debtByTenant.slice(0, 6)} layout="vertical" margin={{ left: 20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => shortCurrency(v)} />
                    <YAxis dataKey="tenantName" type="category" width={110} />
                    <Tooltip formatter={(v) => `${fmt(v)} đ`} />
                    <Bar dataKey="debt" fill="#d32f2f">
                      <LabelList dataKey="debt" position="right" formatter={(v) => shortCurrency(v)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="body2">Tổng số phòng</Typography><Typography variant="h6">{fmt(report.overview.totalRooms)}</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="body2">Tỷ lệ lấp đầy</Typography><Typography variant="h6">{fmt(report.overview.occupancyRate)}%</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2">Doanh thu đã thu (thuần)</Typography>
                  <Typography variant="h6">{fmt(report.invoices.paidRevenue)} đ</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Hóa đơn đã thu: {fmt(report.invoices.invoicePaidRevenueGross ?? report.invoices.paidRevenue)} đ
                    {(report.invoices.depositRefundsInPeriod ?? 0) > 0 && (
                      <> · Hoàn cọc trong kỳ: −{fmt(report.invoices.depositRefundsInPeriod)} đ</>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="body2">Công nợ (kỳ + cọc trong tháng)</Typography><Typography variant="h6" color="error.main">{fmt(report.invoices.outstandingDebt)} đ</Typography></CardContent></Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Tổng quan vận hành</Typography>
                <Typography variant="body2">Phòng trống: {fmt(report.overview.availableRooms)}</Typography>
                <Typography variant="body2">Phòng giữ chỗ: {fmt(report.overview.reservedRooms)}</Typography>
                <Typography variant="body2">Phòng đã thuê: {fmt(report.overview.occupiedRooms)}</Typography>
                <Typography variant="body2">Phòng bảo trì: {fmt(report.overview.maintenanceRooms)}</Typography>
                <Typography variant="body2">Tổng khách thuê: {fmt(report.overview.totalTenants)}</Typography>
                <Typography variant="body2">Hợp đồng hoạt động: {fmt(report.overview.activeContracts)}</Typography>
                <Typography variant="body2">Hợp đồng chờ xử lý: {fmt(report.overview.pendingContracts)}</Typography>
                <Typography variant="body2">HĐ sắp hết hạn (30 ngày): {fmt(report.overview.expiringIn30Days)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Tổng hợp hóa đơn kỳ {report.period.month}/{report.period.year}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tháng: {fmt(report.invoices.monthlyInvoicesInPeriod ?? 0)} · Cọc phát sinh trong tháng:{' '}
                  {fmt(report.invoices.depositInvoicesInPeriod ?? 0)}
                </Typography>
                <Typography variant="body2">Tổng hóa đơn: {fmt(report.invoices.totalInvoices)}</Typography>
                <Typography variant="body2">Đã thanh toán: {fmt(report.invoices.paidInvoices)}</Typography>
                <Typography variant="body2">Chưa thanh toán: {fmt(report.invoices.pendingInvoices)}</Typography>
                <Typography variant="body2">Quá hạn: {fmt(report.invoices.overdueInvoices)}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Hoàn cọc ghi nhận trong kỳ: {fmt(report.invoices.depositRefundsInPeriod ?? 0)} đ (đã trừ ở doanh thu thuần)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Chỉ từ hóa đơn tháng của kỳ (không gồm hóa đơn cọc)
                </Typography>
                <Typography variant="body2">Tiền phòng: {fmt(report.utilities.roomRentTotal)} đ</Typography>
                <Typography variant="body2">Tiền điện: {fmt(report.utilities.electricityTotal)} đ</Typography>
                <Typography variant="body2">Tiền nước: {fmt(report.utilities.waterTotal)} đ</Typography>
                <Typography variant="body2">Tiền dịch vụ: {fmt(report.utilities.serviceFeeTotal)} đ</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <strong>Doanh thu theo tháng ({report.period.year})</strong>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Thuần: đã trừ hoàn cọc theo tháng ghi nhận
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tháng</TableCell>
                      <TableCell align="right">Doanh thu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.yearlyRevenue.map((r) => (
                      <TableRow key={r.month}>
                        <TableCell>{r.month}</TableCell>
                        <TableCell align="right">{fmt(r.revenue)} đ</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={3}><strong>Top công nợ theo khách thuê</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Khách thuê</TableCell>
                      <TableCell align="right">Số hóa đơn</TableCell>
                      <TableCell align="right">Nợ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.debtByTenant.length === 0 ? (
                      <TableRow><TableCell colSpan={3} align="center">Không có công nợ</TableCell></TableRow>
                    ) : (
                      report.debtByTenant.map((d) => (
                        <TableRow key={d.tenantId}>
                          <TableCell>{d.tenantName}</TableCell>
                          <TableCell align="right">{fmt(d.invoiceCount)}</TableCell>
                          <TableCell align="right">{fmt(d.debt)} đ</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <strong>Top phòng theo doanh thu thuần (hóa đơn kỳ + cọc − hoàn cọc theo phòng trong kỳ)</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phòng</TableCell>
                    <TableCell align="right">Số hóa đơn</TableCell>
                    <TableCell align="right">Doanh thu</TableCell>
                    <TableCell align="right">Đã thu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.roomRevenue.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center">Chưa có dữ liệu</TableCell></TableRow>
                  ) : (
                    report.roomRevenue.map((r) => (
                      <TableRow key={r.roomId}>
                        <TableCell>{r.roomNumber}</TableCell>
                        <TableCell align="right">{fmt(r.invoiceCount)}</TableCell>
                        <TableCell align="right">{fmt(r.revenue)} đ</TableCell>
                        <TableCell align="right">{fmt(r.paidRevenue)} đ</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Container>
  )
}

export default ReportsPage

