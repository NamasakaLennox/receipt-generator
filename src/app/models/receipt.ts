import { PaymentDirection } from './payment';

export interface ReceiptItem {
  id: number;
  description: string;
  qty: number;
  price: number | null;
}

export interface BusinessDetails {
  name: string;
  tagline: string;
  location: string;
  phone: string;
  thankYouNote: string;
  footer: string;
}

export const DEFAULT_BUSINESS: BusinessDetails = {
  name: 'My Business',
  tagline: 'Quality you can trust',
  location: 'Nairobi, Kenya',
  phone: '',
  thankYouNote: 'Thank you for your support!',
  footer: 'Karibu Tena!',
};

/** Everything a receipt template needs to render. */
export interface ReceiptView {
  receiptNumber: string;
  business: BusinessDetails;
  sourceLabel: string;
  refLabel: string;
  secondaryRefLabel?: string;
  direction: PaymentDirection;
  transactionId: string;
  secondaryRef: string;
  counterpartyName: string;
  counterpartyPhone: string;
  account: string;
  dateTime: Date | null;
  items: { description: string; qty: number; price: number; lineTotal: number }[];
  total: number;
}
