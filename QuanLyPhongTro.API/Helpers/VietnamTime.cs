using System.Runtime.InteropServices;

namespace QuanLyPhongTro.API.Helpers;

/// <summary>
/// Múi giờ Việt Nam (UTC+7)
/// </summary>
public static class VietnamTime
{
    private static readonly TimeZoneInfo VietnamTz = GetVietnamTimeZone();

    private static TimeZoneInfo GetVietnamTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(
                RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                    ? "SE Asia Standard Time"
                    : "Asia/Ho_Chi_Minh");
        }
        catch
        {
            return TimeZoneInfo.CreateCustomTimeZone("Vietnam", TimeSpan.FromHours(7), "Vietnam", "Vietnam");
        }
    }

    /// <summary>
    /// Thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
    /// </summary>
    public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTz);

    /// <summary>
    /// Chuyển UTC sang giờ Việt Nam
    /// </summary>
    public static DateTime FromUtc(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(utc, VietnamTz);

    /// <summary>
    /// Chuyển giờ Việt Nam sang UTC
    /// </summary>
    public static DateTime ToUtc(DateTime vietnamTime) => TimeZoneInfo.ConvertTimeToUtc(vietnamTime, VietnamTz);
}
