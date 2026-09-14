# 📋 Task — Implementation Roadmap

## PinHarvest Extension

| Atribut | Detail |
| :--- | :--- |
| **Dokumen Terkait** | [PRD.md](./PRD.md), [FSD.md](./FSD.md) |
| **Tech Stack** | Lihat [FSD §4](./FSD.md#4-tech-stack-implementasi) |
| **Status** | Belum dimulai |

---

## Legend

- 🔴 **Blocker** — Belum bisa dikerjakan
- 🟡 **In Progress** — Sedang dikerjakan
- 🟢 **Done** — Selesai
- ⚪ **Not Started** — Belum dimulai

---

## 📌 Phase 0: Foundational Setup

**Tujuan:** Inisialisasi proyek WXT, tooling, dan struktur folder.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 0.1 | Inisialisasi project dengan WXT (`npx wxt init`) | ⚪ | — | §4.2 |
| 0.2 | Setup TypeScript (`tsconfig.json`) via WXT auto-generate | ⚪ | 0.1 | §4.1 |
| 0.3 | Setup ESLint + Prettier | ⚪ | 0.1 | §4.1 |
| 0.4 | Setup Vitest + `vitest-chrome` (mock Chrome API) | ⚪ | 0.1 | §4.4 |
| 0.5 | Setup Tailwind CSS (opsional, via WXT integration) | ⚪ | 0.1 | §4.1 |
| 0.6 | Buat struktur folder sesuai mapping FSD (entrypoints/) | ⚪ | 0.1 | §4.2 |
| 0.7 | Verifikasi build: `wxt build` berhasil tanpa error | ⚪ | 0.1–0.6 | — |

**Deliverables:** Proyek dapat di-build dan di-load sebagai ekstensi Chrome dev.

---

## 📌 Phase 1: Shared Types & Messaging Contract

**Tujuan:** Mendefinisikan tipe pesan, state, dan data yang digunakan seluruh modul.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 1.1 | Definisikan `ScrapedDataItem` (interface: `text`, `href`, `timestamp`, `selector`, dll.) | ⚪ | 0.1 | §2.3, §2.4 |
| 1.2 | Definisikan `ExtensionMessage` (union type untuk semua pesan: start/stop/export/data) | ⚪ | 1.1 | §2.4 |
| 1.3 | Definisikan `ExtensionState` (enum/type: `idle`, `inspecting`, `scrolling`, `paused`, `done`) | ⚪ | 1.1 | §2.4 |
| 1.4 | Definisikan `ExportFormat` (type: `'csv' | 'json'`) | ⚪ | 1.1 | §2.4 |
| 1.5 | Buat shared types file (`entrypoints/shared/types.ts`) | ⚪ | 1.1–1.4 | — |
| 1.6 | Buat message channel constants (`entrypoints/shared/channels.ts`) | ⚪ | 1.2 | — |

**Deliverables:** Semua tipe dan kontrak messaging siap digunakan oleh modul lain.

---

## 📌 Phase 2: Modul A — Element Inspector & Picker

**Tujuan:** Implementasi interactive element picker di content script.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 2.1 | Setup content script entry (`entrypoints/content.ts`) dengan `defineContentScript()` | ⚪ | 0.1, 1.5 | §1, §2.1 |
| 2.2 | Implementasi `mouseover` listener: highlight sementara (`outline: 3px solid #00ff88`) | ⚪ | 2.1 | §2.1 |
| 2.3 | Implementasi `mouseout` listener: hapus highlight dari elemen sebelumnya | ⚪ | 2.2 | §2.1 |
| 2.4 | Implementasi `click` listener: stop inspect mode, simpan referensi elemen | ⚪ | 2.2 | §2.1 |
| 2.5 | Implementasi toggle inspect mode (start/stop via message dari popup) | ⚪ | 2.1–2.4 | §2.1 |
| 2.6 | Ekstrak CSS selector unik dari elemen yang dipilih | ⚪ | 2.4 | §2.1 |
| 2.7 | Validasi: elemen target memiliki scroll container | ⚪ | 2.4 | §3 |
| 2.8 | Notifikasi ke popup saat elemen berhasil dipilih atau gagal | ⚪ | 2.5–2.7 | §2.1 |

**Deliverables:** Pengguna bisa mengarahkan kursor, melihat highlight, mengklik, dan elemen terseleksi.

---

## 📌 Phase 3: Modul B — Auto-Scroll Engine

**Tujuan:** Implementasi scroll otomatis pada elemen yang dipilih.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 3.1 | Implementasi fungsi scroll dengan `element.scrollTop = element.scrollHeight` | ⚪ | 2.6 | §2.2 |
| 3.2 | Implementasi random delay (1000ms–3000ms) antar scroll | ⚪ | 3.1 | §2.2 |
| 3.3 | Implementasi boundary detection (uji apakah sudah di ujung bawah) | ⚪ | 3.1 | §2.2 |
| 3.4 | Implementasi `maxScrolls` counter (opsional, untuk batas maksimal) | ⚪ | 3.1 | §2.2 |
| 3.5 | Implementasi mekanisme retry: tunggu hingga 3x siklus jika scrollHeight tidak berubah | ⚪ | 3.3 | §3 |
| 3.6 | Integrasi start/stop scroll via message dari popup | ⚪ | 3.1–3.5 | §2.2 |
| 3.7 | Kirim status scroll ke background (current scroll count, selesai/tidak) | ⚪ | 3.6 | §2.4 |

**Deliverables:** Content script melakukan scroll otomatis dengan jeda manusiawi dan berhenti di ujung.

---

## 📌 Phase 4: Modul C — Data Capture (Penanganan Virtual DOM)

**Tujuan:** Menangkap data dari elemen DOM yang baru muncul saat scroll.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 4.1 | Implementasi `MutationObserver` pada container elemen target | ⚪ | 2.6, 3.1 | §2.3 |
| 4.2 | Alternatif: implementasi `setInterval` polling 500ms sebagai fallback | ⚪ | 4.1 | §2.3 |
| 4.3 | Ekstrak `innerText` dan atribut (`href`, dll.) dari DOM baru | ⚪ | 4.1 | §2.3 |
| 4.4 | Implementasi `Set<ScrapedDataItem>` untuk dedup data otomatis | ⚪ | 1.1, 4.3 | §2.3 |
| 4.5 | Kirim data incremental ke background via `chrome.runtime.sendMessage` | ⚪ | 4.4, 1.2 | §2.4 |
| 4.6 | Simpan data parsial ke `chrome.storage.local` sebagai cadangan (anti-crash) | ⚪ | 4.5 | §3 |

**Deliverables:** Data setiap item baru tertangkap, di-dedup, dan dikirim ke background secara real-time.

---

## 📌 Phase 5: Modul D — Storage & Export

**Tujuan:** Menyimpan data di background dan menyediakan export CSV/JSON.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 5.1 | Implementasi `chrome.runtime.onMessage` listener di background worker | ⚪ | 0.1, 1.2 | §2.4 |
| 5.2 | Implementasi state management: simpan `ScrapedDataItem[]` di `chrome.storage.local` | ⚪ | 1.3, 5.1 | §2.4 |
| 5.3 | Implementasi dedup global di background (merge dari content script) | ⚪ | 5.2 | §2.3 |
| 5.4 | Implementasi serialisasi CSV (header + baris, handle escape) | ⚪ | 5.2 | §2.4 |
| 5.5 | Implementasi serialisasi JSON (pretty-print array) | ⚪ | 5.2 | §2.4 |
| 5.6 | Implementasi `Blob` + `URL.createObjectURL` untuk trigger download | ⚪ | 5.4, 5.5 | §2.4 |
| 5.7 | Implementasi trigger export via message dari popup | ⚪ | 5.6 | §2.4 |
| 5.8 | Kirim data export ke popup untuk ditampilkan (opsional preview) | ⚪ | 5.7 | — |

**Deliverables:** Data tersimpan, dan user bisa download CSV atau JSON.

---

## 📌 Phase 6: Popup UI

**Tujuan:** Antarmuka pengguna untuk mengontrol ekstensi.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 6.1 | Buat `entrypoints/popup/index.html` dengan struktur dasar | ⚪ | 0.1 | §1, §4.2 |
| 6.2 | Implementasi tombol **Start Inspect** / **Stop Inspect** (toggle) | ⚪ | 6.1 | §2.1 |
| 6.3 | Implementasi tombol **Export to CSV** dan **Export to JSON** | ⚪ | 6.1 | §2.4 |
| 6.4 | Implementasi indikator status (idle, inspecting, scrolling, done) | ⚪ | 1.3, 6.1 | — |
| 6.5 | Implementasi counter hasil (jumlah data yang sudah terkumpul) | ⚪ | 6.4, 5.2 | — |
| 6.6 | Implementasi komunikasi `chrome.runtime.sendMessage` ke background | ⚪ | 6.2–6.3, 1.2 | §2.4 |
| 6.7 | Styling popup (CSS): responsive, modern, clean | ⚪ | 6.1 | — |
| 6.8 | Handling error state: tampilkan toast/alert jika ada masalah | ⚪ | 6.6 | §3 |

**Deliverables:** Popup berfungsi penuh — start/stop inspect, lihat progress, export data.

---

## 📌 Phase 7: Edge Cases & Error Handling

**Tujuan:** Menangani kasus khusus sesuai FSD §3.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 7.1 | Koneksi lambat: retry 3x siklus jika `scrollHeight` tidak berubah | ⚪ | 3.5 | §3 |
| 7.2 | Elemen tidak bisa di-scroll: notifikasi toast ke popup | ⚪ | 2.7 | §3 |
| 7.3 | Web crash: pulihkan data dari `chrome.storage.local` | ⚪ | 4.6 | §3 |
| 7.4 | Handle tab switch / navigasi: pause scroll, notifikasi user | ⚪ | 3.6 | — |
| 7.5 | Handle popup close saat scroll berjalan: scroll tetap lanjut via background | ⚪ | 5.1, 3.6 | — |
| 7.6 | Handle duplicate data di edge case (DOM append ulang) | ⚪ | 4.4 | §2.3 |

**Deliverables:** Ekstensi stabil dalam skenario non-ideal.

---

## 📌 Phase 8: Testing

**Tujuan:** Unit test dan integration test untuk semua modul.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 8.1 | Test Modul B: boundary detection, random delay, maxScrolls | ⚪ | 3.1–3.5, 0.4 | §4.4 |
| 8.2 | Test Modul C: dedup via `Set`, ekstraksi `innerText`/`href` | ⚪ | 4.3–4.4, 0.4 | §4.4 |
| 8.3 | Test Modul D: serialisasi CSV/JSON, `Blob` URL, filename | ⚪ | 5.4–5.6, 0.4 | §4.4 |
| 8.4 | Test Modul A: CSS selector generation, validasi scroll container | ⚪ | 2.6–2.7, 0.4 | §4.4 |
| 8.5 | Integration test: round-trip message popup → background → content | ⚪ | 6.6, 5.1, 2.5, 0.4 | §4.4 |
| 8.6 | Integration test: full flow (inspect → scroll → capture → export) | ⚪ | 8.1–8.5 | — |
| 8.7 | E2E test: load extension di Chrome, test di halaman real (manual / browser-use) | ⚪ | 8.6 | — |

**Deliverables:** Coverage untuk semua modul, minimal 90% logika murni teruji.

---

## 📌 Phase 9: Build, Packaging & Release

**Tujuan:** Finalisasi ekstensi untuk distribusi.

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 9.1 | Finalisasi `wxt.config.ts` untuk production build | ⚪ | 0.1 | §4.1 |
| 9.2 | Optimasi bundle size (tree-shake, minify via Vite) | ⚪ | 9.1 | — |
| 9.3 | Review permissions di manifest (minimal: `storage`, `activeTab`, `scripting`) | ⚪ | 9.1 | — |
| 9.4 | Test build di Chrome Canary / stable | ⚪ | 9.1–9.3 | — |
| 9.5 | Buat icon extension (16px, 48px, 128px) | ⚪ | — | — |
| 9.6 | Buat store listing description (English + Indonesian) | ⚪ | — | — |
| 9.7 | Package `.zip` untuk Chrome Web Store upload | ⚪ | 9.4–9.6 | — |
| 9.8 | (Opsional) Build untuk Firefox via WXT cross-browser | ⚪ | 9.7 | — |

**Deliverables:** Ekstensi siap di-publish ke Chrome Web Store.

---

## 🗺️ Dependency Graph (Visual)

```
Phase 0: Setup
    │
    ▼
Phase 1: Shared Types
    │
    ├──────────────────────────────┐
    ▼                              ▼
Phase 2: Modul A (Picker)     Phase 4: Modul C (Capture)
    │                              │
    ▼                              │
Phase 3: Modul B (Scroll)  ───────┤
    │                              │
    └──────────┬───────────────────┘
               ▼
          Phase 5: Modul D (Storage & Export)
               │
               ▼
          Phase 6: Popup UI
               │
               ▼
          Phase 7: Edge Cases
               │
               ▼
          Phase 8: Testing
               │
               ▼
          Phase 9: Build & Release
```

---

## ⏱️ Estimasi

| Phase | Tasks | Estimasi |
| :--- | :--- | :--- |
| Phase 0: Setup | 7 | 1 hari |
| Phase 1: Shared Types | 6 | 0.5 hari |
| Phase 2: Modul A | 8 | 2 hari |
| Phase 3: Modul B | 7 | 1.5 hari |
| Phase 4: Modul C | 6 | 2 hari |
| Phase 5: Modul D | 8 | 1.5 hari |
| Phase 6: Popup UI | 8 | 1.5 hari |
| Phase 7: Edge Cases | 6 | 1 hari |
| Phase 8: Testing | 7 | 2 hari |
| Phase 9: Build & Release | 8 | 1 hari |
| **Total** | **71** | **~14 hari** |

---

## Riwayat Dokumen

| Versi | Tanggal | Perubahan |
| :--- | :--- | :--- |
| 1.0 | — | Initial release — task breakdown dari PRD & FSD. |