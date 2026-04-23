using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Landlord")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/reports/summary?month=3&year=2026
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int? month, [FromQuery] int? year)
    {
        var now = VietnamTime.Now;
        var reportMonth = month is >= 1 and <= 12 ? month.Value : now.Month;
        var reportYear = year is >= 2000 and <= 3000 ? year.Value : now.Year;

        // Kỳ báo cáo: hóa đơn tháng theo Month/Year kỳ; hóa đơn cọc dùng Month=0/Year=0 nên lọc theo CreatedAt (VN)
        var periodInvoices = _context.Invoices.Where(i =>
            (i.InvoiceType == "Monthly" && i.Month == reportMonth && i.Year == reportYear)
            || (i.InvoiceType == "Deposit" && i.CreatedAt.Year == reportYear && i.CreatedAt.Month == reportMonth));

        var monthlyPeriodInvoices = _context.Invoices.Where(i =>
            i.InvoiceType == "Monthly" && i.Month == reportMonth && i.Year == reportYear);

        var totalRooms = await _context.Rooms.CountAsync();
        var occupiedRooms = await _context.Rooms.CountAsync(r => r.Status == "Occupied");
        var reservedRooms = await _context.Rooms.CountAsync(r => r.Status == "Reserved");
        var availableRooms = await _context.Rooms.CountAsync(r => r.Status == "Available");
        var maintenanceRooms = await _context.Rooms.CountAsync(r => r.Status == "Maintenance");

        var totalTenants = await _context.Tenants.CountAsync();
        var totalContracts = await _context.Contracts.CountAsync();
        var activeContracts = await _context.Contracts.CountAsync(c => c.Status == "Active");
        var pendingContracts = await _context.Contracts.CountAsync(c => c.Status == "Pending" || c.Status == "AwaitingDeposit");
        var expiringIn30Days = await _context.Contracts.CountAsync(c =>
            c.Status == "Active" &&
            c.EndDate.Date >= now.Date &&
            c.EndDate.Date <= now.Date.AddDays(30));

        var totalInvoices = await periodInvoices.CountAsync();
        var paidInvoices = await periodInvoices.CountAsync(i => i.Status == "Paid");
        var pendingInvoices = await periodInvoices.CountAsync(i => i.Status == "Pending");
        var overdueInvoices = await periodInvoices.CountAsync(i => i.Status == "Overdue");
        var invoicePaidRevenueGross =
            await periodInvoices.Where(i => i.Status == "Paid").SumAsync(i => (decimal?)i.TotalAmount) ?? 0m;
        var depositRefundsInPeriod =
            await _context.Contracts
                .Where(c =>
                    c.DepositRefundedAt != null &&
                    c.DepositRefundedAt.Value.Year == reportYear &&
                    c.DepositRefundedAt.Value.Month == reportMonth)
                .SumAsync(c => (decimal?)c.DepositRefundedAmount) ?? 0m;
        var paidRevenue = invoicePaidRevenueGross - depositRefundsInPeriod;
        var outstandingDebt = await periodInvoices.Where(i => i.Status == "Pending" || i.Status == "Overdue").SumAsync(i => (decimal?)i.TotalAmount) ?? 0m;

        var electricityTotal = await monthlyPeriodInvoices.SumAsync(i => (decimal?)i.ElectricityAmount) ?? 0m;
        var waterTotal = await monthlyPeriodInvoices.SumAsync(i => (decimal?)i.WaterAmount) ?? 0m;
        var roomRentTotal = await monthlyPeriodInvoices.SumAsync(i => (decimal?)i.RoomRent) ?? 0m;
        var monthlyInvoiceTotal = await monthlyPeriodInvoices.SumAsync(i => (decimal?)i.TotalAmount) ?? 0m;
        var serviceFeeTotal = monthlyInvoiceTotal - roomRentTotal - electricityTotal - waterTotal;
        if (serviceFeeTotal < 0) serviceFeeTotal = 0;

        var monthlyPaidByMonth = await _context.Invoices
            .Where(i => i.InvoiceType == "Monthly" && i.Year == reportYear && i.Status == "Paid")
            .GroupBy(i => i.Month)
            .Select(g => new { month = g.Key, revenue = g.Sum(x => x.TotalAmount) })
            .ToListAsync();

        var depositPaidByMonth = await _context.Invoices
            .Where(i => i.InvoiceType == "Deposit" && i.Status == "Paid" && i.CreatedAt.Year == reportYear)
            .GroupBy(i => i.CreatedAt.Month)
            .Select(g => new { month = g.Key, revenue = g.Sum(x => x.TotalAmount) })
            .ToListAsync();

        var depositRefundsByMonth = await _context.Contracts
            .Where(c => c.DepositRefundedAt != null && c.DepositRefundedAt.Value.Year == reportYear)
            .GroupBy(c => c.DepositRefundedAt!.Value.Month)
            .Select(g => new { month = g.Key, amount = g.Sum(x => x.DepositRefundedAmount) })
            .ToListAsync();

        var yearlyRevenue = Enumerable.Range(1, 12)
            .Select(m =>
            {
                var fromMonthly = monthlyPaidByMonth.FirstOrDefault(x => x.month == m)?.revenue ?? 0m;
                var fromDeposit = depositPaidByMonth.FirstOrDefault(x => x.month == m)?.revenue ?? 0m;
                var refunds = depositRefundsByMonth.FirstOrDefault(x => x.month == m)?.amount ?? 0m;
                return new { month = m, revenue = fromMonthly + fromDeposit - refunds };
            })
            .ToList();

        var debtByTenant = await _context.Invoices
            .Where(i => (i.InvoiceType == "Monthly" || i.InvoiceType == "Deposit")
                && (i.Status == "Pending" || i.Status == "Overdue"))
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .GroupBy(i => new { i.Contract.TenantId, i.Contract.Tenant.FullName })
            .Select(g => new
            {
                tenantId = g.Key.TenantId,
                tenantName = g.Key.FullName,
                debt = g.Sum(x => x.TotalAmount),
                invoiceCount = g.Count()
            })
            .OrderByDescending(x => x.debt)
            .Take(10)
            .ToListAsync();

        var roomRevenueBase = await periodInvoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
            .GroupBy(i => new { i.Contract.RoomId, i.Contract.Room.RoomNumber })
            .Select(g => new
            {
                roomId = g.Key.RoomId,
                roomNumber = g.Key.RoomNumber,
                revenue = g.Sum(x => x.TotalAmount),
                paidRevenue = g.Where(x => x.Status == "Paid").Sum(x => x.TotalAmount),
                invoiceCount = g.Count()
            })
            .ToListAsync();

        var refundByRoom = await _context.Contracts
            .Where(c =>
                c.DepositRefundedAt != null &&
                c.DepositRefundedAt.Value.Year == reportYear &&
                c.DepositRefundedAt.Value.Month == reportMonth)
            .GroupBy(c => c.RoomId)
            .Select(g => new { roomId = g.Key, amount = g.Sum(x => x.DepositRefundedAmount) })
            .ToListAsync();
        var refundRoomDict = refundByRoom.ToDictionary(x => x.roomId, x => x.amount);

        var roomRevenue = roomRevenueBase
            .Select(r =>
            {
                var sub = refundRoomDict.TryGetValue(r.roomId, out var a) ? a : 0m;
                return new
                {
                    r.roomId,
                    r.roomNumber,
                    revenue = Math.Max(0m, r.revenue - sub),
                    paidRevenue = Math.Max(0m, r.paidRevenue - sub),
                    r.invoiceCount
                };
            })
            .OrderByDescending(x => x.revenue)
            .Take(10)
            .ToList();

        var monthlyInvoicesInPeriod = await monthlyPeriodInvoices.CountAsync();
        var depositInvoicesInPeriod = await periodInvoices.CountAsync(i => i.InvoiceType == "Deposit");

        var response = new
        {
            period = new { month = reportMonth, year = reportYear },
            overview = new
            {
                totalRooms,
                occupiedRooms,
                reservedRooms,
                availableRooms,
                maintenanceRooms,
                occupancyRate = totalRooms == 0 ? 0 : Math.Round(((occupiedRooms + reservedRooms) * 100.0m) / totalRooms, 2),
                totalTenants,
                totalContracts,
                activeContracts,
                pendingContracts,
                expiringIn30Days
            },
            invoices = new
            {
                totalInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                invoicePaidRevenueGross,
                depositRefundsInPeriod,
                paidRevenue,
                outstandingDebt,
                monthlyInvoicesInPeriod,
                depositInvoicesInPeriod
            },
            utilities = new
            {
                roomRentTotal,
                electricityTotal,
                waterTotal,
                serviceFeeTotal
            },
            yearlyRevenue,
            debtByTenant,
            roomRevenue
        };

        return Ok(response);
    }
}

