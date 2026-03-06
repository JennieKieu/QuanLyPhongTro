using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string Role { get; set; } = default!; // "Landlord" | "Tenant"
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; } = VietnamTime.Now;
    public DateTime? LastLoginAt { get; set; }

    public Tenant? Tenant { get; set; }
}


