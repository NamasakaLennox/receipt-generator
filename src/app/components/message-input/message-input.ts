import { Component, inject } from '@angular/core';
import { ReceiptStateService } from '../../services/receipt-state.service';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.html',
  styleUrl: './message-input.scss',
})
export class MessageInput {
  protected readonly state = inject(ReceiptStateService);
  protected readonly maxLength = 500;
}
