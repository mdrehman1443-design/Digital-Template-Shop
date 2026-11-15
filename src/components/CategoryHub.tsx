import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Search,
  Store,
  Smartphone,
  UtensilsCrossed,
  Scissors,
  Pill,
  Wrench,
  SlidersHorizontal,
  Edit3,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../data/categories';
import { UI_STRINGS } from '../data/i18n';
import {
  BusinessCategory,
  CustomShop,
  Language,
  ReceiptRecord,
  ReceiptTemplate,
} from '../types/receipt';
import { formatMoney } from '../utils/receiptExport';

interface CategoryHubProps {
  language: Language;
  currencySymbol: string;
  customShops: CustomShop[];
  receipts: ReceiptRecord[];
  onSelectTemplate: (category: BusinessCategory, template: ReceiptTemplate) => void;
  onSelectCustomShop: (shop: CustomShop) => void;
  onOpenNewCustomShop: () => void;
  onEditCustomShop: (shop: CustomShop) => void;
  onDeleteCustomShop: (shopId: string) => void;
  onOpenProfileModal: () => void;
}

const CATEGORY_ICONS = {
  Store,
  Smartphone,
  UtensilsCrossed,
  Scissors,
  Pill,
  Wrench,
};

export const CategoryHub: React.FC<CategoryHubProps> = ({
  language,
  currencySymbol,
  customShops,
  receipts,
  onSelectTemplate,
  onSelectCustomShop,
  onOpenNewCustomShop,
  onEditCustomShop,
  onDeleteCustomShop,
  onOpenProfileModal,
}) => {
  const t = UI_STRINGS[language];
  const isUr = language === 'ur';
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalSales = receipts.reduce((sum, r) => sum + (r.grandTotal || 0), 0);
    const totalUdhaar = receipts.reduce(
      (sum, r) => sum + (r.balanceDue > 0 ? r.balanceDue : 0),
      0
    );
    return {
      count: receipts.length,
      totalSales,
      totalUdhaar,
      shopsCount: customShops.length,
    };
  }, [receipts, customShops.length]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return BUSINESS_CATEGORIES;
    return BUSINESS_CATEGORIES.map((cat) => {
      const catMatch =
        cat.nameEn.toLowerCase().includes(q) ||
        cat.nameUr.includes(q) ||
        cat.descriptionEn.toLowerCase().includes(q) ||
        cat.descriptionUr.includes(q);
      const matchingTemplates = cat.templates.filter(
        (tpl) =>
          tpl.nameEn.toLowerCase().includes(q) ||
          tpl.nameUr.includes(q) ||
          tpl.subtitleEn.toLowerCase().includes(q) ||
          tpl.subtitleUr.includes(q)
      );
      if (catMatch) return cat;
      if (matchingTemplates.length > 0) {
        return { ...cat, templates: matchingTemplates };
      }
      return null;
    }).filter((c): c is BusinessCategory => c !== null);
  }, [search]);

  const filteredCustomShops = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customShops;
    return customShops.filter(
      (s) =>
        s.shopNameEn.toLowerCase().includes(q) ||
        s.shopNameUr.includes(q) ||
        s.categoryLabelEn.toLowerCase().includes(q) ||
        s.categoryLabelUr.includes(q)
    );
  }, [customShops, search]);

  const DirArrow = isUr ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8">
      {/* Hero & Action Bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
              {t.heroTitle}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              {t.heroSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <span>{t.shopSettingsBtn}</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewCustomShop}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F2942] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163B5E] whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addCustomShopBtn}</span>
            </button>
          </div>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4 sm:gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500">{t.quickStatsReceipts}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums sm:text-2xl">
              {stats.count}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{t.quickStatsSales}</p>
            <p className="mt-1 text-xl font-bold text-emerald-700 tabular-nums sm:text-2xl">
              {formatMoney(stats.totalSales, currencySymbol)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{t.quickStatsUdhaar}</p>
            <p className="mt-1 text-xl font-bold text-rose-700 tabular-nums sm:text-2xl">
              {formatMoney(stats.totalUdhaar, currencySymbol)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{t.quickStatsShops}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums sm:text-2xl">
              {stats.shopsCount}
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
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
          placeholder={t.searchTemplatesPlaceholder}
          className={`min-h-[46px] w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#0F2942]/15 ${
            isUr ? 'pr-11 pl-4' : 'pl-11 pr-4'
          }`}
        />
      </div>

      {/* Custom Shops Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {t.customShopsHeading}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">{t.customShopsSubheading}</p>
          </div>
          <button
            type="button"
            onClick={onOpenNewCustomShop}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addCustomShopBtn}</span>
          </button>
        </div>

        {filteredCustomShops.length === 0 ? (
          <button
            type="button"
            onClick={onOpenNewCustomShop}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center transition-colors hover:border-[#0F2942] hover:bg-slate-50/70"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#0F2942]">
              <Plus className="h-6 w-6" />
            </span>
            <p className="max-w-md text-sm font-medium text-slate-700">
              {t.customShopsEmpty}
            </p>
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCustomShops.map((shop) => {
              const title = isUr && shop.shopNameUr ? shop.shopNameUr : shop.shopNameEn;
              const catLabel =
                isUr && shop.categoryLabelUr ? shop.categoryLabelUr : shop.categoryLabelEn;
              const tagline = isUr && shop.taglineUr ? shop.taglineUr : shop.taglineEn;

              return (
                <article
                  key={shop.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      {shop.logoDataUrl ? (
                        <img
                          src={shop.logoDataUrl}
                          alt={title}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-contain bg-white p-1"
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white font-bold text-lg"
                          style={{ backgroundColor: shop.accentHex || '#0F2942' }}
                        >
                          {title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {catLabel}
                          <span aria-hidden="true"> · </span>
                          <span className="tabular-nums">{shop.customFields.length}</span>{' '}
                          {isUr ? 'اضافی خانے' : 'fields'}
                          <span aria-hidden="true"> · </span>
                          {shop.defaultPaper.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {tagline && (
                      <p className="mt-3 line-clamp-2 text-xs text-slate-600">{tagline}</p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => onSelectCustomShop(shop)}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#163B5E] whitespace-nowrap"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{t.createBill}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditCustomShop(shop)}
                      aria-label={t.editShop}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {confirmDeleteId === shop.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCustomShop(shop.id);
                          setConfirmDeleteId(null);
                        }}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700 whitespace-nowrap"
                      >
                        {t.confirmDelete}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(shop.id)}
                        aria-label={t.deleteShop}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
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
      </section>

      {/* Pre-Built Business Categories */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {t.categoriesHeading}
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">{t.categoriesSubheading}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => {
            const IconComponent = CATEGORY_ICONS[category.iconName] || Store;
            const catTitle = isUr ? category.nameUr : category.nameEn;
            const catDesc = isUr ? category.descriptionUr : category.descriptionEn;

            return (
              <article
                key={category.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: category.accentHex }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900">{catTitle}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="tabular-nums">{category.templates.length}</span>{' '}
                      {t.templatesCount}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600">{catDesc}</p>

                <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                  {category.templates.map((tpl) => {
                    const tplTitle = isUr ? tpl.nameUr : tpl.nameEn;
                    const tplSub = isUr ? tpl.subtitleUr : tpl.subtitleEn;

                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => onSelectTemplate(category, tpl)}
                        className="group flex min-h-[52px] w-full items-center justify-between gap-3 py-3 text-start transition-colors hover:bg-slate-50/80 px-2 -mx-2 rounded-lg"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-[#0F2942]">
                            {tplTitle}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {tplSub}
                            <span aria-hidden="true"> · </span>
                            <span className="font-mono text-[11px] uppercase">
                              {tpl.defaultPaper}
                            </span>
                          </div>
                        </div>
                        <DirArrow className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:text-[#0F2942]" />
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {/* Prominent + Add Custom Category Card inside the grid */}
          <button
            type="button"
            onClick={onOpenNewCustomShop}
            className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition-colors hover:border-[#0F2942] hover:bg-white"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2942] text-white">
              <Plus className="h-7 w-7" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-base font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>{t.addCustomShopBtn}</span>
              </div>
              <p className="max-w-xs text-xs text-slate-500">{t.builderSubtitle}</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
