import React from 'react'
import { Box, Container, Grid, Link, Typography, Divider } from '@mui/material'
import HomeWorkOutlined from '@mui/icons-material/HomeWorkOutlined'
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined'
import { boardingHouseInfo } from '../../config/boardingHouseInfo'
import { useAuth } from '../../context/AuthContext'

const COPYRIGHT_LINE = 'Bản quyền © 2026 EZROOM. Tất cả quyền được bảo lưu.'

const SectionTitle = ({ icon: Icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Icon sx={{ fontSize: 22, color: 'primary.main', opacity: 0.9 }} />
    <Typography variant="subtitle1" component="h2" fontWeight={700} color="primary">
      {children}
    </Typography>
  </Box>
)

const AppFooter = () => {
  const { isLandlord } = useAuth()
  const {
    name,
    tagline,
    address,
    hotline,
    email,
    landlordName,
    bankName,
    bankAccountNumber,
    bankAccountHolder,
    bankTransferNote,
  } = boardingHouseInfo

  const hasBoarding = Boolean(name || tagline || landlordName || address || hotline || email)
  const hasBank = Boolean(bankName || bankAccountNumber || bankAccountHolder || bankTransferNote)

  if (isLandlord) {
    return (
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 2,
          px: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            sx={{ fontSize: '0.8rem' }}
          >
            {COPYRIGHT_LINE}
          </Typography>
        </Container>
      </Box>
    )
  }

  if (!hasBoarding && !hasBank) {
    return null
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        px: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {hasBoarding && (
            <Grid item xs={12} md={hasBank ? 6 : 12}>
              <SectionTitle icon={HomeWorkOutlined}>Nhà trọ</SectionTitle>
              {name && (
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {name}
                </Typography>
              )}
              {tagline && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {tagline}
                </Typography>
              )}
              {landlordName && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: address ? 0.75 : 1 }}>
                  Chủ trọ: <strong>{landlordName}</strong>
                </Typography>
              )}
              {address && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Địa chỉ: {address}
                </Typography>
              )}
              {hotline && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Hotline:{' '}
                  <Link href={`tel:${hotline.replace(/\s/g, '')}`} underline="hover" color="inherit">
                    {hotline}
                  </Link>
                </Typography>
              )}
              {email && (
                <Typography variant="body2" color="text.secondary">
                  Email:{' '}
                  <Link href={`mailto:${email}`} underline="hover" color="inherit">
                    {email}
                  </Link>
                </Typography>
              )}
            </Grid>
          )}

          {hasBank && (
            <Grid item xs={12} md={hasBoarding ? 6 : 12}>
              <SectionTitle icon={AccountBalanceOutlined}>Thanh toán (chuyển khoản)</SectionTitle>
              {bankName && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Ngân hàng: <strong>{bankName}</strong>
                </Typography>
              )}
              {bankAccountNumber && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Số tài khoản:{' '}
                  <Box
                    component="span"
                    sx={{
                      fontFamily: 'ui-monospace, monospace',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {bankAccountNumber}
                  </Box>
                </Typography>
              )}
              {bankAccountHolder && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Chủ TK: <strong>{bankAccountHolder}</strong>
                </Typography>
              )}
              {bankTransferNote && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                  {bankTransferNote}
                </Typography>
              )}
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" color="text.secondary" display="block" textAlign={{ xs: 'left', sm: 'center' }}>
          {COPYRIGHT_LINE}
        </Typography>
      </Container>
    </Box>
  )
}

export default AppFooter
