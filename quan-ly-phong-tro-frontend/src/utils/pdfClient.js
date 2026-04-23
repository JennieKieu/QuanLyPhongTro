import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts.vfs

const formatCurrency = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-')
const statusLabel = (status) => {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Pending') return 'Chờ duyệt'
  if (status === 'AwaitingDeposit') return 'Chờ thanh toán cọc'
  if (status === 'Expired') return 'Hết hạn'
  if (status === 'Terminated') return 'Đã chấm dứt'
  if (status === 'Rejected') return 'Từ chối'
  if (status === 'Paid') return 'Đã thanh toán'
  if (status === 'Overdue') return 'Quá hạn'
  return status || '-'
}

const getServiceFee = (invoice) => {
  if ((invoice.invoiceType || 'Monthly') !== 'Monthly') return 0
  const fee =
    Number(invoice.totalAmount || 0) -
    Number(invoice.roomRent || 0) -
    Number(invoice.electricityAmount || 0) -
    Number(invoice.waterAmount || 0)
  return fee > 0 ? fee : 0
}

const openPdf = (pdfDocGenerator, fileName) => {
  pdfDocGenerator.getBlob((blob) => {
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
  })
}

export const exportContractPdfClient = (contract) => {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 36, 30, 30],
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: true, color: 'white' },
      subtitle: { fontSize: 10, color: 'white' },
      section: { fontSize: 12, bold: true, color: '#185da9', margin: [0, 12, 0, 8] },
      tableHeader: { bold: true, fillColor: '#f2f6fb' },
    },
    content: [
      {
        table: {
          widths: ['*'],
          body: [[{ text: `HỢP ĐỒNG THUÊ PHÒNG\nMã chứng từ: ${contract.contractNumber || contract.id}`, style: 'title', margin: [10, 8, 10, 8] }]],
        },
        layout: { fillColor: () => '#185da9', hLineWidth: () => 0, vLineWidth: () => 0 },
      },
      { text: 'I. THÔNG TIN CHUNG', style: 'section' },
      {
        table: {
          widths: [95, '*', 95, '*'],
          body: [
            ['Số hợp đồng:', contract.contractNumber || '-', 'Ngày lập:', formatDate(contract.createdAt)],
            ['Phòng:', contract.roomNumber || '-', 'Trạng thái:', statusLabel(contract.status)],
            ['Người thuê:', contract.tenantName || '-', 'Ngày bắt đầu:', formatDate(contract.startDate)],
            ['CMND/CCCD:', contract.tenantIdentityCard || '-', 'Ngày kết thúc:', formatDate(contract.endDate)],
            ['Tiền cọc:', formatCurrency(contract.deposit || 0), 'SĐT người thuê:', contract.tenantPhone || '-'],
            ['Giá thuê/tháng:', formatCurrency(contract.monthlyRent), 'Đã thu cọc:', formatCurrency(contract.depositPaid || 0)],
            ...(contract.depositRefundedAt
              ? [
                  [
                    'Đã hoàn cọc:',
                    formatCurrency(contract.depositRefundedAmount || 0),
                    'Ngày ghi nhận:',
                    formatDate(contract.depositRefundedAt),
                  ],
                ]
              : []),
          ],
        },
        layout: 'lightHorizontalLines',
      },
      ...(contract.rentalTermsAcceptedAt
        ? [
            {
              text: `Xác nhận điều khoản thuê trọ (gửi yêu cầu): ${formatDate(contract.rentalTermsAcceptedAt)}`,
              margin: [0, 6, 0, 0],
            },
          ]
        : []),
      ...(contract.endedAt && (contract.status === 'Terminated' || contract.status === 'Expired')
        ? [
            {
              text:
                contract.status === 'Expired'
                  ? `Ngày hệ thống ghi nhận hết hạn: ${formatDate(contract.endedAt)}`
                  : `Ngày hệ thống ghi nhận chấm dứt: ${formatDate(contract.endedAt)}`,
              margin: [0, 6, 0, 0],
            },
          ]
        : []),
      ...(contract.status === 'Terminated' &&
      (contract.terminationInitiatedBy || contract.terminationReason)
        ? [
            {
              text: `Chấm dứt bởi: ${
                contract.terminationInitiatedBy === 'Landlord'
                  ? 'Chủ trọ'
                  : contract.terminationInitiatedBy === 'Tenant'
                  ? 'Người thuê'
                  : '-'
              }`,
              bold: true,
              margin: [0, 8, 0, 0],
            },
            ...(contract.terminationReason
              ? [{ text: `Lý do: ${contract.terminationReason}`, margin: [0, 0, 0, 8] }]
              : []),
          ]
        : []),
      ...(contract.depositRefundedAt && contract.depositRefundNotes
        ? [
            { text: 'Ghi chú hoàn cọc:', bold: true, margin: [0, 8, 0, 0] },
            { text: contract.depositRefundNotes, margin: [0, 0, 0, 8] },
          ]
        : []),
      { text: 'II. ĐIỀU KHOẢN HỢP ĐỒNG', style: 'section' },
      { text: contract.terms || 'Hai bên thống nhất thực hiện theo các điều khoản đã thỏa thuận.', margin: [0, 0, 0, 8] },
      ...(contract.notes
        ? [{ text: 'Ghi chú:', bold: true }, { text: contract.notes, margin: [0, 0, 0, 8] }]
        : []),
      { text: 'III. XÁC NHẬN CÁC BÊN', style: 'section' },
      {
        columns: [
          { width: '*', text: 'BÊN CHO THUÊ\n(Ký, ghi rõ họ tên)', alignment: 'center', margin: [0, 8, 0, 0] },
          { width: '*', text: 'BÊN THUÊ\n(Ký, ghi rõ họ tên)', alignment: 'center', margin: [0, 8, 0, 0] },
        ],
      },
    ],
  }

  openPdf(pdfMake.createPdf(docDefinition), `hop-dong-${contract.contractNumber || contract.id}.pdf`)
}

export const exportInvoicePdfClient = (invoice) => {
  const period = invoice.invoiceType === 'Deposit' ? '-' : `${invoice.month}/${invoice.year}`

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [30, 36, 30, 30],
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: true, color: 'white' },
      section: { fontSize: 12, bold: true, color: '#185da9', margin: [0, 12, 0, 8] },
      tableHeader: { bold: true, fillColor: '#f2f6fb' },
      total: { bold: true },
    },
    content: [
      {
        table: {
          widths: ['*'],
          body: [[{ text: `HÓA ĐƠN THANH TOÁN\nMã chứng từ: ${invoice.id}`, style: 'title', margin: [10, 8, 10, 8] }]],
        },
        layout: { fillColor: () => '#185da9', hLineWidth: () => 0, vLineWidth: () => 0 },
      },
      { text: 'I. THÔNG TIN HÓA ĐƠN', style: 'section' },
      {
        table: {
          widths: [95, '*', 95, '*'],
          body: [
            ['Mã hóa đơn:', String(invoice.id), 'Ngày tạo:', formatDate(invoice.createdAt)],
            ['Loại hóa đơn:', invoice.invoiceType === 'Deposit' ? 'Cọc phòng' : 'Hàng tháng', 'Kỳ thanh toán:', period],
            [
              'Phòng:',
              invoice.roomNumber || '-',
              'Người thuê:',
              `${invoice.tenantName || '-'}${invoice.tenantIdentityCard ? ` (${invoice.tenantIdentityCard})` : ''}`,
            ],
            ['Hạn thanh toán:', formatDate(invoice.dueDate), 'Trạng thái:', statusLabel(invoice.status)],
          ],
        },
        layout: 'lightHorizontalLines',
      },
      { text: 'II. CHI TIẾT THANH TOÁN', style: 'section' },
      {
        table: {
          widths: ['*', 130],
          body: [
            [{ text: 'Nội dung', style: 'tableHeader' }, { text: 'Số tiền', style: 'tableHeader', alignment: 'right' }],
            ['Tiền phòng', { text: formatCurrency(invoice.roomRent), alignment: 'right' }],
            ['Tiền điện', { text: formatCurrency(invoice.electricityAmount), alignment: 'right' }],
            ['Tiền nước', { text: formatCurrency(invoice.waterAmount), alignment: 'right' }],
            ['Tiền dịch vụ', { text: formatCurrency(getServiceFee(invoice)), alignment: 'right' }],
            [{ text: 'Tổng cộng', style: 'total' }, { text: formatCurrency(invoice.totalAmount), style: 'total', alignment: 'right' }],
          ],
        },
      },
      { text: 'III. XÁC NHẬN THANH TOÁN', style: 'section' },
      {
        columns: [
          { width: '*', text: 'BÊN THU TIỀN\n(Ký, ghi rõ họ tên)', alignment: 'center', margin: [0, 8, 0, 0] },
          { width: '*', text: 'BÊN THANH TOÁN\n(Ký, ghi rõ họ tên)', alignment: 'center', margin: [0, 8, 0, 0] },
        ],
      },
    ],
  }

  openPdf(pdfMake.createPdf(docDefinition), `hoa-don-${invoice.id}.pdf`)
}

