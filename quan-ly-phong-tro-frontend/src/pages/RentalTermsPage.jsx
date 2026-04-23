import React from 'react'
import { Box, Container, Divider, Link as MuiLink, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <Box component="section" sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom color="primary">
      {title}
    </Typography>
    {children}
  </Box>
)

const RentalTermsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper elevation={0} sx={{ p: { xs: 2.2, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h4" gutterBottom>
          Điều khoản thuê trọ
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Văn bản này mô tả các nguyên tắc vận hành được hệ thống áp dụng khi bạn gửi yêu cầu thuê phòng. Khi tích
          chọn đồng ý trên form thuê, hệ thống ghi nhận thời điểm bạn xác nhận đã đọc các điểm chính dưới đây.
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Section title="1. Gửi yêu cầu và hiệu lực">
          <Typography variant="body2" paragraph>
            Yêu cầu thuê phòng là đề nghị gửi tới chủ trọ. Hợp đồng chỉ có hiệu lực sau khi chủ trọ duyệt và (nếu có
            cọc) sau khi bạn hoàn tất thanh toán cọc theo hóa đơn do chủ trọ phát hành trên hệ thống.
          </Typography>
        </Section>

        <Section title="2. Tiền thuê, tiền cọc và thanh toán">
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Giá thuê và tiền cọc theo thông tin phòng tại thời điểm đặt.</li>
              <li>Bạn thanh toán các hóa đơn (cọc, hóa đơn hàng tháng) đúng hạn theo quy định trên từng hóa đơn.</li>
              <li>Chỉ số điện, nước và các khoản phụ có thể được tính theo từng kỳ như trên hóa đơn.</li>
            </Box>
          </Typography>
        </Section>

        <Section title="3. Chấm dứt hợp đồng và xử lý cọc">
          <Typography variant="body2" paragraph>
            <strong>Chủ trọ chấm dứt hợp đồng:</strong> phải ghi nhận lý do trên hệ thống. Trong trường hợp chấm dứt
            thuộc trách nhiệm / quyết định phía chủ trọ có căn cứ hợp đồng và pháp luật, việc hoàn cọc (toàn phần
            hoặc một phần sau khấu trừ) được ghi nhận qua chức năng hoàn cọc sau khi hợp đồng đã chấm dứt hoặc hết
            hạn, phù hợp thỏa thuận thực tế giữa các bên.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Người thuê chấm dứt trước thời hạn:</strong> nếu bạn chủ động chấm dứt hợp đồng đang hiệu lực
            trong khi ngày kết thúc hợp đồng vẫn còn ở tương lai (so với ngày hệ thống ghi nhận), hệ thống áp dụng
            nguyên tắc <strong>mất tiền cọc đã thu</strong> theo điều khoản này — trừ khi các bên có thỏa thuận khác
            được ghi rõ trong hợp đồng giấy hoặc văn bản bổ sung ngoài hệ thống.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Hết hạn tự nhiên:</strong> khi đến ngày kết thúc, hợp đồng có thể được hệ thống chuyển trạng thái
            hết hạn; việc hoàn cọc (nếu có) do chủ trọ ghi nhận sau khi bàn giao phòng và quyết toán các khoản.
          </Typography>
        </Section>

        <Section title="4. Trách nhiệm và tranh chấp">
          <Typography variant="body2" paragraph>
            Các bên tuân thủ luật pháp Việt Nam và nội dung hợp đồng cụ thể do chủ trọ lập khi duyệt. Tranh chấp phát
            sinh ngoài phạm vi phần mềm được các bên giải quyết theo thỏa thuận, hòa giải hoặc cơ quan có thẩm
            quyền.
          </Typography>
        </Section>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Bạn có thể quay lại{' '}
          <MuiLink component={Link} to="/rooms/available">
            danh sách phòng
          </MuiLink>{' '}
          hoặc màn hình thuê phòng để hoàn tất gửi yêu cầu (sau khi đăng nhập tài khoản người thuê).
        </Typography>
      </Paper>
    </Container>
  )
}

export default RentalTermsPage
