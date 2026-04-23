# 3.2 Thiết kế hệ thống

Phần này mô tả thiết kế logic của hệ thống quản lý phòng trọ theo **phiên bản mã nguồn hiện tại** (ASP.NET Core API + EF Core, SQL Server). Các thực thể dữ liệu dưới đây khớp với lớp `Models` trong dự án `QuanLyPhongTro.API` và tên bảng vật lý trong migration (snapshot EF Core).

**Tham chiếu sơ đồ:** ERD / kết hợp thực thể — [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml), [`BaoCao-ERD-MoiKetHop.drawio`](./BaoCao-ERD-MoiKetHop.drawio); CDM — [`BaoCao-CDM-MoiKetHop.puml`](./BaoCao-CDM-MoiKetHop.puml); PDM — [`BaoCao-PDM-MoiKetHop.puml`](./BaoCao-PDM-MoiKetHop.puml).

---

## 3.2.1 Các thực thể

**Quy ước:** Tên lớp C# / bảng SQL (tiếng Anh) kèm tên gọi nghiệp vụ tiếng Việt. Thuộc tính có thể null trong C# được ghi *(tùy chọn)*. Giá trị trạng thái trong ngoặc là ví dụ theo mã nguồn (chuỗi lưu trong CSDL).

### Thực thể Người dùng (User)

**Hình 3:** Thực thể người dùng — xem khối **Users** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** USER — bảng **`Users`** (Người dùng).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã người dùng (khóa chính).
  - **Email:** Địa chỉ email đăng nhập (duy nhất trong hệ thống).
  - **PasswordHash:** Mật khẩu đã băm (không lưu mật khẩu thô).
  - **Role:** Vai trò (ví dụ: chủ trọ / khách thuê — giá trị chuỗi trong code: `Landlord`, `Tenant`).
  - **FullName:** Họ và tên.
  - **Phone:** Số điện thoại.
  - **IsEmailVerified:** Đã xác thực email hay chưa.
  - **CreatedAt:** Thời điểm tạo tài khoản.
  - **LastLoginAt:** Lần đăng nhập gần nhất *(tùy chọn)*.

**Liên kết:** Một người dùng có tối đa **một** hồ sơ khách thuê (`Tenants.UserId` unique) — quan hệ **1 : 0..1**.

---

### Thực thể Khách thuê (Tenant)

**Hình 4:** Thực thể khách thuê — khối **Tenants** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** KHACHTHUE — bảng **`Tenants`** (Khách thuê).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã khách thuê (khóa chính).
  - **UserId:** Mã người dùng (khóa ngoại tới `Users.Id`, **duy nhất** — mỗi tài khoản tối đa một hồ sơ tenant).
  - **FullName:** Họ và tên.
  - **Phone:** Số điện thoại.
  - **Email:** Email liên hệ trên hồ sơ.
  - **IdentityCard:** Số CMND/CCCD *(tùy chọn)*.
  - **Address:** Địa chỉ *(tùy chọn)*.
  - **DateOfBirth:** Ngày sinh *(tùy chọn)*.
  - **Gender:** Giới tính *(tùy chọn)*.
  - **EmergencyContact:** Người liên hệ khẩn cấp *(tùy chọn)*.
  - **EmergencyPhone:** Số điện thoại liên hệ khẩn cấp *(tùy chọn)*.
  - **CreatedAt:** Thời điểm tạo hồ sơ.

---

### Thực thể Phòng (Room)

**Hình 5:** Thực thể phòng — khối **Rooms** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** PHONG — bảng **`Rooms`** (Phòng).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã phòng (khóa chính).
  - **RoomNumber:** Số hiệu phòng.
  - **Area:** Diện tích (m²).
  - **MonthlyRent:** Giá thuê tháng.
  - **Status:** Trạng thái phòng (chuỗi trong CSDL; ví dụ: `Available`, `Reserved`, `Occupied`, `Maintenance` — tương ứng trống / giữ chỗ / đang thuê / bảo trì).
  - **Description:** Mô tả phòng *(tùy chọn)*.
  - **ImageUrls:** Danh sách đường dẫn ảnh *(tùy chọn)*, lưu dạng chuỗi (JSON).
  - **DepositAmount:** Tiền cọc yêu cầu *(tùy chọn; null = không quy định)*.
  - **MinLeaseMonths:** Số tháng thuê tối thiểu *(tùy chọn; null hoặc ≤ 0 = không ràng buộc)*.
  - **CreatedAt:** Thời điểm tạo bản ghi.

---

### Thực thể Hợp đồng (Contract)

**Hình 6:** Thực thể hợp đồng — khối **Contracts** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** HOPDONG — bảng **`Contracts`** (Hợp đồng).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã hợp đồng (khóa chính).
  - **RoomId:** Mã phòng (FK → `Rooms`).
  - **TenantId:** Mã khách thuê (FK → `Tenants`).
  - **StartDate:** Ngày bắt đầu hiệu lực (theo hợp đồng).
  - **EndDate:** Ngày kết thúc theo kỳ hạn (theo hợp đồng).
  - **MonthlyRent:** Tiền thuê tháng đã thỏa thuận.
  - **Deposit:** Tiền cọc thỏa thuận *(tùy chọn)*.
  - **DepositPaid:** Số tiền cọc đã thu (ghi nhận qua luồng hóa đơn cọc).
  - **DepositPaidAt:** Thời điểm ghi nhận đã thu cọc *(tùy chọn)*.
  - **DepositRefundedAmount:** Số tiền đã hoàn cho khách (0 nếu không hoàn / khấu trừ hết).
  - **DepositRefundedAt:** Thời điểm ghi nhận xử lý hoàn cọc *(tùy chọn)*.
  - **DepositRefundNotes:** Ghi chú hoàn cọc *(tùy chọn)*.
  - **Status:** Trạng thái (ví dụ: `Pending`, `AwaitingDeposit`, `Active`, `Expired`, `Terminated`, `Rejected`).
  - **Terms:** Nội dung điều khoản *(tùy chọn)*.
  - **Notes:** Ghi chú nội bộ *(tùy chọn)*.
  - **ContractNumber:** Số hiệu hợp đồng *(tùy chọn)*.
  - **SignedDate:** Ngày ký *(tùy chọn)*.
  - **SignedByLandlord:** Chủ trọ đã ký (bool).
  - **SignedByTenant:** Khách thuê đã ký (bool).
  - **RentalTermsAcceptedAt:** Thời điểm người thuê xác nhận đã đọc điều khoản thuê trọ *(tùy chọn)*.
  - **TerminationInitiatedBy:** Bên khởi xướng chấm dứt *(tùy chọn; ví dụ Landlord / Tenant)*.
  - **TerminationReason:** Lý do chấm dứt *(tùy chọn)*.
  - **EndedAt:** Thời điểm hệ thống ghi nhận kết thúc hợp đồng *(tùy chọn; khi trạng thái kết thúc / hết hạn)*.
  - **CreatedAt:** Thời điểm tạo bản ghi.
  - **CreatedBy:** Mã người dùng tạo *(tùy chọn)*.
  - **ApprovedAt:** Thời điểm duyệt *(tùy chọn)*.
  - **ApprovedBy:** Mã người dùng duyệt *(tùy chọn)*.

---

### Thực thể Hóa đơn (Invoice)

**Hình 7:** Thực thể hóa đơn — khối **Invoices** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** HOADON — bảng **`Invoices`** (Hóa đơn).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã hóa đơn (khóa chính).
  - **ContractId:** Mã hợp đồng (FK → `Contracts`).
  - **InvoiceType:** Loại hóa đơn (chuỗi; ví dụ: `Monthly` — hàng tháng, `Deposit` — cọc).
  - **Month:** Tháng tính tiền / tham chiếu kỳ.
  - **Year:** Năm tính tiền / tham chiếu kỳ.
  - **RoomRent:** Tiền phòng.
  - **ElectricityAmount:** Tiền điện.
  - **WaterAmount:** Tiền nước.
  - **TotalAmount:** Tổng tiền.
  - **Status:** Trạng thái (ví dụ: `Pending`, `Paid`, `Overdue`).
  - **DueDate:** Hạn thanh toán.
  - **CreatedAt:** Thời điểm tạo hóa đơn.

---

### Thực thể Chỉ số điện nước (UtilityReading)

**Hình 8:** Thực thể chỉ số điện nước — khối **Utilities** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** CHISODIENNUOC — bảng **`Utilities`** (Chỉ số điện nước; lớp C#: `UtilityReading`).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã bản ghi (khóa chính).
  - **RoomId:** Mã phòng (FK → `Rooms`).
  - **Month:** Tháng ghi chỉ số.
  - **Year:** Năm ghi chỉ số.
  - **ElectricityIndex:** Chỉ số công tơ điện.
  - **WaterIndex:** Chỉ số nước.
  - **ElectricityUnitPrice:** Đơn giá điện (kỳ ghi nhận).
  - **WaterUnitPrice:** Đơn giá nước (kỳ ghi nhận).
  - **ServiceFee:** Phí dịch vụ (một khoản gộp theo kỳ, dùng trong tính hóa đơn).
  - **RecordedAt:** Thời điểm ghi nhận chỉ số.

---

### Thực thể Mã OTP (OtpCode)

**Hình 9:** Thực thể mã OTP — khối **OtpCodes** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** MAOTP — bảng **`OtpCodes`** (Mã OTP).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã bản ghi (khóa chính).
  - **Email:** Email nhận OTP.
  - **Code:** Mã OTP.
  - **ExpiresAt:** Thời điểm hết hạn.
  - **Used:** Đã sử dụng hay chưa.
  - **CreatedAt:** Thời điểm tạo mã.

**Lưu ý:** Không có khóa ngoại tới `Users`; liên kết nghiệp vụ theo **Email** (và chỉ mục kép Email + Code trong CSDL).

---

### Thực thể Thanh toán (Payment)

**Hình 10:** Thực thể thanh toán — khối **Payments** trong [`BaoCao-KetHopThucThe.puml`](./BaoCao-KetHopThucThe.puml).

- **Tên thực thể:** THANHTOAN — bảng **`Payments`** (Thanh toán).
- **Khóa thực thể:** `Id`.
- **Các thuộc tính thực thể:**
  - **Id:** Mã giao dịch (khóa chính).
  - **InvoiceId:** Mã hóa đơn (FK → `Invoices`).
  - **Amount:** Số tiền thanh toán.
  - **PaymentDate:** Thời điểm thanh toán.
  - **PaymentMethod:** Hình thức thanh toán (chuỗi; ví dụ tiền mặt, chuyển khoản — theo quy ước ứng dụng).
  - **Notes:** Ghi chú *(tùy chọn)*.

---

*Nguồn thuộc tính: `QuanLyPhongTro.API/Models/*.cs`. Cập nhật theo snapshot: `Migrations/ApplicationDbContextModelSnapshot.cs`.*

## Tài liệu tham khảo

Danh mục trích dẫn dùng cho báo cáo (có kèm liên kết tới tài liệu điện tử khi có): [`BaoCao-TaiLieuThamKhao.md`](./BaoCao-TaiLieuThamKhao.md).
