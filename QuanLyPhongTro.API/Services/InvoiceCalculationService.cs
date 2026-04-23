using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.Helpers;
using QuanLyPhongTro.API.Models;

namespace QuanLyPhongTro.API.Services;

public class InvoiceCalculationService
{
    private readonly ApplicationDbContext _context;

    public InvoiceCalculationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(decimal electricityAmount, decimal waterAmount, decimal serviceFee)> CalculateUtilityCosts(
        int roomId, int month, int year)
    {
        // Get current month's utility reading
        var currentReading = await _context.Utilities
            .FirstOrDefaultAsync(u => u.RoomId == roomId && u.Month == month && u.Year == year);

        if (currentReading == null)
        {
            throw new InvalidOperationException("Chưa có chỉ số điện/nước cho tháng đã chọn.");
        }

        // Get nearest previous reading (not necessarily previous month)
        var previousReading = await _context.Utilities
            .Where(u => u.RoomId == roomId &&
                        (u.Year < year || (u.Year == year && u.Month < month)))
            .OrderByDescending(u => u.Year)
            .ThenByDescending(u => u.Month)
            .FirstOrDefaultAsync();

        var previousElectric = previousReading?.ElectricityIndex ?? 0;
        var previousWater = previousReading?.WaterIndex ?? 0;

        // Calculate usage (avoid negative)
        var electricityUsage = Math.Max(0, currentReading.ElectricityIndex - previousElectric);
        var waterUsage = Math.Max(0, currentReading.WaterIndex - previousWater);

        // Calculate costs
        var electricityAmount = electricityUsage * currentReading.ElectricityUnitPrice;
        var waterAmount = waterUsage * currentReading.WaterUnitPrice;
        var serviceFee = currentReading.ServiceFee;

        return (electricityAmount, waterAmount, serviceFee);
    }

    public async Task<Invoice> GenerateInvoice(int contractId, int month, int year)
    {
        var contract = await _context.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .FirstOrDefaultAsync(c => c.Id == contractId);

        if (contract == null)
        {
            throw new ArgumentException("Contract not found");
        }

        if (contract.Status != "Active")
        {
            throw new InvalidOperationException("Can only generate invoice for active contracts");
        }

        // Check if monthly invoice already exists
        var existingInvoice = await _context.Invoices
            .FirstOrDefaultAsync(i =>
                i.ContractId == contractId &&
                i.InvoiceType == "Monthly" &&
                i.Month == month &&
                i.Year == year);

        if (existingInvoice != null)
        {
            throw new InvalidOperationException("Invoice for this month already exists");
        }

        var roomRent = CalculateProRatedRoomRent(contract, month, year);

        // Calculate utility costs
        var (electricityAmount, waterAmount, serviceFee) = await CalculateUtilityCosts(
            contract.RoomId, month, year);

        // Calculate total
        var totalAmount = roomRent + electricityAmount + waterAmount + serviceFee;

        // Set due date: end of invoice month + 10 days
        var dueDate = new DateTime(year, month, DateTime.DaysInMonth(year, month)).AddDays(10);

        var invoice = new Invoice
        {
            ContractId = contractId,
            InvoiceType = "Monthly",
            Month = month,
            Year = year,
            RoomRent = roomRent,
            ElectricityAmount = electricityAmount,
            WaterAmount = waterAmount,
            TotalAmount = totalAmount,
            Status = "Pending",
            DueDate = dueDate,
            CreatedAt = VietnamTime.Now
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return invoice;
    }

    private static decimal CalculateProRatedRoomRent(Contract contract, int month, int year)
    {
        var monthStart = new DateTime(year, month, 1);
        var monthEnd = new DateTime(year, month, DateTime.DaysInMonth(year, month));
        var effectiveStart = contract.StartDate.Date > monthStart ? contract.StartDate.Date : monthStart;
        var effectiveEnd = contract.EndDate.Date < monthEnd ? contract.EndDate.Date : monthEnd;

        if (effectiveEnd < effectiveStart)
        {
            throw new InvalidOperationException("Hợp đồng không có hiệu lực trong tháng đã chọn.");
        }

        var occupiedDays = (effectiveEnd - effectiveStart).Days + 1;
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var proRatedRent = contract.MonthlyRent * occupiedDays / daysInMonth;

        return Math.Round(proRatedRent, 2, MidpointRounding.AwayFromZero);
    }

    public async Task<Invoice> GenerateDepositInvoice(int contractId)
    {
        var contract = await _context.Contracts
            .Include(c => c.Room)
            .FirstOrDefaultAsync(c => c.Id == contractId);

        if (contract == null)
        {
            throw new ArgumentException("Contract not found");
        }

        if (contract.Status != "AwaitingDeposit")
        {
            throw new InvalidOperationException("Chỉ tạo hóa đơn cọc khi hợp đồng đang chờ thu cọc.");
        }

        var required = contract.Deposit ?? contract.Room?.DepositAmount ?? 0m;
        if (required <= 0)
        {
            throw new InvalidOperationException("Hợp đồng không có tiền cọc cần thu.");
        }

        var existing = await _context.Invoices
            .AnyAsync(i => i.ContractId == contractId && i.InvoiceType == "Deposit");

        if (existing)
        {
            throw new InvalidOperationException("Đã có hóa đơn cọc cho hợp đồng này.");
        }

        var dueDate = VietnamTime.Now.Date.AddDays(7);
        var invoice = new Invoice
        {
            ContractId = contractId,
            InvoiceType = "Deposit",
            Month = 0,
            Year = 0,
            RoomRent = 0,
            ElectricityAmount = 0,
            WaterAmount = 0,
            TotalAmount = required,
            Status = "Pending",
            DueDate = dueDate,
            CreatedAt = VietnamTime.Now
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return invoice;
    }
}

