using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.DTOs;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;
using System.Security.Claims;
using System.Text.Json;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public RoomsController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // GET: api/rooms
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        var rooms = await _context.Rooms
            .AsNoTracking()
            .OrderBy(r => r.RoomNumber)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Area = r.Area,
                MonthlyRent = r.MonthlyRent,
                Status = r.Status,
                Description = r.Description,
                ImageUrls = ParseImageUrls(r.ImageUrls),
                DepositAmount = r.DepositAmount,
                MinLeaseMonths = r.MinLeaseMonths,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(rooms);
    }

    // GET: api/rooms/available
    [HttpGet("available")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetAvailableRooms()
    {
        var rooms = await _context.Rooms
            .AsNoTracking()
            .Where(r => r.Status == "Available")
            .OrderBy(r => r.RoomNumber)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Area = r.Area,
                MonthlyRent = r.MonthlyRent,
                Status = r.Status,
                Description = r.Description,
                ImageUrls = ParseImageUrls(r.ImageUrls),
                DepositAmount = r.DepositAmount,
                MinLeaseMonths = r.MinLeaseMonths,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(rooms);
    }

    // GET: api/rooms/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
        {
            return NotFound();
        }

        var roomDto = new RoomDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            Area = room.Area,
            MonthlyRent = room.MonthlyRent,
            Status = room.Status,
            Description = room.Description,
            ImageUrls = ParseImageUrls(room.ImageUrls),
            DepositAmount = room.DepositAmount,
            MinLeaseMonths = room.MinLeaseMonths,
            CreatedAt = room.CreatedAt
        };

        return Ok(roomDto);
    }

    // POST: api/rooms
    [HttpPost]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<RoomDto>> CreateRoom([FromForm] CreateRoomFormRequest createRoomDto)
    {
        // Check if room number already exists
        var existingRoom = await _context.Rooms
            .FirstOrDefaultAsync(r => r.RoomNumber == createRoomDto.RoomNumber);

        if (existingRoom != null)
        {
            return BadRequest(new { message = "Số phòng đã tồn tại" });
        }

        var imageUrls = await SaveImagesAsync(createRoomDto.Images);
        var room = new Room
        {
            RoomNumber = createRoomDto.RoomNumber,
            Area = createRoomDto.Area,
            MonthlyRent = createRoomDto.MonthlyRent,
            Status = "Available",
            Description = createRoomDto.Description,
            ImageUrls = NormalizeImageUrls(imageUrls),
            DepositAmount = createRoomDto.DepositAmount,
            MinLeaseMonths = createRoomDto.MinLeaseMonths,
            CreatedAt = VietnamTime.Now
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        var roomDto = new RoomDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            Area = room.Area,
            MonthlyRent = room.MonthlyRent,
            Status = room.Status,
            Description = room.Description,
            ImageUrls = ParseImageUrls(room.ImageUrls),
            DepositAmount = room.DepositAmount,
            MinLeaseMonths = room.MinLeaseMonths,
            CreatedAt = room.CreatedAt
        };

        return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, roomDto);
    }

    // PUT: api/rooms/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> UpdateRoom(int id, [FromForm] UpdateRoomFormRequest updateRoomDto)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
        {
            return NotFound();
        }

        // Check if room number already exists (if being changed)
        if (!string.IsNullOrEmpty(updateRoomDto.RoomNumber) && updateRoomDto.RoomNumber != room.RoomNumber)
        {
            var existingRoom = await _context.Rooms
                .FirstOrDefaultAsync(r => r.RoomNumber == updateRoomDto.RoomNumber && r.Id != id);

            if (existingRoom != null)
            {
                return BadRequest(new { message = "Số phòng đã tồn tại" });
            }
        }

        if (!string.IsNullOrEmpty(updateRoomDto.RoomNumber))
            room.RoomNumber = updateRoomDto.RoomNumber;

        if (updateRoomDto.Area.HasValue)
            room.Area = updateRoomDto.Area.Value;

        if (updateRoomDto.MonthlyRent.HasValue)
            room.MonthlyRent = updateRoomDto.MonthlyRent.Value;

        if (!string.IsNullOrEmpty(updateRoomDto.Status))
            room.Status = updateRoomDto.Status;

        if (updateRoomDto.Description != null)
            room.Description = updateRoomDto.Description;

        if (updateRoomDto.Images != null && updateRoomDto.Images.Count > 0)
        {
            var newImages = await SaveImagesAsync(updateRoomDto.Images);
            room.ImageUrls = NormalizeImageUrls(newImages);
        }

        if (updateRoomDto.DepositAmount.HasValue)
            room.DepositAmount = updateRoomDto.DepositAmount;

        if (updateRoomDto.MinLeaseMonths.HasValue)
            room.MinLeaseMonths = updateRoomDto.MinLeaseMonths;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoomExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/rooms/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var room = await _context.Rooms
            .Include(r => r.Contracts)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (room == null)
        {
            return NotFound();
        }

        // Check if room has active contracts
        var hasActiveContracts = room.Contracts.Any(c => c.Status == "Active");
        if (hasActiveContracts)
        {
            return BadRequest(new { message = "Không thể xóa phòng đang có hợp đồng đang hoạt động" });
        }

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RoomExists(int id)
    {
        return _context.Rooms.Any(e => e.Id == id);
    }

    private static List<string> ParseImageUrls(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return new List<string>();
        }
        try
        {
            return JsonSerializer.Deserialize<List<string>>(raw) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    private static string? NormalizeImageUrls(IEnumerable<string>? urls)
    {
        if (urls == null)
        {
            return null;
        }
        var cleaned = urls
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u.Trim())
            .Distinct()
            .ToList();
        return cleaned.Count == 0 ? null : JsonSerializer.Serialize(cleaned);
    }

    private async Task<List<string>> SaveImagesAsync(IEnumerable<IFormFile>? files)
    {
        var results = new List<string>();
        if (files == null)
        {
            return results;
        }

        var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadDir = Path.Combine(root, "uploads", "rooms");
        Directory.CreateDirectory(uploadDir);

        foreach (var file in files)
        {
            if (file.Length == 0) continue;
            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadDir, fileName);
            await using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream);
            results.Add($"/uploads/rooms/{fileName}");
        }

        return results;
    }
}

