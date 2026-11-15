import { jsPDF } from 'jspdf';
import { ReceiptRecord } from '../types/receipt';
import { UI_STRINGS } from '../data/i18n';

export function formatMoney(value: number, currency = 'Rs.'): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  const formatted = Number.isInteger(rounded)
    ? rounded.toLocaleString('en-US')
    : rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency} ${formatted}`;
}

export function buildWhatsAppText(receipt: ReceiptRecord): string {
  const isUr = receipt.language === 'ur';
  const currency = receipt.currencySymbol || 'Rs.';

  const lines: string[] = [];
  lines.push(`*${receipt.shopName}*`);
  if (receipt.shopTagline) lines.push(`_${receipt.shopTagline}_`);
  if (receipt.shopPhone) lines.push(`${isUr ? 'فون' : 'Tel'}: ${receipt.shopPhone}`);
  if (receipt.shopAddress) lines.push(`${receipt.shopAddress}`);
  lines.push('------------------------');
  lines.push(`*${receipt.docTitle}*`);
  lines.push(`${isUr ? 'رسید نمبر' : 'Receipt #'}: ${receipt.receiptNumber}`);
  lines.push(`${isUr ? 'تاریخ' : 'Date'}: ${receipt.date} ${receipt.time}`);
  lines.push(
    `${isUr ? 'گاہک' : 'Customer'}: ${receipt.customerName || (isUr ? 'نقد گاہک' : 'Walk-in Customer')}${
      receipt.customerPhone ? ` (${receipt.customerPhone})` : ''
    }`
  );

  // Custom fields
  for (const field of receipt.customFieldDefs) {
    const val = receipt.customFieldValues[field.id];
    if (val && val.trim()) {
      const label = isUr ? field.labelUr || field.labelEn : field.labelEn;
      lines.push(`${label}: ${val}`);
    }
  }

  lines.push('------------------------');
  for (const item of receipt.items) {
    const rowTotal = item.qty * item.rate;
    lines.push(`• ${item.name}`);
    lines.push(`  ${item.qty} x ${formatMoney(item.rate, currency)} = ${formatMoney(rowTotal, currency)}`);
  }
  lines.push('------------------------');
  lines.push(`${isUr ? 'مجموعی رقم' : 'Subtotal'}: ${formatMoney(receipt.subtotal, currency)}`);
  if (receipt.discountAmount > 0) {
    lines.push(`${isUr ? 'رعایت' : 'Discount'}: -${formatMoney(receipt.discountAmount, currency)}`);
  }
  if (receipt.taxAmount > 0) {
    lines.push(`${isUr ? 'ٹیکس' : 'Tax'} (${receipt.taxPercent}%): +${formatMoney(receipt.taxAmount, currency)}`);
  }
  lines.push(`*${isUr ? 'کل بل' : 'Grand Total'}: ${formatMoney(receipt.grandTotal, currency)}*`);
  lines.push(`${isUr ? 'وصول رقم' : 'Paid'}: ${formatMoney(receipt.amountPaid, currency)}`);

  if (receipt.balanceDue > 0) {
    lines.push(`*${isUr ? 'بقایا ادھار' : 'Balance Due (Udhaar)'}: ${formatMoney(receipt.balanceDue, currency)}*`);
  } else if (receipt.balanceDue < 0) {
    lines.push(`${isUr ? 'واپس بقایا' : 'Change Return'}: ${formatMoney(Math.abs(receipt.balanceDue), currency)}`);
  } else {
    lines.push(`${isUr ? 'حالت: مکمل ادا شدہ' : 'Status: Paid in Full'}`);
  }

  if (receipt.footerNote) {
    lines.push('------------------------');
    lines.push(receipt.footerNote);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(receipt: ReceiptRecord): string {
  const text = encodeURIComponent(buildWhatsAppText(receipt));
  const cleanedPhone = (receipt.customerPhone || '').replace(/[^\d]/g, '');
  if (cleanedPhone.length >= 10) {
    // Convert local 03XX to 923XX if needed while preserving international digits
    const normalized = cleanedPhone.startsWith('0') && cleanedPhone.length === 11
      ? `92${cleanedPhone.slice(1)}`
      : cleanedPhone;
    return `https://wa.me/${normalized}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderReceiptToCanvas(receipt: ReceiptRecord): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading timeout
    }
  }

  const isUr = receipt.language === 'ur';
  const t = UI_STRINGS[receipt.language];
  const currency = receipt.currencySymbol || 'Rs.';

  // Logical width by paper format (rendered at 2x DPI for sharp print/image)
  const scale = 2;
  const logicalWidth =
    receipt.paperFormat === '58mm' ? 380 : receipt.paperFormat === '80mm' ? 480 : 760;
  const padX = receipt.paperFormat === '58mm' ? 20 : receipt.paperFormat === '80mm' ? 26 : 44;
  const contentWidth = logicalWidth - padX * 2;
  const fontBody = isUr
    ? '"Noto Nastaliq Urdu", "DM Sans", sans-serif'
    : '"Plus Jakarta Sans", "DM Sans", sans-serif';
  const fontMono = '"JetBrains Mono", monospace';
  const lineStep = isUr ? 28 : 22;

  // Measure height dynamically first using an offscreen canvas
  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d')!;

  let logoImg: HTMLImageElement | null = null;
  if (receipt.shopLogoDataUrl) {
    logoImg = await loadImageElement(receipt.shopLogoDataUrl);
  }

  // Estimate height cleanly
  let y = 30;
  if (logoImg) y += 72;
  y += isUr ? 44 : 34; // Shop Name
  if (receipt.shopTagline) y += lineStep;
  if (receipt.shopPhone) y += lineStep;
  if (receipt.shopAddress) {
    mctx.font = `400 13px ${fontBody}`;
    y += wrapTextLines(mctx, receipt.shopAddress, contentWidth).length * lineStep;
  }
  y += 24; // divider + doc title banner
  y += 34;
  y += lineStep * 3; // Receipt No, Date, Customer

  const filledCustomFields = receipt.customFieldDefs.filter(
    (f) => receipt.customFieldValues[f.id]?.trim()
  );
  y += filledCustomFields.length * lineStep;
  if (filledCustomFields.length > 0) y += 12;

  y += 38; // Table header
  mctx.font = `500 13px ${fontBody}`;
  for (const item of receipt.items) {
    const nameLines = wrapTextLines(
      mctx,
      item.name || (isUr ? 'شے' : 'Item'),
      contentWidth * 0.48
    );
    y += Math.max(1, nameLines.length) * lineStep + 8;
  }

  y += 24; // divider
  y += lineStep; // Subtotal
  if (receipt.discountAmount > 0) y += lineStep;
  if (receipt.taxAmount > 0) y += lineStep;
  y += 42; // Grand Total box
  y += lineStep; // Amount Paid
  y += lineStep + 10; // Balance / Status

  if (receipt.footerNote) {
    mctx.font = `400 12px ${fontBody}`;
    const footerLines = wrapTextLines(mctx, receipt.footerNote, contentWidth);
    y += 22 + footerLines.length * lineStep;
  }
  y += 36; // Bottom padding

  const logicalHeight = Math.max(420, y);

  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Crisp paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Subtle top accent bar
  ctx.fillStyle = receipt.accentHex || '#0F2942';
  ctx.fillRect(0, 0, logicalWidth, 6);

  let curY = 28;
  const centerX = logicalWidth / 2;
  const startX = isUr ? logicalWidth - padX : padX;
  const endX = isUr ? padX : logicalWidth - padX;

  // Logo
  if (logoImg) {
    const maxLogoH = 56;
    const ratio = Math.min(maxLogoH / logoImg.height, 140 / logoImg.width);
    const lw = logoImg.width * ratio;
    const lh = logoImg.height * ratio;
    ctx.drawImage(logoImg, centerX - lw / 2, curY, lw, lh);
    curY += lh + 14;
  }

  // Shop Header
  ctx.textAlign = 'center';
  ctx.direction = isUr ? 'rtl' : 'ltr';
  ctx.fillStyle = '#0F172A';
  ctx.font = `700 ${receipt.paperFormat === '58mm' ? 18 : 22}px ${fontBody}`;
  ctx.fillText(receipt.shopName, centerX, curY);
  curY += isUr ? 34 : 26;

  if (receipt.shopTagline) {
    ctx.fillStyle = '#475569';
    ctx.font = `400 13px ${fontBody}`;
    ctx.fillText(receipt.shopTagline, centerX, curY);
    curY += lineStep;
  }

  if (receipt.shopPhone) {
    ctx.fillStyle = '#334155';
    ctx.font = `500 12px ${fontMono}`;
    ctx.direction = 'ltr';
    ctx.fillText(receipt.shopPhone, centerX, curY);
    curY += lineStep;
  }

  if (receipt.shopAddress) {
    ctx.fillStyle = '#475569';
    ctx.font = `400 12px ${fontBody}`;
    ctx.direction = isUr ? 'rtl' : 'ltr';
    const addrLines = wrapTextLines(ctx, receipt.shopAddress, contentWidth);
    for (const ln of addrLines) {
      ctx.fillText(ln, centerX, curY);
      curY += lineStep;
    }
  }

  curY += 6;

  // Doc Title Strip
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(padX, curY, contentWidth, 30);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(padX, curY, contentWidth, 30);
  ctx.fillStyle = receipt.accentHex || '#0F2942';
  ctx.font = `700 13px ${fontBody}`;
  ctx.textAlign = 'center';
  ctx.direction = isUr ? 'rtl' : 'ltr';
  ctx.fillText(receipt.docTitle, centerX, curY + 20);
  curY += 46;

  // Helper for two-sided row
  const drawPair = (label: string, value: string, boldVal = false, valueColor = '#0F172A', monoVal = false) => {
    ctx.textAlign = isUr ? 'right' : 'left';
    ctx.direction = isUr ? 'rtl' : 'ltr';
    ctx.fillStyle = '#475569';
    ctx.font = `400 12px ${fontBody}`;
    ctx.fillText(label, startX, curY);

    ctx.textAlign = isUr ? 'left' : 'right';
    ctx.direction = monoVal ? 'ltr' : isUr ? 'rtl' : 'ltr';
    ctx.fillStyle = valueColor;
    ctx.font = `${boldVal ? '700' : '600'} 12px ${monoVal ? fontMono : fontBody}`;
    ctx.fillText(value, endX, curY);
    curY += lineStep;
  };

  drawPair(t.receiptNoLabel, receipt.receiptNumber, true, '#0F172A', true);
  drawPair(t.dateLabel, `${receipt.date} · ${receipt.time}`, false, '#334155', true);
  drawPair(
    t.customerNameLabel,
    `${receipt.customerName || t.customerWalkIn}${receipt.customerPhone ? ` (${receipt.customerPhone})` : ''}`,
    true
  );

  for (const field of filledCustomFields) {
    const label = isUr ? field.labelUr || field.labelEn : field.labelEn;
    drawPair(label, receipt.customFieldValues[field.id], false);
  }

  if (filledCustomFields.length > 0) curY += 6;

  // Dashed divider
  const drawDashedLine = () => {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(padX, curY);
    ctx.lineTo(logicalWidth - padX, curY);
    ctx.stroke();
    ctx.restore();
    curY += 16;
  };

  drawDashedLine();

  // Table Header
  const colItemX = startX;
  const colQtyX = isUr ? padX + contentWidth * 0.44 : padX + contentWidth * 0.56;
  const colRateX = isUr ? padX + contentWidth * 0.25 : padX + contentWidth * 0.76;
  const colTotalX = endX;

  ctx.fillStyle = '#334155';
  ctx.font = `700 11px ${fontBody}`;
  ctx.direction = isUr ? 'rtl' : 'ltr';
  ctx.textAlign = isUr ? 'right' : 'left';
  ctx.fillText(t.itemNameCol, colItemX, curY);
  ctx.textAlign = 'center';
  ctx.fillText(t.qtyCol, colQtyX, curY);
  ctx.fillText(t.rateCol, colRateX, curY);
  ctx.textAlign = isUr ? 'left' : 'right';
  ctx.fillText(t.totalCol, colTotalX, curY);
  curY += 10;

  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(logicalWidth - padX, curY);
  ctx.stroke();
  curY += 18;

  // Items
  for (const item of receipt.items) {
    const rowTotal = item.qty * item.rate;
    ctx.fillStyle = '#0F172A';
    ctx.font = `500 12px ${fontBody}`;
    ctx.direction = isUr ? 'rtl' : 'ltr';
    const nameLines = wrapTextLines(
      ctx,
      item.name || (isUr ? 'شے' : 'Item'),
      contentWidth * 0.46
    );
    nameLines.forEach((line, idx) => {
      ctx.textAlign = isUr ? 'right' : 'left';
      ctx.fillText(line, colItemX, curY + idx * lineStep);
    });

    ctx.font = `500 12px ${fontMono}`;
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    ctx.fillText(String(item.qty), colQtyX, curY);
    ctx.fillText(String(item.rate), colRateX, curY);

    ctx.textAlign = isUr ? 'left' : 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = `600 12px ${fontMono}`;
    ctx.fillText(formatMoney(rowTotal, currency), colTotalX, curY);

    curY += Math.max(1, nameLines.length) * lineStep + 6;
  }

  curY += 4;
  drawDashedLine();

  // Totals
  drawPair(t.subtotalLabel, formatMoney(receipt.subtotal, currency), false, '#334155', true);
  if (receipt.discountAmount > 0) {
    drawPair(
      `${t.discountLabel}${receipt.discountType === 'percent' ? ` (${receipt.discountValue}%)` : ''}`,
      `-${formatMoney(receipt.discountAmount, currency)}`,
      false,
      '#B45309',
      true
    );
  }
  if (receipt.taxAmount > 0) {
    drawPair(
      `${t.taxLabel} (${receipt.taxPercent}%)`,
      `+${formatMoney(receipt.taxAmount, currency)}`,
      false,
      '#334155',
      true
    );
  }

  // Grand Total Box
  curY += 4;
  ctx.fillStyle = receipt.accentHex || '#0F2942';
  ctx.fillRect(padX, curY - 16, contentWidth, 34);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = isUr ? 'right' : 'left';
  ctx.direction = isUr ? 'rtl' : 'ltr';
  ctx.font = `700 14px ${fontBody}`;
  ctx.fillText(t.grandTotalLabel, isUr ? endX + contentWidth - 12 : padX + 12, curY + 6);

  ctx.textAlign = isUr ? 'left' : 'right';
  ctx.direction = 'ltr';
  ctx.font = `700 15px ${fontMono}`;
  ctx.fillText(formatMoney(receipt.grandTotal, currency), isUr ? padX + 12 : endX - 12, curY + 6);
  curY += 34;

  drawPair(t.amountPaidLabel, formatMoney(receipt.amountPaid, currency), true, '#059669', true);

  if (receipt.balanceDue > 0) {
    drawPair(t.balanceUdhaarLabel, formatMoney(receipt.balanceDue, currency), true, '#DC2626', true);
  } else if (receipt.balanceDue < 0) {
    drawPair(t.changeReturnLabel, formatMoney(Math.abs(receipt.balanceDue), currency), true, '#0F2942', true);
  } else {
    drawPair(t.paidInFullLabel, formatMoney(0, currency), true, '#059669', true);
  }

  // Footer
  if (receipt.footerNote) {
    curY += 8;
    drawDashedLine();
    ctx.fillStyle = '#475569';
    ctx.font = `400 12px ${fontBody}`;
    ctx.textAlign = 'center';
    ctx.direction = isUr ? 'rtl' : 'ltr';
    const footerLines = wrapTextLines(ctx, receipt.footerNote, contentWidth);
    for (const ln of footerLines) {
      ctx.fillText(ln, centerX, curY);
      curY += lineStep;
    }
  }

  return canvas;
}

export async function downloadReceiptPng(receipt: ReceiptRecord): Promise<void> {
  const canvas = await renderReceiptToCanvas(receipt);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${receipt.receiptNumber || 'receipt'}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareReceiptImageNative(receipt: ReceiptRecord): Promise<boolean> {
  const canvas = await renderReceiptToCanvas(receipt);
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) return false;

  const file = new File([blob], `${receipt.receiptNumber || 'receipt'}.png`, {
    type: 'image/png',
  });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `${receipt.shopName} - ${receipt.receiptNumber}`,
        text: buildWhatsAppText(receipt),
        files: [file],
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function downloadReceiptPdf(receipt: ReceiptRecord): Promise<void> {
  const canvas = await renderReceiptToCanvas(receipt);
  const imgData = canvas.toDataURL('image/png');

  const aspect = canvas.height / canvas.width;

  if (receipt.paperFormat === 'a4') {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 10;
    let drawW = pageW - margin * 2;
    let drawH = drawW * aspect;
    if (drawH > 277) {
      drawH = 277;
      drawW = drawH / aspect;
    }
    const xOffset = (pageW - drawW) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, 10, drawW, drawH);
    pdf.save(`${receipt.receiptNumber || 'receipt'}-A4.pdf`);
  } else {
    const widthMm = receipt.paperFormat === '58mm' ? 58 : 80;
    const heightMm = Math.max(100, Math.ceil(widthMm * aspect) + 4);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
    });
    pdf.addImage(imgData, 'PNG', 0, 2, widthMm, widthMm * aspect);
    pdf.save(`${receipt.receiptNumber || 'receipt'}-${receipt.paperFormat}.pdf`);
  }
}
