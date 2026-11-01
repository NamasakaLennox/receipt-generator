import { imBankParser } from './im-bank.parser';

describe('imBankParser', () => {
  it('parses a bank to M-PESA transfer', () => {
    const p = imBankParser.parse(
      'Bank to M-PESA transfer of KES 1,331.00 to 0714477317 - LENNOX MATIMBAI NAMASAKA successfully processed. Transaction Ref ID: 5561ASKA8796. M-PESA Ref ID: UJ6IL94YTY',
    )!;
    expect(p.direction).toBe('sent');
    expect(p.amount).toBe(1331);
    expect(p.counterpartyPhone).toBe('0714477317');
    expect(p.counterpartyName).toBe('LENNOX MATIMBAI NAMASAKA');
    expect(p.transactionId).toBe('5561ASKA8796');
    expect(p.secondaryRef).toBe('UJ6IL94YTY');
    expect(p.dateTime).toBeUndefined();
  });

  it('tolerates line breaks from copy/paste', () => {
    const p = imBankParser.parse(
      'Bank to M-PESA transfer of KES 1,331.00 to\n0714477317 - LENNOX MATIMBAI NAMASAKA\nsuccessfully processed. Transaction Ref ID:\n5561ASKA8796. M-PESA Ref ID: UJ6IL94YTY',
    );
    expect(p?.amount).toBe(1331);
  });
});
