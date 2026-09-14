import { describe, it, expect } from 'vitest';
import { parseItemText } from '../entrypoints/shared/parser';

describe('parseItemText module', () => {
  it('extracts title, rating, reviews, category, address, phone, and status', () => {
    const raw = `Giant Computer Store and Service
4.8(7,166)
Computer store ·  · Jl. Komjen. Pol. M. Jasin Jl. Klp. Dua Raya No.45
Open · Closes 8.00 pm · 0812-8518-0588
In-store pick-up · Delivery`;

    const parsed = parseItemText(raw);

    expect(parsed.title).toBe('Giant Computer Store and Service');
    expect(parsed.rating).toBe('4.8');
    expect(parsed.reviews).toBe('7,166');
    expect(parsed.category).toBe('Computer store');
    expect(parsed.address).toContain('Jl. Komjen. Pol. M. Jasin');
    expect(parsed.phone).toBe('0812-8518-0588');
    expect(parsed.status).toBe('Open');
  });
});
