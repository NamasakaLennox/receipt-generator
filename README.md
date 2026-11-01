# Receipt Generator

Turn a payment SMS into a clean, shareable receipt. Paste an **M-PESA**, **Equity Bank** or **I&M Bank** message. The app reads the amount, reference, name, phone and date, then you add line items and download the receipt as a PDF or image.

Built with Angular 20 (standalone components and signals) and TypeScript.

## Getting started

```bash
npm install
npm start            # http://localhost:4200
npm test             # unit tests (parsers + app)
npm run build        # production build in dist/
```

## Supported messages

| Source | Example |
| --- | --- |
| M-PESA: sent / paid / paybill / received | `UK1IL0DWBR Confirmed. Ksh400.00 sent to Leon Murunga 0706163691 on 1/11/26 at 8:26 PM...` |
| Equity Bank | `15450.00 KES has been successfully sent to HAKI TRADERS 0********0527. Ref. AD5B64354930B on 05 Aug 2026 at 15:07 EAT...` |
| I&M Bank | `Bank to M-PESA transfer of KES 1,331.00 to 0714477317 - JOHN DOE successfully processed. Transaction Ref ID: ...` |

## Adding a new message format

1. Create `src/app/parsers/<name>.parser.ts` that implements `MessageParser` (`id`, `label`, `refLabel`, `samples`, `canParse`, `parse`).
2. Add it to `PARSERS` in `src/app/parsers/parser-registry.ts`. Order matters: put more specific formats first.
3. Add `<name>.parser.spec.ts` with real sample messages. The registry spec also checks every `samples` entry automatically.

## Project layout

```
src/app/
  parsers/      one parser per message format + registry
  models/       ParsedPayment, receipt types
  storage/      ReceiptStorage abstraction (localStorage today, swap for an API later in app.config.ts)
  services/     receipt state (signals) and PDF/PNG export
  components/   message input, payment form, items editor, preview, business details dialog
  templates/    receipt layouts (registry in receipt-templates.ts)
```
