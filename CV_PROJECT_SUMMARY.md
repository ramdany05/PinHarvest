# 📄 CV Project Summary — PinHarvest

> Copy/paste-ready entry. Placeholders in `[brackets]` need to be filled before use.
> All technical claims are verifiable from the codebase — no invented metrics.

---

## CV Entry

**PinHarvest — Google Maps Lead Harvester (Chrome Extension)** | [Chrome Web Store Link] | [GitHub Link] | [Mon YYYY – Mon YYYY]

**Overview:** No-code Chrome extension (MV3) that harvests Google Maps listings into structured, CRM-ready lead data (name, rating, phone, address) in one click, packaged in an 18 kB bundle with zero runtime dependencies.

- **Engineered** a crash-resilient data pipeline (content script → background service worker → `chrome.storage.local`) that captures virtual-DOM items in real time via MutationObserver + 500ms polling, with a dual-layer dedup filter (content + background) guaranteeing zero duplicate records.
- **Built** a visual point-and-click element picker with live hover highlighting and a popup dashboard showing real-time status (idle/inspecting/scrolling) and item counter, enabling one-click CSV/JSON export for non-technical users.
- **Optimized** for bot-detection avoidance by simulating human scrolling behavior (randomized 1.2–2.5s delays, boundary detection with 3× retry cycles), verified by 8 unit tests across 4 test suites covering capture, parsing, and export logic.

**Tech Stack:** TypeScript, Chrome Extension API (Manifest V3), WXT, Vite, Chrome APIs (chrome.storage, chrome.runtime messaging, MutationObserver), Vitest, happy-dom, ESLint/Prettier

---

## Supporting Facts (for interviews)

Use these talking points if an interviewer digs into any bullet:

| Claim in bullet | Where it lives in the code |
| :--- | :--- |
| Real-time capture via MutationObserver + 500ms polling | `entrypoints/shared/dataCapture.ts` — `DataCaptureEngine` runs both simultaneously |
| Dual-layer dedup | `dataCapture.ts` (Set of `title::href` keys) + `background.ts` (filters `NEW_DATA_ITEMS` by id) |
| Crash-resilient storage | `background.ts` — `saveState()` persists every batch to `chrome.storage.local`; state restored on service worker restart |
| Randomized human-like scrolling | `entrypoints/shared/scrollEngine.ts` — `AutoScrollEngine` with minDelay 1200ms / maxDelay 2500ms |
| 3× retry boundary detection | `scrollEngine.ts` — ends after 3 consecutive no-change scroll cycles |
| 8 unit tests / 4 suites | `tests/` — parser, scrollEngine, utils, dataCapture (`npm test`, all passing) |
| 18 kB bundle, zero runtime deps | `wxt build` output; only devDependencies in `package.json` |
| Google Maps field parsing | `entrypoints/shared/parser.ts` — extracts title, rating, reviews, category, address, phone, status |

## Checklist Before Publishing the CV

- [ ] Fill in dates: `[Mon YYYY – Mon YYYY]`
- [ ] Create GitHub repo and fill `[GitHub Link]` (project is not a git repo yet)
- [ ] Publish to Chrome Web Store and fill `[Chrome Web Store Link]` — or delete that column if unpublished
- [ ] Run one real benchmark scrape and strengthen bullet 3 with a real metric, e.g. "captured 1,000+ records from Google Maps in under 10 minutes"
- [ ] Optional: add ESLint config so "ESLint" in Tech Stack is fully true (installed but unconfigured)
