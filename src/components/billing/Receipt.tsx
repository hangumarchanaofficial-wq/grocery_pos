// src/components/billing/Receipt.tsx
// ============================================================
// Receipt — Exact format matching Samaranayake invoice style
// Supports English & Sinhala, thermal 80mm print layout
// ============================================================

'use client';

import { forwardRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { t } from '@/lib/i18n';
import type { AppLanguage } from '@/store/settingsStore';

export interface ReceiptBill {
  billNumber: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  customer?: { name: string; phone: string } | null;
  user: { name: string };
  items: {
    quantity: number;
    price: number;
    unitPrice?: number; // buying/cost price for savings display
    total: number;
    product: { name: string; productCode?: string };
  }[];
}

interface ReceiptProps {
  bill: ReceiptBill;
  forceLang?: AppLanguage;
}

// Pad left helper for table alignment
function padL(str: string, len: number): string {
  return str.padStart(len, ' ');
}
function padR(str: string, len: number): string {
  return str.padEnd(len, ' ');
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ bill, forceLang }, ref) => {
  const { settings } = useSettingsStore();
  const lang = forceLang ?? settings.language;
  const tr = (key: Parameters<typeof t>[1]) => t(lang, key);

  const storeNameLines =
    lang === 'si'
      ? settings.storeNameSi.split('\n')
      : settings.storeName.split('\n');

  const address = lang === 'si' ? settings.addressSi : settings.address;
  const footer = lang === 'si' ? settings.receiptFooterSi : settings.receiptFooter;

  // Format invoice number like: PA0112603300076
  const invNo = bill.billNumber;

  // Format date like: 2026-03-30   13:07:25.
  const dateObj = bill.createdAt ? new Date(bill.createdAt) : new Date();
  const validDate = Number.isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const dateStr = validDate.toISOString().slice(0, 10);
  const timeStr = validDate.toTimeString().slice(0, 8) + '.';

  // Total savings = sum of (unitPrice - price) * qty across items
  const totalSavings = bill.items.reduce((acc, item) => {
    if (item.unitPrice && item.unitPrice > item.price) {
      return acc + (item.unitPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  const LINE = '─'.repeat(42);
  const DLINE = '═'.repeat(42);

  return (
    <>
      {/* ─── Print-only CSS injected inline ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap');
        
        .receipt-root {
          font-family: ${lang === 'si'
            ? "'Noto Sans Sinhala', 'Iskoola Pota', monospace"
            : "'Courier New', 'Courier', monospace"};
          font-size: 12px;
          line-height: 1.5;
          color: #000;
          background: #fff;
          width: 302px; /* 80mm thermal */
          margin: 0 auto;
          padding: 8px 6px;
        }
        .receipt-center { text-align: center; }
        .receipt-bold   { font-weight: 700; }
        .receipt-large  { font-size: 15px; }
        .receipt-xlarge { font-size: 18px; }
        .receipt-row    { display: flex; justify-content: space-between; }
        .receipt-divider{ border-top: 1px dashed #000; margin: 4px 0; }
        .receipt-divider-solid { border-top: 1px solid #000; margin: 4px 0; }
        .receipt-item-name { font-weight: 700; font-size: 11px; }
        .receipt-table-header {
          display: grid;
          grid-template-columns: 55px 1fr 60px 55px 60px;
          font-weight: 700;
          font-size: 10px;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .receipt-table-row {
          display: grid;
          grid-template-columns: 55px 1fr 60px 55px 60px;
          font-size: 11px;
          align-items: start;
        }
        .receipt-table-row-item {
          grid-column: 1 / -1;
          font-weight: 700;
          font-size: 11px;
          padding-bottom: 1px;
        }
        .receipt-table-values {
          display: grid;
          grid-template-columns: 55px 60px 55px 60px;
          font-size: 11px;
          padding-left: 55px;
          gap: 0;
        }
        .receipt-right  { text-align: right; }
        .receipt-savings {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          margin: 4px 0;
          border: 1px solid #000;
          padding: 4px;
        }
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body * { visibility: hidden !important; }
          .print-receipt, .print-receipt * { visibility: visible !important; }
          .print-receipt { position: fixed; top: 0; left: 0; width: 80mm; }
          .receipt-root { width: 100%; }
        }
      `}</style>

      <div ref={ref} className="receipt-root print-receipt">

        {/* ══ STORE HEADER ══ */}
        <div className="receipt-center">
          {storeNameLines.map((line, i) => (
            <div key={i} className={`receipt-bold ${i === 0 ? 'receipt-large' : ''}`}>
              {line}
            </div>
          ))}
          <div style={{ marginTop: 4 }}>{address}</div>
          <div>{settings.phone}</div>
        </div>

        <div className="receipt-divider" style={{ margin: '6px 0' }} />

        {/* ══ INVOICE TITLE ══ */}
        <div className="receipt-center receipt-bold" style={{ fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>
          {tr('invoice')}
        </div>

        {/* ══ BILL META ══ */}
        <div style={{ marginBottom: 4 }}>
          <div className="receipt-row">
            <span>{tr('invNo')}</span>
            <span style={{ fontWeight: 700, letterSpacing: 0.5 }}>: {invNo}</span>
          </div>
          <div className="receipt-row">
            <span>{tr('date')}</span>
            <span>: {dateStr}&nbsp;&nbsp;{timeStr}</span>
          </div>
          <div className="receipt-row">
            <span>{tr('terminal')}</span>
            <span>: {settings.terminalId}</span>
          </div>
          <div className="receipt-row">
            <span>{tr('cashier')}</span>
            <span>: {bill.user.name}</span>
          </div>
          <div className="receipt-row">
            <span>{tr('customer')}</span>
            <span>: {bill.customer?.name ?? tr('posCustomer')}</span>
          </div>
        </div>

        <div className="receipt-divider-solid" />

        {/* ══ ITEMS TABLE HEADER ══ */}
        <div className="receipt-table-header">
          <span>Code</span>
          <span>{tr('description')}</span>
          <span className="receipt-right">{tr('unitPrice')}</span>
          <span className="receipt-right">{tr('netPrice')}</span>
          <span className="receipt-right">{tr('amount')}</span>
        </div>

        {/* ══ ITEMS ══ */}
        {bill.items.map((item, i) => {
          const code = item.product.productCode ?? `PC${String(i + 1).padStart(4, '0')}`;
          const unitPrice = item.price;
          const netPrice = item.price; // after discount per unit if any
          const lineTotal = item.total;
          return (
            <div key={i} style={{ marginBottom: 3 }}>
              {/* Product Code + Name */}
              <div style={{ fontWeight: 700, fontSize: 11 }}>
                {code}&nbsp;&nbsp;{item.product.name}
              </div>
              {/* Qty + prices row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 60px 55px 62px',
                fontSize: 11,
                paddingLeft: 8
              }}>
                <span>{item.quantity}</span>
                <span />
                <span className="receipt-right">{unitPrice.toFixed(2)}</span>
                <span className="receipt-right">{netPrice.toFixed(2)}</span>
                <span className="receipt-right">{lineTotal.toFixed(2)}</span>
              </div>
            </div>
          );
        })}

        <div className="receipt-divider-solid" />

        {/* ══ TOTAL AMOUNT ══ */}
        <div className="receipt-row receipt-bold" style={{ fontSize: 13, margin: '4px 0' }}>
          <span>{tr('totalAmount')}</span>
          <span>{bill.total.toFixed(2)}</span>
        </div>

        {/* ══ PAYMENT METHOD ══ */}
        {bill.paymentMethod === 'CASH' && (
          <>
            <div className="receipt-row">
              <span style={{ fontWeight: 700 }}>CASH</span>
              <span style={{ fontWeight: 700 }}>{bill.paidAmount.toFixed(2)}</span>
            </div>
            {bill.changeAmount > 0 && (
              <div className="receipt-row">
                <span>{tr('balance')}</span>
                <span style={{ fontWeight: 700 }}>{bill.changeAmount.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {(bill.paymentMethod === 'CARD' || bill.paymentMethod === 'VISA') && (
          <div className="receipt-row">
            <span style={{ fontWeight: 700 }}>
              VISA {bill.paidAmount > 0 ? String(bill.paidAmount).slice(-4).padStart(10, '*') : ''}
            </span>
            <span style={{ fontWeight: 700 }}>{bill.total.toFixed(2)}</span>
          </div>
        )}

        {bill.paymentMethod === 'QR' && (
          <div className="receipt-row">
            <span style={{ fontWeight: 700 }}>QR PAY</span>
            <span style={{ fontWeight: 700 }}>{bill.total.toFixed(2)}</span>
          </div>
        )}

        {/* ══ BALANCE (ALWAYS) ══ */}
        {bill.paymentMethod !== 'CASH' && (
          <div className="receipt-row receipt-bold">
            <span>{tr('balance')}</span>
            <span>{bill.changeAmount > 0 ? '0.00' : bill.changeAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="receipt-divider" />

        {/* ══ ITEM COUNT + END TIME ══ */}
        <div className="receipt-row" style={{ fontSize: 11 }}>
          <span>{tr('itemCount')}</span>
          <span style={{ fontWeight: 700 }}>
            {bill.items.reduce((s, i) => s + i.quantity, 0)}
          </span>
        </div>
        <div className="receipt-row" style={{ fontSize: 11 }}>
          <span>{tr('endTime')}</span>
          <span>{new Date().toTimeString().slice(0, 10)}</span>
        </div>

        {/* ══ SAVINGS BOX ══ */}
        {settings.showSavingsOnReceipt && totalSavings > 0 && (
          <div className="receipt-savings" style={{ marginTop: 6 }}>
            <div style={{ fontSize: 11, marginBottom: 2 }}>
              {lang === 'si' ? 'ඔබ ඉතිරි කළා' : 'You Saved'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>
              {totalSavings.toFixed(2)}
            </div>
          </div>
        )}

        <div className="receipt-divider" style={{ marginTop: 6 }} />

        {/* ══ FOOTER ══ */}
        <div className="receipt-center" style={{ marginTop: 6, fontSize: 11 }}>
          <div>{footer}</div>
          {lang === 'en' && (
            <div style={{ fontFamily: "'Noto Sans Sinhala', sans-serif", marginTop: 2, fontSize: 10 }}>
              {settings.receiptFooterSi}
            </div>
          )}
        </div>

        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 9, color: '#555' }}>
          software by supervision (www.serp.lk)
        </div>
      </div>
    </>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;
