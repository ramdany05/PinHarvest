import { ExtensionState, ExportFormat } from '../shared/types';
import { triggerDownload } from '../shared/exportUtils';

const btnInspect = document.getElementById('btn-inspect') as HTMLButtonElement;
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;
const btnExportCsv = document.getElementById('btn-export-csv') as HTMLButtonElement;
const btnExportJson = document.getElementById('btn-export-json') as HTMLButtonElement;
const btnClear = document.getElementById('btn-clear') as HTMLButtonElement;
const itemCountEl = document.getElementById('item-count') as HTMLElement;
const statusTextEl = document.getElementById('status-text') as HTMLElement;
const statusDotEl = document.getElementById('status-dot') as HTMLElement;
const toastEl = document.getElementById('toast') as HTMLElement;

document.addEventListener('DOMContentLoaded', () => {
  fetchState();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'STATE_CHANGED') {
      updateUIState(message.state, message.itemCount, message.message);
    }
  });

  btnInspect.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'START_INSPECT' }, () => {
      fetchState();
    });
  });

  btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_SCROLL' }, () => {
      fetchState();
    });
  });

  btnExportCsv.addEventListener('click', () => exportData('csv'));
  btnExportJson.addEventListener('click', () => exportData('json'));

  btnClear.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_DATA' }, () => {
      fetchState();
    });
  });
});

function fetchState() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
    if (res) {
      updateUIState(res.state, res.itemCount);
    }
  });
}

function updateUIState(state: ExtensionState, count: number, message?: string) {
  itemCountEl.textContent = count.toString();
  statusTextEl.textContent = `Status: ${state.charAt(0).toUpperCase() + state.slice(1)}`;

  statusDotEl.className = 'dot ' + state;

  const hasData = count > 0;
  btnExportCsv.disabled = !hasData;
  btnExportJson.disabled = !hasData;

  if (state === 'inspecting' || state === 'scrolling') {
    btnInspect.style.display = 'none';
    btnStop.style.display = 'block';
  } else {
    btnInspect.style.display = 'block';
    btnStop.style.display = 'none';
  }

  if (message) {
    showToast(message);
  }
}

function exportData(format: ExportFormat) {
  chrome.runtime.sendMessage({ type: 'EXPORT_DATA', format }, (res) => {
    if (res?.data) {
      triggerDownload(res.data, res.filename, res.mimeType);
    }
  });
}

function showToast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 4000);
}
