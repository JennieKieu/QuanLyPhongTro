using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class Tenant
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? IdentityCard { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public DateTime CreatedAt { get; set; } = VietnamTime.Now;

    public User User { get; set; } = default!;
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}


