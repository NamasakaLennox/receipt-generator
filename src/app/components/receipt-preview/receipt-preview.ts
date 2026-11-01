import { NgComponentOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ExportService } from '../../services/export.service';
import { ReceiptStateService } from '../../services/receipt-state.service';
import { RECEIPT_TEMPLATES } from '../../templates/receipt-templates';
import { BusinessDetailsDialog } from '../business-details-dialog/business-details-dialog';

@Component({
  selector: 'app-receipt-preview',
  imports: [NgComponentOutlet, BusinessDetailsDialog],
  templateUrl: './receipt-preview.html',
  styleUrl: './receipt-preview.scss',
  host: { '(document:click)': 'menuOpen.set(false)' },
})
export class ReceiptPreview {
  protected readonly state = inject(ReceiptStateService);
  private readonly exporter = inject(ExportService);

  protected readonly templates = RECEIPT_TEMPLATES;
  protected readonly templateId = signal(RECEIPT_TEMPLATES[0].id);
  protected readonly template = computed(
    () => this.templates.find((t) => t.id === this.templateId()) ?? this.templates[0],
  );

  protected readonly menuOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly notice = signal('');

  private readonly paper = viewChild.required<ElementRef<HTMLElement>>('paper');
  private readonly dialog = viewChild.required(BusinessDetailsDialog);

  protected cycleTemplate(): void {
    const i = this.templates.findIndex((t) => t.id === this.templateId());
    this.templateId.set(this.templates[(i + 1) % this.templates.length].id);
  }

  protected editBusiness(): void {
    this.dialog().open();
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  private fileName(): string {
    return `receipt-${this.state.view().receiptNumber}`;
  }

  protected async download(format: 'pdf' | 'png'): Promise<void> {
    this.menuOpen.set(false);
    await this.run(async () => {
      const el = this.paper().nativeElement;
      if (format === 'pdf') await this.exporter.downloadPdf(el, this.fileName());
      else await this.exporter.downloadPng(el, this.fileName());
      this.flash(`Saved ${this.fileName()}.${format}`);
      await this.state.commitReceiptNumber();
    });
  }

  protected async share(): Promise<void> {
    await this.run(async () => {
      const result = await this.exporter.share(
        this.paper().nativeElement,
        this.fileName(),
        `Receipt ${this.state.view().receiptNumber}`,
      );
      if (result === 'downloaded') this.flash('Sharing isn’t supported here, so the image was downloaded instead.');
    });
  }

  private async run(task: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await task();
    } catch (err) {
      console.error(err);
      this.flash('Something went wrong while creating the receipt. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }

  private flash(message: string): void {
    this.notice.set(message);
    setTimeout(() => this.notice() === message && this.notice.set(''), 4000);
  }
}
