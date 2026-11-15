import React, { useMemo, useState } from 'react';
import {
  Check,
  Download,
  FileDown,
  FilePlus2,
  Image as ImageIcon,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { UI_STRINGS } from '../data/i18n';
import {
  DiscountType,
  Language,
  PaperFormat,
  QuickItemPreset,
  ReceiptItem,
  ReceiptRecord,
} from '../types/receipt';
import {
  downloadReceiptPdf,
  downloadReceiptPng,
  formatMoney,
} from '../utils/receiptExport';
import { ReceiptPreview } from './ReceiptPreview';
import { WhatsAppShareModal } from './WhatsAppShareModal';

interface ReceiptGeneratorProps {
  uiLanguage: Language;
  receipt: ReceiptRecord;
  quickItems: QuickItemPreset[];
  isEditingExisting: boolean;
  onChangeReceipt: (updated: ReceiptRecord) => void;
  onSaveReceipt: (receiptToSave: ReceiptRecord) => void;
  onNewBlankReceipt: () => void;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  uiLanguage,
  receipt,
  quickItems,
  isEditingExisting,
  onChangeReceipt,
  onSaveReceipt,
  onNewBlankReceipt,
}) => {
  const t = UI_STRINGS[uiLanguage];
  const isUiUr = uiLanguage === 'ur';
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form');
  const [showShopOverride, setShowShopOverride] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'png' | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Recalculate totals automatically whenever items, discount, tax, or paid changes
  const computedReceipt = useMemo<ReceiptRecord>(() => {
    const subtotal = receipt.items.reduce(
      (sum, item) => sum + Math.max(0, item.qty) * Math.max(0, item.rate),
      0
    );
    const rawDiscount = Math.max(0, receipt.discountValue || 0);
    const discountAmount =
      receipt.discountType === 'percent'
        ? Math.min(subtotal, (subtotal * Math.min(100, rawDiscount)) / 100)
        : Math.min(subtotal, rawDiscount);

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxPercent = Math.max(0, receipt.taxPercent || 0);
    const taxAmount = (afterDiscount * taxPercent) / 100;
    const grandTotal = Math.round((afterDiscount + taxAmount) * 100) / 100;
    const amountPaid = Math.max(0, receipt.amountPaid || 0);
    const balanceDue = Math.round((grandTotal - amountPaid) * 100) / 100;

    return {
      ...receipt,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal,
      balanceDue,
    };
  }, [receipt]);

  const updateField = <K extends keyof ReceiptRecord>(
    key: K,
    value: ReceiptRecord[K]
  ) => {
    onChangeReceipt({ ...computedReceipt, [key]: value });
  };

  const handleItemChange = (
    itemId: string,
    field: keyof ReceiptItem,
    value: string | number
  ) => {
    const nextItems = computedReceipt.items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    onChangeReceipt({ ...computedReceipt, items: nextItems });
  };

  const handleAddItem = (preset?: QuickItemPreset) => {
    const isRecUr = computedReceipt.language === 'ur';
    const newItem: ReceiptItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: preset ? (isRecUr ? preset.nameUr : preset.nameEn) : '',
      qty: 1,
      rate: preset ? preset.rate : 0,
    };
    // If only 1 empty blank row exists, replace it for quick add
    if (
      preset &&
      computedReceipt.items.length === 1 &&
      !computedReceipt.items[0].name.trim() &&
      computedReceipt.items[0].rate === 0
    ) {
      onChangeReceipt({ ...computedReceipt, items: [newItem] });
      return;
    }
    onChangeReceipt({
      ...computedReceipt,
      items: [...computedReceipt.items, newItem],
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (computedReceipt.items.length <= 1) {
      onChangeReceipt({
        ...computedReceipt,
        items: [{ id: itemId, name: '', qty: 1, rate: 0 }],
      });
      return;
    }
    onChangeReceipt({
      ...computedReceipt,
      items: computedReceipt.items.filter((i) => i.id !== itemId),
    });
  };

  const handleSave = () => {
    onSaveReceipt(computedReceipt);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePdfDownload = async () => {
    setExporting('pdf');
    try {
      await downloadReceiptPdf(computedReceipt);
    } finally {
      setExporting(null);
    }
  };

  const handlePngDownload = async () => {
    setExporting('png');
    try {
      await downloadReceiptPng(computedReceipt);
    } finally {
      setExporting(null);
    }
  };

  const currency = computedReceipt.currencySymbol || 'Rs.';

  return (
    <>
      {/* Main Interactive Workspace (Hidden during print) */}
      <div className="space-y-4 no-print">
        {/* Top Utility Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                {computedReceipt.categoryName}
              </p>
              <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {computedReceipt.docTitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Receipt Output Language Toggle */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => updateField('language', 'en')}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                  computedReceipt.language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN Receipt
              </button>
              <button
                type="button"
                onClick={() => updateField('language', 'ur')}
                className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                  computedReceipt.language === 'ur'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اردو رسید
              </button>
            </div>

            {/* Paper Size Switcher */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1">
              {(['a4', '80mm', '58mm'] as PaperFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => updateField('paperFormat', fmt)}
                  className={`min-h-[36px] rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    computedReceipt.paperFormat === fmt
                      ? 'bg-[#0F2942] text-white'
                      : 'text-slate-600 hover:text-slate-900'
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

            <button
              type="button"
              onClick={onNewBlankReceipt}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>{t.newBlankBtn}</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (Form vs Live Preview) */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePane('form')}
            className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
              mobilePane === 'form'
                ? 'bg-[#0F2942] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabEditForm}
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('preview')}
            className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
              mobilePane === 'preview'
                ? 'bg-[#0F2942] text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabLivePreview} · {formatMoney(computedReceipt.grandTotal, currency)}
          </button>
        </div>

        {/* 2-Column Split on Desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* LEFT: Form Editor */}
          <div
            className={`space-y-5 lg:col-span-7 ${
              mobilePane === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Shop Branding Override Accordion */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setShowShopOverride((prev) => !prev)}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 text-start"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    {t.shopDetailsSection}
                  </p>
                  <p className="truncate text-sm font-bold text-slate-900">
                    {computedReceipt.shopName}
                    {computedReceipt.shopPhone ? ` · ${computedReceipt.shopPhone}` : ''}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2942] shrink-0">
                  <span>{t.editShopOverride}</span>
                  {showShopOverride ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </button>

              {showShopOverride && (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {t.shopNameLabel}
                    </label>
                    <input
                      type="text"
                      value={computedReceipt.shopName}
                      onChange={(e) => updateField('shopName', e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={computedReceipt.shopPhone}
                      onChange={(e) => updateField('shopPhone', e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {t.taglineLabel}
                    </label>
                    <input
                      type="text"
                      value={computedReceipt.shopTagline}
                      onChange={(e) => updateField('shopTagline', e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      {t.addressLabel}
                    </label>
                    <input
                      type="text"
                      value={computedReceipt.shopAddress}
                      onChange={(e) => updateField('shopAddress', e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Receipt Meta & Customer Info */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="mb-3.5 text-sm font-bold text-slate-900">
                {t.receiptMetaSection}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t.receiptNoLabel}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={computedReceipt.receiptNumber}
                    onChange={(e) => updateField('receiptNumber', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F2942] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t.dateLabel}
                  </label>
                  <input
                    type="date"
                    dir="ltr"
                    value={computedReceipt.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t.timeLabel}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={computedReceipt.time}
                    onChange={(e) => updateField('time', e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t.customerNameLabel}
                  </label>
                  <input
                    type="text"
                    value={computedReceipt.customerName}
                    onChange={(e) => updateField('customerName', e.target.value)}
                    placeholder={t.customerWalkIn}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F2942] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t.customerPhoneLabel}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={computedReceipt.customerPhone}
                    onChange={(e) => updateField('customerPhone', e.target.value)}
                    placeholder="0300 1234567"
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F2942] focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Template / Custom Shop Dynamic Fields */}
            {computedReceipt.customFieldDefs.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <h3 className="mb-3.5 text-sm font-bold text-slate-900">
                  {t.customDetailsSection}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {computedReceipt.customFieldDefs.map((field) => {
                    const label = isUiUr
                      ? field.labelUr || field.labelEn
                      : field.labelEn;
                    const placeholder = isUiUr
                      ? field.placeholderUr || field.placeholderEn || ''
                      : field.placeholderEn || '';
                    const val = computedReceipt.customFieldValues[field.id] || '';

                    return (
                      <div key={field.id}>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          {label}
                          {field.required && (
                            <span className="text-rose-600"> *</span>
                          )}
                        </label>
                        {field.type === 'select' && field.options?.length ? (
                          <select
                            value={val}
                            onChange={(e) =>
                              onChangeReceipt({
                                ...computedReceipt,
                                customFieldValues: {
                                  ...computedReceipt.customFieldValues,
                                  [field.id]: e.target.value,
                                },
                              })
                            }
                            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
                          >
                            <option value="">—</option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                            dir={field.type === 'date' || field.type === 'number' ? 'ltr' : undefined}
                            value={val}
                            placeholder={placeholder}
                            onChange={(e) =>
                              onChangeReceipt({
                                ...computedReceipt,
                                customFieldValues: {
                                  ...computedReceipt.customFieldValues,
                                  [field.id]: e.target.value,
                                },
                              })
                            }
                            className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F2942] focus:outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Dynamic Line Items */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{t.itemsSection}</h3>
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t.addItemRow}</span>
                </button>
              </div>

              {/* Quick Add Presets */}
              {quickItems.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3.5">
                  <span className="text-xs font-medium text-slate-500 me-1">
                    {t.quickAddLabel}
                  </span>
                  {quickItems.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddItem(preset)}
                      className="min-h-[34px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-[#0F2942] hover:bg-white"
                    >
                      + {isUiUr ? preset.nameUr : preset.nameEn}{' '}
                      <span className="font-mono text-slate-500">
                        ({preset.rate})
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Item Rows */}
              <div className="space-y-3">
                {computedReceipt.items.map((item, idx) => {
                  const rowTotal = Math.max(0, item.qty) * Math.max(0, item.rate);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-400 w-5 shrink-0">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, 'name', e.target.value)
                          }
                          placeholder={t.itemNameCol}
                          className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0F2942] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={t.deleteReceipt}
                          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2.5 grid grid-cols-12 items-center gap-2">
                        {/* Qty with mobile +/- steppers */}
                        <div className="col-span-5 sm:col-span-4">
                          <label className="mb-1 block text-[11px] font-medium text-slate-500">
                            {t.qtyCol}
                          </label>
                          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                handleItemChange(
                                  item.id,
                                  'qty',
                                  Math.max(0, Number((item.qty - 1).toFixed(2)))
                                )
                              }
                              aria-label="Decrease quantity"
                              className="flex min-h-[42px] min-w-[38px] items-center justify-center text-slate-600 hover:bg-slate-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              dir="ltr"
                              value={item.qty}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  'qty',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full min-w-0 bg-transparent text-center font-mono text-sm font-semibold text-slate-900 focus:outline-none tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleItemChange(
                                  item.id,
                                  'qty',
                                  Number((item.qty + 1).toFixed(2))
                                )
                              }
                              aria-label="Increase quantity"
                              className="flex min-h-[42px] min-w-[38px] items-center justify-center text-slate-600 hover:bg-slate-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Unit Rate */}
                        <div className="col-span-4 sm:col-span-4">
                          <label className="mb-1 block text-[11px] font-medium text-slate-500">
                            {t.rateCol}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            dir="ltr"
                            value={item.rate || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'rate',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F2942] focus:outline-none tabular-nums"
                          />
                        </div>

                        {/* Row Total */}
                        <div className="col-span-3 sm:col-span-4 text-end">
                          <span className="mb-1 block text-[11px] font-medium text-slate-500">
                            {t.totalCol}
                          </span>
                          <div
                            dir="ltr"
                            className="flex min-h-[44px] items-center justify-end font-mono text-sm font-bold text-slate-900 tabular-nums"
                          >
                            {formatMoney(rowTotal, currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Automated Math Engine & Payments */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-900">{t.mathSection}</h3>

              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">{t.subtotalLabel}</span>
                  <span dir="ltr" className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatMoney(computedReceipt.subtotal, currency)}
                  </span>
                </div>

                {/* Discount Row */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
                  <span className="text-sm font-medium text-slate-600 sm:col-span-4">
                    {t.discountLabel}
                  </span>
                  <div className="flex items-center gap-2 sm:col-span-8">
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 shrink-0">
                      {(['flat', 'percent'] as DiscountType[]).map((dtype) => (
                        <button
                          key={dtype}
                          type="button"
                          onClick={() => updateField('discountType', dtype)}
                          className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                            computedReceipt.discountType === dtype
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          {dtype === 'flat' ? t.discountFlat : t.discountPercent}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      dir="ltr"
                      value={computedReceipt.discountValue || ''}
                      placeholder="0"
                      onChange={(e) =>
                        updateField('discountValue', parseFloat(e.target.value) || 0)
                      }
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F2942] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                {/* Optional Tax % */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
                  <span className="text-sm font-medium text-slate-600 sm:col-span-4">
                    {t.taxLabel}
                  </span>
                  <div className="sm:col-span-8">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      dir="ltr"
                      value={computedReceipt.taxPercent || ''}
                      placeholder="0"
                      onChange={(e) =>
                        updateField('taxPercent', parseFloat(e.target.value) || 0)
                      }
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-sm font-semibold text-slate-900 focus:border-[#0F2942] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                {/* Grand Total Banner */}
                <div className="flex items-center justify-between rounded-xl bg-[#0F2942] px-4 py-3 text-white">
                  <span className="text-sm font-bold">{t.grandTotalLabel}</span>
                  <span dir="ltr" className="font-mono text-lg font-bold tabular-nums">
                    {formatMoney(computedReceipt.grandTotal, currency)}
                  </span>
                </div>

                {/* Amount Paid + Quick Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      {t.amountPaidLabel}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateField('amountPaid', computedReceipt.grandTotal)
                        }
                        className="min-h-[34px] rounded-lg bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                      >
                        {t.markFullPaid}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('amountPaid', 0)}
                        className="min-h-[34px] rounded-lg bg-rose-50 px-2.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                      >
                        {t.markFullUdhaar}
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    dir="ltr"
                    value={computedReceipt.amountPaid}
                    onChange={(e) =>
                      updateField('amountPaid', parseFloat(e.target.value) || 0)
                    }
                    className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3.5 font-mono text-base font-bold text-slate-900 focus:border-[#0F2942] focus:outline-none tabular-nums"
                  />
                </div>

                {/* Balance / Udhaar Status */}
                <div
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    computedReceipt.balanceDue > 0
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : computedReceipt.balanceDue < 0
                      ? 'border-slate-200 bg-slate-100 text-slate-900'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {computedReceipt.balanceDue > 0 ? (
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                    <span>
                      {computedReceipt.balanceDue > 0
                        ? t.balanceUdhaarLabel
                        : computedReceipt.balanceDue < 0
                        ? t.changeReturnLabel
                        : t.paidInFullLabel}
                    </span>
                  </div>
                  <span dir="ltr" className="font-mono text-base font-bold tabular-nums">
                    {formatMoney(Math.abs(computedReceipt.balanceDue), currency)}
                  </span>
                </div>
              </div>
            </section>

            {/* Footer Notes */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <label className="mb-2 block text-sm font-bold text-slate-900">
                {t.footerNoteLabel}
              </label>
              <textarea
                rows={2}
                value={computedReceipt.footerNote}
                onChange={(e) => updateField('footerNote', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-[#0F2942] focus:outline-none"
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500">{t.footerPresetsLabel}</span>
                {t.footerPresets.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateField('footerNote', preset)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 text-start"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </section>

            {/* Primary Save & Export Row inside Form */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 whitespace-nowrap"
              >
                {justSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{t.savedToast}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {isEditingExisting ? t.updateReceiptBtn : t.saveReceiptBtn}
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowWhatsApp(true)}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-5 text-sm font-bold text-white transition-colors hover:bg-[#163B5E] whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.whatsappShareBtn}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Live Preview & Export Dock */}
          <div
            className={`space-y-4 lg:sticky lg:top-20 lg:col-span-5 ${
              mobilePane === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Action Toolbar */}
            <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-white p-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                <Printer className="h-4 w-4 text-[#0F2942]" />
                <span className="truncate">{t.printBtn}</span>
              </button>
              <button
                type="button"
                onClick={handlePdfDownload}
                disabled={exporting === 'pdf'}
                className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-60"
              >
                {exporting === 'pdf' ? (
                  <Download className="h-4 w-4 animate-bounce text-[#0F2942]" />
                ) : (
                  <FileDown className="h-4 w-4 text-[#0F2942]" />
                )}
                <span className="truncate">{t.downloadPdfBtn}</span>
              </button>
              <button
                type="button"
                onClick={handlePngDownload}
                disabled={exporting === 'png'}
                className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-60"
              >
                {exporting === 'png' ? (
                  <Download className="h-4 w-4 animate-bounce text-[#0F2942]" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-[#0F2942]" />
                )}
                <span className="truncate">{t.downloadPngBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWhatsApp(true)}
                className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="truncate">{t.whatsappShareBtn}</span>
              </button>
            </div>

            {/* Live Paper Preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 sm:p-6">
              <ReceiptPreview receipt={computedReceipt} />
            </div>

            {/* Mobile quick save below preview */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                <span>
                  {justSaved
                    ? t.savedToast
                    : isEditingExisting
                    ? t.updateReceiptBtn
                    : t.saveReceiptBtn}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print-Only Receipt Container (Active exclusively during @media print) */}
      <div className="hidden print-only-container">
        <ReceiptPreview receipt={computedReceipt} forPrint />
      </div>

      {/* WhatsApp Share Modal */}
      {showWhatsApp && (
        <WhatsAppShareModal
          receipt={computedReceipt}
          language={uiLanguage}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </>
  );
};
