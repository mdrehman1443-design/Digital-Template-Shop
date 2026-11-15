export type Language = 'en' | 'ur';

export type PaperFormat = 'a4' | '80mm' | '58mm';

export type DiscountType = 'flat' | 'percent';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export interface CustomFieldDef {
  id: string;
  labelEn: string;
  labelUr: string;
  type: CustomFieldType;
  placeholderEn?: string;
  placeholderUr?: string;
  options?: string[];
  required?: boolean;
}

export interface QuickItemPreset {
  nameEn: string;
  nameUr: string;
  rate: number;
}

export interface ReceiptTemplate {
  id: string;
  categoryId: string;
  nameEn: string;
  nameUr: string;
  subtitleEn: string;
  subtitleUr: string;
  docLabelEn: string;
  docLabelUr: string;
  defaultPaper: PaperFormat;
  defaultFooterEn: string;
  defaultFooterUr: string;
  customFields: CustomFieldDef[];
  quickItems: QuickItemPreset[];
}

export interface BusinessCategory {
  id: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  accentHex: string;
  iconName:
    | 'Store'
    | 'Smartphone'
    | 'UtensilsCrossed'
    | 'Scissors'
    | 'Pill'
    | 'Wrench';
  templates: ReceiptTemplate[];
}

export interface CustomShop {
  id: string;
  shopNameEn: string;
  shopNameUr: string;
  taglineEn: string;
  taglineUr: string;
  categoryLabelEn: string;
  categoryLabelUr: string;
  phone: string;
  addressEn: string;
  addressUr: string;
  logoDataUrl?: string;
  accentHex: string;
  defaultPaper: PaperFormat;
  defaultFooterEn: string;
  defaultFooterUr: string;
  customFields: CustomFieldDef[];
  createdAt: string;
}

export interface DefaultShopProfile {
  shopNameEn: string;
  shopNameUr: string;
  taglineEn: string;
  taglineUr: string;
  phone: string;
  addressEn: string;
  addressUr: string;
  logoDataUrl?: string;
  currencySymbol: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
}

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  language: Language;
  paperFormat: PaperFormat;
  sourceType: 'template' | 'custom_shop';
  sourceId: string;
  categoryName: string;
  docTitle: string;
  accentHex: string;
  shopName: string;
  shopTagline: string;
  shopPhone: string;
  shopAddress: string;
  shopLogoDataUrl?: string;
  customerName: string;
  customerPhone: string;
  customFieldDefs: CustomFieldDef[];
  customFieldValues: Record<string, string>;
  items: ReceiptItem[];
  discountType: DiscountType;
  discountValue: number;
  taxPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  footerNote: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'hub' | 'generator' | 'history' | 'custom_shops';
