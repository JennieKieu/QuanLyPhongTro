using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace QuanLyPhongTro.API.Services;

public class EmailSettingsOptions
{
    public string SmtpHost { get; set; } = string.Empty;
    public string SmtpPort { get; set; } = "587";
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
}

public class EmailService
{
    private readonly EmailSettingsOptions _options;

    public EmailService(IOptions<EmailSettingsOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(_options.SmtpHost))
        {
            return;
        }

        var port = int.TryParse(_options.SmtpPort, out var p) ? p : 587;
        using var client = new SmtpClient(_options.SmtpHost, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_options.SmtpUser, _options.SmtpPassword)
        };

        var message = new MailMessage
        {
            From = new MailAddress(_options.FromEmail, _options.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        message.To.Add(toEmail);

        await client.SendMailAsync(message);
    }
}


