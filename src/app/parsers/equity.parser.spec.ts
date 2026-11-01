import { equityParser } from './equity.parser';

describe('equityParser', () => {
  const samples: [string, string, Date][] = [
    ['AD5B64354930B', '05 Aug 2026 at 15:07', new Date(2026, 7, 5, 15, 7)],
    ['ADB1983B9287B', '04 Sep 2026 at 12:18', new Date(2026, 8, 4, 12, 18)],
    ['A35027C0CF0EF', '05 Oct 2026 at 10:43', new Date(2026, 9, 5, 10, 43)],
  ];

  for (const [ref, when, date] of samples) {
    it(`parses ref ${ref}`, () => {
      const text = `15450.00 KES has been successfully sent to HAKI TRADERS 0********0527. Ref. ${ref} on ${when} EAT. Transaction charge 0.00 KES, SMS alert charge 2.26 KES\n\nRent & Water HD2`;
      expect(equityParser.canParse(text)).toBeTrue();
      const p = equityParser.parse(text)!;
      expect(p.direction).toBe('sent');
      expect(p.transactionId).toBe(ref);
      expect(p.amount).toBe(15450);
      expect(p.counterpartyName).toBe('HAKI TRADERS');
      expect(p.counterpartyPhone).toBe('0********0527');
      expect(p.dateTime).toEqual(date);
      expect(p.charges).toBe(2.26);
      expect(p.narration).toBe('Rent & Water HD2');
    });
  }

  it('handles a message without narration', () => {
    const p = equityParser.parse(
      '500.00 KES has been successfully sent to JOHN DOE 0712345678. Ref. ABC123 on 01 Nov 2026 at 09:05 EAT. Transaction charge 0.00 KES, SMS alert charge 2.26 KES',
    )!;
    expect(p.amount).toBe(500);
    expect(p.narration).toBeUndefined();
  });
});
