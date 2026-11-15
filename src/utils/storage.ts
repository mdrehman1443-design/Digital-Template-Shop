import {
  CustomShop,
  DefaultShopProfile,
  Language,
  ReceiptRecord,
} from '../types/receipt';

const KEYS = {
  CUSTOM_SHOPS: 'drth_custom_shops_v1',
  RECEIPTS: 'drth_receipts_v1',
  PROFILE: 'drth_default_profile_v1',
  LANGUAGE: 'drth_language_v1',
  COUNTER: 'drth_invoice_counter_v1',
};

export const DEFAULT_SHOP_PROFILE: DefaultShopProfile = {
  shopNameEn: 'Al-Madina Trading Co.',
  shopNameUr: 'المدینہ ٹریڈنگ کمپنی',
  taglineEn: 'Quality Goods & Honest Pricing',
  taglineUr: 'معیاری اشیاء اور مناسب قیمتیں',
  phone: '+92 300 1234567',
  addressEn: 'Shop #14, Main Bazaar, Lahore',
  addressUr: 'دکان نمبر 14، مین بازار، لاہور',
  currencySymbol: 'Rs.',
};

export function loadLanguage(): Language {
  try {
    const val = localStorage.getItem(KEYS.LANGUAGE);
    return val === 'ur' ? 'ur' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  } catch {
    // ignore storage quota errors
  }
}

export function loadDefaultProfile(): DefaultShopProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return DEFAULT_SHOP_PROFILE;
    return { ...DEFAULT_SHOP_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHOP_PROFILE;
  }
}

export function saveDefaultProfile(profile: DefaultShopProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadCustomShops(): CustomShop[] {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_SHOPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomShops(shops: CustomShop[]): void {
  try {
    localStorage.setItem(KEYS.CUSTOM_SHOPS, JSON.stringify(shops));
  } catch {
    // ignore
  }
}

export function loadReceipts(): ReceiptRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.RECEIPTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReceipts(receipts: ReceiptRecord[]): void {
  try {
    localStorage.setItem(KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch {
    // ignore
  }
}

export function generateNextInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  let counter = 101;
  try {
    const raw = localStorage.getItem(KEYS.COUNTER);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed)) counter = parsed + 1;
    }
    localStorage.setItem(KEYS.COUNTER, String(counter));
  } catch {
    counter = Math.floor(100 + Math.random() * 899);
  }
  return `INV-${y}${m}${d}-${counter}`;
}

export function compressImageFile(file: File, maxSize = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
