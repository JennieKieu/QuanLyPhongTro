using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Models;

namespace QuanLyPhongTro.API.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<UtilityReading> Utilities => Set<UtilityReading>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasOne(t => t.User)
            .WithOne(u => u.Tenant)
            .HasForeignKey<Tenant>(t => t.UserId);

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.UserId)
            .IsUnique();

        modelBuilder.Entity<Room>()
            .Property(r => r.Status)
            .HasMaxLength(32);

        modelBuilder.Entity<Contract>()
            .Property(c => c.Status)
            .HasMaxLength(32);

        modelBuilder.Entity<Invoice>()
            .Property(i => i.Status)
            .HasMaxLength(32);

        modelBuilder.Entity<OtpCode>()
            .HasIndex(o => new { o.Email, o.Code });
    }
}


