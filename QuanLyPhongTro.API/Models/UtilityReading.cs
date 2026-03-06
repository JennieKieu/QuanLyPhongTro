using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Models;

public class UtilityReading
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int ElectricityIndex { get; set; }
    public int WaterIndex { get; set; }
    public decimal ElectricityUnitPrice { get; set; }
    public decimal WaterUnitPrice { get; set; }
    public DateTime RecordedAt { get; set; } = VietnamTime.Now;

    public Room Room { get; set; } = default!;
}


