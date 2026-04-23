using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Services;

/// <summary>
/// Background job: tự động chuyển hóa đơn Pending quá hạn sang Overdue.
/// </summary>
public class InvoiceOverdueBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<InvoiceOverdueBackgroundService> _logger;

    public InvoiceOverdueBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<InvoiceOverdueBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Chạy ngay khi service khởi động để đồng bộ dữ liệu cũ.
        await MarkOverdueInvoices(stoppingToken);

        // Sau đó chạy định kỳ mỗi giờ.
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                await MarkOverdueInvoices(stoppingToken);
            }
            catch (TaskCanceledException)
            {
                // Normal shutdown.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chạy job cập nhật hóa đơn quá hạn.");
            }
        }
    }

    private async Task MarkOverdueInvoices(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var today = VietnamTime.Now.Date;

        var overdueInvoices = await db.Invoices
            .Where(i => i.Status == "Pending" && i.DueDate.Date < today)
            .ToListAsync(cancellationToken);

        if (overdueInvoices.Count == 0)
        {
            return;
        }

        foreach (var invoice in overdueInvoices)
        {
            invoice.Status = "Overdue";
        }

        await db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Đã cập nhật {Count} hóa đơn sang trạng thái Overdue.",
            overdueInvoices.Count);
    }
}
