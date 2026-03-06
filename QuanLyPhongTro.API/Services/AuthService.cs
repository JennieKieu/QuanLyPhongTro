using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongTro.API.Data;
using QuanLyPhongTro.API.Models;

namespace QuanLyPhongTro.API.Services;

public class AuthService
{
    private readonly ApplicationDbContext _dbContext;

    public AuthService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _dbContext.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<User> CreateUserAsync(string email, string password, string fullName, string phone, string role)
    {
        var user = new User
        {
            Email = email,
            PasswordHash = HashPassword(password),
            FullName = fullName,
            Phone = phone,
            Role = role,
            IsEmailVerified = true
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        if (role.Equals("Tenant", StringComparison.OrdinalIgnoreCase))
        {
            var tenant = new Tenant
            {
                UserId = user.Id,
                FullName = fullName,
                Email = email,
                Phone = phone
            };

            _dbContext.Tenants.Add(tenant);
            await _dbContext.SaveChangesAsync();
        }

        return user;
    }

    public async Task<bool> CheckPasswordAsync(User user, string password)
    {
        var hash = HashPassword(password);
        return string.Equals(user.PasswordHash, hash, StringComparison.Ordinal);
    }

    public async Task ChangePasswordAsync(User user, string newPassword)
    {
        user.PasswordHash = HashPassword(newPassword);
        await _dbContext.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        // Đơn giản: PBKDF2 với salt cố định. Thực tế nên lưu salt riêng cho từng user.
        var salt = "PhongTro_Salt_v1";
        var pbkdf2 = new Rfc2898DeriveBytes(password, Encoding.UTF8.GetBytes(salt), 100_000, HashAlgorithmName.SHA256);
        return Convert.ToBase64String(pbkdf2.GetBytes(32));
    }
}


