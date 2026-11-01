import { BusinessDetails } from '../models/receipt';

/**
 * Persistence boundary. The app uses LocalReceiptStorage today; a backend
 * implementation (e.g. HttpReceiptStorage) can be swapped in via app.config.ts.
 */
export abstract class ReceiptStorage {
  abstract getBusiness(): Promise<BusinessDetails>;
  abstract saveBusiness(details: BusinessDetails): Promise<void>;
  /** The number the next receipt will get, without consuming it. */
  abstract peekReceiptNumber(): Promise<number>;
  /** Consumes and returns the next receipt number. */
  abstract nextReceiptNumber(): Promise<number>;
}
