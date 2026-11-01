import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReceiptStateService } from '../../services/receipt-state.service';

@Component({
  selector: 'app-items-editor',
  imports: [DecimalPipe],
  templateUrl: './items-editor.html',
  styleUrl: './items-editor.scss',
})
export class ItemsEditor {
  protected readonly state = inject(ReceiptStateService);

  protected setQty(id: number, value: string): void {
    this.state.updateItem(id, { qty: Math.max(0, parseInt(value, 10) || 0) });
  }

  protected setPrice(id: number, value: string): void {
    const n = parseFloat(value);
    this.state.updateItem(id, { price: value === '' || isNaN(n) ? null : n });
  }
}
