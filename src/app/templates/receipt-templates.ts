import { Type } from '@angular/core';
import { SimpleReceipt } from './simple/simple-receipt';

export interface ReceiptTemplate {
  id: string;
  label: string;
  /** Component that takes a `view: ReceiptView` input. */
  component: Type<unknown>;
}

/** Available receipt layouts. Add new templates here. */
export const RECEIPT_TEMPLATES: readonly ReceiptTemplate[] = [
  { id: 'simple', label: 'Simple', component: SimpleReceipt },
];
