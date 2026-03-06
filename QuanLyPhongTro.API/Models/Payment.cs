namespace QuanLyPhongTro.API.Models;

public class Payment
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = default!; // Cash, BankTransfer, etc.
    public string? Notes { get; set; }

    public Invoice Invoice { get; set; } = default!;
}


