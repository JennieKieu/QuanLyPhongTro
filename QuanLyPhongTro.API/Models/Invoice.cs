using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class Invoice
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal RoomRent { get; set; }
    public decimal ElectricityAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Paid, Overdue
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = VietnamTime.Now;

    public Contract Contract { get; set; } = default!;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}


