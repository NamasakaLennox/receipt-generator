import { computed, inject, Injectable, signal } from '@angular/core';
import { PaymentDirection } from '../models/payment';
import { BusinessDetails, DEFAULT_BUSINESS, ReceiptItem, ReceiptView } from '../models/receipt';
import { detectAndParse, getParser, PARSERS, safeParse } from '../parsers/parser-registry';
import { ReceiptStorage } from '../storage/receipt-storage';

export type ParseStatus = 'idle' | 'parsed' | 'unrecognised' | 'failed';

/** Formats a Date for <input type="datetime-local">. */
export function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatReceiptNumber(n: number): string {
  return `MR-${String(n).padStart(5, '0')}`;
}

@Injectable({ providedIn: 'root' })
export class ReceiptStateService {
  private readonly storage = inject(ReceiptStorage);
  private nextItemId = 1;

  readonly parsers = PARSERS;

  readonly message = signal('');
  readonly sourceId = signal<string>(PARSERS.find((p) => p.id === 'mpesa')?.id ?? PARSERS[0].id);
  readonly parseStatus = signal<ParseStatus>('idle');

  readonly direction = signal<PaymentDirection>('received');
  readonly transactionId = signal('');
  readonly secondaryRef = signal('');
  readonly amount = signal<number | null>(null);
  readonly counterpartyName = signal('');
  readonly counterpartyPhone = signal('');
  readonly account = signal('');
  readonly dateTime = signal('');
  readonly items = signal<ReceiptItem[]>([this.blankItem()]);

  readonly business = signal<BusinessDetails>({ ...DEFAULT_BUSINESS });
  readonly receiptNumber = signal(1);

  readonly parser = computed(() => getParser(this.sourceId()) ?? PARSERS[0]);

  readonly itemsTotal = computed(() =>
    round2(this.items().reduce((sum, i) => sum + (i.price ?? 0) * (i.qty || 0), 0)),
  );

  /** The payment amount wins; fall back to the items total when no amount is set. */
  readonly total = computed(() => this.amount() ?? this.itemsTotal());

  readonly totalsMismatch = computed(() => {
    const amount = this.amount();
    const itemsTotal = this.itemsTotal();
    return amount !== null && itemsTotal > 0 && Math.abs(amount - itemsTotal) >= 0.01;
  });

  readonly view = computed<ReceiptView>(() => {
    const parser = this.parser();
    const filled = this.items().filter((i) => i.description.trim() || i.price);
    const total = this.total();
    const items = filled.length
      ? filled.map((i) => {
          const price = i.price ?? 0;
          return {
            description: i.description.trim() || 'Item',
            qty: i.qty || 1,
            price,
            lineTotal: round2(price * (i.qty || 1)),
          };
        })
      : [
          {
            description: this.direction() === 'received' ? 'Payment received' : 'Payment sent',
            qty: 1,
            price: total,
            lineTotal: total,
          },
        ];
    const dt = this.dateTime();
    return {
      receiptNumber: formatReceiptNumber(this.receiptNumber()),
      business: this.business(),
      sourceLabel: parser.label,
      refLabel: parser.refLabel,
      secondaryRefLabel: parser.secondaryRefLabel,
      direction: this.direction(),
      transactionId: this.transactionId().trim(),
      secondaryRef: this.secondaryRef().trim(),
      counterpartyName: this.counterpartyName().trim(),
      counterpartyPhone: this.counterpartyPhone().trim(),
      account: this.account().trim(),
      dateTime: dt ? new Date(dt) : null,
      items,
      total,
    };
  });

  constructor() {
    this.dateTime.set(toLocalInput(new Date()));
    void this.load();
  }

  private async load(): Promise<void> {
    this.business.set(await this.storage.getBusiness());
    this.receiptNumber.set(await this.storage.peekReceiptNumber());
  }

  /** Called when the pasted message changes: detect the format and fill the form. */
  setMessage(text: string): void {
    this.message.set(text);
    if (!text.trim()) {
      this.parseStatus.set('idle');
      return;
    }
    const result = detectAndParse(text);
    if (!result) {
      this.parseStatus.set('unrecognised');
      return;
    }
    this.sourceId.set(result.parser.id);
    this.applyParsed(result.payment);
  }

  /** Manual source override: re-parse the current message with the chosen parser. */
  setSource(id: string): void {
    this.sourceId.set(id);
    const text = this.message();
    if (text.trim()) this.applyParsed(safeParse(this.parser(), text));
  }

  trySample(): void {
    const all = this.parsers.flatMap((p) => p.samples);
    const current = this.message();
    const pool = all.filter((s) => s !== current);
    this.setMessage(pool[Math.floor(Math.random() * pool.length)] ?? all[0]);
  }

  private applyParsed(payment: ReturnType<typeof safeParse>): void {
    if (!payment) {
      this.parseStatus.set('failed');
      return;
    }
    this.parseStatus.set('parsed');
    this.direction.set(payment.direction);
    this.transactionId.set(payment.transactionId);
    this.secondaryRef.set(payment.secondaryRef ?? '');
    this.amount.set(payment.amount);
    this.counterpartyName.set(payment.counterpartyName ?? '');
    this.counterpartyPhone.set(payment.counterpartyPhone ?? '');
    this.account.set(payment.account ?? '');
    this.dateTime.set(toLocalInput(payment.dateTime ?? new Date()));

    const items = this.items();
    const untouched = items.every((i) => !i.description.trim() && !i.price);
    if (payment.narration && untouched) {
      this.items.set([
        { id: this.nextItemId++, description: payment.narration, qty: 1, price: payment.amount },
      ]);
    }
  }

  addItem(): void {
    this.items.update((items) => [...items, this.blankItem()]);
  }

  updateItem(id: number, patch: Partial<Omit<ReceiptItem, 'id'>>): void {
    this.items.update((items) => items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  removeItem(id: number): void {
    this.items.update((items) => {
      const rest = items.filter((i) => i.id !== id);
      return rest.length ? rest : [this.blankItem()];
    });
  }

  async saveBusiness(details: BusinessDetails): Promise<void> {
    this.business.set(details);
    await this.storage.saveBusiness(details);
  }

  /** Reserves the current receipt number (call after a successful download). */
  async commitReceiptNumber(): Promise<void> {
    await this.storage.nextReceiptNumber();
    this.receiptNumber.set(await this.storage.peekReceiptNumber());
  }

  reset(): void {
    this.message.set('');
    this.parseStatus.set('idle');
    this.transactionId.set('');
    this.secondaryRef.set('');
    this.amount.set(null);
    this.counterpartyName.set('');
    this.counterpartyPhone.set('');
    this.account.set('');
    this.dateTime.set(toLocalInput(new Date()));
    this.items.set([this.blankItem()]);
  }

  private blankItem(): ReceiptItem {
    return { id: this.nextItemId++, description: '', qty: 1, price: null };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
