export interface ITranslation {
  appTitle: string;
  loginTitle: string;
  loginSubtitle: string;
  username: string;
  password: string;
  loginBtn: string;
  logout: string;
  operator: string;
  admin: string;
  role: string;
  cableType: string;
  orderNumber: string;
  notes: string;
  startMeasurement: string;
  resultsTitle: string;
  generateReport: string;
  newMeasurement: string;
  parameter: string;
  value: string;
  unit: string;
  status: string;
  pass: string;
  fail: string;
  overallStatus: string;
  adminPanel: string;
  language: string;
  camActive: string;
  camInactive: string;
}

export const translations: Record<'tr' | 'en', ITranslation> = {
  tr: {
    appTitle: 'Kablo İzolasyon Ölçüm Sistemi',
    loginTitle: 'Sisteme Giriş Yapın',
    loginSubtitle: 'Kablo İzolasyon Kalite Kontrol Yazılımı',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    loginBtn: 'Giriş Yap',
    logout: 'Çıkış Yap',
    operator: 'Operatör',
    admin: 'Yönetici (Admin)',
    role: 'Rol',
    cableType: 'Kablo Tipi Seçimi',
    orderNumber: 'İş Emri / Lot No',
    notes: 'Ölçüm Notları',
    startMeasurement: 'Ölçümü Başlat',
    resultsTitle: 'Ölçüm ve Analiz Sonuçları',
    generateReport: 'PDF Rapor Oluştur',
    newMeasurement: 'Yeni Ölçüm',
    parameter: 'Parametre',
    value: 'Değer',
    unit: 'Birim',
    status: 'Durum',
    pass: 'UYGUN (PASS)',
    fail: 'HATALI (FAIL)',
    overallStatus: 'Genel Kalite Durumu',
    adminPanel: 'Yönetici Paneli & Standartlar',
    language: 'Dil / Language',
    camActive: 'Canlı Kamera Aktif',
    camInactive: 'Kamera Pasif - Test Görüntüsü Yüklendi'
  },
  en: {
    appTitle: 'Cable Insulation Measurement System',
    loginTitle: 'Sign In to System',
    loginSubtitle: 'Cable Insulation Quality Control Software',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Sign In',
    logout: 'Log Out',
    operator: 'Operator',
    admin: 'Administrator',
    role: 'Role',
    cableType: 'Cable Type Selection',
    orderNumber: 'Work Order / Lot No',
    notes: 'Measurement Notes',
    startMeasurement: 'Start Measurement',
    resultsTitle: 'Measurement & Analysis Results',
    generateReport: 'Generate PDF Report',
    newMeasurement: 'New Measurement',
    parameter: 'Parameter',
    value: 'Value',
    unit: 'Unit',
    status: 'Status',
    pass: 'PASS',
    fail: 'FAIL',
    overallStatus: 'Overall Quality Status',
    adminPanel: 'Admin Panel & Standards',
    language: 'Language',
    camActive: 'Live Camera Active',
    camInactive: 'Camera Inactive - Test Image Loaded'
  }
};
