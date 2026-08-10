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
  capture: string;
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
  measurementCount: string;
  cableVarieties: string;
  selectedCable: string;
  standard: string;
  addFormula: string;
  removeFormula: string;
  formulaLabel: string;
  formulaExpr: string;
  formulaStd: string;
  formulaFor: string;
  reportTitle: string;
  reportDate: string;
  reportOperator: string;
  reportLot: string;
  saveFormula: string;
  cancel: string;
  formulaManagement: string;
  cameraError: string;
}

export const translations: Record<'tr' | 'en', ITranslation> = {
  tr: {
    appTitle: 'Kablo Yalıtım Kalınlığı Ölçüm Programı',
    loginTitle: 'Sisteme Giriş',
    loginSubtitle: 'Kablo İzolasyon Kalınlığı Ölçüm Yazılımı',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    loginBtn: 'Giriş Yap',
    logout: 'Çıkış',
    operator: 'Operatör',
    admin: 'Yönetici',
    role: 'Rol',
    cableType: 'Kablo Tipi Seçimi',
    orderNumber: 'İş Emri / Lot No',
    notes: 'Notlar',
    startMeasurement: 'Ölçüm Yap',
    capture: 'Fotoğraf Al',
    resultsTitle: 'Ölçüm Sonuçları',
    generateReport: 'PDF Rapor Oluştur',
    newMeasurement: 'Yeni Ölçüm',
    parameter: 'Parametre',
    value: 'Değer',
    unit: 'Birim',
    status: 'Durum',
    pass: 'UYGUN',
    fail: 'HATA',
    overallStatus: 'Genel Durum',
    adminPanel: 'Yönetici Paneli',
    language: 'Dil',
    camActive: 'Kamera Aktif',
    camInactive: 'Test Görüntüsü',
    measurementCount: 'Ölçüm Sayısı',
    cableVarieties: 'Kablo Çeşitleri',
    selectedCable: 'Seçili Kablo',
    standard: 'Standart',
    addFormula: 'Formül Ekle',
    removeFormula: 'Sil',
    formulaLabel: 'Formül Adı',
    formulaExpr: 'Formül İfadesi',
    formulaStd: 'Standart (opsiyonel)',
    formulaFor: 'Kablo Türü için Formüller',
    reportTitle: 'Kablo Yalıtım Kalınlığı Ölçüm Raporu',
    reportDate: 'Tarih / Saat',
    reportOperator: 'Ölçümü Yapan',
    reportLot: 'İş Emri',
    saveFormula: 'Kaydet',
    cancel: 'İptal',
    formulaManagement: 'Formül Yönetimi',
    cameraError: 'Kamera başlatılamadı. Kamera bağlantısını kontrol edin.',
  },
  en: {
    appTitle: 'Cable Insulation Thickness Measurement Program',
    loginTitle: 'Sign In',
    loginSubtitle: 'Cable Insulation Thickness Measurement Software',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Sign In',
    logout: 'Log Out',
    operator: 'Operator',
    admin: 'Administrator',
    role: 'Role',
    cableType: 'Cable Type Selection',
    orderNumber: 'Work Order / Lot No',
    notes: 'Notes',
    startMeasurement: 'Measure',
    capture: 'Capture Photo',
    resultsTitle: 'Measurement Results',
    generateReport: 'Generate PDF Report',
    newMeasurement: 'New Measurement',
    parameter: 'Parameter',
    value: 'Value',
    unit: 'Unit',
    status: 'Status',
    pass: 'PASS',
    fail: 'FAIL',
    overallStatus: 'Overall Status',
    adminPanel: 'Admin Panel',
    language: 'Language',
    camActive: 'Camera Active',
    camInactive: 'Test Image',
    measurementCount: 'Measurement Count',
    cableVarieties: 'Cable Types',
    selectedCable: 'Selected Cable',
    standard: 'Standard',
    addFormula: 'Add Formula',
    removeFormula: 'Remove',
    formulaLabel: 'Formula Name',
    formulaExpr: 'Formula Expression',
    formulaStd: 'Standard (optional)',
    formulaFor: 'Formulas for Cable Type',
    reportTitle: 'Cable Insulation Thickness Measurement Report',
    reportDate: 'Date / Time',
    reportOperator: 'Measured By',
    reportLot: 'Work Order',
    saveFormula: 'Save',
    cancel: 'Cancel',
    formulaManagement: 'Formula Management',
    cameraError: 'Camera could not be started. Check camera connection.',
  }
};
