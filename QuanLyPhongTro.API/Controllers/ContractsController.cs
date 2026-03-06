using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.DTOs;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;
using System.Security.Claims;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ContractsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/contracts
    [HttpGet]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetContracts()
    {
        var contracts = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ContractDto
            {
                Id = c.Id,
                RoomId = c.RoomId,
                RoomNumber = c.Room.RoomNumber,
                TenantId = c.TenantId,
                TenantName = c.Tenant.FullName,
                TenantPhone = c.Tenant.Phone,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                MonthlyRent = c.MonthlyRent,
                Deposit = c.Deposit,
                Status = c.Status,
                Terms = c.Terms,
                Notes = c.Notes,
                ContractNumber = c.ContractNumber,
                SignedDate = c.SignedDate,
                SignedByLandlord = c.SignedByLandlord,
                SignedByTenant = c.SignedByTenant,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(contracts);
    }

    // GET: api/contracts/pending
    [HttpGet("pending")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetPendingContracts()
    {
        var contracts = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .Where(c => c.Status == "Pending")
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ContractDto
            {
                Id = c.Id,
                RoomId = c.RoomId,
                RoomNumber = c.Room.RoomNumber,
                TenantId = c.TenantId,
                TenantName = c.Tenant.FullName,
                TenantPhone = c.Tenant.Phone,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                MonthlyRent = c.MonthlyRent,
                Deposit = c.Deposit,
                Status = c.Status,
                Terms = c.Terms,
                Notes = c.Notes,
                ContractNumber = c.ContractNumber,
                SignedDate = c.SignedDate,
                SignedByLandlord = c.SignedByLandlord,
                SignedByTenant = c.SignedByTenant,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(contracts);
    }

    // GET: api/contracts/active
    [HttpGet("active")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetActiveContracts()
    {
        var contracts = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .Where(c => c.Status == "Active")
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ContractDto
            {
                Id = c.Id,
                RoomId = c.RoomId,
                RoomNumber = c.Room.RoomNumber,
                TenantId = c.TenantId,
                TenantName = c.Tenant.FullName,
                TenantPhone = c.Tenant.Phone,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                MonthlyRent = c.MonthlyRent,
                Deposit = c.Deposit,
                Status = c.Status,
                Terms = c.Terms,
                Notes = c.Notes,
                ContractNumber = c.ContractNumber,
                SignedDate = c.SignedDate,
                SignedByLandlord = c.SignedByLandlord,
                SignedByTenant = c.SignedByTenant,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(contracts);
    }

    // GET: api/contracts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ContractDto>> GetContract(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        // Check authorization: Tenant can only view their own contracts
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)!.Value;

        if (userRole == "Tenant")
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null || contract.TenantId != tenant.Id)
            {
                return Forbid();
            }
        }

        var contractDto = new ContractDto
        {
            Id = contract.Id,
            RoomId = contract.RoomId,
            RoomNumber = contract.Room.RoomNumber,
            TenantId = contract.TenantId,
            TenantName = contract.Tenant.FullName,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            MonthlyRent = contract.MonthlyRent,
            Deposit = contract.Deposit,
            Status = contract.Status,
            Terms = contract.Terms,
            Notes = contract.Notes,
            ContractNumber = contract.ContractNumber,
            SignedDate = contract.SignedDate,
            SignedByLandlord = contract.SignedByLandlord,
            SignedByTenant = contract.SignedByTenant,
            CreatedAt = contract.CreatedAt
        };

        return Ok(contractDto);
    }

    // GET: api/contracts/my-contract
    [HttpGet("my-contract")]
    [Authorize(Roles = "Tenant")]
    public async Task<ActionResult<ContractDto>> GetMyContract()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
        if (tenant == null)
        {
            return NotFound();
        }

        var contract = await _context.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .Where(c => c.TenantId == tenant.Id && c.Status == "Active")
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        if (contract == null)
        {
            return NotFound(new { message = "Bạn chưa có hợp đồng đang hoạt động" });
        }

        var contractDto = new ContractDto
        {
            Id = contract.Id,
            RoomId = contract.RoomId,
            RoomNumber = contract.Room.RoomNumber,
            TenantId = contract.TenantId,
            TenantName = contract.Tenant.FullName,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            MonthlyRent = contract.MonthlyRent,
            Deposit = contract.Deposit,
            Status = contract.Status,
            Terms = contract.Terms,
            Notes = contract.Notes,
            ContractNumber = contract.ContractNumber,
            SignedDate = contract.SignedDate,
            SignedByLandlord = contract.SignedByLandlord,
            SignedByTenant = contract.SignedByTenant,
            CreatedAt = contract.CreatedAt
        };

        return Ok(contractDto);
    }

    // POST: api/contracts
    [HttpPost]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<ContractDto>> CreateContract(CreateContractDto createDto)
    {
        // Validate room exists and is available
        var room = await _context.Rooms.FindAsync(createDto.RoomId);
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }

        if (room.Status != "Available")
        {
            return BadRequest(new { message = "Phòng không còn trống" });
        }

        // Check if room has active contract
        var hasActiveContract = await _context.Contracts
            .AnyAsync(c => c.RoomId == createDto.RoomId && c.Status == "Active");

        if (hasActiveContract)
        {
            return BadRequest(new { message = "Phòng đang có hợp đồng đang hoạt động" });
        }

        // Validate tenant exists
        var tenant = await _context.Tenants.FindAsync(createDto.TenantId);
        if (tenant == null)
        {
            return NotFound(new { message = "Không tìm thấy người thuê" });
        }

        // Validate dates
        if (createDto.EndDate <= createDto.StartDate)
        {
            return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu" });
        }

        if (room.MinLeaseMonths.HasValue && room.MinLeaseMonths.Value > 0)
        {
            var minEnd = createDto.StartDate.AddMonths(room.MinLeaseMonths.Value);
            if (createDto.EndDate < minEnd)
            {
                return BadRequest(new
                {
                    message = $"Thời gian thuê tối thiểu là {room.MinLeaseMonths.Value} tháng."
                });
            }
        }

        var depositAmount = room.DepositAmount ?? createDto.Deposit;
        var contract = new Contract
        {
            RoomId = createDto.RoomId,
            TenantId = createDto.TenantId,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            MonthlyRent = createDto.MonthlyRent,
            Deposit = depositAmount,
            Status = "Active",
            Terms = createDto.Terms,
            Notes = createDto.Notes,
            ContractNumber = createDto.ContractNumber ?? GenerateContractNumber(),
            SignedByLandlord = true,
            SignedByTenant = false,
            CreatedAt = VietnamTime.Now
        };

        // Update room status
        room.Status = "Occupied";

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        var contractDto = new ContractDto
        {
            Id = contract.Id,
            RoomId = contract.RoomId,
            RoomNumber = room.RoomNumber,
            TenantId = contract.TenantId,
            TenantName = tenant.FullName,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            MonthlyRent = contract.MonthlyRent,
            Deposit = contract.Deposit,
            Status = contract.Status,
            Terms = contract.Terms,
            Notes = contract.Notes,
            ContractNumber = contract.ContractNumber,
            SignedDate = contract.SignedDate,
            SignedByLandlord = contract.SignedByLandlord,
            SignedByTenant = contract.SignedByTenant,
            CreatedAt = contract.CreatedAt
        };

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contractDto);
    }

    // POST: api/contracts/rent-room
    [HttpPost("rent-room")]
    [Authorize(Roles = "Tenant")]
    public async Task<ActionResult<ContractDto>> RentRoom(RentRoomDto rentDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
        if (tenant == null)
        {
            return NotFound(new { message = "Không tìm thấy thông tin người thuê" });
        }

        // Check if tenant already has active contract
        var hasActiveContract = await _context.Contracts
            .AnyAsync(c => c.TenantId == tenant.Id && c.Status == "Active");

        if (hasActiveContract)
        {
            return BadRequest(new { message = "Bạn đang có hợp đồng đang hoạt động" });
        }

        // Validate room exists and is available
        var room = await _context.Rooms.FindAsync(rentDto.RoomId);
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }

        if (room.Status != "Available")
        {
            return BadRequest(new { message = "Phòng không còn trống" });
        }

        // Validate dates
        if (rentDto.EndDate <= rentDto.StartDate)
        {
            return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu" });
        }

        if (room.MinLeaseMonths.HasValue && room.MinLeaseMonths.Value > 0)
        {
            var minEnd = rentDto.StartDate.AddMonths(room.MinLeaseMonths.Value);
            if (rentDto.EndDate < minEnd)
            {
                return BadRequest(new
                {
                    message = $"Thời gian thuê tối thiểu là {room.MinLeaseMonths.Value} tháng."
                });
            }
        }

        var depositAmount = room.DepositAmount ?? rentDto.Deposit;
        var contract = new Contract
        {
            RoomId = rentDto.RoomId,
            TenantId = tenant.Id,
            StartDate = rentDto.StartDate,
            EndDate = rentDto.EndDate,
            MonthlyRent = room.MonthlyRent, // Use room's monthly rent as default
            Deposit = depositAmount,
            Status = "Pending",
            Notes = rentDto.Notes,
            ContractNumber = GenerateContractNumber(),
            SignedByLandlord = false,
            SignedByTenant = true,
            CreatedAt = VietnamTime.Now
        };

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        var contractDto = new ContractDto
        {
            Id = contract.Id,
            RoomId = contract.RoomId,
            RoomNumber = room.RoomNumber,
            TenantId = contract.TenantId,
            TenantName = tenant.FullName,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            MonthlyRent = contract.MonthlyRent,
            Deposit = contract.Deposit,
            Status = contract.Status,
            Terms = contract.Terms,
            Notes = contract.Notes,
            ContractNumber = contract.ContractNumber,
            SignedDate = contract.SignedDate,
            SignedByLandlord = contract.SignedByLandlord,
            SignedByTenant = contract.SignedByTenant,
            CreatedAt = contract.CreatedAt
        };

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contractDto);
    }

    // PUT: api/contracts/5/approve
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> ApproveContract(int id, ApproveContractDto approveDto)
    {
        var contract = await _context.Contracts
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.Status != "Pending")
        {
            return BadRequest(new { message = "Chỉ có thể duyệt hợp đồng đang chờ duyệt" });
        }

        // Update contract
        contract.Status = "Active";
        contract.MonthlyRent = approveDto.MonthlyRent;
        if (!string.IsNullOrEmpty(approveDto.Terms))
            contract.Terms = approveDto.Terms;
        contract.SignedByLandlord = true;
        contract.ApprovedAt = VietnamTime.Now;
        contract.ApprovedBy = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Update room status
        contract.Room.Status = "Occupied";

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/contracts/5/reject
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> RejectContract(int id)
    {
        var contract = await _context.Contracts
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.Status != "Pending")
        {
            return BadRequest(new { message = "Chỉ có thể từ chối hợp đồng đang chờ duyệt" });
        }

        contract.Status = "Rejected";
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/contracts/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> UpdateContract(int id, CreateContractDto updateDto)
    {
        var contract = await _context.Contracts.FindAsync(id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.Status != "Pending" && contract.Status != "Active")
        {
            return BadRequest(new { message = "Chỉ có thể cập nhật hợp đồng đang chờ duyệt hoặc đang hoạt động" });
        }

        // Validate room if changed
        if (updateDto.RoomId != contract.RoomId)
        {
            var room = await _context.Rooms.FindAsync(updateDto.RoomId);
            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng" });
            }
            contract.RoomId = updateDto.RoomId;
        }

        if (updateDto.TenantId != contract.TenantId)
        {
            var tenant = await _context.Tenants.FindAsync(updateDto.TenantId);
            if (tenant == null)
            {
                return NotFound(new { message = "Không tìm thấy người thuê" });
            }
            contract.TenantId = updateDto.TenantId;
        }

        contract.StartDate = updateDto.StartDate;
        contract.EndDate = updateDto.EndDate;
        contract.MonthlyRent = updateDto.MonthlyRent;
        contract.Deposit = updateDto.Deposit;
        contract.Terms = updateDto.Terms;
        contract.Notes = updateDto.Notes;

        if (!string.IsNullOrEmpty(updateDto.ContractNumber))
            contract.ContractNumber = updateDto.ContractNumber;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/contracts/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> DeleteContract(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        // Only allow deletion of pending or rejected contracts
        if (contract.Status == "Active")
        {
            return BadRequest(new { message = "Không thể xóa hợp đồng đang hoạt động. Vui lòng chấm dứt hợp đồng trước." });
        }

        // If contract was active, free the room
        if (contract.Room.Status == "Occupied")
        {
            contract.Room.Status = "Available";
        }

        _context.Contracts.Remove(contract);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private string GenerateContractNumber()
    {
        return $"HD{VietnamTime.Now:yyyyMMdd}{VietnamTime.Now.Ticks % 10000:D4}";
    }
}

