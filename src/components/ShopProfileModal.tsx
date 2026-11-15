import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { UI_STRINGS } from '../data/i18n';
import { DefaultShopProfile, Language } from '../types/receipt';
import { compressImageFile } from '../utils/storage';

interface ShopProfileModalProps {
  language: Language;
  profile: DefaultShopProfile;
  onSave: (profile: DefaultShopProfile) => void;
  onClose: () => void;
}

export const ShopProfileModal: React.FC<ShopProfileModalProps> = ({
  language,
  profile,
  onSave,
  onClose,
}) => {
  const t = UI_STRINGS[language];
  const [form, setForm] = useState<DefaultShopProfile>(profile);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 240);
      setForm((prev) => ({ ...prev, logoDataUrl: compressed }));
    } catch {
      // ignore invalid file
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-xs sm:items-center sm:p-4 no-print">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {t.defaultProfileTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.defaultProfileSubtitle}
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            {form.logoDataUrl ? (
              <img
                src={form.logoDataUrl}
                alt="Shop logo"
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-xl border border-slate-200 bg-white object-contain p-1"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F2942] text-lg font-bold text-white">
                {(form.shopNameEn || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                <Upload className="h-4 w-4 text-[#0F2942]" />
                <span>{t.uploadLogo}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {form.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, logoDataUrl: undefined }))}
                  className="min-h-[42px] rounded-xl px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  {t.removeLogo}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.shopNameLabel}
              </label>
              <input
                type="text"
                value={form.shopNameEn}
                onChange={(e) => setForm({ ...form, shopNameEn: e.target.value })}
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
                value={form.shopNameUr}
                onChange={(e) => setForm({ ...form, shopNameUr: e.target.value })}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.taglineLabel}
              </label>
              <input
                type="text"
                value={form.taglineEn}
                onChange={(e) => setForm({ ...form, taglineEn: e.target.value })}
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
                value={form.taglineUr}
                onChange={(e) => setForm({ ...form, taglineUr: e.target.value })}
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
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.currencyLabel}
              </label>
              <select
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-[#0F2942] focus:outline-none"
              >
                <option value="Rs.">Rs. (PKR / INR)</option>
                <option value="PKR">PKR</option>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="$">$ (USD)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t.addressLabel}
              </label>
              <input
                type="text"
                value={form.addressEn}
                onChange={(e) => setForm({ ...form, addressEn: e.target.value })}
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
                value={form.addressUr}
                onChange={(e) => setForm({ ...form, addressUr: e.target.value })}
                className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
            </div>
          </div>

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
              className="min-h-[44px] rounded-xl bg-[#0F2942] px-6 text-sm font-bold text-white hover:bg-[#163B5E]"
            >
              {t.saveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
