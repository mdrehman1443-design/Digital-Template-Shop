import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Edit3,
  FileText,
  MessageCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { UI_STRINGS } from '../data/i18n';
import { Language, ReceiptRecord } from '../types/receipt';
import { formatMoney } from '../utils/receiptExport';
import { WhatsAppShareModal } from './WhatsAppShareModal';

interface ReceiptHistoryProps {
  language: Language;
  receipts: ReceiptRecord[];
  onEditReceipt: (receipt: ReceiptRecord) => void;
  onDuplicateReceipt: (receipt: ReceiptRecord) => void;
  onSettleUdhaar: (receiptId: string) => void;
  onDeleteReceipt: (receiptId: string) => void;
  onGoToTemplates: () => void;
}

export const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({
  language,
  receipts,
  onEditReceipt,
  onDuplicateReceipt,
  onSettleUdhaar,
  onDeleteReceipt,
  onGoToTemplates,
}) => {
  const t = UI_STRINGS[language];
  const isUr = language === 'ur';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'udhaar'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ReceiptRecord | null>(null);

  const filteredReceipts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receipts.filter((r) => {
      if (filter === 'paid' && r.balanceDue > 0) return false;
      if (filter === 'udhaar' && r.balanceDue <= 0) return false;
      if (!q) return true;
      return (
        r.receiptNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.toLowerCase().includes(q) ||
        r.shopName.toLowerCase().includes(q) ||
        r.docTitle.toLowerCase().includes(q)
      );
    });
  }, [receipts, search, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {t.historyTitle}
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">{t.historySubtitle}</p>
        </div>

        {/* Segmented Filter */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
          {(['all', 'paid', 'udhaar'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`min-h-[38px] rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all'
                ? t.filterAll
                : tab === 'paid'
                ? t.filterPaid
                : t.filterUdhaar}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
            isUr ? 'right-4' : 'left-4'
          }`}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchHistoryPlaceholder}
          className={`min-h-[46px] w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F2942] focus:outline-none ${
            isUr ? 'pr-11 pl-4' : 'pl-11 pr-4'
          }`}
        />
      </div>

      {/* Empty State or Ledger List */}
      {filteredReceipts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileText className="h-6 w-6" />
          </span>
          <h3 className="mt-3 text-base font-bold text-slate-900">
            {t.historyEmptyTitle}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
            {t.historyEmptySubtitle}
          </p>
          <button
            type="button"
            onClick={onGoToTemplates}
            className="mt-5 min-h-[44px] rounded-xl bg-[#0F2942] px-5 text-sm font-semibold text-white hover:bg-[#163B5E]"
          >
            {t.newReceiptCta}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReceipts.map((r) => {
            const currency = r.currencySymbol || 'Rs.';
            const isUdhaar = r.balanceDue > 0;
            const isChange = r.balanceDue < 0;

            return (
              <article
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 transition-colors hover:border-slate-300"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span dir="ltr" className="font-mono text-sm font-bold text-slate-900">
                        {r.receiptNumber}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {r.customerName || t.customerWalkIn}
                      </span>
                      {r.customerPhone && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span dir="ltr" className="font-mono text-xs text-slate-500">
                            {r.customerPhone}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {r.shopName}
                      <span aria-hidden="true"> · </span>
                      {r.docTitle}
                      <span aria-hidden="true"> · </span>
                      <span dir="ltr" className="font-mono">
                        {r.date} {r.time}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">{r.items.length}</span> {t.itemsUnit}
                    </p>
                  </div>

                  {/* Totals & Status */}
                  <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                    <div className="text-start sm:text-end">
                      <div
                        dir="ltr"
                        className="font-mono text-base font-bold text-slate-900 tabular-nums"
                      >
                        {formatMoney(r.grandTotal, currency)}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold">
                        {isUdhaar ? (
                          <span className="inline-flex items-center gap-1 text-rose-700">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>
                              {t.udhaarTag}:{' '}
                              <span dir="ltr" className="font-mono tabular-nums">
                                {formatMoney(r.balanceDue, currency)}
                              </span>
                            </span>
                          </span>
                        ) : isChange ? (
                          <span className="inline-flex items-center gap-1 text-[#0F2942]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                              {t.changeTag}:{' '}
                              <span dir="ltr" className="font-mono tabular-nums">
                                {formatMoney(Math.abs(r.balanceDue), currency)}
                              </span>
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t.paidTag}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onEditReceipt(r)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 whitespace-nowrap"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{t.openInGenerator}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateReceipt(r)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t.duplicateReceipt}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareTarget(r)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 whitespace-nowrap"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{t.whatsappShareBtn}</span>
                  </button>

                  {isUdhaar && (
                    <button
                      type="button"
                      onClick={() => onSettleUdhaar(r.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t.settleUdhaar}</span>
                    </button>
                  )}

                  <div className="ms-auto">
                    {confirmDeleteId === r.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteReceipt(r.id);
                          setConfirmDeleteId(null);
                        }}
                        className="inline-flex min-h-[40px] items-center rounded-xl bg-rose-600 px-3.5 text-xs font-semibold text-white hover:bg-rose-700 whitespace-nowrap"
                      >
                        {t.confirmDelete}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(r.id)}
                        aria-label={t.deleteReceipt}
                        className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {shareTarget && (
        <WhatsAppShareModal
          receipt={shareTarget}
          language={language}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
};
