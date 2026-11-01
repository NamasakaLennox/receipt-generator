import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Renders an element to a high-resolution canvas (libraries loaded on demand). */
  private async render(el: HTMLElement): Promise<HTMLCanvasElement> {
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  }

  async toPngBlob(el: HTMLElement): Promise<Blob> {
    const canvas = await this.render(el);
    return new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
    );
  }

  async downloadPng(el: HTMLElement, fileName: string): Promise<void> {
    this.saveBlob(await this.toPngBlob(el), `${fileName}.png`);
  }

  async downloadPdf(el: HTMLElement, fileName: string): Promise<void> {
    const canvas = await this.render(el);
    const { jsPDF } = await import('jspdf');
    // Page sized to the receipt; JPEG keeps the file small enough for WhatsApp/email.
    const width = 100;
    const height = (canvas.height / canvas.width) * width;
    const pdf = new jsPDF({ unit: 'mm', format: [width, height] });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, width, height);
    pdf.save(`${fileName}.pdf`);
  }

  /** Shares the receipt image via the Web Share API; falls back to a PNG download. */
  async share(el: HTMLElement, fileName: string, title: string): Promise<'shared' | 'downloaded'> {
    const blob = await this.toPngBlob(el);
    const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title });
        return 'shared';
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return 'shared';
      }
    }
    this.saveBlob(blob, file.name);
    return 'downloaded';
  }

  private saveBlob(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
