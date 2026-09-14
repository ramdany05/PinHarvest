import { ExtensionMessage, ExtensionState, ScrapedDataItem } from './shared/types';
import { convertToCSV, convertToJSON } from './shared/exportUtils';

let currentState: ExtensionState = 'idle';
let scrapedData: ScrapedDataItem[] = [];
let selectedSelector: string | null = null;

export default defineBackground(() => {
  console.log('Background Service Worker initialized.');

  chrome.storage.local.get(['scrapedData', 'currentState', 'selectedSelector'], (res) => {
    if (res.scrapedData) scrapedData = res.scrapedData;
    if (res.currentState) currentState = res.currentState;
    if (res.selectedSelector) selectedSelector = res.selectedSelector;
  });

  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_STATE': {
        sendResponse({
          state: currentState,
          itemCount: scrapedData.length,
          selector: selectedSelector,
        });
        break;
      }

      case 'START_INSPECT': {
        currentState = 'inspecting';
        saveState();
        notifyStateChange();
        forwardToActiveTab(message);
        sendResponse({ success: true });
        break;
      }

      case 'STOP_INSPECT': {
        currentState = 'idle';
        saveState();
        notifyStateChange();
        forwardToActiveTab(message);
        sendResponse({ success: true });
        break;
      }

      case 'INSPECT_SELECTED': {
        selectedSelector = message.selector;
        if (message.isValidScrollable) {
          currentState = 'scrolling';
          saveState();
          notifyStateChange();
          forwardToActiveTab({ type: 'START_SCROLL', selector: message.selector });
        } else {
          currentState = 'idle';
          saveState();
          notifyStateChange('Selected element is not scrollable.');
        }
        sendResponse({ success: true });
        break;
      }

      case 'NEW_DATA_ITEMS': {
        const existingIds = new Set(scrapedData.map((d) => d.id));
        const brandNew = message.items.filter((item) => !existingIds.has(item.id));
        if (brandNew.length > 0) {
          scrapedData.push(...brandNew);
          saveState();
          notifyStateChange();
        }
        sendResponse({ success: true, count: scrapedData.length });
        break;
      }

      case 'STOP_SCROLL': {
        currentState = 'done';
        saveState();
        notifyStateChange('Scraping stopped or completed.');
        forwardToActiveTab(message);
        sendResponse({ success: true });
        break;
      }

      case 'CLEAR_DATA': {
        scrapedData = [];
        selectedSelector = null;
        currentState = 'idle';
        saveState();
        notifyStateChange();
        sendResponse({ success: true });
        break;
      }

      case 'EXPORT_DATA': {
        if (message.format === 'csv') {
          const csvText = convertToCSV(scrapedData);
          sendResponse({ data: csvText, filename: 'scraped_data.csv', mimeType: 'text/csv' });
        } else {
          const jsonText = convertToJSON(scrapedData);
          sendResponse({ data: jsonText, filename: 'scraped_data.json', mimeType: 'application/json' });
        }
        break;
      }
    }
    return true;
  });
});

function saveState() {
  chrome.storage.local.set({
    scrapedData,
    currentState,
    selectedSelector,
  });
}

function notifyStateChange(customMessage?: string) {
  chrome.runtime.sendMessage({
    type: 'STATE_CHANGED',
    state: currentState,
    itemCount: scrapedData.length,
    message: customMessage,
  }).catch(() => {
  });
}

function forwardToActiveTab(message: ExtensionMessage) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
    }
  });
}
