using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.Helpers;

namespace QuanLyPhongTro.API.Services;

/// <summary>
/// Background job: tự động cập nhật hợp đồng hết hạn và trạng thái phòng.
/// </summary>
public class ContractExpiryBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ContractExpiryBackgroundService> _logger;

    public ContractExpiryBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<ContractExpiryBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await ProcessExpiredContracts(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                await ProcessExpiredContracts(stoppingToken);
            }
            catch (TaskCanceledException)
            {
                // Normal shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chạy job cập nhật hợp đồng hết hạn.");
            }
        }
    }

    private async Task ProcessExpiredContracts(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var today = VietnamTime.Now.Date;

        var expiringContracts = await db.Contracts
            .Include(c => c.Room)
            .Where(c => c.Status == "Active" && c.EndDate.Date < today)
            .ToListAsync(cancellationToken);

        if (expiringContracts.Count == 0)
        {
            return;
        }

        foreach (var contract in expiringContracts)
        {
            contract.Status = "Expired";
            contract.EndedAt = VietnamTime.Now;

            var hasOtherOpenContract = await db.Contracts.AnyAsync(c =>
                c.Id != contract.Id &&
                c.RoomId == contract.RoomId &&
                (c.Status == "Active" || c.Status == "Pending" || c.Status == "AwaitingDeposit"),
                cancellationToken);

            if (!hasOtherOpenContract && contract.Room.Status == "Occupied")
            {
                contract.Room.Status = "Available";
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Đã cập nhật {Count} hợp đồng sang trạng thái Expired.",
            expiringContracts.Count);
    }
}
