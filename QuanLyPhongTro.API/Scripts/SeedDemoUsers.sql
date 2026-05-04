-- Tài khoản demo khớp thuật toán trong AuthService (PBKDF2, salt cố định "PhongTro_Salt_v1", 100000 vòng SHA256).
-- Chạy trên database đúng Connection String của API.

-- ========== CHỦ TRỌ (tương đương "admin") ==========
-- Email:    admin@demo.local
-- Mật khẩu: Admin123!

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = N'admin@demo.local')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role, FullName, Phone, IsEmailVerified, CreatedAt, LastLoginAt)
    VALUES (
        N'admin@demo.local',
        N'DhFydI9MPE+/CjxZ1nR7OedWQ5ZpeSJOvFdNNqceiLk=',
        N'Landlord',
        N'Admin Demo',
        N'0900000001',
        1,
        SYSUTCDATETIME(),
        NULL
    );
END;

-- ========== KHÁCH (Tenant) ==========
-- Email:    khach@demo.local
-- Mật khẩu: Khach123!
-- Tenant cần cả Users + Tenants (ứng dụng tạo cả hai khi đăng ký Tenant).

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = N'khach@demo.local')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role, FullName, Phone, IsEmailVerified, CreatedAt, LastLoginAt)
    VALUES (
        N'khach@demo.local',
        N'IASa7G59gB7RxZIV5XnntCBPZwzT+cPT7IIrX5EZtYk=',
        N'Tenant',
        N'Khách Demo',
        N'0900000002',
        1,
        SYSUTCDATETIME(),
        NULL
    );

    DECLARE @TenantUserId INT = SCOPE_IDENTITY();

    INSERT INTO Tenants (UserId, FullName, Phone, Email, CreatedAt)
    VALUES (@TenantUserId, N'Khách Demo', N'0900000002', N'khach@demo.local', SYSUTCDATETIME());
END;
