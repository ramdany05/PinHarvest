export interface ScrapedDataItem {
  id: string;
  title?: string;
  rating?: string;
  reviews?: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  status?: string;
  text: string;
  href?: string;
  selector?: string;
  timestamp: number;
}

export type ExtensionState = 'idle' | 'inspecting' | 'scrolling' | 'paused' | 'done';

export type ExportFormat = 'csv' | 'json';

export type ExtensionMessage =
  | { type: 'START_INSPECT' }
  | { type: 'STOP_INSPECT' }
  | { type: 'INSPECT_SELECTED'; selector: string; isValidScrollable: boolean }
  | { type: 'START_SCROLL'; selector: string }
  | { type: 'STOP_SCROLL' }
  | { type: 'NEW_DATA_ITEMS'; items: ScrapedDataItem[] }
  | { type: 'STATE_CHANGED'; state: ExtensionState; itemCount: number; message?: string }
  | { type: 'GET_STATE' }
  | { type: 'EXPORT_DATA'; format: ExportFormat }
  | { type: 'CLEAR_DATA' };
