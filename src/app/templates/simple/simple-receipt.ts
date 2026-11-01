import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ReceiptView } from '../../models/receipt';

@Component({
  selector: 'app-simple-receipt',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './simple-receipt.html',
  styleUrl: './simple-receipt.scss',
})
export class SimpleReceipt {
  readonly view = input.required<ReceiptView>();
}
