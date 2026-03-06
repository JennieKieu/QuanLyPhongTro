using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.DTOs;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Landlord")]
public class UtilitiesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UtilitiesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/utilities
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UtilityReadingDto>>> GetUtilities()
    {
        var utilities = await _context.Utilities
            .AsNoTracking()
            .Include(u => u.Room)
            .OrderByDescending(u => u.Year)
            .ThenByDescending(u => u.Month)
            .Select(u => new UtilityReadingDto
            {
                Id = u.Id,
                RoomId = u.RoomId,
                RoomNumber = u.Room.RoomNumber,
                Month = u.Month,
                Year = u.Year,
                ElectricityIndex = u.ElectricityIndex,
                WaterIndex = u.WaterIndex,
                ElectricityUnitPrice = u.ElectricityUnitPrice,
                WaterUnitPrice = u.WaterUnitPrice,
                RecordedAt = u.RecordedAt
            })
            .ToListAsync();

        return Ok(utilities);
    }

    // GET: api/utilities/room/5
    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<UtilityReadingDto>>> GetUtilitiesByRoom(int roomId)
    {
        var utilities = await _context.Utilities
            .AsNoTracking()
            .Include(u => u.Room)
            .Where(u => u.RoomId == roomId)
            .OrderByDescending(u => u.Year)
            .ThenByDescending(u => u.Month)
            .Select(u => new UtilityReadingDto
            {
                Id = u.Id,
                RoomId = u.RoomId,
                RoomNumber = u.Room.RoomNumber,
                Month = u.Month,
                Year = u.Year,
                ElectricityIndex = u.ElectricityIndex,
                WaterIndex = u.WaterIndex,
                ElectricityUnitPrice = u.ElectricityUnitPrice,
                WaterUnitPrice = u.WaterUnitPrice,
                RecordedAt = u.RecordedAt
            })
            .ToListAsync();

        return Ok(utilities);
    }

    // GET: api/utilities/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UtilityReadingDto>> GetUtility(int id)
    {
        var utility = await _context.Utilities
            .Include(u => u.Room)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (utility == null)
        {
            return NotFound();
        }

        var utilityDto = new UtilityReadingDto
        {
            Id = utility.Id,
            RoomId = utility.RoomId,
            RoomNumber = utility.Room.RoomNumber,
            Month = utility.Month,
            Year = utility.Year,
            ElectricityIndex = utility.ElectricityIndex,
            WaterIndex = utility.WaterIndex,
            ElectricityUnitPrice = utility.ElectricityUnitPrice,
            WaterUnitPrice = utility.WaterUnitPrice,
            RecordedAt = utility.RecordedAt
        };

        return Ok(utilityDto);
    }

    // POST: api/utilities
    [HttpPost]
    public async Task<ActionResult<UtilityReadingDto>> CreateUtility(CreateUtilityReadingDto createDto)
    {
        // Validate room exists
        var room = await _context.Rooms.FindAsync(createDto.RoomId);
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }

        // Check if utility reading already exists for this room, month, year
        var existing = await _context.Utilities
            .FirstOrDefaultAsync(u => u.RoomId == createDto.RoomId && 
                                      u.Month == createDto.Month && 
                                      u.Year == createDto.Year);

        if (existing != null)
        {
            return BadRequest(new { message = "Chỉ số điện/nước cho tháng này đã được nhập" });
        }

        // Get previous month's reading to validate
        var previousMonth = createDto.Month == 1 ? 12 : createDto.Month - 1;
        var previousYear = createDto.Month == 1 ? createDto.Year - 1 : createDto.Year;

        var previousReading = await _context.Utilities
            .FirstOrDefaultAsync(u => u.RoomId == createDto.RoomId && 
                                      u.Month == previousMonth && 
                                      u.Year == previousYear);

        if (previousReading != null)
        {
            if (createDto.ElectricityIndex < previousReading.ElectricityIndex)
            {
                return BadRequest(new { message = "Chỉ số điện không được nhỏ hơn chỉ số tháng trước" });
            }

            if (createDto.WaterIndex < previousReading.WaterIndex)
            {
                return BadRequest(new { message = "Chỉ số nước không được nhỏ hơn chỉ số tháng trước" });
            }
        }

        // Get default unit prices from configuration or use provided values
        var electricityUnitPrice = createDto.ElectricityUnitPrice ?? 3000; // Default 3000 VND/kWh
        var waterUnitPrice = createDto.WaterUnitPrice ?? 15000; // Default 15000 VND/m3

        var utility = new UtilityReading
        {
            RoomId = createDto.RoomId,
            Month = createDto.Month,
            Year = createDto.Year,
            ElectricityIndex = createDto.ElectricityIndex,
            WaterIndex = createDto.WaterIndex,
            ElectricityUnitPrice = electricityUnitPrice,
            WaterUnitPrice = waterUnitPrice,
            RecordedAt = VietnamTime.Now
        };

        _context.Utilities.Add(utility);
        await _context.SaveChangesAsync();

        var utilityDto = new UtilityReadingDto
        {
            Id = utility.Id,
            RoomId = utility.RoomId,
            RoomNumber = room.RoomNumber,
            Month = utility.Month,
            Year = utility.Year,
            ElectricityIndex = utility.ElectricityIndex,
            WaterIndex = utility.WaterIndex,
            ElectricityUnitPrice = utility.ElectricityUnitPrice,
            WaterUnitPrice = utility.WaterUnitPrice,
            RecordedAt = utility.RecordedAt
        };

        return CreatedAtAction(nameof(GetUtility), new { id = utility.Id }, utilityDto);
    }

    // PUT: api/utilities/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUtility(int id, UpdateUtilityReadingDto updateDto)
    {
        var utility = await _context.Utilities.FindAsync(id);

        if (utility == null)
        {
            return NotFound();
        }

        // Validate indices if being updated
        if (updateDto.ElectricityIndex.HasValue || updateDto.WaterIndex.HasValue)
        {
            var previousMonth = utility.Month == 1 ? 12 : utility.Month - 1;
            var previousYear = utility.Month == 1 ? utility.Year - 1 : utility.Year;

            var previousReading = await _context.Utilities
                .FirstOrDefaultAsync(u => u.RoomId == utility.RoomId && 
                                          u.Month == previousMonth && 
                                          u.Year == previousYear);

            if (previousReading != null)
            {
                var newElectricityIndex = updateDto.ElectricityIndex ?? utility.ElectricityIndex;
                var newWaterIndex = updateDto.WaterIndex ?? utility.WaterIndex;

                if (newElectricityIndex < previousReading.ElectricityIndex)
                {
                    return BadRequest(new { message = "Chỉ số điện không được nhỏ hơn chỉ số tháng trước" });
                }

                if (newWaterIndex < previousReading.WaterIndex)
                {
                    return BadRequest(new { message = "Chỉ số nước không được nhỏ hơn chỉ số tháng trước" });
                }
            }
        }

        if (updateDto.ElectricityIndex.HasValue)
            utility.ElectricityIndex = updateDto.ElectricityIndex.Value;

        if (updateDto.WaterIndex.HasValue)
            utility.WaterIndex = updateDto.WaterIndex.Value;

        if (updateDto.ElectricityUnitPrice.HasValue)
            utility.ElectricityUnitPrice = updateDto.ElectricityUnitPrice.Value;

        if (updateDto.WaterUnitPrice.HasValue)
            utility.WaterUnitPrice = updateDto.WaterUnitPrice.Value;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}

