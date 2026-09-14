export function findScrollContainer(el: HTMLElement): HTMLElement {
  let current: HTMLElement | null = el;

  while (current && current !== document.body && current !== document.documentElement) {
    if (isScrollable(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return document.body;
}

export function isScrollable(el: HTMLElement): boolean {
  if (el === document.body || el === document.documentElement) return true;

  const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
  const overflowY = style ? style.overflowY || style.overflow : (el.style?.overflowY || '');
  const isScrollStyle = ['auto', 'scroll', 'overlay'].includes(overflowY);
  const hasScrollHeight = el.scrollHeight > el.clientHeight && el.clientHeight > 0;

  return isScrollStyle || hasScrollHeight;
}

export function generateCssSelector(el: HTMLElement): string {
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }

  const role = el.getAttribute('role');
  if (role) {
    return `${el.tagName.toLowerCase()}[role="${role}"]`;
  }

  const path: string[] = [];
  let current: HTMLElement | null = el;
  let depth = 0;

  while (current && current.nodeType === Node.ELEMENT_NODE && depth < 4) {
    if (current.id) {
      path.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    let selector = current.tagName.toLowerCase();
    const parent: HTMLElement | null = current.parentElement;

    if (parent) {
      const children = Array.from(parent.children);
      const index = children.indexOf(current) + 1;
      selector += `:nth-child(${index})`;
    }

    path.unshift(selector);
    current = parent;
    depth++;
  }

  return path.join(' > ');
}
