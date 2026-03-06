namespace QuanLyPhongTro.API.DTOs;

public class ContractDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = default!;
    public int TenantId { get; set; }
    public string TenantName { get; set; } = default!;
    public string? TenantPhone { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal? Deposit { get; set; }
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
}

public class ApproveContractDto
{
    public decimal MonthlyRent { get; set; }
    public string? Terms { get; set; }
}

