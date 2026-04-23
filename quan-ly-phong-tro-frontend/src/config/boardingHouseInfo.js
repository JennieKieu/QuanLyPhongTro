/**
 * Thông tin hiển thị ở footer (nhà trọ, chủ trọ, thanh toán).
 * Có thể ghi đè khi build bằng biến môi trường REACT_APP_* (Create React App).
 *
 * Ví dụ .env:
 * REACT_APP_BOARDING_NAME=Nhà trọ X
 * REACT_APP_BOARDING_ADDRESS=123 Đường ABC, Quận 1, TP.HCM
 * REACT_APP_BOARDING_HOTLINE=0901234567
 * REACT_APP_BOARDING_EMAIL=lienhe@example.com
 * REACT_APP_LANDLORD_NAME=Nguyễn Văn A
 * REACT_APP_BANK_NAME=Vietcombank
 * REACT_APP_BANK_ACCOUNT=0123456789
 * REACT_APP_BANK_HOLDER=NGUYEN VAN A
 * REACT_APP_BANK_NOTE=Nội dung CK: Số phòng + tháng thanh toán
 */

const env = (key, fallback = '') => process.env[key] || fallback

/** Mẫu demo — sửa trực tiếp hoặc dùng .env REACT_APP_* */
const sample = {
  name: 'Hệ thống nhà trọ EZROOM',
  tagline: 'Phòng đầy đủ tiện nghi, an ninh, gần trung tâm',
  address: '123/5 Đường Nguyễn Văn Linh, Phường Tân Thuận Đông, TP. Hồ Chí Minh',
  hotline: '0901 234 567',
  email: 'ezroom@admin.com',
  landlordName: 'Nguyễn Văn An',
  bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  bankAccountNumber: '0123456789012',
  bankAccountHolder: 'NGUYEN VAN AN',
  bankTransferNote: 'Nội dung CK: Họ tên + Số phòng + Tháng thanh toán (VD: Nguyen Van A P302 T3-2026)',
}

export const boardingHouseInfo = {
  name: env('REACT_APP_BOARDING_NAME', sample.name),
  tagline: env('REACT_APP_BOARDING_TAGLINE', sample.tagline),
  address: env('REACT_APP_BOARDING_ADDRESS', sample.address),
  hotline: env('REACT_APP_BOARDING_HOTLINE', sample.hotline),
  email: env('REACT_APP_BOARDING_EMAIL', sample.email),
  landlordName: env('REACT_APP_LANDLORD_NAME', sample.landlordName),
  bankName: env('REACT_APP_BANK_NAME', sample.bankName),
  bankAccountNumber: env('REACT_APP_BANK_ACCOUNT', sample.bankAccountNumber),
  bankAccountHolder: env('REACT_APP_BANK_HOLDER', sample.bankAccountHolder),
  bankTransferNote: env('REACT_APP_BANK_NOTE', sample.bankTransferNote),
}
