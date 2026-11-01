import type { PaymentMethod } from './types';

/** 75000 -> "Rp 75.000" (sama dengan format di web) */
export function formatRupiah(value: number | null | undefined): string {
  const n = Math.round(Number(value) || 0);
  const digits = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${n < 0 ? '-' : ''}${digits}`;
}

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** "2026-11-01T10:20:00Z" -> "1 November 2026" */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** "2026-11-01T10:20:00Z" -> "1 November 2026, 17.20" */
export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)}, ${hh}.${mm}`;
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  transfer_bank: 'Transfer Bank',
  e_wallet: 'E-Wallet',
};
