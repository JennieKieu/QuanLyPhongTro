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

    public InvoicesController(ApplicationDbContext context, InvoiceCalculationService calculationService)
    {
        _context = context;
        _calculationService = calculationService;
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
            .OrderByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
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
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
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
            .OrderByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
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
            .OrderByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                RoomNumber = i.Contract.Room.RoomNumber,
                TenantName = i.Contract.Tenant.FullName,
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
            RoomNumber = invoice.Contract.Room.RoomNumber,
            TenantName = invoice.Contract.Tenant.FullName,
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
                RoomNumber = invoiceWithDetails.Contract.Room.RoomNumber,
                TenantName = invoiceWithDetails.Contract.Tenant.FullName,
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
    [Authorize(Roles = "Landlord")]
    public async Task<IActionResult> PayInvoice(int id, PayInvoiceDto payDto)
    {
        var invoice = await _context.Invoices.FindAsync(id);

        if (invoice == null)
        {
            return NotFound();
        }

        if (invoice.Status == "Paid")
        {
            return BadRequest(new { message = "Hóa đơn đã được thanh toán" });
        }

        if (payDto.Amount > invoice.TotalAmount)
        {
            return BadRequest(new { message = "Số tiền thanh toán không được vượt quá tổng tiền hóa đơn" });
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
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

