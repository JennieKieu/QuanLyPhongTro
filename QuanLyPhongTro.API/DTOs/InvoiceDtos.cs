namespace QuanLyPhongTro.API.DTOs;

public class InvoiceDto
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public string RoomNumber { get; set; } = default!;
    public string TenantName { get; set; } = default!;
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

public class PayInvoiceDto
{
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = default!;
    public string? Notes { get; set; }
}

