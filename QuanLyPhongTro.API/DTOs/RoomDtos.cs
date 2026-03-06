using Microsoft.AspNetCore.Http;

namespace QuanLyPhongTro.API.DTOs;

public class RoomDto
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = default!;
    public decimal Area { get; set; }
    public decimal MonthlyRent { get; set; }
    public string Status { get; set; } = default!;
    public string? Description { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public decimal? DepositAmount { get; set; }
    public int? MinLeaseMonths { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRoomDto
{
    public string RoomNumber { get; set; } = default!;
    public decimal Area { get; set; }
    public decimal MonthlyRent { get; set; }
    public string? Description { get; set; }
    public List<string>? ImageUrls { get; set; }
    public decimal? DepositAmount { get; set; }
    public int? MinLeaseMonths { get; set; }
}

public class UpdateRoomDto
{
    public string? RoomNumber { get; set; }
    public decimal? Area { get; set; }
    public decimal? MonthlyRent { get; set; }
    public string? Status { get; set; }
    public string? Description { get; set; }
    public List<string>? ImageUrls { get; set; }
    public decimal? DepositAmount { get; set; }
    public int? MinLeaseMonths { get; set; }
}

// Form-data requests (upload ảnh)
public class CreateRoomFormRequest
{
    public string RoomNumber { get; set; } = default!;
    public decimal Area { get; set; }
    public decimal MonthlyRent { get; set; }
    public string? Description { get; set; }
    public decimal? DepositAmount { get; set; }
    public int? MinLeaseMonths { get; set; }
    public List<IFormFile>? Images { get; set; }
}

public class UpdateRoomFormRequest
{
    public string? RoomNumber { get; set; }
    public decimal? Area { get; set; }
    public decimal? MonthlyRent { get; set; }
    public string? Status { get; set; }
    public string? Description { get; set; }
    public decimal? DepositAmount { get; set; }
    public int? MinLeaseMonths { get; set; }
    public List<IFormFile>? Images { get; set; }
}

