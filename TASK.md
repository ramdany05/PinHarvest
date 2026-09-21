# 📋 Task — Implementation Roadmap

## PinHarvest Extension

| Atribut | Detail |
| :--- | :--- |
| **Dokumen Terkait** | [PRD.md](./PRD.md), [FSD.md](./FSD.md) |
| **Tech Stack** | Lihat [FSD §4](./FSD.md#4-tech-stack-implementasi) |
| **Status** | 🟢 **MVP fungsional selesai** — alur inti (inspect → scroll → capture → export) sudah berjalan. Sisa pekerjaan: perbaikan bug, penambahan test, dan packaging rilis. |
| **Terakhir Diperbarui** | 21 September 2026 (audit kode `entrypoints/` & `tests/`) |

### 📊 Ringkasan Progres

| Status | Jumlah | Persentase |
| :--- | :--- | :--- |
| 🟢 Done | **52** | 73% |
| 🟡 Partial / Perlu Perbaikan | **9** | 13% |
| ⚪ Not Started | **8** | 11% |
| ⏭️ Skipped (opsional) | **2** | 3% |
| **Total** | **71** | 100% |

> **Terverifikasi (21 Sep 2026):** `npm run build` berhasil (`.output/chrome-mv3/`, total **18.52 kB**) dan `npm test` lulus **8/8** test di 4 file.

---

## Legend

- 🟢 **Done** — Implementasi selesai dan sesuai spesifikasi
- 🟡 **Partial** — Sudah ada implementasinya, tetapi belum lengkap, belum tervalidasi, atau mengandung bug
- ⚪ **Not Started** — Belum dikerjakan
- ⏭️ **Skipped** — Ditinggalkan secara sadar (opsional / tidak masuk scope MVP)

---

## 📌 Phase 0: Foundational Setup

**Tujuan:** Inisialisasi proyek WXT, tooling, dan struktur folder.

**Progres:** 5 🟢 · 1 🟡 · 1 ⏭️

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 0.1 | Inisialisasi project dengan WXT (`npx wxt init`) | 🟢 | — | §4.2 |
| 0.2 | Setup TypeScript (`tsconfig.json`) via WXT auto-generate | 🟢 | 0.1 | §4.1 |
| 0.3 | Setup ESLint + Prettier | 🟡 | 0.1 | §4.1 |
| 0.4 | Setup Vitest + `vitest-chrome` (mock Chrome API) | 🟢 | 0.1 | §4.4 |
| 0.5 | Setup Tailwind CSS (opsional, via WXT integration) | ⏭️ | 0.1 | §4.1 |
| 0.6 | Buat struktur folder sesuai mapping FSD (entrypoints/) | 🟢 | 0.1 | §4.2 |
| 0.7 | Verifikasi build: `wxt build` berhasil tanpa error | 🟢 | 0.1–0.6 | — |

> **Catatan:**
> - **0.3** 🟡 — `eslint@^9` + `prettier@^3` sudah ada di `devDependencies` dan script `lint: "eslint ."` terdaftar di `package.json`, tetapi **belum ada file konfigurasi** (`eslint.config.js` / `.prettierrc`). Akibatnya `npm run lint` gagal.
> - **0.4** 🟢 — Memakai **happy-dom** (bukan `vitest-chrome`) sebagai environment test; Chrome API di-mock manual per-test. Berfungsi, hanya berbeda dari rencana awal.
> - **0.5** ⏭️ — Skip: popup cukup memakai CSS vanilla (`entrypoints/popup/style.css`), tidak butuh Tailwind.

**Deliverables:** ✅ Proyek dapat di-build dan di-load sebagai ekstensi Chrome dev.

---

## 📌 Phase 1: Shared Types & Messaging Contract

**Tujuan:** Mendefinisikan tipe pesan, state, dan data yang digunakan seluruh modul.

**Progres:** 5 🟢 · 1 🟡

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 1.1 | Definisikan `ScrapedDataItem` (interface: `text`, `href`, `timestamp`, `selector`, dll.) | 🟢 | 0.1 | §2.3, §2.4 |
| 1.2 | Definisikan `ExtensionMessage` (union type untuk semua pesan: start/stop/export/data) | 🟢 | 1.1 | §2.4 |
| 1.3 | Definisikan `ExtensionState` (enum/type: `idle`, `inspecting`, `scrolling`, `paused`, `done`) | 🟢 | 1.1 | §2.4 |
| 1.4 | Definisikan `ExportFormat` (type: `'csv' \| 'json'`) | 🟢 | 1.1 | §2.4 |
| 1.5 | Buat shared types file (`entrypoints/shared/types.ts`) | 🟢 | 1.1–1.4 | — |
| 1.6 | Buat message channel constants (`entrypoints/shared/channels.ts`) | 🟡 | 1.2 | — |

> **Catatan:**
> - **1.6** 🟡 — `channels.ts` sudah dibuat (`MESSAGE_CHANNELS`), tetapi **belum diimpor di file mana pun** — seluruh kode masih memakai string literal pada `types.ts`. Tidak ada bahaya, hanya konstanta yang belum termanfaatkan.

**Deliverables:** ✅ Semua tipe dan kontrak messaging siap digunakan oleh modul lain.

---

## 📌 Phase 2: Modul A — Element Inspector & Picker

**Tujuan:** Implementasi interactive element picker di content script.

**Progres:** 6 🟢 · 2 🟡

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 2.1 | Setup content script entry (`entrypoints/content.ts`) dengan `defineContentScript()` | 🟢 | 0.1, 1.5 | §1, §2.1 |
| 2.2 | Implementasi `mouseover` listener: highlight sementara (`outline: 3px solid #00ff88`) | 🟢 | 2.1 | §2.1 |
| 2.3 | Implementasi `mouseout` listener: hapus highlight dari elemen sebelumnya | 🟢 | 2.2 | §2.1 |
| 2.4 | Implementasi `click` listener: stop inspect mode, simpan referensi elemen | 🟢 | 2.2 | §2.1 |
| 2.5 | Implementasi toggle inspect mode (start/stop via message dari popup) | 🟢 | 2.1–2.4 | §2.1 |
| 2.6 | Ekstrak CSS selector unik dari elemen yang dipilih | 🟢 | 2.4 | §2.1 |
| 2.7 | Validasi: elemen target memiliki scroll container | 🟡 | 2.4 | §3 |
| 2.8 | Notifikasi ke popup saat elemen berhasil dipilih atau gagal | 🟡 | 2.5–2.7 | §2.1 |

> **Catatan:**
> - **2.7** 🟡 **BUG** — `content.ts:handleClick()` selalu mengirim `isValidScrollable: true`, sehingga blok gagal di `background.ts` (`INSPECT_SELECTED` → `else`) adalah *dead code*. Karena `findScrollContainer()` juga fallback ke `document.body` (selalu dianggap scrollable), halaman yang salah pilih akan tetap di-scrape dan menghasilkan data sampah.
> - **2.8** 🟡 — Jalur sukses berfungsi (`STATE_CHANGED` → toast di popup), tetapi jalur **gagal tidak pernah bisa terjadi** karena 2.7 di atas. Toast error tidak akan pernah muncul.
> - **2.3** ⚠️ minor — `handleMouseOut()` menghapus highlight dari `e.target`, bukan dari `currentHighlightedEl`; referensi global berpotensi menunjuk elemen yang sudah tidak ter-highlight.

**Deliverables:** ✅ Pengguna bisa mengarahkan kursor, melihat highlight, mengklik, dan elemen terseleksi.

---

## 📌 Phase 3: Modul B — Auto-Scroll Engine

**Tujuan:** Implementasi scroll otomatis pada elemen yang dipilih.

**Progres:** 5 🟢 · 2 🟡

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 3.1 | Implementasi fungsi scroll dengan `element.scrollTop = element.scrollHeight` | 🟢 | 2.6 | §2.2 |
| 3.2 | Implementasi random delay (1000ms–3000ms) antar scroll | 🟢 | 3.1 | §2.2 |
| 3.3 | Implementasi boundary detection (uji apakah sudah di ujung bawah) | 🟡 | 3.1 | §2.2 |
| 3.4 | Implementasi `maxScrolls` counter (opsional, untuk batas maksimal) | 🟢 | 3.1 | §2.2 |
| 3.5 | Implementasi mekanisme retry: tunggu hingga 3x siklus jika scrollHeight tidak berubah | 🟢 | 3.3 | §3 |
| 3.6 | Integrasi start/stop scroll via message dari popup | 🟢 | 3.1–3.5 | §2.2 |
| 3.7 | Kirim status scroll ke background (current scroll count, selesai/tidak) | 🟡 | 3.6 | §2.4 |

> **Catatan:**
> - **3.2** 🟢 — Default engine 1000–3000 ms (`scrollEngine.ts:29-30`), namun `content.ts:115-116` menginstansiasi dengan **1200–2500 ms** (lebih manusiawi). Keduanya sesuai rentang FSD.
> - **3.3** 🟡 — Deteksi ujung daftar memakai *change-tracking* (`lastScrollTop` + `lastScrollHeight` + `noChangeCount`), **bukan** pemeriksaan eksplisit `scrollTop + clientHeight >= scrollHeight` seperti di PRD. Berfungsi, tetapi lebih lambat mengenali ujung daftar dan bisa salah berhenti bila konten memuat batch besar sekaligus.
> - **3.7** 🟡 — `onScrollStep` tersedia di engine tapi **tidak dipasang** di `content.ts`; background hanya menerima `STOP_SCROLL` + `reason` saat selesai. Tidak ada update progres scroll per-langkah ke background/popup (popup hanya menampilkan jumlah item).
> - **3.4** 🟢 — `maxScrolls` ada (default 1000) dan berhenti dengan `onEnd('max_reached')`, tetapi belum bisa dikonfigurasi dari UI.

**Deliverables:** ✅ Content script melakukan scroll otomatis dengan jeda manusiawi dan berhenti di ujung.

---

## 📌 Phase 4: Modul C — Data Capture (Penanganan Virtual DOM)

**Tujuan:** Menangkap data dari elemen DOM yang baru muncul saat scroll.

**Progres:** 6 🟢

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 4.1 | Implementasi `MutationObserver` pada container elemen target | 🟢 | 2.6, 3.1 | §2.3 |
| 4.2 | Alternatif: implementasi `setInterval` polling 500ms sebagai fallback | 🟢 | 4.1 | §2.3 |
| 4.3 | Ekstrak `innerText` dan atribut (`href`, dll.) dari DOM baru | 🟢 | 4.1 | §2.3 |
| 4.4 | Implementasi `Set<ScrapedDataItem>` untuk dedup data otomatis | 🟢 | 1.1, 4.3 | §2.3 |
| 4.5 | Kirim data incremental ke background via `chrome.runtime.sendMessage` | 🟢 | 4.4, 1.2 | §2.4 |
| 4.6 | Simpan data parsial ke `chrome.storage.local` sebagai cadangan (anti-crash) | 🟢 | 4.5 | §3 |

> **Catatan:**
> - **4.2** 🟢 — Observer **dan** polling 500 ms berjalan bersamaan sebagai jaring pengaman ganda; `stop()` membersihkan keduanya.
> - **4.4** 🟢 — Kunci dedup memakai komposit `title::href` (bukan `id` acak), plus dedup lapis kedua di background (`background.ts:63-64` — filter `existingIds`).
> - **4.6** 🟢 — Penyimpanan dilakukan **di background** (`saveState()` dipanggil setiap batch `NEW_DATA_ITEMS`), bukan di content script. Secara arsitektur justru lebih aman karena service worker tetap hidup saat tab dinavigasi.

**Deliverables:** ✅ Data setiap item baru tertangkap, di-dedup, dan dikirim ke background secara real-time.

---

## 📌 Phase 5: Modul D — Storage & Export

**Tujuan:** Menyimpan data di background dan menyediakan export CSV/JSON.

**Progres:** 8 🟢

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 5.1 | Implementasi `chrome.runtime.onMessage` listener di background worker | 🟢 | 0.1, 1.2 | §2.4 |
| 5.2 | Implementasi state management: simpan `ScrapedDataItem[]` di `chrome.storage.local` | 🟢 | 1.3, 5.1 | §2.4 |
| 5.3 | Implementasi dedup global di background (merge dari content script) | 🟢 | 5.2 | §2.3 |
| 5.4 | Implementasi serialisasi CSV (header + baris, handle escape) | 🟢 | 5.2 | §2.4 |
| 5.5 | Implementasi serialisasi JSON (pretty-print array) | 🟢 | 5.2 | §2.4 |
| 5.6 | Implementasi `Blob` + `URL.createObjectURL` untuk trigger download | 🟢 | 5.4, 5.5 | §2.4 |
| 5.7 | Implementasi trigger export via message dari popup | 🟢 | 5.6 | §2.4 |
| 5.8 | Kirim data export ke popup untuk ditampilkan (opsional preview) | 🟢 | 5.7 | — |

> **Catatan:**
> - **5.4** 🟢 — `escapeCSVField()` membungkus semua field dengan kutip dan menggandakan `"` di dalamnya; timestamp dikonversi ke ISO string. Header: `Title, Rating, Reviews, Category, Address, Phone, Website, Status, URL, RawText, Timestamp`.
> - **5.6** 🟢 — `triggerDownload()` di `exportUtils.ts` memanggil `URL.revokeObjectURL()` setelah klik untuk mencegah memory leak.
> - **5.8** 🟢 — Data dikirim via `sendResponse` ke popup, tetapi **belum ada UI preview**; popup langsung mengunduhnya. Preview sesungguhnya masih bisa ditambahkan nanti.

**Deliverables:** ✅ Data tersimpan, dan user bisa download CSV atau JSON.

---

## 📌 Phase 6: Popup UI

**Tujuan:** Antarmuka pengguna untuk mengontrol ekstensi.

**Progres:** 8 🟢

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 6.1 | Buat `entrypoints/popup/index.html` dengan struktur dasar | 🟢 | 0.1 | §1, §4.2 |
| 6.2 | Implementasi tombol **Start Inspect** / **Stop Inspect** (toggle) | 🟢 | 6.1 | §2.1 |
| 6.3 | Implementasi tombol **Export to CSV** dan **Export to JSON** | 🟢 | 6.1 | §2.4 |
| 6.4 | Implementasi indikator status (idle, inspecting, scrolling, done) | 🟢 | 1.3, 6.1 | — |
| 6.5 | Implementasi counter hasil (jumlah data yang sudah terkumpul) | 🟢 | 6.4, 5.2 | — |
| 6.6 | Implementasi komunikasi `chrome.runtime.sendMessage` ke background | 🟢 | 6.2–6.3, 1.2 | §2.4 |
| 6.7 | Styling popup (CSS): responsive, modern, clean | 🟢 | 6.1 | — |
| 6.8 | Handling error state: tampilkan toast/alert jika ada masalah | 🟢 | 6.6 | §3 |

> **Catatan:**
> - **6.2** 🟢 — Tombol Start/Stop di-*toggle* lewat `display` berdasarkan state (`inspecting`/`scrolling` → tampilkan Stop). Tombol Export otomatis `disabled` saat `count === 0`.
> - **6.4** 🟢 — Indikator berupa dot berwarna kelas `dot <state>` + teks `Status: Idle/Inspecting/Scrolling/Done`.
> - **6.8** 🟢 — `showToast()` tampil 4 detik; namun hanya ter-trigger dari field `message` pada `STATE_CHANGED`. Karena bug 2.7/7.2, toast error praktis belum pernah muncul — nilainya akan nyata setelah bug itu diperbaiki.

**Deliverables:** ✅ Popup berfungsi penuh — start/stop inspect, lihat progress, export data.

---

## 📌 Phase 7: Edge Cases & Error Handling

**Tujuan:** Menangani kasus khusus sesuai FSD §3.

**Progres:** 4 🟢 · 1 🟡 · 1 ⚪

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 7.1 | Koneksi lambat: retry 3x siklus jika `scrollHeight` tidak berubah | 🟢 | 3.5 | §3 |
| 7.2 | Elemen tidak bisa di-scroll: notifikasi toast ke popup | 🟡 | 2.7 | §3 |
| 7.3 | Web crash: pulihkan data dari `chrome.storage.local` | 🟢 | 4.6 | §3 |
| 7.4 | Handle tab switch / navigasi: pause scroll, notifikasi user | ⚪ | 3.6 | — |
| 7.5 | Handle popup close saat scroll berjalan: scroll tetap lanjut via background | 🟢 | 5.1, 3.6 | — |
| 7.6 | Handle duplicate data di edge case (DOM append ulang) | 🟢 | 4.4 | §2.3 |

> **Catatan:**
> - **7.2** 🟡 **BUG** — Sama akarnya dengan 2.7: toast *"Selected element is not scrollable"* ada di `background.ts` tapi tidak akan pernah dipanggil karena content script selalu mengirim `isValidScrollable: true`.
> - **7.3** 🟢 — `background.ts` memuat ulang `scrapedData`, `currentState`, dan `selectedSelector` dari `chrome.storage.local` saat inisialisasi. Catatan: **proses scroll tidak di-resume** otomatis setelah service worker dimatikan Chrome — user perlu menekan Start lagi.
> - **7.4** ⚪ — Belum ada listener `visibilitychange` maupun `chrome.tabs.onUpdated`. Bila tab dinavigasi saat scraping, content script hilang tanpa notifikasi (state di background tetap `scrolling` → popup bisa "nyangkut"). Ini kandidat prioritas setelah dua bug utama.

**Deliverables:** 🟡 Ekstensi stabil untuk skenario umum; skenario navigasi/tab-switch belum ditangani.

---

## 📌 Phase 8: Testing

**Tujuan:** Unit test dan integration test untuk semua modul.

**Progres:** 2 🟢 · 2 🟡 · 3 ⚪

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 8.1 | Test Modul B: boundary detection, random delay, maxScrolls | 🟢 | 3.1–3.5, 0.4 | §4.4 |
| 8.2 | Test Modul C: dedup via `Set`, ekstraksi `innerText`/`href` | 🟡 | 4.3–4.4, 0.4 | §4.4 |
| 8.3 | Test Modul D: serialisasi CSV/JSON, `Blob` URL, filename | 🟢 | 5.4–5.6, 0.4 | §4.4 |
| 8.4 | Test Modul A: CSS selector generation, validasi scroll container | 🟡 | 2.6–2.7, 0.4 | §4.4 |
| 8.5 | Integration test: round-trip message popup → background → content | ⚪ | 6.6, 5.1, 2.5, 0.4 | §4.4 |
| 8.6 | Integration test: full flow (inspect → scroll → capture → export) | ⚪ | 8.1–8.5 | — |
| 8.7 | E2E test: load extension di Chrome, test di halaman real (manual / browser-use) | ⚪ | 8.6 | — |

> **Catatan:**
> - **8.1** 🟢 — `scrollEngine.test.ts` memakai fake timers untuk memverifikasi 2 langkah scroll lalu berhenti dengan `max_reached`. Belum menguji jalur `noChangeCount >= retryLimit` (ujung daftar asli).
> - **8.2** 🟡 — Test berjudul *"deduplicates items"* hanya memastikan `getCapturedItems().length > 0`; **belum ada assertion dedup** (idealnya: panggil capture 2x, pastikan jumlah item tetap sama).
> - **8.3** 🟢 — CSV diuji sampai kasus escape kutip (`"Hello, ""World"""`) dan JSON diuji struktur `rawText`. Pengujian `triggerDownload`/`Blob` belum ada (butuh mock DOM API).
> - **8.4** 🟡 — `utils.test.ts` menguji `generateCssSelector` (id + hierarchy) dan `findScrollContainer`, tetapi **tidak ada test untuk `isScrollable()`** maupun jalur validasi di `handleClick` — justru bagian yang saat ini buggy.
> - **8.5–8.7** ⚪ — Belum ada integration/E2E test sama sekali.

**Deliverables:** 🟡 Baru 8 unit test lulus (4 file); target **90% coverage logika murni** belum tercapai.

---

## 📌 Phase 9: Build, Packaging & Release

**Tujuan:** Finalisasi ekstensi untuk distribusi.

**Progres:** 3 🟢 · 4 ⚪ · 1 ⏭️

| # | Task | Status | Dependensi | FSD Ref |
| :--- | :--- | :--- | :--- | :--- |
| 9.1 | Finalisasi `wxt.config.ts` untuk production build | 🟢 | 0.1 | §4.1 |
| 9.2 | Optimasi bundle size (tree-shake, minify via Vite) | 🟢 | 9.1 | — |
| 9.3 | Review permissions di manifest (minimal: `storage`, `activeTab`, `scripting`) | 🟢 | 9.1 | — |
| 9.4 | Test build di Chrome Canary / stable | ⚪ | 9.1–9.3 | — |
| 9.5 | Buat icon extension (16px, 48px, 128px) | ⚪ | — | — |
| 9.6 | Buat store listing description (English + Indonesian) | ⚪ | — | — |
| 9.7 | Package `.zip` untuk Chrome Web Store upload | ⚪ | 9.4–9.6 | — |
| 9.8 | (Opsional) Build untuk Firefox via WXT cross-browser | ⏭️ | 9.7 | — |

> **Catatan:**
> - **9.2** 🟢 — Bundle produksi hanya **~18.5 kB** karena nol runtime dependency (semua library hanya `devDependencies`). Target `es2022` sudah diset.
> - **9.3** 🟢 — Manifest sudah memakai izin paling minimal: `storage`, `activeTab`, `scripting` — tanpa `host_permissions` berlebih.
> - **9.4** ⚪ — Belum ada catatan pengujian manual di Chrome stable. Wajib dilakukan sebelum upload (inilah satu-satunya validasi perilaku end-to-end sampai test integration 8.5–8.6 dibuat).
> - **9.7** ⚪ — Script `wxt zip` sudah tersedia di `package.json`, tetapi belum pernah dijalankan; masih tertahan oleh 9.5 (icon wajib untuk upload ke Chrome Web Store).
> - **9.8** ⏭️ — Di luar scope MVP (fokus Chrome dulu).

**Deliverables:** 🟡 Build & konfigurasi siap; icon, store listing, dan packaging belum.

---

## 🗺️ Dependency Graph (Visual)

```
Phase 0: Setup                        🟢
    │
    ▼
Phase 1: Shared Types                 🟢
    │
    ├──────────────────────────────┐
    ▼                              ▼
Phase 2: Modul A (Picker)     Phase 4: Modul C (Capture)
    🟡 (validasi buggy)           🟢
    │                              │
    ▼                              │
Phase 3: Modul B (Scroll)  ───────┤
    🟡 (boundary detection)        │
    │                              │
    └──────────┬───────────────────┘
               ▼
          Phase 5: Modul D (Storage & Export)   🟢
               │
               ▼
          Phase 6: Popup UI                      🟢
               │
               ▼
          Phase 7: Edge Cases                    🟡
               │
               ▼
          Phase 8: Testing                       🟡
               │
               ▼
          Phase 9: Build & Release               🟡
```

---

## ⏱️ Estimasi & Realisasi

| Phase | Tasks | Estimasi Awal | Progres | Sisa Pekerjaan |
| :--- | :--- | :--- | :--- | :--- |
| Phase 0: Setup | 7 | 1 hari | 5 🟢 · 1 🟡 · 1 ⏭️ | Tambah config ESLint (0.3) |
| Phase 1: Shared Types | 6 | 0.5 hari | 5 🟢 · 1 🟡 | Pakai `MESSAGE_CHANNELS` atau hapus file (1.6) |
| Phase 2: Modul A | 8 | 2 hari | 6 🟢 · 2 🟡 | **Perbaiki validasi scrollable (2.7)** |
| Phase 3: Modul B | 7 | 1.5 hari | 5 🟢 · 2 🟡 | Boundary detection eksplisit + progres scroll (3.3, 3.7) |
| Phase 4: Modul C | 6 | 2 hari | 6 🟢 | — |
| Phase 5: Modul D | 8 | 1.5 hari | 8 🟢 | — |
| Phase 6: Popup UI | 8 | 1.5 hari | 8 🟢 | — |
| Phase 7: Edge Cases | 6 | 1 hari | 4 🟢 · 1 🟡 · 1 ⚪ | Bug toast (7.2) + tab switch (7.4) |
| Phase 8: Testing | 7 | 2 hari | 2 🟢 · 2 🟡 · 3 ⚪ | Perkuat test dedup; integration test |
| Phase 9: Build & Release | 8 | 1 hari | 3 🟢 · 4 ⚪ · 1 ⏭️ | Icon, store listing, `.zip`, uji manual |
| **Total** | **71** | **~14 hari** | **52 🟢 · 9 🟡 · 8 ⚪ · 2 ⏭️** | **~4–5 hari kerja** |

---

## 🔎 Open Issues (Hasil Audit Kode)

Temuan dari perbandingan PRD/FSD dengan implementasi aktual, diurutkan berdasarkan dampak:

| # | Severity | Temuan | Lokasi | Task Terkait |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 🔴 High | `isValidScrollable` selalu `true` → validasi "bukan container scroll" adalah *dead code*; salah pilih elemen = data sampah tanpa peringatan | `content.ts` (`handleClick`) | 2.7, 7.2 |
| 2 | 🔴 High | Ujung daftar dideteksi via *change-tracking*, bukan `scrollTop + clientHeight >= scrollHeight` seperti spesifikasi PRD | `scrollEngine.ts` (`step`) | 3.3 |
| 3 | 🟡 Medium | Tab dinavigasi/di-switch saat scraping → tidak ada pause/notifikasi; state di background bisa tertinggal di `scrolling` | `content.ts`, `background.ts` | 7.4 |
| 4 | 🟡 Medium | Test dedup tidak benar-benar menguji dedup; `isScrollable()` belum punya test (justru area yang buggy) | `tests/dataCapture.test.ts`, `tests/utils.test.ts` | 8.2, 8.4 |
| 5 | 🟡 Medium | `eslint.config.js` belum ada → `npm run lint` gagal walau dependency & script sudah terpasang | root | 0.3 |
| 6 | 🟡 Low | `handleMouseOut` menghapus highlight dari `e.target`, bukan dari `currentHighlightedEl` | `content.ts` (`handleMouseOut`) | 2.3 |
| 7 | 🟡 Low | `channels.ts` dibuat tapi tidak dipakai di mana pun | `shared/channels.ts` | 1.6 |
| 8 | 🟡 Low | Progres scroll per-langkah tidak dikirim ke background (`onScrollStep` tidak di-wire) | `content.ts` (`initiateScrape`) | 3.7 |

### 🎯 Rekomendasi Urutan Pengerjaan Berikutnya

1. **Perbaiki #1 & #2** — dua bug ini memengaruhi *setiap* sesi scraping (validasi scrollable + deteksi ujung daftar).
2. **Tambah eslint config (#5)** — murah, langsung membuat `npm run lint` hijau.
3. **Perkuat test (#4)** — assertion dedup yang benar + test `isScrollable()`, lalu kejar target 90% coverage.
4. **Handle tab switch (#3)** — cegah state nyangkut sebelum dipakai user nyata.
5. **Rilis (#9.4–9.7)** — uji manual di Chrome, icon, store listing, lalu `wxt zip`.

---

## Riwayat Dokumen

| Versi | Tanggal | Perubahan |
| :--- | :--- | :--- |
| 1.0 | — | Initial release — task breakdown dari PRD & FSD. |
| 1.1 | 2026-09-21 | Audit menyeluruh terhadap `entrypoints/`, `tests/`, `package.json`, dan `wxt.config.ts`; seluruh status task diperbarui dari ⚪ menjadi kondisi aktual (52 🟢 · 9 🟡 · 8 ⚪ · 2 ⏭️). Ditambahkan: ringkasan progres, catatan bukti per-phase, kolom realisasi pada tabel estimasi, serta daftar Open Issues + rekomendasi prioritas. Legenda disesuaikan (`⏭️ Skipped`, makna 🟡 diperluas ke "partial/buggy"). |
