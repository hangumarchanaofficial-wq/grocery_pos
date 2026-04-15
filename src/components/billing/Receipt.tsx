'use client';

import { forwardRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
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
    unitPrice?: number;
    total: number;
    product: { name: string; productCode?: string };
  }[];
}

interface ReceiptProps {
  bill: ReceiptBill;
  forceLang?: AppLanguage;
}

function amount(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function paymentLabel(method: string): string {
  if (method === 'CASH') return 'CASH';
  if (method === 'CARD' || method === 'VISA') return 'VISA';
  if (method === 'QR') return 'QR PAY';
  return method || 'PAYMENT';
}

function safeDate(input: string): Date {
  const d = input ? new Date(input) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ bill, forceLang }, ref) => {
  const { settings } = useSettingsStore();
  const lang = forceLang ?? settings.language;

  const storeNameLines = (lang === 'si' ? settings.storeNameSi : settings.storeName)
    .split('\n')
    .filter(Boolean);
  const created = safeDate(bill.createdAt);
  const dateStr = created.toISOString().slice(0, 10);
  const timeStr = created.toTimeString().slice(0, 8);
  const endTime = `${timeStr}.0`;

  const lineCount = bill.items.length;
  const savings = bill.items.reduce((sum, item) => {
    const refPrice = item.unitPrice ?? item.price;
    const diff = refPrice - item.price;
    return diff > 0 ? sum + diff * item.quantity : sum;
  }, 0);

  const paymentText = paymentLabel(bill.paymentMethod);
  const paidValue = bill.paymentMethod === 'CASH' ? bill.paidAmount : bill.total;
  const balanceValue = bill.paymentMethod === 'CASH' ? Math.max(0, bill.changeAmount) : 0;

  return (
    <div ref={ref}>
      <style>{`
        .receipt-root {
          font-family: ${lang === 'si'
            ? "var(--font-sinhala), 'Iskoola Pota', monospace"
            : "'Courier New', Courier, monospace"};
          width: 300px;
          margin: 0 auto;
          padding: 6px 6px;
          background: #fff;
          color: #000;
          font-size: 11px;
          line-height: 1.2;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .r-center { text-align: center; }
        .r-bold { font-weight: 700; }
        .r-row { display: flex; justify-content: space-between; gap: 8px; }
        .r-divider { border-top: 1px solid #111; margin: 4px 0; }
        .r-meta { margin-top: 6px; }
        .r-meta .r-row { margin: 1px 0; }
        .r-col-head {
          display: grid;
          grid-template-columns: 56px 1fr 58px 58px 64px;
          font-size: 9px;
          font-weight: 700;
          border-top: 1px solid #111;
          border-bottom: 1px solid #111;
          padding: 2px 0;
          margin: 4px 0 2px;
        }
        .r-item-name {
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .r-item-values {
          display: grid;
          grid-template-columns: 28px 1fr 58px 58px 64px;
          align-items: baseline;
          font-size: 10px;
          margin: 0 0 1px;
        }
        .r-right { text-align: right; }
        .r-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 12px;
          font-weight: 700;
          margin: 4px 0;
        }
        .r-balance {
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }
        .r-saving-title {
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          margin-top: 4px;
        }
        .r-saving-amount {
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          line-height: 1;
          margin-top: 1px;
        }
        .r-footnote { text-align: center; font-size: 11px; margin-top: 8px; }
        .r-software { text-align: center; color: #555; font-size: 9px; margin-top: 8px; }

        @media print {
          @page { margin: 0; size: 80mm auto; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            background: #fff !important;
          }
          body * { visibility: hidden !important; }
          .print-receipt, .print-receipt * { visibility: visible !important; }
          .print-receipt {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 80mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            box-sizing: border-box;
            overflow: visible !important;
            transform: none !important;
            max-height: none !important;
            height: auto !important;
          }
          .receipt-root {
            width: 80mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            box-sizing: border-box;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
        }
      `}</style>

      <div className="receipt-root print-receipt">
        <div className="r-center r-bold" style={{ letterSpacing: 1, fontSize: 16, lineHeight: 1.1 }}>
          {storeNameLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div className="r-center" style={{ marginTop: 6 }}>
          <div>{settings.address}</div>
          <div>{settings.phone}</div>
        </div>

        <div className="r-center r-bold" style={{ marginTop: 6, fontSize: 18, letterSpacing: 1.2 }}>
          INVOICE
        </div>

        <div className="r-meta">
          <div className="r-row"><span>Inv No</span><span>: {bill.billNumber}</span></div>
          <div className="r-row"><span>Date</span><span>: {dateStr}     {timeStr}</span></div>
          <div className="r-row"><span>Terminal</span><span>: {settings.terminalId}</span></div>
          <div className="r-row"><span>Cashier</span><span>: {bill.user.name}</span></div>
          <div className="r-row"><span>Customer</span><span>: {bill.customer?.name || 'POS CUSTOMER'}</span></div>
        </div>

        <div className="r-col-head">
          <span>{lang === 'si' ? '????' : 'Code'}</span>
          <span>{lang === 'si' ? '????? ??' : 'Description'}</span>
          <span className="r-right">{lang === 'si' ? '??? ???' : 'Unit'}</span>
          <span className="r-right">{lang === 'si' ? '????? ???' : 'Net'}</span>
          <span className="r-right">{lang === 'si' ? '???????' : 'Amount'}</span>
        </div>

        {bill.items.map((item, idx) => {
          const code = item.product.productCode || `PC${String(idx + 1).padStart(4, '0')}`;
          const unit = item.unitPrice ?? item.price;
          const net = item.price;
          return (
            <div key={`${code}-${idx}`}>
              <div className="r-item-name">{code} {item.product.name}</div>
              <div className="r-item-values">
                <span>{item.quantity}</span>
                <span />
                <span className="r-right">{amount(unit)}</span>
                <span className="r-right">{amount(net)}</span>
                <span className="r-right">{amount(item.total)}</span>
              </div>
            </div>
          );
        })}

        <div className="r-divider" />

        <div className="r-total">
          <span>****TOTAL AMOUNT****</span>
          <span>{amount(bill.total)}</span>
        </div>

        <div className="r-row">
          <span className="r-bold">{paymentText}</span>
          <span className="r-bold">{amount(paidValue)}</span>
        </div>

        <div className="r-row" style={{ marginTop: 1 }}>
          <span className="r-bold" style={{ fontSize: 14 }}>BALANCE</span>
          <span className="r-balance">{amount(balanceValue)}</span>
        </div>

        <div className="r-row" style={{ marginTop: 4 }}>
          <span className="r-bold">Item Count</span>
          <span>{lineCount}</span>
        </div>
        <div className="r-row">
          <span className="r-bold">End Time</span>
          <span>{endTime}</span>
        </div>

        <div className="r-divider" style={{ marginTop: 4 }} />

        {settings.showSavingsOnReceipt && savings > 0 && (
          <>
            <div className="r-saving-title">?? ???? ????</div>
            <div className="r-saving-amount">{amount(savings)}</div>
          </>
        )}

        <div className="r-footnote">{settings.receiptFooter}</div>
        <div className="r-footnote" style={{ fontSize: 10 }}>{settings.receiptFooterSi}</div>

        <div className="r-software">software by supervision (www.serp.lk)</div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;
