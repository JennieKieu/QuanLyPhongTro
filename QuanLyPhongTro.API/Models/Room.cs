using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class Room
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = default!;
    public decimal Area { get; set; }
    public decimal MonthlyRent { get; set; }
    public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance
    public string? Description { get; set; }
    // Lưu danh sách URL ảnh dưới dạng JSON
    public string? ImageUrls { get; set; }
    // Tiền cọc yêu cầu sẵn (null nghĩa là không yêu cầu)
    public decimal? DepositAmount { get; set; }
    // Số tháng thuê tối thiểu (null hoặc <= 0 nghĩa là không ràng buộc)
    public int? MinLeaseMonths { get; set; }
    public DateTime CreatedAt { get; set; } = VietnamTime.Now;

    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    public ICollection<UtilityReading> Utilities { get; set; } = new List<UtilityReading>();
}


