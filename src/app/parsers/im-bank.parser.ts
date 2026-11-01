import { MessageParser } from './message-parser';
import { cleanName, normalizeWhitespace, parseAmount } from './parse-utils';

const MAIN = new RegExp(
  String.raw`Bank to M-PESA transfer of KES ([\d,]+(?:\.\d{2})?) to (0\d{9}|254\d{9}) - (.+?) successfully processed\.? Transaction Ref ID: ([A-Z0-9]+)\.?(?: M-PESA Ref ID: ([A-Z0-9]+))?`,
  'i',
);

export const imBankParser: MessageParser = {
  id: 'im-bank',
  label: 'I&M Bank',
  refLabel: 'Transaction Ref ID',
  secondaryRefLabel: 'M-PESA Ref ID',
  samples: [
    'Bank to M-PESA transfer of KES 1,331.00 to 0714477317 - LENNOX MATIMBAI NAMASAKA successfully processed. Transaction Ref ID: 5561ASKA8796. M-PESA Ref ID: UJ6IL94YTY',
  ],

  canParse(text) {
    return /Bank to M-PESA transfer of KES/i.test(text);
  },

  parse(text) {
    const m = MAIN.exec(normalizeWhitespace(text));
    if (!m) return null;
    return {
      source: 'im-bank',
      direction: 'sent',
      transactionId: m[4].toUpperCase(),
      secondaryRef: m[5]?.toUpperCase(),
      amount: parseAmount(m[1]),
      currency: 'KES',
      counterpartyName: cleanName(m[3]),
      counterpartyPhone: m[2],
      // The message carries no date; the form defaults to "now".
      dateTime: undefined,
    };
  },
};
