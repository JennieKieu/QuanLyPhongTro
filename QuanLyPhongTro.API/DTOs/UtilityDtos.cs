namespace QuanLyPhongTro.API.DTOs;

public class UtilityReadingDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = default!;
    public int Month { get; set; }
    public int Year { get; set; }
    public int ElectricityIndex { get; set; }
    public int WaterIndex { get; set; }
    public decimal ElectricityUnitPrice { get; set; }
    public decimal WaterUnitPrice { get; set; }
    public DateTime RecordedAt { get; set; }
}

public class CreateUtilityReadingDto
{
    public int RoomId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int ElectricityIndex { get; set; }
    public int WaterIndex { get; set; }
    public decimal? ElectricityUnitPrice { get; set; }
    public decimal? WaterUnitPrice { get; set; }
}

public class UpdateUtilityReadingDto
{
    public int? ElectricityIndex { get; set; }
    public int? WaterIndex { get; set; }
    public decimal? ElectricityUnitPrice { get; set; }
    public decimal? WaterUnitPrice { get; set; }
}

