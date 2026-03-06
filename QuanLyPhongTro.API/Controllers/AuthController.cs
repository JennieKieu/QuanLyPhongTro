using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.DTOs;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;
using QuanLyPhongTro.API.Services;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly AuthService _authService;
    private readonly JwtService _jwtService;
    private readonly OtpService _otpService;
    private readonly JwtOptions _jwtOptions;

    public AuthController(
        ApplicationDbContext dbContext,
        AuthService authService,
        JwtService jwtService,
        OtpService otpService,
        IOptions<JwtOptions> jwtOptions)
    {
        _dbContext = dbContext;
        _authService = authService;
        _jwtService = jwtService;
        _otpService = otpService;
        _jwtOptions = jwtOptions.Value;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });
        }

        if (await _authService.EmailExistsAsync(request.Email))
        {
            return BadRequest(new { message = "Email đã tồn tại." });
        }

        // Tạo OTP và gửi email
        await _otpService.CreateAndSendOtpAsync(request.Email, "register");

        // Lưu tạm thông tin đăng ký vào memory/session? Đơn giản: client gửi lại full info khi verify.
        return Ok(new { message = "Đã gửi OTP tới email. Vui lòng kiểm tra và xác thực.", request.Email });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest? request)
    {
        if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Code))
        {
            return BadRequest(new { message = "Email và mã OTP không được để trống." });
        }

        // Chỉ validate OTP, không đánh dấu Used cho đến khi tạo user thành công
        var isValid = await _otpService.VerifyOtpAsync(request.Email, request.Code, markAsUsed: false);
        if (!isValid)
        {
            return BadRequest(new { message = "OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử Gửi lại OTP." });
        }

        // Nếu có đầy đủ thông tin đăng ký => tạo tài khoản và trả token
        if (!string.IsNullOrEmpty(request.Password) && !string.IsNullOrEmpty(request.FullName) && !string.IsNullOrEmpty(request.Phone))
        {
            if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
            {
                return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });
            }
            if (await _authService.EmailExistsAsync(request.Email))
            {
                return BadRequest(new { message = "Email đã tồn tại." });
            }

            try
            {
                var user = await _authService.CreateUserAsync(
                    request.Email,
                    request.Password!,
                    request.FullName!,
                    request.Phone!,
                    request.Role ?? "Tenant");

                // Chỉ đánh dấu OTP đã dùng SAU KHI tạo user thành công
                await _otpService.MarkOtpAsUsedAsync(request.Email, request.Code);

                var token = _jwtService.GenerateAccessToken(user);
                return Ok(new
                {
                    accessToken = token,
                    tokenType = "Bearer",
                    expiresIn = _jwtOptions.AccessTokenMinutes * 60,
                    user = new { user.Id, user.Email, user.FullName, user.Phone, user.Role }
                });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                return BadRequest(new { message = "Lỗi khi lưu dữ liệu: " + (ex.InnerException?.Message ?? ex.Message) });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        return Ok(new { message = "OTP hợp lệ. Hãy tiếp tục gửi thông tin đăng ký đầy đủ để tạo tài khoản." });
    }

    // Đăng ký + tạo user (sau khi OTP OK) - phiên bản đơn giản gộp luôn
    [HttpPost("register-confirm")]
    public async Task<IActionResult> RegisterConfirm([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });
        }

        if (await _authService.EmailExistsAsync(request.Email))
        {
            return BadRequest(new { message = "Email đã tồn tại." });
        }

        // Không kiểm tra OTP ở đây để đơn giản hóa (đã verify trước đó)
        var user = await _authService.CreateUserAsync(
            request.Email,
            request.Password,
            request.FullName,
            request.Phone,
            request.Role);

        var token = _jwtService.GenerateAccessToken(user);

        return Ok(new AuthResponse
        {
            AccessToken = token,
            ExpiresIn = _jwtOptions.AccessTokenMinutes * 60
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.GetUserByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
        }

        var passwordOk = await _authService.CheckPasswordAsync(user, request.Password);
        if (!passwordOk)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
        }

        user.LastLoginAt = VietnamTime.Now;
        await _dbContext.SaveChangesAsync();

        var token = _jwtService.GenerateAccessToken(user);

        return Ok(new
        {
            accessToken = token,
            tokenType = "Bearer",
            expiresIn = _jwtOptions.AccessTokenMinutes * 60,
            user = new { user.Id, user.Email, user.FullName, user.Phone, user.Role }
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                        User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.Role
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _authService.GetUserByEmailAsync(request.Email);
        if (user is null)
        {
            // Không tiết lộ email tồn tại hay không
            return Ok(new { message = "Nếu email tồn tại, mã OTP sẽ được gửi." });
        }

        await _otpService.CreateAndSendOtpAsync(request.Email, "forgot-password");
        return Ok(new { message = "Đã gửi OTP tới email (nếu email tồn tại)." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var isValid = await _otpService.VerifyOtpAsync(request.Email, request.Code, markAsUsed: false);
        if (!isValid)
        {
            return BadRequest(new { message = "OTP không hợp lệ hoặc đã hết hạn." });
        }

        var user = await _authService.GetUserByEmailAsync(request.Email);
        if (user is null)
        {
            return NotFound(new { message = "User không tồn tại." });
        }

        await _authService.ChangePasswordAsync(user, request.NewPassword);
        await _otpService.MarkOtpAsUsedAsync(request.Email, request.Code);
        return Ok(new { message = "Đổi mật khẩu thành công." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                        User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user is null)
        {
            return NotFound();
        }

        var ok = await _authService.CheckPasswordAsync(user, request.CurrentPassword);
        if (!ok)
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
        }

        await _authService.ChangePasswordAsync(user, request.NewPassword);
        return Ok(new { message = "Đổi mật khẩu thành công." });
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ForgotPasswordRequest request)
    {
        await _otpService.CreateAndSendOtpAsync(request.Email, "register");
        return Ok(new { message = "Đã gửi lại OTP." });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // JWT logout xử lý phía client (xoá token). Ở backend chỉ trả về 200.
        return Ok(new { message = "Đã đăng xuất." });
    }

    [HttpPost("refresh-token")]
    public IActionResult RefreshToken()
    {
        // Để đơn giản, có thể giữ cho future work. Hiện tại frontend có thể login lại khi token hết hạn.
        return StatusCode(StatusCodes.Status501NotImplemented,
            new { message = "Refresh token chưa được triển khai trong bản demo." });
    }
}


