import { ScrapedDataItem } from './types';
import { parseItemText } from './parser';

export class DataCaptureEngine {
  private container: HTMLElement;
  private seenIds = new Set<string>();
  private items: ScrapedDataItem[] = [];
  private observer: MutationObserver | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onNewItems?: (items: ScrapedDataItem[]) => void;

  constructor(container: HTMLElement, onNewItems?: (items: ScrapedDataItem[]) => void) {
    this.container = container;
    this.onNewItems = onNewItems;
  }

  public start(): void {
    this.captureCurrentItems();

    this.observer = new MutationObserver(() => {
      this.captureCurrentItems();
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.intervalId = setInterval(() => {
      this.captureCurrentItems();
    }, 500);
  }

  public stop(): void {
    if (this.observer !== null) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getCapturedItems(): ScrapedDataItem[] {
    return [...this.items];
  }

  private captureCurrentItems(): void {
    const directChildren = Array.from(this.container.children) as HTMLElement[];
    let candidateElements: HTMLElement[] = [];

    if (directChildren.length > 1) {
      candidateElements = directChildren;
    } else {
      const cards = Array.from(this.container.querySelectorAll('a[href], div[role="article"], div[role="feed"] > div, [class*="card"], [class*="item"], [class*="result"]')) as HTMLElement[];
      candidateElements = cards.length > 0 ? cards : directChildren;
    }

    if (candidateElements.length === 0) {
      candidateElements = [this.container];
    }

    const newItems: ScrapedDataItem[] = [];

    for (const el of candidateElements) {
      const text = el.innerText?.trim() || el.textContent?.trim();
      if (!text || text.length < 3) continue;

      const allAnchors = Array.from(el.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      if (el.tagName.toLowerCase() === 'a') {
        allAnchors.unshift(el as HTMLAnchorElement);
      }
      const extraLinks = allAnchors.map((a) => a.href).filter(Boolean);
      const anchor = allAnchors.length > 0 ? allAnchors[0] : null;
      const href = anchor ? anchor.href : undefined;

      const structured = parseItemText(text, extraLinks);
      const uniqueKey = `${structured.title || text}::${href || ''}`;

      if (!this.seenIds.has(uniqueKey)) {
        this.seenIds.add(uniqueKey);
        const item: ScrapedDataItem = {
          id: uniqueKey,
          title: structured.title,
          rating: structured.rating,
          reviews: structured.reviews,
          category: structured.category,
          address: structured.address,
          phone: structured.phone,
          website: structured.website,
          status: structured.status,
          text,
          href,
          timestamp: Date.now(),
        };
        this.items.push(item);
        newItems.push(item);
      }
    }

    if (newItems.length > 0) {
      this.onNewItems?.(newItems);
    }
  }
}
