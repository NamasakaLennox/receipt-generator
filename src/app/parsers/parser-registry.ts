import { ParsedPayment } from '../models/payment';
import { equityParser } from './equity.parser';
import { imBankParser } from './im-bank.parser';
import { MessageParser } from './message-parser';
import { mpesaParser } from './mpesa.parser';

/**
 * All supported message formats. Order matters: more specific formats come
 * first (I&M messages mention "M-PESA", so I&M is checked before M-PESA).
 * Add new providers here.
 */
export const PARSERS: readonly MessageParser[] = [imBankParser, equityParser, mpesaParser];

export function getParser(id: string): MessageParser | undefined {
  return PARSERS.find((p) => p.id === id);
}

export interface DetectResult {
  parser: MessageParser;
  payment: ParsedPayment | null;
}

/** Finds the parser whose format matches the text and parses it. */
export function detectAndParse(text: string): DetectResult | null {
  if (!text.trim()) return null;
  for (const parser of PARSERS) {
    if (parser.canParse(text)) {
      return { parser, payment: safeParse(parser, text) };
    }
  }
  return null;
}

/** Parses the text with a specific parser, never throwing. */
export function safeParse(parser: MessageParser, text: string): ParsedPayment | null {
  try {
    return parser.parse(text);
  } catch {
    return null;
  }
}
