import { ScrapedDataItem } from './types';

function escapeCSVField(str?: string): string {
  if (!str) return '""';
  return `"${str.replace(/"/g, '""')}"`;
}

export function convertToCSV(data: ScrapedDataItem[]): string {
  const headers = ['Title', 'Rating', 'Reviews', 'Category', 'Address', 'Phone', 'Website', 'Status', 'URL', 'RawText', 'Timestamp'];
  
  if (data.length === 0) return headers.join(',') + '\n';

  const rows = data.map((item) => {
    const title = escapeCSVField(item.title);
    const rating = escapeCSVField(item.rating);
    const reviews = escapeCSVField(item.reviews);
    const category = escapeCSVField(item.category);
    const address = escapeCSVField(item.address);
    const phone = escapeCSVField(item.phone);
    const website = escapeCSVField(item.website);
    const status = escapeCSVField(item.status);
    const url = escapeCSVField(item.href);
    const rawText = escapeCSVField(item.text);
    const date = new Date(item.timestamp).toISOString();

    return [title, rating, reviews, category, address, phone, website, status, url, rawText, date].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function convertToJSON(data: ScrapedDataItem[]): string {
  const structuredData = data.map((item) => ({
    title: item.title || '',
    rating: item.rating || '',
    reviews: item.reviews || '',
    category: item.category || '',
    address: item.address || '',
    phone: item.phone || '',
    website: item.website || '',
    status: item.status || '',
    url: item.href || '',
    rawText: item.text,
    timestamp: item.timestamp,
  }));

  return JSON.stringify(structuredData, null, 2);
}

export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
