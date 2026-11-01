import { Injectable } from '@angular/core';
import { BusinessDetails, DEFAULT_BUSINESS } from '../models/receipt';
import { ReceiptStorage } from './receipt-storage';

const BUSINESS_KEY = 'receipt-generator.business';
const COUNTER_KEY = 'receipt-generator.counter';

@Injectable()
export class LocalReceiptStorage extends ReceiptStorage {
  async getBusiness(): Promise<BusinessDetails> {
    try {
      const raw = localStorage.getItem(BUSINESS_KEY);
      return raw ? { ...DEFAULT_BUSINESS, ...JSON.parse(raw) } : { ...DEFAULT_BUSINESS };
    } catch {
      return { ...DEFAULT_BUSINESS };
    }
  }

  async saveBusiness(details: BusinessDetails): Promise<void> {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(details));
  }

  async peekReceiptNumber(): Promise<number> {
    return Number(localStorage.getItem(COUNTER_KEY) ?? '0') + 1;
  }

  async nextReceiptNumber(): Promise<number> {
    const next = await this.peekReceiptNumber();
    localStorage.setItem(COUNTER_KEY, String(next));
    return next;
  }
}
