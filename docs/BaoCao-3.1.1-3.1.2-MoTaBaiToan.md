# 3.1.1 Mô tả bài toán

Hệ thống quản lý phòng trọ được nghiên cứu và thiết kế nhằm hỗ trợ chủ cơ sở lưu trú số hóa quy trình vận hành, đồng thời tạo kênh tương tác minh bạch với người thuê. Quản lý truyền thống bằng sổ sách dễ dẫn đến thất lạc dữ liệu, sai sót khi tính tiền phòng – điện – nước – phí dịch vụ, và khó đối soát với người thuê. Do đó, nền tảng quản lý tập trung, có phân quyền và tự động hóa một phần nghiệp vụ là giải pháp phù hợp để giảm rủi ro vận hành và nâng chất lượng trải nghiệm cho cả chủ trọ và khách thuê.

Phiên bản hiện tại của dự án được triển khai theo kiến trúc **client–server**: **React 18** (Material UI, React Router, Axios) cho giao diện web; **ASP.NET Core 9** (REST API, JWT Bearer, Entity Framework Core) cho lớp xử lý; **SQL Server** lưu trữ dữ liệu có cấu trúc. Cấu hình môi trường (chuỗi kết nối, JWT, SMTP…) được tách sang **file `.env`** để triển khai linh hoạt giữa các máy. Hệ thống còn bổ sung xử lý thời gian theo **múi giờ Việt Nam (UTC+7)** cho các thao tác nghiệp vụ và ghi nhận thời điểm.

**Luồng truy cập công khai (khách chưa đăng nhập):** Ứng dụng mặc định vào trang **Dashboard khách**; người dùng chưa đăng nhập có thể xem **phòng trống** và **điều khoản thuê trọ**. Khi truy cập các trang yêu cầu đăng nhập, hệ thống chuyển hướng tới trang đăng nhập kèm thông báo và có thể quay lại trang đích sau khi xác thực thành công.

**Yêu cầu chức năng:** Hệ thống bao phủ vòng đời vận hành khu trọ, phân quyền rõ ràng theo hai vai trò chính (`Landlord` / `Tenant`):

### Nhóm chức năng dành cho Chủ trọ (Landlord)

- **Quản lý phòng trọ:** Thiết lập và cập nhật danh mục phòng (số phòng, diện tích, giá thuê, mô tả, ảnh, cọc tối thiểu, thời hạn thuê tối thiểu nếu có), theo dõi trạng thái phòng (trống, đang cho thuê, bảo trì, …).
- **Quản lý khách hàng (người thuê):** Số hóa hồ sơ người thuê (thông tin liên hệ, CMND/CCCD nếu có, …) phục vụ quản lý nhân khẩu và hợp đồng.
- **Quản lý hợp đồng:** Tạo, duyệt, từ chối, cập nhật, gia hạn, chấm dứt hợp đồng; hỗ trợ luồng **cọc** (chờ thanh toán cọc, ghi nhận hoàn cọc); ghi nhận xác nhận điều khoản thuê trọ khi có yêu cầu từ người thuê; xuất **PDF** hợp đồng (API server dùng QuestPDF; giao diện chủ trọ có thể xuất nhanh bằng pdfmake).
- **Quản lý chỉ số điện – nước và phí dịch vụ:** Nhập chỉ số, đơn giá điện/nước và **phí dịch vụ** theo phòng – kỳ, làm cơ sở tính hóa đơn.
- **Quản lý hóa đơn:** Tạo hóa đơn theo tháng (gồm tiền phòng, điện, nước, phần phí dịch vụ suy ra từ tổng và các khoản chi tiết) và hóa đơn **cọc**; cập nhật thanh toán, trạng thái; xuất **PDF** hóa đơn; hệ thống có dịch vụ nền ghi nhận hóa đơn **quá hạn** theo lịch.
- **Báo cáo – thống kê:** API và giao diện báo cáo tổng quan (số liệu, biểu đồ) hỗ trợ chủ trọ theo dõi tình hình kinh doanh.

### Nhóm chức năng dành cho Khách thuê (Tenant)

- **Tra cứu phòng trống:** Xem danh sách phòng còn trống (có thể truy cập khi chưa đăng nhập), thông tin giá, diện tích, mô tả và ảnh minh họa.
- **Gửi yêu cầu thuê phòng:** Người thuê đã đăng nhập gửi yêu cầu thuê; có thể kèm xác nhận đã đọc điều khoản thuê trọ (theo luồng hiện tại của ứng dụng).
- **Xem hợp đồng:** Tra cứu hợp đồng của mình, trạng thái, thông tin cọc, chấm dứt (nếu có).
- **Xem hóa đơn:** Theo dõi hóa đơn theo kỳ, số tiền và trạng thái thanh toán; minh bạch các khoản tiền phòng, điện, nước và phần phí dịch vụ (khi áp dụng).
- **Thông tin tài khoản:** Cập nhật hồ sơ, đổi mật khẩu; đăng ký tài khoản qua **OTP gửi email** (SMTP), quên/đặt lại mật khẩu có hỗ trợ OTP.

**Yêu cầu phi chức năng (bám theo triển khai hiện tại):**

- **Giao diện (Client):** Ứng dụng web một trang (SPA) với React, thiết kế thân thiện, hỗ trợ điều hướng theo vai trò (menu chủ trọ / menu người thuê), có phân trang trên nhiều màn hình danh sách.
- **API (Server):** RESTful, xác thực JWT; một số endpoint công khai (ví dụ danh sách phòng trống); Swagger trong môi trường phát triển.
- **Cơ sở dữ liệu:** SQL Server, schema được quản lý qua **EF Core Migrations**; dữ liệu người dùng, phòng, hợp đồng, hóa đơn, chỉ số, thanh toán, OTP được mô hình hóa rõ ràng.
- **Vận hành tự động:** Dịch vụ nền cập nhật hợp đồng **hết hạn** và hóa đơn **quá hạn**, giảm thao tác thủ công cho chủ trọ.
- **Bảo mật cơ bản:** Mật khẩu lưu dưới dạng băm (PBKDF2 trong mã nguồn hiện tại); khuyến nghị đặt khóa JWT đủ dài và bảo vệ file `.env` khi triển khai thực tế.

---

# 3.1.2 Đối tượng sử dụng hệ thống

- **Chủ trọ (Landlord):** Người quản lý và vận hành khu trọ trên hệ thống. Được cấp quyền truy cập đầy đủ các phân hệ nghiệp vụ: quản lý phòng, hồ sơ người thuê, hợp đồng (duyệt yêu cầu thuê, cọc, chấm dứt, hoàn cọc…), chỉ số điện – nước – phí dịch vụ, hóa đơn và báo cáo. Chủ trọ cũng là người tạo và theo dõi hóa đơn, cập nhật trạng thanh toán theo thực tế thu tiền.
- **Khách thuê (Tenant):** Người sử dụng dịch vụ lưu trú, đăng nhập với quyền hạn chế theo nhu cầu tra cứu và tương tác: xem phòng trống (kể cả khi chưa đăng nhập tùy cấu hình route), sau khi đăng nhập có thể gửi yêu cầu thuê phòng, xem hợp đồng và hóa đơn của mình, cập nhật thông tin cá nhân và bảo mật tài khoản (đổi mật khẩu, đăng ký/xác thực OTP).
- **Khách vãng lai (chưa đăng nhập):** Có thể vào trang chủ/dashboard công khai, xem phòng trống và điều khoản thuê trọ; muốn dùng các chức năng cá nhân (hợp đồng, hóa đơn, thuê phòng, hồ sơ…) phải **đăng nhập**; hệ thống sẽ chuyển hướng tới trang đăng nhập với thông báo phù hợp khi truy cập trái phép.

