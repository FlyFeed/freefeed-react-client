import { debounce } from 'lodash-es';
import LRU from 'lru-cache';

const lsKey = 'previewSize';
const lruSize = 500;
const lruSaveTimeout = 10000;

const lru = new LRU({ max: lruSize });

try {
  const stored = localStorage.getItem(lsKey);
  const data = JSON.parse(stored);
  lru.load(data);
} catch {
  // do nothing
}

const save = debounce(() => {
  try {
    localStorage.setItem(lsKey, JSON.stringify(lru.dump()));
  } catch {
    // do nothing
  }
}, lruSaveTimeout);

export function get(url, defaultRatio) {
  const r = lru.get(url);
  return r !== undefined ? r : defaultRatio;
}

export function set(url, ratio) {
  lru.set(url, ratio);
  save();
  return ratio;
}
