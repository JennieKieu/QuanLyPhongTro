import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import MeetingRoomOutlined from '@mui/icons-material/MeetingRoomOutlined'
import PeopleOutline from '@mui/icons-material/PeopleOutline'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import ElectricalServicesOutlined from '@mui/icons-material/ElectricalServicesOutlined'
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'

/**
 * Menu / lối tắt chủ trọ — dùng chung sidebar, header (mobile), dashboard.
 */
export const landlordNavItems = [
  {
    path: '/dashboard',
    label: 'Trang chủ',
    drawerLabel: 'Trang chủ',
    description: 'Tổng quan hệ thống',
    Icon: DashboardOutlined,
  },
  {
    path: '/rooms',
    label: 'Phòng trọ',
    drawerLabel: 'Phòng trọ',
    description: 'Số phòng, giá thuê, cọc, trạng thái và hình ảnh',
    Icon: MeetingRoomOutlined,
  },
  {
    path: '/tenants',
    label: 'Khách hàng',
    drawerLabel: 'Khách hàng',
    description: 'Danh sách người thuê và thông tin liên hệ',
    Icon: PeopleOutline,
  },
  {
    path: '/contracts',
    label: 'Hợp đồng',
    drawerLabel: 'Hợp đồng',
    description: 'Duyệt, gia hạn, cọc và chấm dứt hợp đồng',
    Icon: DescriptionOutlined,
  },
  {
    path: '/invoices',
    label: 'Hóa đơn',
    drawerLabel: 'Hóa đơn',
    description: 'Tạo hóa đơn, thanh toán và theo dõi công nợ',
    Icon: ReceiptLongOutlined,
  },
  {
    path: '/utilities',
    label: 'Điện, nước & dịch vụ',
    drawerLabel: 'Điện / nước',
    description: 'Chỉ số điện nước và phí dịch vụ theo tháng',
    Icon: ElectricalServicesOutlined,
  },
  {
    path: '/reports',
    label: 'Báo cáo',
    drawerLabel: 'Báo cáo',
    description: 'Doanh thu, hóa đơn và tổng hợp theo kỳ',
    Icon: AssessmentOutlined,
  },
]
