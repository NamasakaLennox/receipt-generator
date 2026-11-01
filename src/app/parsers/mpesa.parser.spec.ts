import { mpesaParser } from './mpesa.parser';

describe('mpesaParser', () => {
  it('parses "sent to" with a phone number', () => {
    const p = mpesaParser.parse(
      'UK1IL0DWBR Confirmed. Ksh400.00 sent to Leon Murunga 0706163691 on 1/11/26 at 8:26 PM. New M-PESA balance is Ksh190.48. Transaction cost, Ksh7.00.  Amount you can transact within the day is 498,480.00. See all your balances now https://saf.cx/iqIzU',
    )!;
    expect(p.transactionId).toBe('UK1IL0DWBR');
    expect(p.direction).toBe('sent');
    expect(p.amount).toBe(400);
    expect(p.counterpartyName).toBe('Leon Murunga');
    expect(p.counterpartyPhone).toBe('0706163691');
    expect(p.dateTime).toEqual(new Date(2026, 10, 1, 20, 26));
    expect(p.charges).toBe(7);
  });

  it('parses "sent to" without a phone and with double spaces in the name', () => {
    const p = mpesaParser.parse(
      'UK1IL0DO42 Confirmed. Ksh60.00 sent to JOSEPH  NYOKABI on 1/11/26 at 8:11 PM. New M-PESA balance is Ksh597.48. Transaction cost, Ksh0.00.',
    )!;
    expect(p.transactionId).toBe('UK1IL0DO42');
    expect(p.amount).toBe(60);
    expect(p.counterpartyName).toBe('JOSEPH NYOKABI');
    expect(p.counterpartyPhone).toBeUndefined();
    expect(p.dateTime).toEqual(new Date(2026, 10, 1, 20, 11));
  });

  it('parses "paid to" (till) with a trailing dot after the name', () => {
    const p = mpesaParser.parse(
      'UK1IL0DQPB Confirmed. Ksh1,000.00 paid to TIMOTHY MACHARIA MWANGI. on 1/11/26 at 7:58 PM.New M-PESA balance is Ksh657.48. Transaction cost, Ksh0.00.',
    )!;
    expect(p.direction).toBe('sent');
    expect(p.amount).toBe(1000);
    expect(p.counterpartyName).toBe('TIMOTHY MACHARIA MWANGI');
    expect(p.dateTime).toEqual(new Date(2026, 10, 1, 19, 58));
    expect(p.charges).toBe(0);
  });

  it('parses a paybill payment with an account number', () => {
    const p = mpesaParser.parse(
      'UJHILAFL7C Confirmed. Ksh300.00 sent to KPLC PREPAID for account 22120479195 on 17/10/26 at 5:30 PM New M-PESA balance is Ksh2,001.68. Transaction cost, Ksh5.00.Amount you can transact within the day is 475,817.00. See all your balances now https://saf.cx/kWQpy',
    )!;
    expect(p.transactionId).toBe('UJHILAFL7C');
    expect(p.direction).toBe('sent');
    expect(p.amount).toBe(300);
    expect(p.counterpartyName).toBe('KPLC PREPAID');
    expect(p.account).toBe('22120479195');
    expect(p.dateTime).toEqual(new Date(2026, 9, 17, 17, 30));
    expect(p.charges).toBe(5);
  });

  it('parses "received from"', () => {
    const p = mpesaParser.parse(
      'QBK7H2M9TX Confirmed. Ksh2,450.00 received from JANE WANJIKU 0712345678 on 19/10/26 at 12:42 PM. New M-PESA balance is Ksh12,450.00.',
    )!;
    expect(p.direction).toBe('received');
    expect(p.amount).toBe(2450);
    expect(p.counterpartyName).toBe('JANE WANJIKU');
    expect(p.counterpartyPhone).toBe('0712345678');
    expect(p.dateTime).toEqual(new Date(2026, 9, 19, 12, 42));
  });

  it('returns null for unrelated text', () => {
    expect(mpesaParser.canParse('hello world')).toBeFalse();
    expect(mpesaParser.parse('hello world')).toBeNull();
  });
});
