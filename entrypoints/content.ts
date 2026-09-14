import { ExtensionMessage } from './shared/types';
import { generateCssSelector, findScrollContainer } from './shared/utils';
import { AutoScrollEngine } from './shared/scrollEngine';
import { DataCaptureEngine } from './shared/dataCapture';

let isInspecting = false;
let currentHighlightedEl: HTMLElement | null = null;
let scrollEngine: AutoScrollEngine | null = null;
let captureEngine: DataCaptureEngine | null = null;

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('PinHarvest content script active.');

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);

    chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
      switch (message.type) {
        case 'START_INSPECT':
          startInspect();
          break;
        case 'STOP_INSPECT':
          stopInspect();
          break;
        case 'START_SCROLL':
          if (message.selector) {
            initiateScrape(message.selector);
          }
          break;
        case 'STOP_SCROLL':
          stopScrape();
          break;
      }
    });
  },
});

function startInspect() {
  isInspecting = true;
}

function stopInspect() {
  isInspecting = false;
  if (currentHighlightedEl !== null) {
    removeHighlight(currentHighlightedEl);
    currentHighlightedEl = null;
  }
}

function handleMouseOver(e: MouseEvent) {
  if (!isInspecting) return;
  e.preventDefault();
  e.stopPropagation();

  const target = e.target as HTMLElement;
  if (currentHighlightedEl !== null && currentHighlightedEl !== target) {
    removeHighlight(currentHighlightedEl);
  }

  currentHighlightedEl = target;
  applyHighlight(target);
}

function handleMouseOut(e: MouseEvent) {
  if (!isInspecting) return;
  const target = e.target as HTMLElement;
  removeHighlight(target);
}

function handleClick(e: MouseEvent) {
  if (!isInspecting) return;
  e.preventDefault();
  e.stopPropagation();

  stopInspect();

  const target = e.target as HTMLElement;
  const scrollContainer = findScrollContainer(target);
  const selector = generateCssSelector(scrollContainer);

  chrome.runtime.sendMessage({
    type: 'INSPECT_SELECTED',
    selector,
    isValidScrollable: true,
  });
}

function applyHighlight(el: HTMLElement) {
  el.style.outline = '3px solid #00ff88';
  el.style.outlineOffset = '-3px';
  el.style.cursor = 'crosshair';
}

function removeHighlight(el: HTMLElement) {
  el.style.outline = '';
  el.style.outlineOffset = '';
  el.style.cursor = '';
}

function initiateScrape(selector: string) {
  const targetEl = (document.querySelector(selector) as HTMLElement) || document.body;

  captureEngine = new DataCaptureEngine(targetEl, (newItems) => {
    chrome.runtime.sendMessage({
      type: 'NEW_DATA_ITEMS',
      items: newItems,
    });
  });
  captureEngine.start();

  scrollEngine = new AutoScrollEngine(targetEl, {
    minDelay: 1200,
    maxDelay: 2500,
    retryLimit: 3,
    onEnd: (reason) => {
      stopScrape();
      chrome.runtime.sendMessage({
        type: 'STOP_SCROLL',
        reason,
      });
    },
  });
  scrollEngine.start();
}

function stopScrape() {
  if (scrollEngine !== null) {
    scrollEngine.stop();
    scrollEngine = null;
  }
  if (captureEngine !== null) {
    captureEngine.stop();
    captureEngine = null;
  }
}
