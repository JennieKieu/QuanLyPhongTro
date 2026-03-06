using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;

namespace QuanLyPhongTro.API.Services;

public class OtpService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly EmailService _emailService;
    private readonly TimeSpan _otpLifetime = TimeSpan.FromMinutes(10);
    private readonly Random _random = new();

    public OtpService(ApplicationDbContext dbContext, EmailService emailService)
    {
        _dbContext = dbContext;
        _emailService = emailService;
    }

    public string GenerateCode()
    {
        return _random.Next(100000, 999999).ToString();
    }

    public async Task<OtpCode> CreateAndSendOtpAsync(string email, string purpose)
    {
        var code = GenerateCode();

        var otp = new OtpCode
        {
            Email = email,
            Code = code,
            ExpiresAt = VietnamTime.Now.Add(_otpLifetime),
            Used = false
        };

        _dbContext.OtpCodes.Add(otp);
        await _dbContext.SaveChangesAsync();

        var subject = purpose switch
        {
            "register" => "Xác thực đăng ký tài khoản",
            "forgot-password" => "Xác thực quên mật khẩu",
            _ => "Mã xác thực OTP"
        };

        var body = $"Mã OTP của bạn là: {code}. Mã có hiệu lực trong {_otpLifetime.TotalMinutes} phút.";

        await _emailService.SendEmailAsync(email, subject, body);

        return otp;
    }

    /// <summary>
    /// Kiểm tra OTP hợp lệ. Chỉ đánh dấu Used khi markAsUsed = true (dùng cho forgot-password).
    /// Với đăng ký: gọi với markAsUsed=false, sau khi tạo user thành công mới gọi MarkOtpAsUsed.
    /// </summary>
    public async Task<bool> VerifyOtpAsync(string email, string code, bool markAsUsed = false)
    {
        var now = VietnamTime.Now;

        var otp = await _dbContext.OtpCodes
            .Where(o => o.Email == email && o.Code == code && !o.Used)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null)
        {
            return false;
        }

        if (otp.ExpiresAt < now)
        {
            return false;
        }

        if (markAsUsed)
        {
            otp.Used = true;
            await _dbContext.SaveChangesAsync();
        }

        return true;
    }

    /// <summary>
    /// Đánh dấu OTP đã sử dụng (gọi sau khi tạo user thành công).
    /// </summary>
    public async Task MarkOtpAsUsedAsync(string email, string code)
    {
        var otp = await _dbContext.OtpCodes
            .Where(o => o.Email == email && o.Code == code && !o.Used)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp != null)
        {
            otp.Used = true;
            await _dbContext.SaveChangesAsync();
        }
    }
}


