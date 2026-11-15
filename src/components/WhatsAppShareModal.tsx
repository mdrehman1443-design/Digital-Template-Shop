import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { UI_STRINGS } from '../data/i18n';
import { Language, ReceiptRecord } from '../types/receipt';
import {
  buildWhatsAppText,
  buildWhatsAppUrl,
  downloadReceiptPng,
  shareReceiptImageNative,
} from '../utils/receiptExport';

interface WhatsAppShareModalProps {
  receipt: ReceiptRecord;
  language: Language;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  receipt,
  language,
  onClose,
}) => {
  const t = UI_STRINGS[language];
  const [copied, setCopied] = useState(false);
  const [sharingImg, setSharingImg] = useState(false);

  const summaryText = buildWhatsAppText(receipt);
  const waUrl = buildWhatsAppUrl(receipt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleShareImage = async () => {
    setSharingImg(true);
    try {
      const shared = await shareReceiptImageNative(receipt);
      if (!shared) {
        await downloadReceiptPng(receipt);
      }
    } finally {
      setSharingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-xs sm:items-center sm:p-4 no-print">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.whatsappModalTitle}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{t.whatsappModalSubtitle}</p>
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

        <pre
          dir={receipt.language === 'ur' ? 'rtl' : 'ltr'}
          className="mt-4 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs leading-relaxed text-slate-800"
        >
          {summaryText}
        </pre>

        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{t.openWhatsappChat}</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleShareImage}
              disabled={sharingImg}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              {sharingImg ? (
                <Download className="h-4 w-4 animate-bounce" />
              ) : (
                <ImageIcon className="h-4 w-4 text-[#0F2942]" />
              )}
              <span>{t.shareImageNative}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">{t.copiedToast}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span>{t.copyTextBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
