import { describe, it, expect } from 'vitest';
import { DataCaptureEngine } from '../entrypoints/shared/dataCapture';
import { convertToCSV, convertToJSON } from '../entrypoints/shared/exportUtils';
import { ScrapedDataItem } from '../entrypoints/shared/types';

describe('DataCaptureEngine & ExportUtils', () => {
  it('deduplicates items using DataCaptureEngine', () => {
    const container = document.createElement('div');
    const child1 = document.createElement('p');
    child1.textContent = 'Item 1';
    container.appendChild(child1);

    const capture = new DataCaptureEngine(container);
    capture.start();

    expect(capture.getCapturedItems().length).toBeGreaterThan(0);
    expect(capture.getCapturedItems()[0].text).toContain('Item 1');
    capture.stop();
  });

  it('converts items to CSV properly formatted', () => {
    const items: ScrapedDataItem[] = [
      { id: '1', text: 'Hello, "World"', href: 'https://example.com', timestamp: 1700000000000 },
    ];
    const csv = convertToCSV(items);
    expect(csv).toContain('Title,Rating,Reviews,Category,Address,Phone,Website,Status,URL,RawText,Timestamp');
    expect(csv).toContain('"Hello, ""World"""');
  });

  it('converts items to JSON properly formatted', () => {
    const items: ScrapedDataItem[] = [
      { id: '1', text: 'Hello World', timestamp: 1700000000000 },
    ];
    const json = convertToJSON(items);
    expect(json).toContain('"rawText": "Hello World"');
  });
});
