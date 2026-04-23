namespace QuanLyPhongTro.API.DTOs;

public class ContractDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = default!;
    public int TenantId { get; set; }
    public string TenantName { get; set; } = default!;
    public string? TenantPhone { get; set; }
    public string? TenantIdentityCard { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal? Deposit { get; set; }
    public decimal DepositPaid { get; set; }
    public DateTime? DepositPaidAt { get; set; }
    public decimal DepositRefundedAmount { get; set; }
    public DateTime? DepositRefundedAt { get; set; }
    public string? DepositRefundNotes { get; set; }
    public string? TerminationInitiatedBy { get; set; }
    public string? TerminationReason { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime? RentalTermsAcceptedAt { get; set; }
    public string Status { get; set; } = default!;
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string? ContractNumber { get; set; }
    public DateTime? SignedDate { get; set; }
    public bool SignedByLandlord { get; set; }
    public bool SignedByTenant { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateContractDto
{
    public int RoomId { get; set; }
    public int TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal? Deposit { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string? ContractNumber { get; set; }
}

public class RentRoomDto
{
    public int RoomId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Deposit { get; set; }
    public string? Notes { get; set; }
    /// <summary>Bắt buộc true: người thuê đã đọc và đồng ý điều khoản.</summary>
    public bool TermsAccepted { get; set; }
}

public class ApproveContractDto
{
    public decimal MonthlyRent { get; set; }
    public string? Terms { get; set; }
}

public class ExtendContractDto
{
    /// <summary>
    /// Số tháng gia hạn thêm (>=1).
    /// </summary>
    public int ExtendMonths { get; set; }
}

public class RecordDepositRefundDto
{
    /// <summary>Số tiền thực tế hoàn cho khách (0 .. DepositPaid).</summary>
    public decimal RefundedAmount { get; set; }
    public string? Notes { get; set; }
}

public class TerminateContractDto
{
    public string Reason { get; set; } = default!;
}

