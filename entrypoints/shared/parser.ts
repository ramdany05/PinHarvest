export interface StructuredData {
  title?: string;
  rating?: string;
  reviews?: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  status?: string;
}

export function parseItemText(rawText: string, extraLinks: string[] = []): StructuredData {
  const result: StructuredData = {};
  if (!rawText) return result;

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return result;

  let title = lines[0];
  if (title === 'Sponsored' && lines.length > 1) {
    title = lines[1];
  }
  result.title = title;

  const fullText = lines.join(' ');

  const ratingMatch = fullText.match(/\b([1-5]\.\d)\s*\(([\d,.]+)\)/);
  if (ratingMatch) {
    result.rating = ratingMatch[1];
    result.reviews = ratingMatch[2];
  }

  const phoneMatch = fullText.match(/(\+?\d[\d\s-]{7,}\d|\(\d{2,4}\)\s*\d[\d\s-]{5,})/);
  if (phoneMatch) {
    result.phone = phoneMatch[1].trim();
  }

  const statusMatch = fullText.match(/(Open|Closed|Closes\s+soon|Opens\s+[\w\s.]+)\b/i);
  if (statusMatch) {
    result.status = statusMatch[1].trim();
  }

  const urlMatch = fullText.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|co\.id|id|net|org|io|biz|info)[^\s]*)/i);
  if (urlMatch) {
    let site = urlMatch[0].trim();
    if (!site.startsWith('http')) site = `https://${site}`;
    result.website = site;
  }

  if (!result.website && extraLinks.length > 0) {
    const externalLink = extraLinks.find((l) => !l.includes('google.com/maps'));
    if (externalLink) {
      result.website = externalLink;
    }
  }

  for (const line of lines) {
    if (line.includes('·')) {
      const parts = line.split('·').map((p) => p.trim());
      if (parts.length >= 2) {
        const potentialCat = parts[0];
        if (!potentialCat.includes('shopping') && !potentialCat.includes('pick-up') && !potentialCat.includes('delivery')) {
          result.category = potentialCat;
          result.address = parts.slice(1).join(' · ');
          break;
        }
      }
    } else if (!result.address && (line.includes('Jl.') || line.includes('Jalan') || line.includes('No.'))) {
      result.address = line;
    }
  }

  return result;
}
