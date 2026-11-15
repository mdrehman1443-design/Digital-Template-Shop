import { Language } from '../types/receipt';

export interface UIStrings {
  brandName: string;
  navHub: string;
  navGenerator: string;
  navHistory: string;
  navCustomShops: string;
  newReceiptCta: string;
  heroTitle: string;
  heroSubtitle: string;
  addCustomShopBtn: string;
  quickStatsReceipts: string;
  quickStatsSales: string;
  quickStatsUdhaar: string;
  quickStatsShops: string;
  categoriesHeading: string;
  categoriesSubheading: string;
  customShopsHeading: string;
  customShopsSubheading: string;
  customShopsEmpty: string;
  templatesCount: string;
  useTemplate: string;
  createBill: string;
  editShop: string;
  deleteShop: string;
  searchTemplatesPlaceholder: string;
  shopSettingsBtn: string;

  // Shop Profile Modal
  defaultProfileTitle: string;
  defaultProfileSubtitle: string;
  shopNameLabel: string;
  shopNameUrLabel: string;
  taglineLabel: string;
  taglineUrLabel: string;
  phoneLabel: string;
  addressLabel: string;
  addressUrLabel: string;
  currencyLabel: string;
  uploadLogo: string;
  removeLogo: string;
  saveProfile: string;
  cancel: string;

  // Custom Shop Builder
  builderTitleNew: string;
  builderTitleEdit: string;
  builderSubtitle: string;
  categoryLabelInput: string;
  accentColorLabel: string;
  defaultPaperLabel: string;
  defaultFooterLabel: string;
  customFieldsHeading: string;
  customFieldsHint: string;
  addFieldBtn: string;
  fieldLabelEn: string;
  fieldLabelUr: string;
  fieldType: string;
  fieldPlaceholder: string;
  fieldOptions: string;
  fieldRequired: string;
  saveCustomShop: string;
  typeText: string;
  typeNumber: string;
  typeDate: string;
  typeSelect: string;

  // Generator
  tabEditForm: string;
  tabLivePreview: string;
  receiptLanguageLabel: string;
  paperFormatLabel: string;
  paperA4: string;
  paper80mm: string;
  paper58mm: string;
  shopDetailsSection: string;
  editShopOverride: string;
  receiptMetaSection: string;
  receiptNoLabel: string;
  dateLabel: string;
  timeLabel: string;
  customerNameLabel: string;
  customerPhoneLabel: string;
  customDetailsSection: string;
  itemsSection: string;
  quickAddLabel: string;
  itemNameCol: string;
  qtyCol: string;
  rateCol: string;
  totalCol: string;
  addItemRow: string;
  mathSection: string;
  subtotalLabel: string;
  discountLabel: string;
  discountFlat: string;
  discountPercent: string;
  taxLabel: string;
  grandTotalLabel: string;
  amountPaidLabel: string;
  markFullPaid: string;
  markFullUdhaar: string;
  balanceUdhaarLabel: string;
  changeReturnLabel: string;
  paidInFullLabel: string;
  footerNoteLabel: string;
  footerPresetsLabel: string;
  saveReceiptBtn: string;
  updateReceiptBtn: string;
  newBlankBtn: string;
  savedToast: string;

  // Export & Share
  printBtn: string;
  downloadPdfBtn: string;
  downloadPngBtn: string;
  whatsappShareBtn: string;
  whatsappModalTitle: string;
  whatsappModalSubtitle: string;
  openWhatsappChat: string;
  shareImageNative: string;
  copyTextBtn: string;
  copiedToast: string;

  // History
  historyTitle: string;
  historySubtitle: string;
  searchHistoryPlaceholder: string;
  filterAll: string;
  filterPaid: string;
  filterUdhaar: string;
  historyEmptyTitle: string;
  historyEmptySubtitle: string;
  openInGenerator: string;
  duplicateReceipt: string;
  settleUdhaar: string;
  deleteReceipt: string;
  itemsUnit: string;
  udhaarTag: string;
  paidTag: string;
  changeTag: string;
  customerWalkIn: string;
  confirmDelete: string;
  footerPresets: string[];
}

export const UI_STRINGS: Record<Language, UIStrings> = {
  en: {
    brandName: 'Digital Receipt Hub',
    navHub: 'Templates',
    navGenerator: 'Receipt Maker',
    navHistory: 'History',
    navCustomShops: 'Custom Shops',
    newReceiptCta: 'New Receipt',
    heroTitle: 'Instant digital receipts & khata slips for every shop',
    heroSubtitle:
      'Pick a ready-made business template or build your own custom shop slip. Auto-calculate totals, track udhaar balances, print thermal or A4, and share on WhatsApp.',
    addCustomShopBtn: 'Add Custom Shop / Category',
    quickStatsReceipts: 'Saved Receipts',
    quickStatsSales: 'Total Billed',
    quickStatsUdhaar: 'Pending Udhaar',
    quickStatsShops: 'Custom Shops',
    categoriesHeading: 'Business Categories & Templates',
    categoriesSubheading: 'Choose any pre-built template to start billing immediately',
    customShopsHeading: 'Your Custom Shops & Templates',
    customShopsSubheading: 'Personalized slips with your own logo, address, and custom fields',
    customShopsEmpty: 'No custom shops created yet. Click "+ Add Custom Shop" to design your own receipt template.',
    templatesCount: 'templates',
    useTemplate: 'Open Template',
    createBill: 'Create Bill',
    editShop: 'Edit',
    deleteShop: 'Delete',
    searchTemplatesPlaceholder: 'Search grocery, repair, tailor, pharmacy, challan...',
    shopSettingsBtn: 'My Shop Profile',

    defaultProfileTitle: 'Default Shop Profile',
    defaultProfileSubtitle: 'Applied automatically to pre-built category templates',
    shopNameLabel: 'Shop / Business Name (English)',
    shopNameUrLabel: 'Shop Name (Urdu)',
    taglineLabel: 'Tagline / Specialty (English)',
    taglineUrLabel: 'Tagline (Urdu)',
    phoneLabel: 'Contact Phone / WhatsApp',
    addressLabel: 'Physical Address (English)',
    addressUrLabel: 'Address (Urdu)',
    currencyLabel: 'Currency Symbol',
    uploadLogo: 'Upload Logo',
    removeLogo: 'Remove',
    saveProfile: 'Save Profile',
    cancel: 'Cancel',

    builderTitleNew: 'Create Custom Shop & Template',
    builderTitleEdit: 'Edit Custom Shop Template',
    builderSubtitle: 'Design a bespoke digital receipt tailored to your business workflow',
    categoryLabelInput: 'Business Type / Category',
    accentColorLabel: 'Receipt Accent Color',
    defaultPaperLabel: 'Default Print Size',
    defaultFooterLabel: 'Default Footer Terms / Message',
    customFieldsHeading: 'Custom Dynamic Fields',
    customFieldsHint: 'Add extra fields specific to your trade (e.g., IMEI No., Table No., Stitching Length, Vehicle Plate)',
    addFieldBtn: 'Add Custom Field',
    fieldLabelEn: 'Field Label (EN)',
    fieldLabelUr: 'Field Label (UR)',
    fieldType: 'Input Type',
    fieldPlaceholder: 'Placeholder hint',
    fieldOptions: 'Dropdown Options (comma separated)',
    fieldRequired: 'Required',
    saveCustomShop: 'Save Custom Shop',
    typeText: 'Text',
    typeNumber: 'Number',
    typeDate: 'Date',
    typeSelect: 'Dropdown',

    tabEditForm: 'Edit Details',
    tabLivePreview: 'Live Receipt',
    receiptLanguageLabel: 'Receipt Language',
    paperFormatLabel: 'Print Size',
    paperA4: 'A4 Sheet',
    paper80mm: '80mm Thermal',
    paper58mm: '58mm Mini',
    shopDetailsSection: 'Shop Branding',
    editShopOverride: 'Edit Shop Info',
    receiptMetaSection: 'Receipt & Customer',
    receiptNoLabel: 'Receipt / Invoice #',
    dateLabel: 'Date',
    timeLabel: 'Time',
    customerNameLabel: 'Customer Name',
    customerPhoneLabel: 'Customer Phone (WhatsApp)',
    customDetailsSection: 'Template Specific Fields',
    itemsSection: 'Line Items',
    quickAddLabel: 'Quick Add:',
    itemNameCol: 'Item / Service',
    qtyCol: 'Qty',
    rateCol: 'Rate',
    totalCol: 'Total',
    addItemRow: 'Add Item Row',
    mathSection: 'Calculations & Payment',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Discount',
    discountFlat: 'Flat',
    discountPercent: '%',
    taxLabel: 'Tax / Extra (%)',
    grandTotalLabel: 'Grand Total',
    amountPaidLabel: 'Amount Paid',
    markFullPaid: 'Full Paid',
    markFullUdhaar: 'Full Udhaar',
    balanceUdhaarLabel: 'Remaining Balance (Udhaar)',
    changeReturnLabel: 'Change to Return',
    paidInFullLabel: 'Paid in Full',
    footerNoteLabel: 'Footer Note / Terms',
    footerPresetsLabel: 'Quick notes:',
    saveReceiptBtn: 'Save Receipt',
    updateReceiptBtn: 'Update Receipt',
    newBlankBtn: 'New Slip',
    savedToast: 'Receipt saved to local history',

    printBtn: 'Print',
    downloadPdfBtn: 'PDF',
    downloadPngBtn: 'Image',
    whatsappShareBtn: 'WhatsApp',
    whatsappModalTitle: 'Share Receipt on WhatsApp',
    whatsappModalSubtitle: 'Send a formatted text summary directly or attach the crisp receipt image.',
    openWhatsappChat: 'Send Summary on WhatsApp',
    shareImageNative: 'Share Receipt Image',
    copyTextBtn: 'Copy Text Summary',
    copiedToast: 'Receipt text copied to clipboard',

    historyTitle: 'Receipt & Khata History',
    historySubtitle: 'All receipts are saved offline on this device',
    searchHistoryPlaceholder: 'Search by customer name, phone, receipt #, or shop...',
    filterAll: 'All Receipts',
    filterPaid: 'Paid',
    filterUdhaar: 'Udhaar Due',
    historyEmptyTitle: 'No saved receipts yet',
    historyEmptySubtitle: 'Generate and save your first receipt from any business template.',
    openInGenerator: 'Edit',
    duplicateReceipt: 'Duplicate',
    settleUdhaar: 'Mark Paid',
    deleteReceipt: 'Delete',
    itemsUnit: 'items',
    udhaarTag: 'Udhaar Due',
    paidTag: 'Paid',
    changeTag: 'Change',
    customerWalkIn: 'Walk-in Customer',
    confirmDelete: 'Confirm',
    footerPresets: [
      'Thank you for your business!',
      'Goods once sold are not returnable.',
      'Exchange within 7 days with original receipt only.',
      'Please verify cash and items before leaving counter.',
    ],
  },
  ur: {
    brandName: 'ڈیجیٹل ٹیمپلیٹ شاپ',
    navHub: 'ٹیمپلیٹس',
    navGenerator: 'رسید بنائیں',
    navHistory: 'ریکارڈ',
    navCustomShops: 'میری دکانیں',
    newReceiptCta: 'نئی رسید',
    heroTitle: 'ہر کاروبار کے لیے فوری ڈیجیٹل رسیدیں اور کھاتہ پرچیاں',
    heroSubtitle:
      'تیار شدہ کاروباری ٹیمپلیٹ منتخب کریں یا اپنی دکان کا ذاتی ٹیمپلیٹ بنائیں۔ خودکار حساب، ادھار کھاتہ، تھرمل یا A4 پرنٹ اور واٹس ایپ شیئرنگ ایک کلک میں۔',
    addCustomShopBtn: 'نئی دکان / کیٹیگری شامل کریں',
    quickStatsReceipts: 'محفوظ رسیدیں',
    quickStatsSales: 'کل بلنگ',
    quickStatsUdhaar: 'واجب الادا ادھار',
    quickStatsShops: 'ذاتی دکانیں',
    categoriesHeading: 'کاروباری کیٹیگریز اور ٹیمپلیٹس',
    categoriesSubheading: 'فوری بل بنانے کے لیے کوئی بھی تیار ٹیمپلیٹ منتخب کریں',
    customShopsHeading: 'آپ کی ذاتی دکانیں اور ٹیمپلیٹس',
    customShopsSubheading: 'آپ کے لوگو، پتہ اور مخصوص خانوں کے ساتھ ذاتی رسیدیں',
    customShopsEmpty: 'ابھی کوئی ذاتی دکان نہیں بنائی گئی۔ اپنا ٹیمپلیٹ بنانے کے لیے "+ نئی دکان شامل کریں" دبائیں۔',
    templatesCount: 'ٹیمپلیٹس',
    useTemplate: 'استعمال کریں',
    createBill: 'بل بنائیں',
    editShop: 'ترمیم',
    deleteShop: 'حذف',
    searchTemplatesPlaceholder: 'کریانہ، موبائل، ریسٹورنٹ، ٹیلر، فارمیسی تلاش کریں...',
    shopSettingsBtn: 'دکان کی تفصیل',

    defaultProfileTitle: 'بنیادی دکان پروفائل',
    defaultProfileSubtitle: 'یہ تفصیل خودکار طور پر تمام تیار ٹیمپلیٹس پر لاگو ہوگی',
    shopNameLabel: 'دکان / کاروبار کا نام (انگریزی)',
    shopNameUrLabel: 'دکان کا نام (اردو)',
    taglineLabel: 'سلوگن / تفصیل (انگریزی)',
    taglineUrLabel: 'سلوگن / تفصیل (اردو)',
    phoneLabel: 'فون / واٹس ایپ نمبر',
    addressLabel: 'پتہ (انگریزی)',
    addressUrLabel: 'دکان کا پتہ (اردو)',
    currencyLabel: 'کرنسی کی علامت',
    uploadLogo: 'لوگو اپلوڈ کریں',
    removeLogo: 'ہٹائیں',
    saveProfile: 'محفوظ کریں',
    cancel: 'منسوخ',

    builderTitleNew: 'نئی دکان اور رسید ٹیمپلیٹ بنائیں',
    builderTitleEdit: 'دکان کے ٹیمپلیٹ میں ترمیم کریں',
    builderSubtitle: 'اپنے کاروبار کی ضرورت کے مطابق مخصوص خانوں والی رسید ڈیزائن کریں',
    categoryLabelInput: 'کاروبار کی قسم / کیٹیگری',
    accentColorLabel: 'رسید کا رنگ',
    defaultPaperLabel: 'بنیادی پرنٹ سائز',
    defaultFooterLabel: 'رسید کے نیچے شرائط یا پیغام',
    customFieldsHeading: 'مخصوص اضافی خانے',
    customFieldsHint: 'اپنے کام کے مطابق خانے شامل کریں (مثلاً IMEI نمبر، ٹیبل نمبر، لمبائی، گاڑی نمبر)',
    addFieldBtn: 'نیا خانہ شامل کریں',
    fieldLabelEn: 'خانے کا نام (انگریزی)',
    fieldLabelUr: 'خانے کا نام (اردو)',
    fieldType: 'خانے کی قسم',
    fieldPlaceholder: 'مثال / رہنمائی',
    fieldOptions: 'فہرست کے اختیارات (کوما سے الگ کریں)',
    fieldRequired: 'لازمی',
    saveCustomShop: 'دکان محفوظ کریں',
    typeText: 'ٹیکسٹ',
    typeNumber: 'نمبر',
    typeDate: 'تاریخ',
    typeSelect: 'فہرست',

    tabEditForm: 'تفصیل درج کریں',
    tabLivePreview: 'رسید دیکھیں',
    receiptLanguageLabel: 'رسید کی زبان',
    paperFormatLabel: 'پرنٹ سائز',
    paperA4: 'A4 پیج',
    paper80mm: '80mm تھرمل',
    paper58mm: '58mm منی',
    shopDetailsSection: 'دکان کی شناخت',
    editShopOverride: 'دکان کا نام بدلیں',
    receiptMetaSection: 'رسید اور گاہک کی تفصیل',
    receiptNoLabel: 'رسید / انوائس نمبر',
    dateLabel: 'تاریخ',
    timeLabel: 'وقت',
    customerNameLabel: 'گاہک کا نام',
    customerPhoneLabel: 'گاہک کا فون (واٹس ایپ)',
    customDetailsSection: 'کاروبار کے مخصوص خانے',
    itemsSection: 'اشیاء / تفصیلات',
    quickAddLabel: 'فوری شامل کریں:',
    itemNameCol: 'تفصیل / شے',
    qtyCol: 'تعداد',
    rateCol: 'ریٹ',
    totalCol: 'کل رقم',
    addItemRow: 'نئی شے شامل کریں',
    mathSection: 'حساب کتاب اور ادائیگی',
    subtotalLabel: 'مجموعی رقم',
    discountLabel: 'رعایت (ڈسکاؤنٹ)',
    discountFlat: 'رقم',
    discountPercent: 'فیصد %',
    taxLabel: 'ٹیکس / اضافی چارجز (%)',
    grandTotalLabel: 'کل قابل ادائیگی',
    amountPaidLabel: 'وصول شدہ رقم',
    markFullPaid: 'مکمل وصول',
    markFullUdhaar: 'مکمل ادھار',
    balanceUdhaarLabel: 'بقایا رقم (ادھار)',
    changeReturnLabel: 'واپس بقایا',
    paidInFullLabel: 'مکمل ادا شدہ',
    footerNoteLabel: 'نیچے شرائط / نوٹ',
    footerPresetsLabel: 'تیار جملے:',
    saveReceiptBtn: 'رسید محفوظ کریں',
    updateReceiptBtn: 'رسید اپڈیٹ کریں',
    newBlankBtn: 'نئی رسید',
    savedToast: 'رسید ریکارڈ میں محفوظ ہو گئی',

    printBtn: 'پرنٹ',
    downloadPdfBtn: 'PDF',
    downloadPngBtn: 'تصویر',
    whatsappShareBtn: 'واٹس ایپ',
    whatsappModalTitle: 'واٹس ایپ پر رسید بھیجیں',
    whatsappModalSubtitle: 'مکمل حساب تحریری شکل میں بھیجیں یا رسید کی صاف تصویر شیئر کریں۔',
    openWhatsappChat: 'واٹس ایپ پر پیغام بھیجیں',
    shareImageNative: 'رسید کی تصویر شیئر کریں',
    copyTextBtn: 'تحریر کاپی کریں',
    copiedToast: 'رسید کی تحریر کاپی ہو گئی',

    historyTitle: 'رسید اور ادھار کھاتہ ریکارڈ',
    historySubtitle: 'تمام رسیدیں آپ کے موبائل یا کمپیوٹر میں محفوظ ہیں',
    searchHistoryPlaceholder: 'گاہک کا نام، فون، رسید نمبر یا دکان تلاش کریں...',
    filterAll: 'تمام رسیدیں',
    filterPaid: 'ادا شدہ',
    filterUdhaar: 'ادھار بقایا',
    historyEmptyTitle: 'ابھی کوئی رسید محفوظ نہیں ہے',
    historyEmptySubtitle: 'کسی بھی ٹیمپلیٹ سے پہلی رسید بنا کر محفوظ کریں۔',
    openInGenerator: 'ترمیم',
    duplicateReceipt: 'نقل بنائیں',
    settleUdhaar: 'وصول ہو گیا',
    deleteReceipt: 'حذف',
    itemsUnit: 'اشیاء',
    udhaarTag: 'ادھار بقایا',
    paidTag: 'ادا شدہ',
    changeTag: 'واپسی',
    customerWalkIn: 'نقد گاہک',
    confirmDelete: 'تصدیق',
    footerPresets: [
      'آپ کی تشریف آوری کا بے حد شکریہ!',
      'فروخت شدہ مال واپس یا تبدیل نہیں ہوگا۔',
      'تبدیلی صرف 7 دن کے اندر اصل رسید کے ساتھ ممکن ہے۔',
      'براہ کرم کاؤنٹر چھوڑنے سے پہلے رقم اور سامان چیک کر لیں۔',
    ],
  },
};
