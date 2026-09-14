export interface ScrollEngineOptions {
  minDelay?: number;
  maxDelay?: number;
  maxScrolls?: number;
  retryLimit?: number;
  onScrollStep?: (scrollCount: number) => void;
  onEnd?: (reason: 'finished' | 'stopped' | 'max_reached') => void;
}

export class AutoScrollEngine {
  private targetElement: HTMLElement;
  private isRunning: boolean = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private scrollCount: number = 0;
  private noChangeCount: number = 0;
  private lastScrollTop: number = -1;
  private lastScrollHeight: number = -1;

  private minDelay: number;
  private maxDelay: number;
  private maxScrolls: number;
  private retryLimit: number;

  private onScrollStep?: (scrollCount: number) => void;
  private onEnd?: (reason: 'finished' | 'stopped' | 'max_reached') => void;

  constructor(targetElement: HTMLElement, options: ScrollEngineOptions = {}) {
    this.targetElement = targetElement;
    this.minDelay = options.minDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 3000;
    this.maxScrolls = options.maxScrolls ?? 1000;
    this.retryLimit = options.retryLimit ?? 3;
    this.onScrollStep = options.onScrollStep;
    this.onEnd = options.onEnd;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scrollCount = 0;
    this.noChangeCount = 0;
    this.step();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.onEnd) {
      this.onEnd('stopped');
    }
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
  }

  private step(): void {
    if (!this.isRunning) return;

    if (this.scrollCount >= this.maxScrolls) {
      this.isRunning = false;
      this.onEnd?.('max_reached');
      return;
    }

    const el = this.targetElement;
    const currentScrollTop = el === document.documentElement || el === document.body ? window.scrollY : el.scrollTop;
    const currentScrollHeight = el.scrollHeight;

    if (el === document.documentElement || el === document.body) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }

    this.scrollCount++;
    this.onScrollStep?.(this.scrollCount);

    if (currentScrollTop === this.lastScrollTop && currentScrollHeight === this.lastScrollHeight) {
      this.noChangeCount++;
    } else {
      this.noChangeCount = 0;
    }

    this.lastScrollTop = currentScrollTop;
    this.lastScrollHeight = currentScrollHeight;

    if (this.noChangeCount >= this.retryLimit) {
      this.isRunning = false;
      this.onEnd?.('finished');
      return;
    }

    const delay = this.getRandomDelay();
    this.timer = setTimeout(() => this.step(), delay);
  }
}
