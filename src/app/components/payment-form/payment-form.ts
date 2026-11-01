import { Component, inject } from '@angular/core';
import { ReceiptStateService } from '../../services/receipt-state.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss',
})
export class PaymentForm {
  protected readonly state = inject(ReceiptStateService);

  protected setAmount(value: string): void {
    const n = parseFloat(value);
    this.state.amount.set(value === '' || isNaN(n) ? null : n);
  }
}
