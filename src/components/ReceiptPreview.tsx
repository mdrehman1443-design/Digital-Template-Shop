import React from 'react';
import { UI_STRINGS } from '../data/i18n';
import { ReceiptRecord } from '../types/receipt';
import { formatMoney } from '../utils/receiptExport';

interface ReceiptPreviewProps {
  receipt: ReceiptRecord;
  forPrint?: boolean;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  receipt,
  forPrint = false,
}) => {
  const isUr = receipt.language === 'ur';
  const t = UI_STRINGS[receipt.language];
  const currency = receipt.currencySymbol || 'Rs.';

  const filledCustomFields = receipt.customFieldDefs.filter(
    (f) => receipt.customFieldValues[f.id] && receipt.customFieldValues[f.id].trim() !== ''
  );

  const paperWidthClass = forPrint
    ? receipt.paperFormat === '58mm'
      ? 'print-paper-58mm'
      : receipt.paperFormat === '80mm'
      ? 'print-paper-80mm'
      : 'print-paper-a4'
    : receipt.paperFormat === '58mm'
    ? 'max-w-[260px]'
    : receipt.paperFormat === '80mm'
    ? 'max-w-[340px]'
    : 'max-w-[680px]';

  const isThermal = receipt.paperFormat !== 'a4';

  return (
    <div
      dir={isUr ? 'rtl' : 'ltr'}
      className={`mx-auto w-full bg-white text-slate-900 ${paperWidthClass} ${
        forPrint
          ? ''
          : 'rounded-xl border border-slate-200 shadow-sm overflow-hidden'
      }`}
    >
      {/* Top Accent Bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: receipt.accentHex || '#0F2942' }}
      />

      <div className={isThermal ? 'p-4 text-xs' : 'p-6 sm:p-8 text-sm'}>
        {/* Shop Header */}
        <div className="flex flex-col items-center text-center">
          {receipt.shopLogoDataUrl && (
            <img
              src={receipt.shopLogoDataUrl}
              alt={receipt.shopName}
              referrerPolicy="no-referrer"
              className={`mb-2.5 object-contain ${isThermal ? 'h-12 max-w-[120px]' : 'h-16 max-w-[160px]'}`}
            />
          )}
          <h3
            className={`font-bold text-slate-950 ${
              isThermal ? 'text-base' : 'text-xl sm:text-2xl'
            } ${isUr ? 'font-urdu-text' : 'font-display'}`}
          >
            {receipt.shopName || (isUr ? 'میری دکان' : 'My Shop')}
          </h3>
          {receipt.shopTagline && (
            <p className="mt-0.5 text-xs text-slate-600">{receipt.shopTagline}</p>
          )}
          {receipt.shopPhone && (
            <p dir="ltr" className="mt-1 font-mono text-xs font-medium text-slate-700">
              {receipt.shopPhone}
            </p>
          )}
          {receipt.shopAddress && (
            <p className="mt-0.5 text-xs text-slate-500">{receipt.shopAddress}</p>
          )}
        </div>

        {/* Document Type Title Strip */}
        <div
          className="my-4 rounded-md border border-slate-200 bg-slate-100 py-1.5 px-3 text-center font-bold tracking-wide"
          style={{ color: receipt.accentHex || '#0F2942' }}
        >
          {receipt.docTitle}
        </div>

        {/* Receipt Meta & Customer */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">{t.receiptNoLabel}</span>
            <span dir="ltr" className="font-mono font-semibold text-slate-900">
              {receipt.receiptNumber}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">{t.dateLabel}</span>
            <span dir="ltr" className="font-mono text-slate-700 tabular-nums">
              {receipt.date} · {receipt.time}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">{t.customerNameLabel}</span>
            <span className="font-semibold text-slate-900">
              {receipt.customerName || t.customerWalkIn}
              {receipt.customerPhone ? ` (${receipt.customerPhone})` : ''}
            </span>
          </div>

          {filledCustomFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between gap-2">
              <span className="text-slate-500">
                {isUr ? field.labelUr || field.labelEn : field.labelEn}
              </span>
              <span className="font-medium text-slate-900">
                {receipt.customFieldValues[field.id]}
              </span>
            </div>
          ))}
        </div>

        {/* Dashed Divider */}
        <div className="my-3.5 border-t border-dashed border-slate-300" />

        {/* Line Items Table */}
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-1.5 text-start font-semibold">{t.itemNameCol}</th>
              <th className="py-1.5 text-center font-semibold">{t.qtyCol}</th>
              <th className="py-1.5 text-center font-semibold">{t.rateCol}</th>
              <th className="py-1.5 text-end font-semibold">{t.totalCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipt.items.map((item) => {
              const rowTotal = item.qty * item.rate;
              return (
                <tr key={item.id}>
                  <td className="py-2 pe-2 font-medium text-slate-900">
                    {item.name || (isUr ? 'شے' : 'Item')}
                  </td>
                  <td className="py-2 text-center font-mono tabular-nums text-slate-700">
                    {item.qty}
                  </td>
                  <td className="py-2 text-center font-mono tabular-nums text-slate-700">
                    {item.rate}
                  </td>
                  <td className="py-2 text-end font-mono font-semibold tabular-nums text-slate-900">
                    {formatMoney(rowTotal, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Dashed Divider */}
        <div className="my-3.5 border-t border-dashed border-slate-300" />

        {/* Math Totals */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{t.subtotalLabel}</span>
            <span dir="ltr" className="font-mono tabular-nums text-slate-800">
              {formatMoney(receipt.subtotal, currency)}
            </span>
          </div>

          {receipt.discountAmount > 0 && (
            <div className="flex items-center justify-between text-amber-700">
              <span>
                {t.discountLabel}
                {receipt.discountType === 'percent' ? ` (${receipt.discountValue}%)` : ''}
              </span>
              <span dir="ltr" className="font-mono tabular-nums">
                -{formatMoney(receipt.discountAmount, currency)}
              </span>
            </div>
          )}

          {receipt.taxAmount > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span>
                {t.taxLabel} ({receipt.taxPercent}%)
              </span>
              <span dir="ltr" className="font-mono tabular-nums">
                +{formatMoney(receipt.taxAmount, currency)}
              </span>
            </div>
          )}

          <div
            className="my-2 flex items-center justify-between rounded-lg px-3 py-2 text-white"
            style={{ backgroundColor: receipt.accentHex || '#0F2942' }}
          >
            <span className="text-sm font-bold">{t.grandTotalLabel}</span>
            <span dir="ltr" className="font-mono text-sm font-bold tabular-nums">
              {formatMoney(receipt.grandTotal, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700">{t.amountPaidLabel}</span>
            <span dir="ltr" className="font-mono font-semibold tabular-nums text-emerald-700">
              {formatMoney(receipt.amountPaid, currency)}
            </span>
          </div>

          {receipt.balanceDue > 0 ? (
            <div className="flex items-center justify-between font-bold text-rose-700">
              <span>{t.balanceUdhaarLabel}</span>
              <span dir="ltr" className="font-mono tabular-nums">
                {formatMoney(receipt.balanceDue, currency)}
              </span>
            </div>
          ) : receipt.balanceDue < 0 ? (
            <div className="flex items-center justify-between font-semibold text-[#0F2942]">
              <span>{t.changeReturnLabel}</span>
              <span dir="ltr" className="font-mono tabular-nums">
                {formatMoney(Math.abs(receipt.balanceDue), currency)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between font-semibold text-emerald-700">
              <span>{t.paidInFullLabel}</span>
              <span dir="ltr" className="font-mono tabular-nums">
                {formatMoney(0, currency)}
              </span>
            </div>
          )}
        </div>

        {/* Footer Note */}
        {receipt.footerNote && (
          <>
            <div className="my-3.5 border-t border-dashed border-slate-300" />
            <p className="text-center text-xs leading-relaxed text-slate-500">
              {receipt.footerNote}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
