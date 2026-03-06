using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class Contract
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public int TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal? Deposit { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Active, Expired, Terminated, Rejected
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string? ContractNumber { get; set; }
    public DateTime? SignedDate { get; set; }
    public bool SignedByLandlord { get; set; }
    public bool SignedByTenant { get; set; }
    public DateTime CreatedAt { get; set; } = VietnamTime.Now;
    public int? CreatedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedBy { get; set; }

    public Room Room { get; set; } = default!;
    public Tenant Tenant { get; set; } = default!;
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}


