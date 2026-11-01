export type PaymentDirection = 'received' | 'sent';

/** Normalised payment details extracted from a bank / mobile-money message. */
export interface ParsedPayment {
  /** Id of the parser (source) that produced this payment, e.g. 'mpesa'. */
  source: string;
  direction: PaymentDirection;
  transactionId: string;
  /** Optional second reference, e.g. the M-PESA ref on a bank-to-M-PESA transfer. */
  secondaryRef?: string;
  amount: number;
  currency: 'KES';
  counterpartyName?: string;
  counterpartyPhone?: string;
  /** Paybill account number, e.g. a KPLC meter number. */
  account?: string;
  dateTime?: Date;
  /** Free-text note attached to the payment, e.g. "Rent & Water HD2". */
  narration?: string;
  /** Total fees charged for the transaction. */
  charges?: number;
}
