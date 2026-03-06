import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Alert,
  Chip,
} from '@mui/material'
import { invoiceService } from '../services/invoiceService'

const MyInvoicesPage = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await invoiceService.getMyInvoices()
      setInvoices(data)
    } catch (err) {
      setError('Không thể tải danh sách hóa đơn')
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
        Hóa đơn của tôi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {invoices.length === 0 ? (
        <Alert severity="info">Bạn chưa có hóa đơn nào</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tháng/Năm</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Tiền phòng</TableCell>
                <TableCell>Tiền điện</TableCell>
                <TableCell>Tiền nước</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Hạn thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {invoice.month}/{invoice.year}
                  </TableCell>
                  <TableCell>{invoice.roomNumber}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(invoice.roomRent)} đ
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      invoice.electricityAmount
                    )}{' '}
                    đ
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(
                      invoice.waterAmount
                    )}{' '}
                    đ
                  </TableCell>
                  <TableCell>
                    <strong>
                      {new Intl.NumberFormat('vi-VN').format(
                        invoice.totalAmount
                      )}{' '}
                      đ
                    </strong>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        invoice.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'
                      }
                      color={invoice.status === 'Paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}

export default MyInvoicesPage
