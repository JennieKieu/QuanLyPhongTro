namespace QuanLyPhongTro.API.DTOs;

public class InvoiceDto
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    /// <summary>Monthly, Deposit</summary>
    public string InvoiceType { get; set; } = "Monthly";
    public string RoomNumber { get; set; } = default!;
    public string TenantName { get; set; } = default!;
    public string? TenantIdentityCard { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal RoomRent { get; set; }
    public decimal ElectricityAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = default!;
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GenerateInvoiceDto
{
    public int ContractId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}

public class GenerateDepositInvoiceDto
{
    public int ContractId { get; set; }
}

public class PayInvoiceDto
{
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = default!;
    public string? Notes { get; set; }
}

public class UpdateInvoiceDto
{
    public decimal? RoomRent { get; set; }
    public decimal? ElectricityAmount { get; set; }
    public decimal? WaterAmount { get; set; }
    public DateTime? DueDate { get; set; }
}

