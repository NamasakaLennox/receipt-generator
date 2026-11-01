import { Component } from '@angular/core';
import { ItemsEditor } from './components/items-editor/items-editor';
import { MessageInput } from './components/message-input/message-input';
import { PaymentForm } from './components/payment-form/payment-form';
import { ReceiptPreview } from './components/receipt-preview/receipt-preview';

@Component({
  selector: 'app-root',
  imports: [MessageInput, PaymentForm, ItemsEditor, ReceiptPreview],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
