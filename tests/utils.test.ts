import { describe, it, expect } from 'vitest';
import { generateCssSelector, isScrollable, findScrollContainer } from '../entrypoints/shared/utils';

describe('Utils module', () => {
  it('generates unique CSS selector for ID elements', () => {
    const div = document.createElement('div');
    div.id = 'my-target';
    expect(generateCssSelector(div)).toBe('#my-target');
  });

  it('generates hierarchy CSS selector for elements without ID', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    document.body.appendChild(parent);

    const selector = generateCssSelector(child);
    expect(selector).toContain('span');
  });

  it('finds nearest scroll container for nested child', () => {
    const container = document.createElement('div');
    container.style.overflowY = 'scroll';
    Object.defineProperty(container, 'scrollHeight', { value: 500 });
    Object.defineProperty(container, 'clientHeight', { value: 200 });

    const child = document.createElement('p');
    container.appendChild(child);
    document.body.appendChild(container);

    expect(findScrollContainer(child)).toBe(container);
  });
});
