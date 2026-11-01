import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BusinessDetails, DEFAULT_BUSINESS } from '../../models/receipt';
import { ReceiptStateService } from '../../services/receipt-state.service';

@Component({
  selector: 'app-business-details-dialog',
  imports: [FormsModule],
  templateUrl: './business-details-dialog.html',
  styleUrl: './business-details-dialog.scss',
})
export class BusinessDetailsDialog {
  private readonly state = inject(ReceiptStateService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly draft = signal<BusinessDetails>({ ...DEFAULT_BUSINESS });

  open(): void {
    this.draft.set({ ...this.state.business() });
    this.dialog().nativeElement.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected update<K extends keyof BusinessDetails>(key: K, value: BusinessDetails[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected async save(): Promise<void> {
    await this.state.saveBusiness(this.draft());
    this.close();
  }
}
