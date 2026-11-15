import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  History,
  Languages,
  LayoutGrid,
  Plus,
  Store,
} from 'lucide-react';
import { CategoryHub } from './components/CategoryHub';
import { CustomShopBuilderModal } from './components/CustomShopBuilderModal';
import { CustomShopsView } from './components/CustomShopsView';
import { ReceiptGenerator } from './components/ReceiptGenerator';
import { ReceiptHistory } from './components/ReceiptHistory';
import { ShopProfileModal } from './components/ShopProfileModal';
import { BUSINESS_CATEGORIES } from './data/categories';
import { UI_STRINGS } from './data/i18n';
import {
  ActiveTab,
  BusinessCategory,
  CustomShop,
  DefaultShopProfile,
  Language,
  QuickItemPreset,
  ReceiptRecord,
  ReceiptTemplate,
} from './types/receipt';
import {
  generateNextInvoiceNumber,
  loadCustomShops,
  loadDefaultProfile,
  loadLanguage,
  loadReceipts,
  saveCustomShops,
  saveDefaultProfile,
  saveLanguage,
  saveReceipts,
} from './utils/storage';

function nowDateInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nowTimeDisplay(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildReceiptFromTemplate(
  category: BusinessCategory,
  template: ReceiptTemplate,
  profile: DefaultShopProfile,
  lang: Language
): ReceiptRecord {
  const isUr = lang === 'ur';
  const nowIso = new Date().toISOString();
  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    receiptNumber: generateNextInvoiceNumber(),
    date: nowDateInput(),
    time: nowTimeDisplay(),
    language: lang,
    paperFormat: template.defaultPaper,
    sourceType: 'template',
    sourceId: template.id,
    categoryName: isUr ? category.nameUr : category.nameEn,
    docTitle: isUr ? template.docLabelUr : template.docLabelEn,
    accentHex: category.accentHex,
    shopName: isUr ? profile.shopNameUr || profile.shopNameEn : profile.shopNameEn,
    shopTagline: isUr ? profile.taglineUr || profile.taglineEn : profile.taglineEn,
    shopPhone: profile.phone,
    shopAddress: isUr ? profile.addressUr || profile.addressEn : profile.addressEn,
    shopLogoDataUrl: profile.logoDataUrl,
    customerName: '',
    customerPhone: '',
    customFieldDefs: template.customFields,
    customFieldValues: {},
    items: [
      {
        id: `item_${Date.now()}`,
        name: '',
        qty: 1,
        rate: 0,
      },
    ],
    discountType: 'flat',
    discountValue: 0,
    taxPercent: 0,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
    footerNote: isUr ? template.defaultFooterUr : template.defaultFooterEn,
    currencySymbol: profile.currencySymbol || 'Rs.',
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function buildReceiptFromCustomShop(
  shop: CustomShop,
  profile: DefaultShopProfile,
  lang: Language
): ReceiptRecord {
  const isUr = lang === 'ur';
  const nowIso = new Date().toISOString();
  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    receiptNumber: generateNextInvoiceNumber(),
    date: nowDateInput(),
    time: nowTimeDisplay(),
    language: lang,
    paperFormat: shop.defaultPaper,
    sourceType: 'custom_shop',
    sourceId: shop.id,
    categoryName: isUr
      ? shop.categoryLabelUr || shop.categoryLabelEn
      : shop.categoryLabelEn,
    docTitle: isUr
      ? shop.shopNameUr || shop.shopNameEn
      : shop.shopNameEn,
    accentHex: shop.accentHex || '#0F2942',
    shopName: isUr ? shop.shopNameUr || shop.shopNameEn : shop.shopNameEn,
    shopTagline: isUr ? shop.taglineUr || shop.taglineEn : shop.taglineEn,
    shopPhone: shop.phone,
    shopAddress: isUr ? shop.addressUr || shop.addressEn : shop.addressEn,
    shopLogoDataUrl: shop.logoDataUrl,
    customerName: '',
    customerPhone: '',
    customFieldDefs: shop.customFields,
    customFieldValues: {},
    items: [
      {
        id: `item_${Date.now()}`,
        name: '',
        qty: 1,
        rate: 0,
      },
    ],
    discountType: 'flat',
    discountValue: 0,
    taxPercent: 0,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
    footerNote: isUr
      ? shop.defaultFooterUr || shop.defaultFooterEn
      : shop.defaultFooterEn || shop.defaultFooterUr,
    currencySymbol: profile.currencySymbol || 'Rs.',
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('hub');
  const [profile, setProfile] = useState<DefaultShopProfile>(() => loadDefaultProfile());
  const [customShops, setCustomShops] = useState<CustomShop[]>(() => loadCustomShops());
  const [receipts, setReceipts] = useState<ReceiptRecord[]>(() => loadReceipts());

  const [activeReceipt, setActiveReceipt] = useState<ReceiptRecord>(() => {
    const defaultCat = BUSINESS_CATEGORIES[0];
    return buildReceiptFromTemplate(
      defaultCat,
      defaultCat.templates[0],
      loadDefaultProfile(),
      loadLanguage()
    );
  });
  const [activeQuickItems, setActiveQuickItems] = useState<QuickItemPreset[]>(
    BUSINESS_CATEGORIES[0].templates[0].quickItems
  );
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);

  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [editingShop, setEditingShop] = useState<CustomShop | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const t = UI_STRINGS[language];
  const isUr = language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isUr ? 'rtl' : 'ltr';
    document.documentElement.lang = isUr ? 'ur' : 'en';
    saveLanguage(language);
  }, [language, isUr]);

  const handleSelectTemplate = (
    category: BusinessCategory,
    template: ReceiptTemplate
  ) => {
    setActiveReceipt(buildReceiptFromTemplate(category, template, profile, language));
    setActiveQuickItems(template.quickItems);
    setEditingReceiptId(null);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCustomShop = (shop: CustomShop) => {
    setActiveReceipt(buildReceiptFromCustomShop(shop, profile, language));
    setActiveQuickItems([]);
    setEditingReceiptId(null);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewBlankReceipt = () => {
    if (activeReceipt.sourceType === 'custom_shop') {
      const shop = customShops.find((s) => s.id === activeReceipt.sourceId);
      if (shop) {
        handleSelectCustomShop(shop);
        return;
      }
    }
    for (const cat of BUSINESS_CATEGORIES) {
      const tpl = cat.templates.find((item) => item.id === activeReceipt.sourceId);
      if (tpl) {
        handleSelectTemplate(cat, tpl);
        return;
      }
    }
    const fallbackCat = BUSINESS_CATEGORIES[0];
    handleSelectTemplate(fallbackCat, fallbackCat.templates[0]);
  };

  const handleSaveReceipt = (receiptToSave: ReceiptRecord) => {
    const stamped: ReceiptRecord = {
      ...receiptToSave,
      updatedAt: new Date().toISOString(),
    };
    setReceipts((prev) => {
      const exists = prev.some((r) => r.id === stamped.id);
      const next = exists
        ? prev.map((r) => (r.id === stamped.id ? stamped : r))
        : [stamped, ...prev];
      saveReceipts(next);
      return next;
    });
    setEditingReceiptId(stamped.id);
  };

  const handleEditHistoryReceipt = (record: ReceiptRecord) => {
    setActiveReceipt(record);
    setEditingReceiptId(record.id);
    // Match quick items if template exists
    let foundQuick: QuickItemPreset[] = [];
    for (const cat of BUSINESS_CATEGORIES) {
      const tpl = cat.templates.find((item) => item.id === record.sourceId);
      if (tpl) {
        foundQuick = tpl.quickItems;
        break;
      }
    }
    setActiveQuickItems(foundQuick);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateHistoryReceipt = (record: ReceiptRecord) => {
    const nowIso = new Date().toISOString();
    const copy: ReceiptRecord = {
      ...record,
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      receiptNumber: generateNextInvoiceNumber(),
      date: nowDateInput(),
      time: nowTimeDisplay(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setActiveReceipt(copy);
    setEditingReceiptId(null);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSettleUdhaar = (receiptId: string) => {
    setReceipts((prev) => {
      const next = prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              amountPaid: r.grandTotal,
              balanceDue: 0,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      saveReceipts(next);
      return next;
    });
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setReceipts((prev) => {
      const next = prev.filter((r) => r.id !== receiptId);
      saveReceipts(next);
      return next;
    });
  };

  const handleSaveCustomShop = (shop: CustomShop) => {
    setCustomShops((prev) => {
      const exists = prev.some((s) => s.id === shop.id);
      const next = exists
        ? prev.map((s) => (s.id === shop.id ? shop : s))
        : [shop, ...prev];
      saveCustomShops(next);
      return next;
    });
    setShowBuilderModal(false);
    setEditingShop(null);
  };

  const handleDeleteCustomShop = (shopId: string) => {
    setCustomShops((prev) => {
      const next = prev.filter((s) => s.id !== shopId);
      saveCustomShops(next);
      return next;
    });
  };

  const handleSaveProfile = (nextProfile: DefaultShopProfile) => {
    setProfile(nextProfile);
    saveDefaultProfile(nextProfile);
    setShowProfileModal(false);
    // Sync current unsaved template receipt branding if using template
    if (activeReceipt.sourceType === 'template' && !editingReceiptId) {
      setActiveReceipt((prev) => ({
        ...prev,
        shopName: isUr
          ? nextProfile.shopNameUr || nextProfile.shopNameEn
          : nextProfile.shopNameEn,
        shopTagline: isUr
          ? nextProfile.taglineUr || nextProfile.taglineEn
          : nextProfile.taglineEn,
        shopPhone: nextProfile.phone,
        shopAddress: isUr
          ? nextProfile.addressUr || nextProfile.addressEn
          : nextProfile.addressEn,
        shopLogoDataUrl: nextProfile.logoDataUrl,
        currencySymbol: nextProfile.currencySymbol,
      }));
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'hub', label: t.navHub, icon: LayoutGrid },
    { id: 'generator', label: t.navGenerator, icon: FileSpreadsheet },
    { id: 'history', label: t.navHistory, icon: History },
    { id: 'custom_shops', label: t.navCustomShops, icon: Store },
  ];

  return (
    <div
      dir={isUr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-10"
    >
      {/* Top Bar (Strict 3-Zone Contract on Desktop, Compact 56px on Mobile) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md no-print">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 md:h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('hub')}
            className="text-start text-base font-extrabold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0 sm:text-lg"
          >
            {t.brandName}
          </button>

          {/* Zone 2: 4 clean single-line text nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === item.id
                    ? 'border-[#0F2942] font-semibold text-[#0F2942]'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                handleNewBlankReceipt();
                setActiveTab('generator');
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0F2942] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#163B5E] whitespace-nowrap shrink-0 sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t.newReceiptCta}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
        {/* Workspace Bilingual Toggle Utility Row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{isUr ? profile.shopNameUr || profile.shopNameEn : profile.shopNameEn}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {receipts.length} {t.quickStatsReceipts}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
            <Languages className="mx-1.5 h-4 w-4 text-slate-500 shrink-0" />
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`min-h-[34px] rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                language === 'en'
                  ? 'bg-[#0F2942] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ur')}
              className={`min-h-[34px] rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                language === 'ur'
                  ? 'bg-[#0F2942] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اردو
            </button>
          </div>
        </div>

        {/* Active View */}
        {activeTab === 'hub' && (
          <CategoryHub
            language={language}
            currencySymbol={profile.currencySymbol}
            customShops={customShops}
            receipts={receipts}
            onSelectTemplate={handleSelectTemplate}
            onSelectCustomShop={handleSelectCustomShop}
            onOpenNewCustomShop={() => {
              setEditingShop(null);
              setShowBuilderModal(true);
            }}
            onEditCustomShop={(shop) => {
              setEditingShop(shop);
              setShowBuilderModal(true);
            }}
            onDeleteCustomShop={handleDeleteCustomShop}
            onOpenProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {activeTab === 'generator' && (
          <ReceiptGenerator
            uiLanguage={language}
            receipt={activeReceipt}
            quickItems={activeQuickItems}
            isEditingExisting={Boolean(editingReceiptId)}
            onChangeReceipt={setActiveReceipt}
            onSaveReceipt={handleSaveReceipt}
            onNewBlankReceipt={handleNewBlankReceipt}
          />
        )}

        {activeTab === 'history' && (
          <ReceiptHistory
            language={language}
            receipts={receipts}
            onEditReceipt={handleEditHistoryReceipt}
            onDuplicateReceipt={handleDuplicateHistoryReceipt}
            onSettleUdhaar={handleSettleUdhaar}
            onDeleteReceipt={handleDeleteReceipt}
            onGoToTemplates={() => setActiveTab('hub')}
          />
        )}

        {activeTab === 'custom_shops' && (
          <CustomShopsView
            language={language}
            customShops={customShops}
            onCreateNew={() => {
              setEditingShop(null);
              setShowBuilderModal(true);
            }}
            onEdit={(shop) => {
              setEditingShop(shop);
              setShowBuilderModal(true);
            }}
            onDelete={handleDeleteCustomShop}
            onSelectForReceipt={handleSelectCustomShop}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb-Zone Navigation Bar (<= 15% combined sticky height) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden pb-safe no-print"
      >
        <div className="grid h-16 grid-cols-4 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  isActive ? 'text-[#0F2942] font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate text-[10px] tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      {showBuilderModal && (
        <CustomShopBuilderModal
          language={language}
          initialShop={editingShop}
          onSave={handleSaveCustomShop}
          onClose={() => {
            setShowBuilderModal(false);
            setEditingShop(null);
          }}
        />
      )}

      {showProfileModal && (
        <ShopProfileModal
          language={language}
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
