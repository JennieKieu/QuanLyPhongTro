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
public class InvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly InvoiceCalculationService _calculationService;
    private readonly PdfExportService _pdfExportService;

    public InvoicesController(
        ApplicationDbContext context,
        InvoiceCalculationService calculationService,
        PdfExportService pdfExportService)
    {
        _context = context;
        _calculationService = calculationService;
        _pdfExportService = pdfExportService;
    }

    // GET: api/invoices
    [HttpGet]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoices()
    {
        var invoices = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                InvoiceType = i.InvoiceType,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
                TenantIdentityCard = i.Contract.Tenant.IdentityCard,
                Month = i.Month,
                Year = i.Year,
                RoomRent = i.RoomRent,
                ElectricityAmount = i.ElectricityAmount,
                WaterAmount = i.WaterAmount,
                TotalAmount = i.TotalAmount,
                Status = i.Status,
                DueDate = i.DueDate,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // GET: api/invoices/pending
    [HttpGet("pending")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetPendingInvoices()
    {
        var invoices = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .Where(i => i.Status == "Pending")
            .OrderBy(i => i.DueDate)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                InvoiceType = i.InvoiceType,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
                TenantIdentityCard = i.Contract.Tenant.IdentityCard,
                Month = i.Month,
                Year = i.Year,
                RoomRent = i.RoomRent,
                ElectricityAmount = i.ElectricityAmount,
                WaterAmount = i.WaterAmount,
                TotalAmount = i.TotalAmount,
                Status = i.Status,
                DueDate = i.DueDate,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // GET: api/invoices/contract/5
    [HttpGet("contract/{contractId}")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByContract(int contractId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)!.Value;

        // Check authorization for tenant
        if (userRole == "Tenant")
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null)
            {
                return NotFound();
            }

            var contract = await _context.Contracts.FindAsync(contractId);
            if (contract == null || contract.TenantId != tenant.Id)
            {
                return Forbid();
            }
        }

        var invoices = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .Where(i => i.ContractId == contractId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                InvoiceType = i.InvoiceType,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
                TenantIdentityCard = i.Contract.Tenant.IdentityCard,
                Month = i.Month,
                Year = i.Year,
                RoomRent = i.RoomRent,
                ElectricityAmount = i.ElectricityAmount,
                WaterAmount = i.WaterAmount,
                TotalAmount = i.TotalAmount,
                Status = i.Status,
                DueDate = i.DueDate,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // GET: api/invoices/my-invoices
    [HttpGet("my-invoices")]
    [Authorize(Roles = "Tenant")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetMyInvoices()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
        if (tenant == null)
        {
            return NotFound();
        }

        var invoices = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .Where(i => i.Contract.TenantId == tenant.Id)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                InvoiceType = i.InvoiceType,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
                TenantIdentityCard = i.Contract.Tenant.IdentityCard,
                Month = i.Month,
                Year = i.Year,
                RoomRent = i.RoomRent,
                ElectricityAmount = i.ElectricityAmount,
                WaterAmount = i.WaterAmount,
                TotalAmount = i.TotalAmount,
                Status = i.Status,
                DueDate = i.DueDate,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // GET: api/invoices/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound();
        }

        // Check authorization: Tenant can only view their own invoices
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)!.Value;

        if (userRole == "Tenant")
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null || invoice.Contract.TenantId != tenant.Id)
            {
                return Forbid();
            }
        }

        var invoiceDto = new InvoiceDto
        {
            Id = invoice.Id,
            ContractId = invoice.ContractId,
            InvoiceType = invoice.InvoiceType,
            RoomNumber = invoice.Contract.Room.RoomNumber,
            TenantName = invoice.Contract.Tenant.FullName,
            TenantIdentityCard = invoice.Contract.Tenant.IdentityCard,
            Month = invoice.Month,
            Year = invoice.Year,
            RoomRent = invoice.RoomRent,
            ElectricityAmount = invoice.ElectricityAmount,
            WaterAmount = invoice.WaterAmount,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status,
            DueDate = invoice.DueDate,
            CreatedAt = invoice.CreatedAt
        };

        return Ok(invoiceDto);
    }

    // GET: api/invoices/5/pdf
    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> ExportInvoicePdf(int id)
    {
        var invoice = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound();
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)!.Value;
        if (userRole == "Tenant")
        {
            var tenant = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null || invoice.Contract.TenantId != tenant.Id)
            {
                return Forbid();
            }
        }

        try
        {
            var pdfBytes = _pdfExportService.GenerateInvoicePdf(invoice);
            return File(pdfBytes, "application/pdf", $"hoa-don-{invoice.Id}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Khong the tao PDF hoa don: {ex.Message}" });
        }
    }

    // POST: api/invoices/generate
    [HttpPost("generate")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<InvoiceDto>> GenerateInvoice(GenerateInvoiceDto generateDto)
    {
        try
        {
            var invoice = await _calculationService.GenerateInvoice(
                generateDto.ContractId, 
                generateDto.Month, 
                generateDto.Year);

            var invoiceWithDetails = await _context.Invoices
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Room)
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Tenant)
                .FirstOrDefaultAsync(i => i.Id == invoice.Id);

            var invoiceDto = new InvoiceDto
            {
                Id = invoiceWithDetails!.Id,
                ContractId = invoiceWithDetails.ContractId,
                InvoiceType = invoiceWithDetails.InvoiceType,
                RoomNumber = invoiceWithDetails.Contract.Room.RoomNumber,
                TenantName = invoiceWithDetails.Contract.Tenant.FullName,
                TenantIdentityCard = invoiceWithDetails.Contract.Tenant.IdentityCard,
                Month = invoiceWithDetails.Month,
                Year = invoiceWithDetails.Year,
                RoomRent = invoiceWithDetails.RoomRent,
                ElectricityAmount = invoiceWithDetails.ElectricityAmount,
                WaterAmount = invoiceWithDetails.WaterAmount,
                TotalAmount = invoiceWithDetails.TotalAmount,
                Status = invoiceWithDetails.Status,
                DueDate = invoiceWithDetails.DueDate,
                CreatedAt = invoiceWithDetails.CreatedAt
            };

            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoiceDto);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/invoices/generate-deposit
    [HttpPost("generate-deposit")]
    [Authorize(Roles = "Landlord")]
    public async Task<ActionResult<InvoiceDto>> GenerateDepositInvoice(GenerateDepositInvoiceDto dto)
    {
        try
        {
            var invoice = await _calculationService.GenerateDepositInvoice(dto.ContractId);

            var invoiceWithDetails = await _context.Invoices
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Room)
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Tenant)
                .FirstOrDefaultAsync(i => i.Id == invoice.Id);

            var invoiceDto = new InvoiceDto
            {
                Id = invoiceWithDetails!.Id,
                ContractId = invoiceWithDetails.ContractId,
                InvoiceType = invoiceWithDetails.InvoiceType,
                RoomNumber = invoiceWithDetails.Contract.Room.RoomNumber,
                TenantName = invoiceWithDetails.Contract.Tenant.FullName,
                TenantIdentityCard = invoiceWithDetails.Contract.Tenant.IdentityCard,
                Month = invoiceWithDetails.Month,
                Year = invoiceWithDetails.Year,
                RoomRent = invoiceWithDetails.RoomRent,
                ElectricityAmount = invoiceWithDetails.ElectricityAmount,
                WaterAmount = invoiceWithDetails.WaterAmount,
                TotalAmount = invoiceWithDetails.TotalAmount,
                Status = invoiceWithDetails.Status,
                DueDate = invoiceWithDetails.DueDate,
                CreatedAt = invoiceWithDetails.CreatedAt
            };

            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoiceDto);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/invoices/5/pay
    [HttpPut("{id}/pay")]
    [Authorize(Roles = "Landlord,Tenant")]
    public async Task<IActionResult> PayInvoice(int id, PayInvoiceDto payDto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Contract)
            .ThenInclude(c => c.Room)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound();
        }

        // Check authorization for tenant
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)!.Value;
        if (userRole == "Tenant")
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null || invoice.Contract.TenantId != tenant.Id)
            {
                return Forbid();
            }
        }

        if (invoice.Status == "Paid")
        {
            return BadRequest(new { message = "Hóa đơn đã được thanh toán" });
        }

        if (payDto.Amount > invoice.TotalAmount)
        {
            return BadRequest(new { message = "Số tiền thanh toán không được vượt quá tổng tiền hóa đơn" });
        }

        if (invoice.InvoiceType == "Deposit" && payDto.Amount != invoice.TotalAmount)
        {
            return BadRequest(new { message = "Hóa đơn cọc phải thanh toán đủ số tiền trên hóa đơn." });
        }

        // Update invoice status
        invoice.Status = "Paid";

        // Create payment record
        var payment = new Payment
        {
            InvoiceId = id,
            Amount = payDto.Amount,
            PaymentDate = VietnamTime.Now,
            PaymentMethod = payDto.PaymentMethod,
            Notes = payDto.Notes
        };

        _context.Payments.Add(payment);

        if (invoice.InvoiceType == "Deposit")
        {
            var contract = invoice.Contract;
            contract.DepositPaid = payDto.Amount;
            contract.DepositPaidAt = VietnamTime.Now;
            if (contract.Status == "AwaitingDeposit")
            {
                contract.Status = "Active";
                contract.Room.Status = "Occupied";
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/invoices/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> UpdateInvoice(int id, UpdateInvoiceDto dto)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null)
        {
            return NotFound();
        }

        if (invoice.Status != "Pending")
        {
            return BadRequest(new { message = "Chỉ có thể sửa hóa đơn chưa thanh toán." });
        }

        if (invoice.InvoiceType == "Deposit")
        {
            if (dto.RoomRent.HasValue || dto.ElectricityAmount.HasValue || dto.WaterAmount.HasValue)
            {
                return BadRequest(new { message = "Hóa đơn cọc không cho phép sửa các khoản tiền chi tiết." });
            }

            if (dto.DueDate.HasValue)
            {
                invoice.DueDate = dto.DueDate.Value;
            }
        }
        else
        {
            var roomRent = dto.RoomRent ?? invoice.RoomRent;
            var electricityAmount = dto.ElectricityAmount ?? invoice.ElectricityAmount;
            var waterAmount = dto.WaterAmount ?? invoice.WaterAmount;
            var serviceFee = invoice.TotalAmount - invoice.RoomRent - invoice.ElectricityAmount - invoice.WaterAmount;

            if (roomRent < 0 || electricityAmount < 0 || waterAmount < 0)
            {
                return BadRequest(new { message = "Các khoản tiền không được âm." });
            }

            invoice.RoomRent = roomRent;
            invoice.ElectricityAmount = electricityAmount;
            invoice.WaterAmount = waterAmount;
            invoice.TotalAmount = roomRent + electricityAmount + waterAmount + (serviceFee > 0 ? serviceFee : 0);

            if (dto.DueDate.HasValue)
            {
                invoice.DueDate = dto.DueDate.Value;
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/invoices/5
    [HttpDelete("{id}")]
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id);
        if (invoice == null)
        {
            return NotFound();
        }

        if (invoice.Status != "Pending")
        {
            return BadRequest(new { message = "Chỉ có thể xóa hóa đơn chưa thanh toán." });
        }

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

