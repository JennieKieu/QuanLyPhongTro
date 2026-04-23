using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.DTOs;
using System.Security.Claims;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TenantsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/tenants
    [HttpGet]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<TenantDto>>> GetTenants()
    {
        var tenants = await _context.Tenants
            .AsNoTracking()
            .OrderBy(t => t.FullName)
            .Select(t => new TenantDto
            {
                Id = t.Id,
                UserId = t.UserId,
                FullName = t.FullName,
                Phone = t.Phone,
                Email = t.Email,
                IdentityCard = t.IdentityCard,
                Address = t.Address,
                DateOfBirth = t.DateOfBirth,
                Gender = t.Gender,
                EmergencyContact = t.EmergencyContact,
                EmergencyPhone = t.EmergencyPhone,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(tenants);
    }

    // GET: api/tenants/5
    [HttpGet("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<TenantDto>> GetTenant(int id)
    {
        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant == null)
        {
            return NotFound();
        }

        var tenantDto = new TenantDto
        {
            Id = tenant.Id,
            UserId = tenant.UserId,
            FullName = tenant.FullName,
            Phone = tenant.Phone,
            Email = tenant.Email,
            IdentityCard = tenant.IdentityCard,
            Address = tenant.Address,
            DateOfBirth = tenant.DateOfBirth,
            Gender = tenant.Gender,
            EmergencyContact = tenant.EmergencyContact,
            EmergencyPhone = tenant.EmergencyPhone,
            CreatedAt = tenant.CreatedAt
        };

        return Ok(tenantDto);
    }

    // GET: api/tenants/my-profile
    [HttpGet("my-profile")]
    [Authorize(Roles = "Tenant")]
    public async Task<ActionResult<TenantDto>> GetMyProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (tenant == null)
        {
            return NotFound();
        }

        var tenantDto = new TenantDto
        {
            Id = tenant.Id,
            UserId = tenant.UserId,
            FullName = tenant.FullName,
            Phone = tenant.Phone,
            Email = tenant.Email,
            IdentityCard = tenant.IdentityCard,
            Address = tenant.Address,
            DateOfBirth = tenant.DateOfBirth,
            Gender = tenant.Gender,
            EmergencyContact = tenant.EmergencyContact,
            EmergencyPhone = tenant.EmergencyPhone,
            CreatedAt = tenant.CreatedAt
        };

        return Ok(tenantDto);
    }

    // GET: api/tenants/my-room
    [HttpGet("my-room")]
    [Authorize(Roles = "Tenant")]
    public async Task<ActionResult<object>> GetMyRoom()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (tenant == null)
        {
            return NotFound(new { message = "Không tìm thấy thông tin người thuê" });
        }

        var baseQ = _context.Contracts
            .Include(c => c.Room)
            .Where(c => c.TenantId == tenant.Id);

        var contract = await baseQ
            .Where(c => c.Status == "Active")
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        contract ??= await baseQ
            .Where(c => c.Status == "AwaitingDeposit")
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        if (contract == null)
        {
            return NotFound(new { message = "Bạn chưa có phòng đang thuê" });
        }

        return Ok(new
        {
            Room = new
            {
                Id = contract.Room.Id,
                RoomNumber = contract.Room.RoomNumber,
                Area = contract.Room.Area,
                MonthlyRent = contract.Room.MonthlyRent,
                Description = contract.Room.Description
            },
            Contract = new
            {
                Id = contract.Id,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate,
                MonthlyRent = contract.MonthlyRent,
                Deposit = contract.Deposit,
                DepositPaid = contract.DepositPaid,
                DepositRefundedAmount = contract.DepositRefundedAmount,
                DepositRefundedAt = contract.DepositRefundedAt,
                DepositRefundNotes = contract.DepositRefundNotes,
                EndedAt = contract.EndedAt,
                Status = contract.Status
            }
        });
    }

    // PUT: api/tenants/profile
    [HttpPut("profile")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> UpdateMyProfile(UpdateTenantProfileDto updateDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (tenant == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(updateDto.FullName))
            tenant.FullName = updateDto.FullName;

        if (!string.IsNullOrEmpty(updateDto.Phone))
            tenant.Phone = updateDto.Phone;

        if (updateDto.IdentityCard != null)
            tenant.IdentityCard = updateDto.IdentityCard;

        if (updateDto.Address != null)
            tenant.Address = updateDto.Address;

        if (updateDto.DateOfBirth.HasValue)
            tenant.DateOfBirth = updateDto.DateOfBirth;

        if (updateDto.Gender != null)
            tenant.Gender = updateDto.Gender;

        if (updateDto.EmergencyContact != null)
            tenant.EmergencyContact = updateDto.EmergencyContact;

        if (updateDto.EmergencyPhone != null)
            tenant.EmergencyPhone = updateDto.EmergencyPhone;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/tenants/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> UpdateTenant(int id, UpdateTenantProfileDto updateDto)
    {
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tenant == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.FullName))
            tenant.FullName = updateDto.FullName.Trim();

        if (!string.IsNullOrWhiteSpace(updateDto.Phone))
            tenant.Phone = updateDto.Phone.Trim();

        if (updateDto.IdentityCard != null)
            tenant.IdentityCard = updateDto.IdentityCard.Trim();

        if (updateDto.Address != null)
            tenant.Address = updateDto.Address.Trim();

        if (updateDto.DateOfBirth.HasValue)
            tenant.DateOfBirth = updateDto.DateOfBirth;

        if (updateDto.Gender != null)
            tenant.Gender = updateDto.Gender.Trim();

        if (updateDto.EmergencyContact != null)
            tenant.EmergencyContact = updateDto.EmergencyContact.Trim();

        if (updateDto.EmergencyPhone != null)
            tenant.EmergencyPhone = updateDto.EmergencyPhone.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }
}

