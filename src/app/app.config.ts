import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { LocalReceiptStorage } from './storage/local-receipt-storage';
import { ReceiptStorage } from './storage/receipt-storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Swap for an HTTP-backed implementation when a backend exists.
    { provide: ReceiptStorage, useClass: LocalReceiptStorage },
  ],
};
