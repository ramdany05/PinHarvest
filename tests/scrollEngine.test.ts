import { describe, it, expect, vi } from 'vitest';
import { AutoScrollEngine } from '../entrypoints/shared/scrollEngine';

describe('AutoScrollEngine', () => {
  it('scrolls target element and invokes callbacks', async () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollHeight', { value: 500, writable: true });
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });

    const stepFn = vi.fn();
    const endFn = vi.fn();

    const engine = new AutoScrollEngine(el, {
      minDelay: 100,
      maxDelay: 100,
      maxScrolls: 2,
      retryLimit: 1,
      onScrollStep: stepFn,
      onEnd: endFn,
    });

    engine.start();
    expect(stepFn).toHaveBeenCalledWith(1);

    vi.advanceTimersByTime(150);
    expect(stepFn).toHaveBeenCalledWith(2);

    vi.advanceTimersByTime(150);
    expect(endFn).toHaveBeenCalledWith('max_reached');
    vi.useRealTimers();
  });
});
