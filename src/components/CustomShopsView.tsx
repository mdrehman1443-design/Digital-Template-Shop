import React, { useState } from 'react';
import { Edit3, FileText, Plus, Store, Trash2 } from 'lucide-react';
import { UI_STRINGS } from '../data/i18n';
import { CustomShop, Language } from '../types/receipt';

interface CustomShopsViewProps {
  language: Language;
  customShops: CustomShop[];
  onCreateNew: () => void;
  onEdit: (shop: CustomShop) => void;
  onDelete: (shopId: string) => void;
  onSelectForReceipt: (shop: CustomShop) => void;
}

export const CustomShopsView: React.FC<CustomShopsViewProps> = ({
  language,
  customShops,
  onCreateNew,
  onEdit,
  onDelete,
  onSelectForReceipt,
}) => {
  const t = UI_STRINGS[language];
  const isUr = language === 'ur';
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {t.customShopsHeading}
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">{t.customShopsSubheading}</p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-5 text-sm font-semibold text-white hover:bg-[#163B5E] whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addCustomShopBtn}</span>
        </button>
      </div>

      {customShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#0F2942]">
            <Store className="h-7 w-7" />
          </span>
          <p className="mt-4 max-w-md text-sm font-medium text-slate-700">
            {t.customShopsEmpty}
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addCustomShopBtn}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customShops.map((shop) => {
            const title = isUr && shop.shopNameUr ? shop.shopNameUr : shop.shopNameEn;
            const cat =
              isUr && shop.categoryLabelUr ? shop.categoryLabelUr : shop.categoryLabelEn;
            const address =
              isUr && shop.addressUr ? shop.addressUr : shop.addressEn;
            const tagline =
              isUr && shop.taglineUr ? shop.taglineUr : shop.taglineEn;

            return (
              <article
                key={shop.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {shop.logoDataUrl ? (
                      <img
                        src={shop.logoDataUrl}
                        alt={title}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
                      />
                    ) : (
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
                        style={{ backgroundColor: shop.accentHex || '#0F2942' }}
                      >
                        {title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-slate-900">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {cat}
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono uppercase">{shop.defaultPaper}</span>
                      </p>
                      {shop.phone && (
                        <p dir="ltr" className="mt-1 font-mono text-xs text-slate-600">
                          {shop.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {tagline && <p className="text-xs text-slate-600">{tagline}</p>}
                  {address && <p className="text-xs text-slate-500">{address}</p>}

                  {shop.customFields.length > 0 && (
                    <div className="border-t border-slate-100 pt-2.5">
                      <p className="text-xs font-medium text-slate-500">
                        {t.customFieldsHeading}:{' '}
                        <span className="text-slate-800">
                          {shop.customFields
                            .map((f) => (isUr ? f.labelUr || f.labelEn : f.labelEn))
                            .join(' · ')}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectForReceipt(shop)}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-4 text-sm font-semibold text-white hover:bg-[#163B5E]"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{t.createBill}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(shop)}
                    aria-label={t.editShop}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {confirmDeleteId === shop.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(shop.id);
                        setConfirmDeleteId(null);
                      }}
                      className="inline-flex min-h-[44px] items-center rounded-xl bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      {t.confirmDelete}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(shop.id)}
                      aria-label={t.deleteShop}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
