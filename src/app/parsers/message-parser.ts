import { ParsedPayment } from '../models/payment';

/**
 * A parser for one message format (one bank / mobile-money provider).
 * To support a new provider, implement this interface and add it to PARSERS
 * in parser-registry.ts.
 */
export interface MessageParser {
  /** Stable id, stored on ParsedPayment.source. */
  id: string;
  /** Shown as the payment method on the receipt. */
  label: string;
  /** Label for the main transaction reference. */
  refLabel: string;
  /** Label for the secondary reference, if the provider has one. */
  secondaryRefLabel?: string;
  /** Example messages used by "Try a sample" and in tests. */
  samples: string[];
  /** Cheap check: does this text look like it came from this provider? */
  canParse(text: string): boolean;
  /** Extracts the payment, or returns null if the text can't be read. */
  parse(text: string): ParsedPayment | null;
}
