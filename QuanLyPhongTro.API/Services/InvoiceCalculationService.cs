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

    public async Task<(decimal electricityAmount, decimal waterAmount)> CalculateUtilityCosts(
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

        return (electricityAmount, waterAmount);
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

        // Check if invoice already exists
        var existingInvoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.ContractId == contractId && i.Month == month && i.Year == year);

        if (existingInvoice != null)
        {
            throw new InvalidOperationException("Invoice for this month already exists");
        }

        // Calculate utility costs
        var (electricityAmount, waterAmount) = await CalculateUtilityCosts(
            contract.RoomId, month, year);

        // Calculate total
        var totalAmount = contract.MonthlyRent + electricityAmount + waterAmount;

        // Set due date (end of month)
        var dueDate = new DateTime(year, month, DateTime.DaysInMonth(year, month));

        var invoice = new Invoice
        {
            ContractId = contractId,
            Month = month,
            Year = year,
            RoomRent = contract.MonthlyRent,
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
}

