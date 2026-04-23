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
    /// <summary>Số tiền cọc đã thu (xác nhận qua hóa đơn cọc).</summary>
    public decimal DepositPaid { get; set; }
    public DateTime? DepositPaidAt { get; set; }
    /// <summary>Số tiền đã hoàn cho khách (0 = không hoàn / khấu trừ hết).</summary>
    public decimal DepositRefundedAmount { get; set; }
    /// <summary>Thời điểm ghi nhận xử lý hoàn cọc (null = chưa xử lý).</summary>
    public DateTime? DepositRefundedAt { get; set; }
    public string? DepositRefundNotes { get; set; }
    /// <summary>Landlord, Tenant — khi Status = Terminated.</summary>
    public string? TerminationInitiatedBy { get; set; }
    public string? TerminationReason { get; set; }
    /// <summary>Thời điểm hệ thống ghi nhận hợp đồng kết thúc (Terminated hoặc Expired).</summary>
    public DateTime? EndedAt { get; set; }
    /// <summary>Người thuê xác nhận đã đọc điều khoản thuê trọ khi gửi yêu cầu thuê.</summary>
    public DateTime? RentalTermsAcceptedAt { get; set; }
    /// <summary>Pending, AwaitingDeposit, Active, Expired, Terminated, Rejected</summary>
    public string Status { get; set; } = "Pending";
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


