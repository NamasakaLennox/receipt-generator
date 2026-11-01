import { MessageParser } from './message-parser';
import { cleanName, normalizeWhitespace, parseAmount, parseDayMonthNameDate } from './parse-utils';

const MAIN = new RegExp(
  String.raw`([\d,]+\.\d{2}) KES has been successfully sent to (.+?) ([\d*]{9,13})\. Ref\. ([A-Z0-9]+) on (\d{1,2} [A-Za-z]{3,4} \d{4}) at (\d{1,2}:\d{2})`,
  'i',
);
const TXN_CHARGE = /Transaction charge ([\d,]+\.\d{2}) KES/i;
const SMS_CHARGE = /SMS alert charge ([\d,]+\.\d{2}) KES/i;
/** The narration is whatever follows the last "... charge X KES". */
const NARRATION = /^[^]*charge [\d,]+\.\d{2} KES\s*([^]*)$/i;

export const equityParser: MessageParser = {
  id: 'equity',
  label: 'Equity Bank',
  refLabel: 'Bank Ref',
  samples: [
    '15450.00 KES has been successfully sent to HAKI TRADERS 0********0527. Ref. AD5B64354930B on 05 Aug 2026 at 15:07 EAT. Transaction charge 0.00 KES, SMS alert charge 2.26 KES\n\nRent & Water HD2',
    '15450.00 KES has been successfully sent to HAKI TRADERS 0********0527. Ref. A35027C0CF0EF on 05 Oct 2026 at 10:43 EAT. Transaction charge 0.00 KES, SMS alert charge 2.26 KES\n\nRent & Water HD2',
  ],

  canParse(text) {
    return /KES has been successfully sent to/i.test(text);
  },

  parse(text) {
    const t = normalizeWhitespace(text);
    const m = MAIN.exec(t);
    if (!m) return null;

    const txnCharge = TXN_CHARGE.exec(t);
    const smsCharge = SMS_CHARGE.exec(t);
    const charges =
      txnCharge || smsCharge
        ? (txnCharge ? parseAmount(txnCharge[1]) : 0) + (smsCharge ? parseAmount(smsCharge[1]) : 0)
        : undefined;
    const narration = NARRATION.exec(text.trim())?.[1]?.trim() || undefined;

    return {
      source: 'equity',
      direction: 'sent',
      transactionId: m[4].toUpperCase(),
      amount: parseAmount(m[1]),
      currency: 'KES',
      counterpartyName: cleanName(m[2]),
      counterpartyPhone: m[3],
      dateTime: parseDayMonthNameDate(m[5], m[6]),
      narration: narration ? normalizeWhitespace(narration) : undefined,
      charges: charges !== undefined ? Math.round(charges * 100) / 100 : undefined,
    };
  },
};
