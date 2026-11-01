import { ParsedPayment } from '../models/payment';
import { MessageParser } from './message-parser';
import { cleanName, normalizeWhitespace, parseAmount, parseDmyDate } from './parse-utils';

const HEADER = /^([A-Z0-9]{10}) Confirmed\.?/i;
const DATE = String.raw`on (\d{1,2}/\d{1,2}/\d{2,4}) at (\d{1,2}:\d{2} ?[AP]M)`;
const SENT = new RegExp(
  String.raw`Ksh ?([\d,]+(?:\.\d{2})?) (?:sent|paid) to (.+?)\.? (?:(0\d{9}|254\d{9}) )?(?:for account (\S+?) )?` + DATE,
  'i',
);
const RECEIVED = new RegExp(
  String.raw`(?:You have received )?Ksh ?([\d,]+(?:\.\d{2})?) (?:received )?from (.+?) (?:(0\d{9}|254\d{9}) )?` + DATE,
  'i',
);
const COST = /Transaction cost,? Ksh ?([\d,]+(?:\.\d{2})?)/i;

export const mpesaParser: MessageParser = {
  id: 'mpesa',
  label: 'M-PESA',
  refLabel: 'M-PESA Transaction ID',
  samples: [
    'UK1IL0DWBR Confirmed. Ksh400.00 sent to Leon Murunga 0706163691 on 1/11/26 at 8:26 PM. New M-PESA balance is Ksh190.48. Transaction cost, Ksh7.00.  Amount you can transact within the day is 498,480.00.',
    'UK1IL0DQPB Confirmed. Ksh1,000.00 paid to TIMOTHY MACHARIA MWANGI. on 1/11/26 at 7:58 PM.New M-PESA balance is Ksh657.48. Transaction cost, Ksh0.00. Amount you can transact within the day is 498,940.00.',
    'UJHILAFL7C Confirmed. Ksh300.00 sent to KPLC PREPAID for account 22120479195 on 17/10/26 at 5:30 PM New M-PESA balance is Ksh2,001.68. Transaction cost, Ksh5.00.Amount you can transact within the day is 475,817.00.',
    'QBK7H2M9TX Confirmed. Ksh2,450.00 received from JANE WANJIKU 0712345678 on 19/10/26 at 12:42 PM. New M-PESA balance is Ksh12,450.00.',
  ],

  canParse(text) {
    return HEADER.test(normalizeWhitespace(text));
  },

  parse(text) {
    const t = normalizeWhitespace(text);
    const header = HEADER.exec(t);
    if (!header) return null;

    const sent = SENT.exec(t);
    const received = sent ? null : RECEIVED.exec(t);
    const match = sent ?? received;
    if (!match) return null;

    const cost = COST.exec(t);
    const payment: ParsedPayment = {
      source: 'mpesa',
      direction: sent ? 'sent' : 'received',
      transactionId: header[1].toUpperCase(),
      amount: parseAmount(match[1]),
      currency: 'KES',
      counterpartyName: cleanName(match[2]),
      counterpartyPhone: match[3],
      account: sent ? sent[4] : undefined,
      dateTime: sent ? parseDmyDate(sent[5], sent[6]) : parseDmyDate(match[4], match[5]),
      charges: cost ? parseAmount(cost[1]) : undefined,
    };
    return payment;
  },
};
