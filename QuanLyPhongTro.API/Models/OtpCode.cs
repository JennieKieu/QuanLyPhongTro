using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class OtpCode
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string Code { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; } = VietnamTime.Now;
}


