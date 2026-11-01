import { detectAndParse, PARSERS } from './parser-registry';

describe('parser registry', () => {
  it('routes I&M messages to I&M, not M-PESA', () => {
    const r = detectAndParse(
      'Bank to M-PESA transfer of KES 1,331.00 to 0714477317 - LENNOX MATIMBAI NAMASAKA successfully processed. Transaction Ref ID: 5561ASKA8796. M-PESA Ref ID: UJ6IL94YTY',
    );
    expect(r?.parser.id).toBe('im-bank');
  });

  it('returns null for unknown text', () => {
    expect(detectAndParse('Your airtime balance is Ksh 20')).toBeNull();
    expect(detectAndParse('   ')).toBeNull();
  });

  it('parses every built-in sample with its own parser', () => {
    for (const parser of PARSERS) {
      for (const sample of parser.samples) {
        const r = detectAndParse(sample);
        expect(r?.parser.id).withContext(sample).toBe(parser.id);
        expect(r?.payment).withContext(sample).not.toBeNull();
      }
    }
  });
});
