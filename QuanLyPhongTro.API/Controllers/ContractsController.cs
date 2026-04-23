using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.DTOs;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;
using QuanLyPhongTro.API.Services;
using System.Security.Claims;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly PdfExportService _pdfExportService;
    private readonly InvoiceCalculationService _invoiceCalculationService;

    public ContractsController(
        ApplicationDbContext context,
        PdfExportService pdfExportService,
        InvoiceCalculationService invoiceCalculationService)
    {
        _context = context;
        _pdfExportService = pdfExportService;
        _invoiceCalculationService = invoiceCalculationService;
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
            .ToListAsync();

        return Ok(contracts.Select(ToContractDto));
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
            .ToListAsync();

        return Ok(contracts.Select(ToContractDto));
    }

    // GET: api/contracts/awaiting-deposit
    [HttpGet("awaiting-deposit")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetAwaitingDepositContracts()
    {
        var contracts = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .Where(c => c.Status == "AwaitingDeposit")
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(contracts.Select(ToContractDto));
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
            .ToListAsync();

        return Ok(contracts.Select(ToContractDto));
    }

    // GET: api/contracts/expiring-soon?days=30
    [HttpGet("expiring-soon")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetExpiringSoonContracts([FromQuery] int days = 30)
    {
        if (days <= 0) days = 30;
        if (days > 365) days = 365;

        var today = VietnamTime.Now.Date;
        var endDate = today.AddDays(days);

        var contracts = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .Where(c =>
                c.Status == "Active" &&
                c.EndDate.Date >= today &&
                c.EndDate.Date <= endDate)
            .OrderBy(c => c.EndDate)
            .ToListAsync();

        return Ok(contracts.Select(ToContractDto));
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

        return Ok(ToContractDto(contract));
    }

    // GET: api/contracts/5/pdf
    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> ExportContractPdf(int id)
    {
        var contract = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)!.Value;
        if (userRole == "Tenant")
        {
            var tenant = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null || contract.TenantId != tenant.Id)
            {
                return Forbid();
            }
        }

        if (contract.Status != "Active")
        {
            return BadRequest(new { message = "Chỉ có thể xuất PDF khi hợp đồng đang hoạt động." });
        }

        try
        {
            var pdfBytes = _pdfExportService.GenerateContractPdf(contract);
            var fileName = $"hop-dong-{(contract.ContractNumber ?? contract.Id.ToString())}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Khong the tao PDF hop dong: {ex.Message}" });
        }
    }

    // GET: api/contracts/my-contract
    [HttpGet("my-contract")]
    [Authorize(Roles = "Tenant")]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetMyContract()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
        if (tenant == null)
        {
            return NotFound();
        }

        var contracts = await _context.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .Where(c => c.TenantId == tenant.Id)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        if (contracts.Count == 0)
        {
            return NotFound(new { message = "Bạn chưa có hợp đồng" });
        }

        return Ok(contracts.Select(ToContractDto).ToList());
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

        var roomBlocked = await _context.Contracts
            .AnyAsync(c =>
                c.RoomId == createDto.RoomId &&
                (c.Status == "Active" || c.Status == "Pending" || c.Status == "AwaitingDeposit"));

        if (roomBlocked)
        {
            return BadRequest(new { message = "Phòng đang có hợp đồng (chờ duyệt, chờ cọc hoặc đang hoạt động)" });
        }

        // Validate tenant exists
        var tenant = await _context.Tenants.FindAsync(createDto.TenantId);
        if (tenant == null)
        {
            return NotFound(new { message = "Không tìm thấy người thuê" });
        }

        // Validate dates
        var today = VietnamTime.Now.Date;
        if (createDto.StartDate.Date < today)
        {
            return BadRequest(new { message = "Ngày bắt đầu thuê không được trước ngày hiện tại." });
        }

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
        var depositRequired = depositAmount ?? 0;
        var contract = new Contract
        {
            RoomId = createDto.RoomId,
            TenantId = createDto.TenantId,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            MonthlyRent = createDto.MonthlyRent,
            Deposit = depositAmount,
            Status = depositRequired > 0 ? "AwaitingDeposit" : "Active",
            Terms = createDto.Terms,
            Notes = createDto.Notes,
            ContractNumber = createDto.ContractNumber ?? GenerateContractNumber(),
            SignedByLandlord = true,
            SignedByTenant = false,
            CreatedAt = VietnamTime.Now
        };

        room.Status = depositRequired > 0 ? "Reserved" : "Occupied";

        _context.Contracts.Add(contract);

        await _context.SaveChangesAsync();

        if (depositRequired > 0)
        {
            try
            {
                await _invoiceCalculationService.GenerateDepositInvoice(contract.Id);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        var created = await _context.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .FirstAsync(c => c.Id == contract.Id);

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, ToContractDto(created));
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

        if (!rentDto.TermsAccepted)
        {
            return BadRequest(new { message = "Bạn phải đồng ý với điều khoản thuê trọ trước khi gửi yêu cầu." });
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

        var roomHasOpenContract = await _context.Contracts
            .AnyAsync(c =>
                c.RoomId == rentDto.RoomId &&
                (c.Status == "Active" || c.Status == "Pending" || c.Status == "AwaitingDeposit"));

        if (roomHasOpenContract)
        {
            return BadRequest(new { message = "Phòng đang có hợp đồng liên quan" });
        }

        var todayRent = VietnamTime.Now.Date;
        if (rentDto.StartDate.Date < todayRent)
        {
            return BadRequest(new { message = "Ngày bắt đầu thuê không được trước ngày hiện tại." });
        }

        // Xác định ngày kết thúc: nếu phòng có ràng buộc số tháng thuê tối thiểu,
        // hệ thống tự cộng thêm số tháng đó, không phụ thuộc ngày kết thúc client gửi lên.
        DateTime endDateToUse;
        if (room.MinLeaseMonths.HasValue && room.MinLeaseMonths.Value > 0)
        {
            endDateToUse = rentDto.StartDate.AddMonths(room.MinLeaseMonths.Value);
        }
        else
        {
            // Trường hợp không cấu hình thời gian thuê tối thiểu: dùng EndDate từ client với kiểm tra cơ bản
            if (rentDto.EndDate <= rentDto.StartDate)
            {
                return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu" });
            }

            endDateToUse = rentDto.EndDate;
        }

        var depositAmount = room.DepositAmount ?? rentDto.Deposit;
        var contract = new Contract
        {
            RoomId = rentDto.RoomId,
            TenantId = tenant.Id,
            StartDate = rentDto.StartDate,
            EndDate = endDateToUse,
            MonthlyRent = room.MonthlyRent, // Use room's monthly rent as default
            Deposit = depositAmount,
            Status = "Pending",
            Notes = rentDto.Notes,
            ContractNumber = GenerateContractNumber(),
            SignedByLandlord = false,
            SignedByTenant = true,
            CreatedAt = VietnamTime.Now,
            RentalTermsAcceptedAt = VietnamTime.Now
        };

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        var created = await _context.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .FirstAsync(c => c.Id == contract.Id);

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, ToContractDto(created));
    }

    // PUT: api/contracts/5/terminate-by-tenant
    [HttpPut("{id}/terminate-by-tenant")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> TerminateContractAsTenant(int id, [FromBody] TerminateContractDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return BadRequest(new { message = "Vui lòng nhập lý do chấm dứt hợp đồng." });
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
        if (tenant == null)
        {
            return NotFound();
        }

        var contract = await _context.Contracts
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.TenantId != tenant.Id)
        {
            return Forbid();
        }

        if (contract.Status != "Active")
        {
            return BadRequest(new { message = "Chỉ có thể chấm dứt hợp đồng đang hoạt động." });
        }

        var today = VietnamTime.Now.Date;
        var endsAfterToday = contract.EndDate.Date > today;

        contract.Status = "Terminated";
        contract.TerminationInitiatedBy = "Tenant";
        contract.TerminationReason = dto.Reason.Trim();
        contract.EndedAt = VietnamTime.Now;

        var hasOtherOpenContract = await _context.Contracts.AnyAsync(c =>
            c.Id != contract.Id &&
            c.RoomId == contract.RoomId &&
            (c.Status == "Active" || c.Status == "Pending" || c.Status == "AwaitingDeposit"));

        if (!hasOtherOpenContract && contract.Room.Status == "Occupied")
        {
            contract.Room.Status = "Available";
        }

        if (endsAfterToday && contract.DepositPaid > 0)
        {
            contract.DepositRefundedAmount = 0;
            contract.DepositRefundedAt = VietnamTime.Now;
            contract.DepositRefundNotes = "Chấm dứt trước hạn do người thuê — mất tiền cọc theo điều khoản thuê trọ.";
        }

        await _context.SaveChangesAsync();
        return NoContent();
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

        contract.MonthlyRent = approveDto.MonthlyRent;
        if (!string.IsNullOrEmpty(approveDto.Terms))
            contract.Terms = approveDto.Terms;
        contract.SignedByLandlord = true;
        contract.ApprovedAt = VietnamTime.Now;
        contract.ApprovedBy = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var depositRequired = contract.Deposit ?? contract.Room?.DepositAmount ?? 0m;
        if (depositRequired > 0)
        {
            if (!contract.Deposit.HasValue || contract.Deposit.Value <= 0)
                contract.Deposit = depositRequired;
            contract.Status = "AwaitingDeposit";
            contract.Room.Status = "Reserved";
        }
        else
        {
            contract.Status = "Active";
            contract.Room.Status = "Occupied";
        }

        await _context.SaveChangesAsync();

        if (depositRequired > 0)
        {
            try
            {
                await _invoiceCalculationService.GenerateDepositInvoice(contract.Id);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        return NoContent();
    }

    // PUT: api/contracts/5/reject
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> RejectContract(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.Status != "Pending" && contract.Status != "AwaitingDeposit")
        {
            return BadRequest(new { message = "Chỉ có thể từ chối hợp đồng đang chờ duyệt hoặc đang chờ cọc" });
        }

        if (contract.Status == "AwaitingDeposit" && contract.Room.Status == "Reserved")
        {
            contract.Room.Status = "Available";
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

        if (contract.Status != "Pending" && contract.Status != "AwaitingDeposit" && contract.Status != "Active")
        {
            return BadRequest(new { message = "Chỉ có thể cập nhật hợp đồng đang chờ duyệt, chờ cọc hoặc đang hoạt động" });
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

        var todayUpdate = VietnamTime.Now.Date;
        if (updateDto.StartDate.Date != contract.StartDate.Date && updateDto.StartDate.Date < todayUpdate)
        {
            return BadRequest(new { message = "Ngày bắt đầu thuê không được trước ngày hiện tại." });
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

    // PUT: api/contracts/5/extend
    [HttpPut("{id}/extend")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> ExtendContract(int id, ExtendContractDto dto)
    {
        if (dto.ExtendMonths <= 0)
        {
            return BadRequest(new { message = "Số tháng gia hạn phải lớn hơn 0." });
        }

        var contract = await _context.Contracts
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.Status != "Active")
        {
            return BadRequest(new { message = "Chỉ có thể gia hạn hợp đồng đang hoạt động." });
        }

        contract.EndDate = contract.EndDate.AddMonths(dto.ExtendMonths);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/contracts/5/terminate
    [HttpPut("{id}/terminate")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> TerminateContract(int id, [FromBody] TerminateContractDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.Reason))
        {
            return BadRequest(new { message = "Vui lòng nhập lý do chấm dứt hợp đồng." });
        }

        var contract = await _context.Contracts
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        if (contract.Status != "Active")
        {
            return BadRequest(new { message = "Chỉ có thể chấm dứt hợp đồng đang hoạt động." });
        }

        contract.Status = "Terminated";
        contract.TerminationInitiatedBy = "Landlord";
        contract.TerminationReason = dto.Reason.Trim();
        contract.EndedAt = VietnamTime.Now;

        var hasOtherOpenContract = await _context.Contracts.AnyAsync(c =>
            c.Id != contract.Id &&
            c.RoomId == contract.RoomId &&
            (c.Status == "Active" || c.Status == "Pending" || c.Status == "AwaitingDeposit"));

        if (!hasOtherOpenContract && contract.Room.Status == "Occupied")
        {
            contract.Room.Status = "Available";
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/contracts/5/deposit-refund
    [HttpPut("{id}/deposit-refund")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> RecordDepositRefund(int id, RecordDepositRefundDto dto)
    {
        if (dto.RefundedAmount < 0)
        {
            return BadRequest(new { message = "Số tiền hoàn không được âm." });
        }

        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
        {
            return NotFound();
        }

        if (contract.DepositRefundedAt.HasValue)
        {
            return BadRequest(new { message = "Cọc đã được ghi nhận xử lý cho hợp đồng này." });
        }

        if (contract.Status != "Expired" && contract.Status != "Terminated")
        {
            return BadRequest(new
            {
                message = "Chỉ ghi nhận hoàn cọc khi hợp đồng đã hết hạn (Expired) hoặc đã chấm dứt (Terminated)."
            });
        }

        if (contract.DepositPaid <= 0)
        {
            return BadRequest(new { message = "Hợp đồng không có tiền cọc đã thu để xử lý hoàn." });
        }

        if (dto.RefundedAmount > contract.DepositPaid)
        {
            return BadRequest(new
            {
                message = $"Số tiền hoàn không được vượt quá số cọc đã thu ({contract.DepositPaid:N0} đ)."
            });
        }

        contract.DepositRefundedAmount = dto.RefundedAmount;
        contract.DepositRefundedAt = VietnamTime.Now;
        contract.DepositRefundNotes = dto.Notes;
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

        if (contract.Status == "Active")
        {
            return BadRequest(new { message = "Không thể xóa hợp đồng đang hoạt động. Vui lòng chấm dứt hợp đồng trước." });
        }

        if (contract.Room.Status == "Occupied" || contract.Room.Status == "Reserved")
        {
            contract.Room.Status = "Available";
        }

        _context.Contracts.Remove(contract);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ContractDto ToContractDto(Contract c) => new()
    {
        Id = c.Id,
        RoomId = c.RoomId,
        RoomNumber = c.Room?.RoomNumber ?? string.Empty,
        TenantId = c.TenantId,
        TenantName = c.Tenant?.FullName ?? string.Empty,
        TenantPhone = c.Tenant?.Phone,
        TenantIdentityCard = c.Tenant?.IdentityCard,
        StartDate = c.StartDate,
        EndDate = c.EndDate,
        MonthlyRent = c.MonthlyRent,
        Deposit = c.Deposit,
        DepositPaid = c.DepositPaid,
        DepositPaidAt = c.DepositPaidAt,
        DepositRefundedAmount = c.DepositRefundedAmount,
        DepositRefundedAt = c.DepositRefundedAt,
        DepositRefundNotes = c.DepositRefundNotes,
        TerminationInitiatedBy = c.TerminationInitiatedBy,
        TerminationReason = c.TerminationReason,
        EndedAt = c.EndedAt,
        RentalTermsAcceptedAt = c.RentalTermsAcceptedAt,
        Status = c.Status,
        Terms = c.Terms,
        Notes = c.Notes,
        ContractNumber = c.ContractNumber,
        SignedDate = c.SignedDate,
        SignedByLandlord = c.SignedByLandlord,
        SignedByTenant = c.SignedByTenant,
        CreatedAt = c.CreatedAt
    };

    private string GenerateContractNumber()
    {
        return $"HD{VietnamTime.Now:yyyyMMdd}{VietnamTime.Now.Ticks % 10000:D4}";
    }
}

