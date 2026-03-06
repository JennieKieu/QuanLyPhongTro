# Hệ Thống Quản Lý Phòng Trọ

Hệ thống quản lý phòng trọ với ReactJS frontend và ASP.NET Core backend.

## Công nghệ sử dụng

- **Frontend**: React 18, Material-UI, React Router, Axios
- **Backend**: ASP.NET Core 9.0, Entity Framework Core, SQL Server
- **Authentication**: JWT Bearer Token
- **Email**: SMTP (OTP verification)

## Cấu trúc dự án

```
QuanLyPhongTro/
├── QuanLyPhongTro.API/          # Backend API
│   ├── Controllers/             # API Controllers
│   ├── Models/                  # Entity Models
│   ├── Services/                # Business Logic Services
│   ├── Data/                   # DbContext
│   ├── DTOs/                   # Data Transfer Objects
│   └── Migrations/             # Database Migrations
└── quan-ly-phong-tro-frontend/  # Frontend React
    ├── src/
    │   ├── components/          # React Components
    │   ├── pages/               # Page Components
    │   ├── services/            # API Services
    │   └── context/             # React Context
    └── public/
```

## Cài đặt và chạy

### Backend

1. Cài đặt .NET SDK 9.0

2. Chạy migrations:
   ```bash
   cd QuanLyPhongTro.API
   dotnet ef database update
   ```
3. Chạy API:
   ```bash
   dotnet run
   ```

### Frontend

1. Cài đặt dependencies:
   ```bash
   cd quan-ly-phong-tro-frontend
   npm install
   ```
2. Chạy development server:
   ```bash
   npm run dev
   ```

## Tính năng

### Chức năng chung
- ✅ Đăng ký với OTP email verification
- ✅ Đăng nhập/Đăng xuất
- ✅ Quên mật khẩu (OTP email)
- ✅ Đổi mật khẩu
- ✅ Quản lý thông tin tài khoản

### Chức năng cho Chủ trọ (Landlord)
- ✅ Quản lý phòng trọ (CRUD)
- ✅ Quản lý khách hàng
- ✅ Quản lý hợp đồng thuê phòng
- ✅ Duyệt/từ chối yêu cầu thuê phòng
- ✅ Nhập và quản lý chỉ số điện/nước
- ✅ Tạo hóa đơn tự động
- ✅ Theo dõi trạng thái thanh toán

### Chức năng cho Người thuê (Tenant)
- ✅ Xem danh sách phòng trống
- ✅ Thuê phòng (tạo yêu cầu)
- ✅ Xem hợp đồng của mình
- ✅ Xem hóa đơn theo tháng
- ✅ Theo dõi lịch sử thanh toán
- ✅ Cập nhật thông tin cá nhân

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký (gửi OTP)
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/change-password` - Đổi mật khẩu
- `GET /api/auth/me` - Thông tin user hiện tại

### Rooms
- `GET /api/rooms` - Danh sách phòng (Landlord)
- `GET /api/rooms/available` - Phòng trống (Public)
- `GET /api/rooms/{id}` - Chi tiết phòng
- `POST /api/rooms` - Tạo phòng (Landlord)
- `PUT /api/rooms/{id}` - Cập nhật phòng (Landlord)
- `DELETE /api/rooms/{id}` - Xóa phòng (Landlord)

### Contracts
- `GET /api/contracts` - Danh sách hợp đồng (Landlord)
- `GET /api/contracts/pending` - Hợp đồng chờ duyệt (Landlord)
- `GET /api/contracts/my-contract` - Hợp đồng của tôi (Tenant)
- `POST /api/contracts` - Tạo hợp đồng (Landlord)
- `POST /api/contracts/rent-room` - Thuê phòng (Tenant)
- `PUT /api/contracts/{id}/approve` - Duyệt hợp đồng (Landlord)
- `PUT /api/contracts/{id}/reject` - Từ chối hợp đồng (Landlord)

### Invoices
- `GET /api/invoices` - Danh sách hóa đơn (Landlord)
- `GET /api/invoices/my-invoices` - Hóa đơn của tôi (Tenant)
- `POST /api/invoices/generate` - Tạo hóa đơn (Landlord)
- `PUT /api/invoices/{id}/pay` - Thanh toán hóa đơn (Landlord)

### Utilities
- `GET /api/utilities` - Danh sách chỉ số (Landlord)
- `POST /api/utilities` - Nhập chỉ số (Landlord)

## Database Schema

- **Users**: Thông tin đăng nhập và phân quyền
- **Tenants**: Thông tin người thuê
- **Rooms**: Thông tin phòng trọ
- **Contracts**: Hợp đồng thuê phòng
- **Invoices**: Hóa đơn tiền phòng
- **UtilityReadings**: Chỉ số điện/nước
- **Payments**: Lịch sử thanh toán
- **OtpCodes**: Mã OTP xác thực

## Phát triển tiếp

Các tính năng có thể mở rộng:
- Export hóa đơn ra PDF
- Thông báo email/SMS
- Thống kê và báo cáo
- Upload ảnh phòng trọ
- Tìm kiếm và lọc nâng cao

