import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { UI_STRINGS } from '../data/i18n';
import {
  CustomFieldDef,
  CustomFieldType,
  CustomShop,
  Language,
  PaperFormat,
} from '../types/receipt';
import { compressImageFile } from '../utils/storage';

interface CustomShopBuilderModalProps {
  language: Language;
  initialShop?: CustomShop | null;
  onSave: (shop: CustomShop) => void;
  onClose: () => void;
}

const ACCENT_SWATCHES = [
  '#0F2942', // Deep Navy
  '#059669', // Emerald
  '#0D9488', // Teal
  '#B45309', // Amber
  '#7C3AED', // Violet
  '#334155', // Slate
];

export const CustomShopBuilderModal: React.FC<CustomShopBuilderModalProps> = ({
  language,
  initialShop,
  onSave,
  onClose,
}) => {
  const t = UI_STRINGS[language];
  const isUr = language === 'ur';

  const [shopNameEn, setShopNameEn] = useState(initialShop?.shopNameEn || '');
  const [shopNameUr, setShopNameUr] = useState(initialShop?.shopNameUr || '');
  const [taglineEn, setTaglineEn] = useState(initialShop?.taglineEn || '');
  const [taglineUr, setTaglineUr] = useState(initialShop?.taglineUr || '');
  const [categoryLabelEn, setCategoryLabelEn] = useState(
    initialShop?.categoryLabelEn || 'Custom Retail Shop'
  );
  const [categoryLabelUr, setCategoryLabelUr] = useState(
    initialShop?.categoryLabelUr || 'ذاتی کاروبار'
  );
  const [phone, setPhone] = useState(initialShop?.phone || '');
  const [addressEn, setAddressEn] = useState(initialShop?.addressEn || '');
  const [addressUr, setAddressUr] = useState(initialShop?.addressUr || '');
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(
    initialShop?.logoDataUrl
  );
  const [accentHex, setAccentHex] = useState(initialShop?.accentHex || '#0F2942');
  const [defaultPaper, setDefaultPaper] = useState<PaperFormat>(
    initialShop?.defaultPaper || '80mm'
  );
  const [defaultFooterEn, setDefaultFooterEn] = useState(
    initialShop?.defaultFooterEn || 'Thank you for your business!'
  );
  const [defaultFooterUr, setDefaultFooterUr] = useState(
    initialShop?.defaultFooterUr || 'آپ کی تشریف آوری کا شکریہ!'
  );
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>(
    initialShop?.customFields || [
      {
        id: 'cf_reference',
        labelEn: 'Reference / Order No.',
        labelUr: 'حوالہ / آرڈر نمبر',
        type: 'text',
        placeholderEn: 'Optional reference',
        placeholderUr: 'اختیاری حوالہ',
      },
    ]
  );
  const [logoError, setLogoError] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    try {
      const compressed = await compressImageFile(file, 240);
      setLogoDataUrl(compressed);
    } catch {
      setLogoError(
        isUr ? 'لوگو تصویر اپلوڈ کرنے میں مسئلہ پیش آیا۔' : 'Could not load image file.'
      );
    }
  };

  const handleAddField = () => {
    const newField: CustomFieldDef = {
      id: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      labelEn: '',
      labelUr: '',
      type: 'text',
      placeholderEn: '',
      placeholderUr: '',
      options: [],
      required: false,
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleUpdateField = (
    id: string,
    patch: Partial<CustomFieldDef>
  ) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const handleRemoveField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNameEn.trim() && !shopNameUr.trim()) {
      setFormError(
        isUr
          ? 'براہ کرم دکان یا کاروبار کا نام درج کریں۔'
          : 'Please enter a shop or business name.'
      );
      return;
    }

    const cleanedFields = customFields
      .filter((f) => f.labelEn.trim() || f.labelUr.trim())
      .map((f) => ({
        ...f,
        labelEn: f.labelEn.trim() || f.labelUr.trim(),
        labelUr: f.labelUr.trim() || f.labelEn.trim(),
      }));

    const shop: CustomShop = {
      id: initialShop?.id || `shop_${Date.now()}`,
      shopNameEn: shopNameEn.trim() || shopNameUr.trim(),
      shopNameUr: shopNameUr.trim() || shopNameEn.trim(),
      taglineEn: taglineEn.trim(),
      taglineUr: taglineUr.trim(),
      categoryLabelEn: categoryLabelEn.trim() || 'Custom Shop',
      categoryLabelUr: categoryLabelUr.trim() || categoryLabelEn.trim() || 'ذاتی دکان',
      phone: phone.trim(),
      addressEn: addressEn.trim(),
      addressUr: addressUr.trim(),
      logoDataUrl,
      accentHex,
      defaultPaper,
      defaultFooterEn: defaultFooterEn.trim(),
      defaultFooterUr: defaultFooterUr.trim(),
      customFields: cleanedFields,
      createdAt: initialShop?.createdAt || new Date().toISOString(),
    };

    onSave(shop);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-xs sm:items-center sm:p-4 no-print">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {initialShop ? t.builderTitleEdit : t.builderTitleNew}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {t.builderSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancel}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {formError}
            </div>
          )}

          {/* Logo Upload */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="Shop logo"
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-xl border border-slate-200 bg-white object-contain p-1"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-white"
                style={{ backgroundColor: accentHex }}
              >
                {(shopNameEn || shopNameUr || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <Upload className="h-4 w-4 text-[#0F2942]" />
                <span>{t.uploadLogo}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setLogoDataUrl(undefined)}
                  className="min-h-[44px] rounded-xl px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  {t.removeLogo}
                </button>
              )}
              {logoError && (
                <p className="w-full text-xs text-rose-600">{logoError}</p>
              )}
            </div>
          </div>

          {/* Core Shop Info */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.shopNameLabel} *
              </label>
              <input
                type="text"
                value={shopNameEn}
                onChange={(e) => setShopNameEn(e.target.value)}
                placeholder="e.g. Bismillah Car Wash"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.shopNameUrLabel}
              </label>
              <input
                type="text"
                dir="rtl"
                value={shopNameUr}
                onChange={(e) => setShopNameUr(e.target.value)}
                placeholder="مثلاً بسم اللہ کار واش"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.taglineLabel}
              </label>
              <input
                type="text"
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                placeholder="e.g. Complete Detailing & Oil Change"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.taglineUrLabel}
              </label>
              <input
                type="text"
                dir="rtl"
                value={taglineUr}
                onChange={(e) => setTaglineUr(e.target.value)}
                placeholder="مکمل سروس اور آئل چینج"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.categoryLabelInput}
              </label>
              <input
                type="text"
                value={categoryLabelEn}
                onChange={(e) => setCategoryLabelEn(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.addressLabel}
              </label>
              <input
                type="text"
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                placeholder="Main Road, Block C"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.addressUrLabel}
              </label>
              <input
                type="text"
                dir="rtl"
                value={addressUr}
                onChange={(e) => setAddressUr(e.target.value)}
                placeholder="مین روڈ، بلاک سی"
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
          </div>

          {/* Color & Default Paper Format */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-700">
                {t.accentColorLabel}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setAccentHex(hex)}
                    aria-label={`Select color ${hex}`}
                    className={`h-10 w-10 rounded-xl transition-transform ${
                      accentHex === hex
                        ? 'ring-2 ring-slate-900 ring-offset-2 scale-105'
                        : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-700">
                {t.defaultPaperLabel}
              </label>
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {(['80mm', '58mm', 'a4'] as PaperFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setDefaultPaper(fmt)}
                    className={`min-h-[38px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                      defaultPaper === fmt
                        ? 'bg-[#0F2942] text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    {fmt === 'a4'
                      ? t.paperA4
                      : fmt === '80mm'
                      ? t.paper80mm
                      : t.paper58mm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Default */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.defaultFooterLabel} (EN)
              </label>
              <input
                type="text"
                value={defaultFooterEn}
                onChange={(e) => setDefaultFooterEn(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.defaultFooterLabel} (اردو)
              </label>
              <input
                type="text"
                dir="rtl"
                value={defaultFooterUr}
                onChange={(e) => setDefaultFooterUr(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Custom Fields Builder */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.customFieldsHeading}
                </h3>
                <p className="text-xs text-slate-500">{t.customFieldsHint}</p>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0F2942] px-3.5 text-xs font-semibold text-white hover:bg-[#163B5E] whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>{t.addFieldBtn}</span>
              </button>
            </div>

            <div className="space-y-3">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5"
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        {t.fieldLabelEn}
                      </label>
                      <input
                        type="text"
                        value={field.labelEn}
                        onChange={(e) =>
                          handleUpdateField(field.id, { labelEn: e.target.value })
                        }
                        placeholder="e.g. Vehicle Plate No."
                        className="min-h-[40px] w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-900 focus:border-[#0F2942] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        {t.fieldLabelUr}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={field.labelUr}
                        onChange={(e) =>
                          handleUpdateField(field.id, { labelUr: e.target.value })
                        }
                        placeholder="مثلاً گاڑی نمبر"
                        className="min-h-[40px] w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-900 focus:border-[#0F2942] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        {t.fieldType}
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            type: e.target.value as CustomFieldType,
                          })
                        }
                        className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:border-[#0F2942] focus:outline-none"
                      >
                        <option value="text">{t.typeText}</option>
                        <option value="number">{t.typeNumber}</option>
                        <option value="date">{t.typeDate}</option>
                        <option value="select">{t.typeSelect}</option>
                      </select>
                    </div>
                    <div className="flex items-end justify-end sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        aria-label={t.deleteShop}
                        className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {field.type === 'select' ? (
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        {t.fieldOptions}
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(', ')}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            options: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                        className="min-h-[38px] w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-900 focus:border-[#0F2942] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-500">
                        {t.fieldPlaceholder}
                      </label>
                      <input
                        type="text"
                        value={field.placeholderEn || ''}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            placeholderEn: e.target.value,
                            placeholderUr: e.target.value,
                          })
                        }
                        placeholder="e.g. Enter details"
                        className="min-h-[38px] w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-900 focus:border-[#0F2942] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-700"
            >
              {t.saveCustomShop}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
