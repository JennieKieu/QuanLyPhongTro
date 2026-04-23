using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuanLyPhongTro.API.Models;

namespace QuanLyPhongTro.API.Services;

public class PdfExportService
{
    public byte[] GenerateContractPdf(Contract contract)
    {
        var statusText = contract.Status switch
        {
            "Active" => "Dang hoat dong",
            "Pending" => "Cho duyet",
            "AwaitingDeposit" => "Cho thanh toan coc",
            "Expired" => "Het han",
            "Rejected" => "Tu choi",
            "Terminated" => "Da cham dut",
            _ => contract.Status
        };

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header()
                    .Text("HOP DONG THUE PHONG")
                    .Bold()
                    .FontSize(18)
                    .FontColor(Colors.Blue.Darken2);

                page.Content().Column(col =>
                {
                    col.Spacing(8);
                    col.Item().Text($"So hop dong: {contract.ContractNumber ?? "-"}").Bold();
                    col.Item().Text($"Phong: {contract.Room?.RoomNumber ?? "-"}");
                    col.Item().Text($"Nguoi thue: {contract.Tenant?.FullName ?? "-"}");
                    col.Item().Text($"So dien thoai: {contract.Tenant?.Phone ?? "-"}");
                    col.Item().Text($"Ngay bat dau: {contract.StartDate:dd/MM/yyyy}");
                    col.Item().Text($"Ngay ket thuc: {contract.EndDate:dd/MM/yyyy}");
                    col.Item().Text($"Gia thue/thang: {contract.MonthlyRent:N0} VND");
                    col.Item().Text($"Tien coc: {(contract.Deposit ?? 0):N0} VND");
                    col.Item().Text($"Da thu coc: {contract.DepositPaid:N0} VND");
                    if (contract.DepositRefundedAt.HasValue)
                    {
                        col.Item().Text($"Da hoan coc cho khach: {contract.DepositRefundedAmount:N0} VND");
                        col.Item().Text($"Ngay ghi nhan hoan coc: {contract.DepositRefundedAt:dd/MM/yyyy HH:mm}");
                        if (!string.IsNullOrWhiteSpace(contract.DepositRefundNotes))
                        {
                            col.Item().Text($"Ghi chu hoan coc: {contract.DepositRefundNotes}");
                        }
                    }

                    if (contract.RentalTermsAcceptedAt.HasValue)
                    {
                        col.Item().Text(
                            $"Xac nhan dieu khoan thue tro (yeu cau thue): {contract.RentalTermsAcceptedAt:dd/MM/yyyy HH:mm}");
                    }

                    if (contract.EndedAt.HasValue && (contract.Status == "Terminated" || contract.Status == "Expired"))
                    {
                        col.Item().Text(
                            contract.Status == "Expired"
                                ? $"Ngay ghi nhan het han tren he thong: {contract.EndedAt:dd/MM/yyyy HH:mm}"
                                : $"Ngay ghi nhan cham dut: {contract.EndedAt:dd/MM/yyyy HH:mm}");
                    }

                    if (contract.Status == "Terminated")
                    {
                        if (!string.IsNullOrWhiteSpace(contract.TerminationInitiatedBy))
                        {
                            col.Item().Text(
                                $"Cham dut boi: {(contract.TerminationInitiatedBy == "Landlord" ? "Chu tro" : "Nguoi thue")}");
                        }

                        if (!string.IsNullOrWhiteSpace(contract.TerminationReason))
                        {
                            col.Item().Text($"Ly do cham dut: {contract.TerminationReason}");
                        }
                    }

                    col.Item().Text($"Trang thai: {statusText}");
                    col.Item().Text($"Ngay tao: {contract.CreatedAt:dd/MM/yyyy HH:mm}");

                    if (!string.IsNullOrWhiteSpace(contract.Terms))
                    {
                        col.Item().PaddingTop(8).Text("Dieu khoan").Bold();
                        col.Item().Text(contract.Terms);
                    }

                    if (!string.IsNullOrWhiteSpace(contract.Notes))
                    {
                        col.Item().PaddingTop(4).Text("Ghi chu").Bold();
                        col.Item().Text(contract.Notes);
                    }
                });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("In luc: ");
                        x.Span(DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
                    });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateInvoicePdf(Invoice invoice)
    {
        var invoiceTypeText = invoice.InvoiceType == "Deposit" ? "Hoa don coc phong" : "Hoa don hang thang";
        var periodText = invoice.InvoiceType == "Deposit" ? "-" : $"{invoice.Month}/{invoice.Year}";
        var statusText = invoice.Status switch
        {
            "Paid" => "Da thanh toan",
            "Overdue" => "Qua han",
            _ => "Chua thanh toan"
        };

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header()
                    .Text("HOA DON")
                    .Bold()
                    .FontSize(18)
                    .FontColor(Colors.Green.Darken2);

                page.Content().Column(col =>
                {
                    col.Spacing(8);
                    col.Item().Text($"{invoiceTypeText} - Ma hoa don: {invoice.Id}").Bold();
                    col.Item().Text($"So hop dong: {invoice.Contract?.ContractNumber ?? "-"}");
                    col.Item().Text($"Phong: {invoice.Contract?.Room?.RoomNumber ?? "-"}");
                    col.Item().Text($"Nguoi thue: {invoice.Contract?.Tenant?.FullName ?? "-"}");
                    col.Item().Text($"Ky thanh toan: {periodText}");
                    col.Item().Text($"Tien phong: {invoice.RoomRent:N0} VND");
                    col.Item().Text($"Tien dien: {invoice.ElectricityAmount:N0} VND");
                    col.Item().Text($"Tien nuoc: {invoice.WaterAmount:N0} VND");
                    col.Item().Text($"Tong tien: {invoice.TotalAmount:N0} VND").Bold();
                    col.Item().Text($"Han thanh toan: {invoice.DueDate:dd/MM/yyyy}");
                    col.Item().Text($"Trang thai: {statusText}");
                    col.Item().Text($"Ngay tao: {invoice.CreatedAt:dd/MM/yyyy HH:mm}");
                });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("In luc: ");
                        x.Span(DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
                    });
            });
        }).GeneratePdf();
    }
}

