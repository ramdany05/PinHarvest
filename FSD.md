# 🛠️ Functional Specification Document (FSD)

## PinHarvest Extension

| Atribut | Detail |
| :--- | :--- |
| **Nama Produk** | PinHarvest — Google Maps Lead Harvester |
| **Platform** | Chrome Browser Extension (Manifest V3) |
| **Dokumen Terkait** | [PRD.md](./PRD.md) |

---

## 1. Arsitektur Sistem (Manifest V3)

Ekstensi akan dibangun menggunakan spesifikasi Chrome **Manifest V3** dengan tiga komponen utama:

| Komponen | File | Tanggung Jawab |
| :--- | :--- | :--- |
| **Popup** | `popup.html` & `popup.js` | Antarmuka (UI) untuk memulai/menghentikan (start/stop) proses dan mengunduh data. |
| **Background Service Worker** | `background.js` | Mengelola status global ekstensi dan menyimpan hasil ekstraksi (*state management*). |
| **Content Script** | `content.js` | Disuntikkan ke halaman web yang aktif untuk berinteraksi dengan elemen DOM (menyorot, *scroll*, dan membaca teks). |

---

## 2. Modul & Spesifikasi Logika Fungsional

### 2.1 Modul A: Element Inspector & Picker

**Trigger:** Pengguna menekan tombol **"Start Inspect"** di Popup.

**Logika Content Script:**

1. Menambahkan event listener `mouseover` ke dokumen.
2. Saat kursor berpindah, berikan *style* sementara:
   ```css
   outline: 3px solid #00ff88 !important;
   outline-offset: -3px;
   cursor: crosshair;
   ```
   pada `event.target`.
3. Hapus *outline* dari elemen sebelumnya saat kursor berpindah (`mouseout`).
4. Saat pengguna melakukan `click`, matikan mode *inspect*, simpan referensi elemen (*selector* unik atau node DOM), dan mulai **Modul B**.

### 2.2 Modul B: Auto-Scroll Engine

**Trigger:** Setelah elemen berhasil dipilih.

**Parameter:**

- `delay` — 1000ms–3000ms secara acak untuk menghindari blokir bot.
- `maxScrolls` — opsional, batas maksimal *scroll*.

**Logika Scroll:**

1. Gunakan `element.scrollTop = element.scrollHeight;` pada elemen target.
2. Validasi status: jika `element.scrollTop + element.clientHeight >= element.scrollHeight` setelah jeda yang ditentukan, artinya sudah di ujung bawah → **hentikan scroll**.

### 2.3 Modul C: Data Capture (Penanganan Virtual DOM)

**Masalah:** Instagram/Google Maps menghapus elemen lama dari DOM saat di-*scroll* ke bawah untuk menghemat RAM.

**Solusi (*Mutation Observer* / *Interval Polling*):**

1. Gunakan `setInterval` setiap **500ms** atau `MutationObserver` pada elemen *container*.
2. Setiap DOM baru muncul, ambil `innerText` atau atribut yang relevan (misal `href` untuk *link*).
3. Gunakan struktur data `Set` (JavaScript) untuk menyimpan data — `Set` secara otomatis menolak duplikasi data jika elemen yang sama terbaca dua kali.

### 2.4 Modul D: Storage & Export

**Penyimpanan Sementara:**

- Data *list* yang diekstrak dikirim dari `content.js` ke `background.js` menggunakan `chrome.runtime.sendMessage()`.

**Export:**

1. Saat pengguna menekan **"Export to CSV"**, data dari *background* ditarik dan dikonversi menjadi format *comma-separated values*.
2. Gunakan API `Blob` dan buat objek URL: `URL.createObjectURL(blob)`.
3. Picu unduhan menggunakan tag `<a>` tersembunyi dengan `download="data_hasil.csv"`.

---

## 3. Penanganan Kasus Khusus (Edge Cases)

| Skenario | Penanganan (System Action) |
| :--- | :--- |
| Koneksi lambat saat *scroll* | Jika `scrollHeight` tidak berubah, ekstensi menunggu hingga **3x siklus jeda** sebelum memutuskan bahwa proses sudah selesai (*end of list*). |
| Elemen target tidak bisa di-*scroll* | Menampilkan notifikasi alert/toast di layar: *"Elemen ini bukan container yang bisa di-scroll, silakan pilih elemen pembungkusnya."* |
| Web *crash* karena data terlalu besar | Menyimpan data secara parsial di `chrome.storage.local` setiap interval tertentu sebagai cadangan. |

---

## 4. Tech Stack (Implementasi)

### 4.1 Ringkasan Stack

| Lapisan | Pilihan | Versi / Keterangan |
| :--- | :--- | :--- |
| **Framework Ekstensi** | **WXT** | Framework full-featured untuk MV3, convention-over-configuration, HMR, cross-browser. |
| **Bundler** | **Vite** | Dijalankan di bawah WXT. HMR untuk popup & content script. |
| **Bahasa** | **TypeScript** | Type-safe di seluruh komponen (popup, background, content script). |
| **UI Popup** | **Vanilla HTML + CSS** | Popup minimal (start/stop + export); tidak perlu React/Vue. Bisa dipercantik dengan Tailwind CSS via WXT. |
| **Testing** | **Vitest** | Unit test untuk logika murni: dedup `Set`, CSV/JSON serialization, boundary scroll. |
| **Linting & Format** | **ESLint + Prettier** | Standar konvensi kode. |
| **Package Manager** | **pnpm / npm** | Bebas pilih, WXT mendukung keduanya. |

### 4.2 Mapping ke Arsitektur FSD

Struktur WXT (`entrypoints/` convention) memetakan langsung ke komponen FSD:

```
pinharvest/                          # Root project
├── entrypoints/
│   ├── background.ts                 # ⬅ FSD: background.js
│   │                                #     - chrome.runtime.onMessage listener
│   │                                #     - State management (chrome.storage.local)
│   │
│   ├── content.ts                    # ⬅ FSD: content.js
│   │                                #     - Modul A: Element Inspector & Picker
│   │                                #     - Modul B: Auto-Scroll Engine
│   │                                #     - Modul C: Data Capture (MutationObserver)
│   │
│   └── popup/
│       ├── index.html                # ⬅ FSD: popup.html
│       ├── main.ts                   # ⬅ FSD: popup.js
│       │                            #     - Tombol Start/Stop Inspect
│       │                            #     - Tombol Export to CSV/JSON
│       │                            #     - chrome.runtime.sendMessage ke background
│       └── style.css                 # Styling popup
│
├── wxt.config.ts                    # Konfigurasi WXT (Vite + manifest generation)
├── tsconfig.json                    # Auto-generated oleh WXT
├── package.json
├── vitest.config.ts                  # Testing config
└── README.md
```

### 4.3 Mapping Modul ke Dependency

| Modul FSD | Teknologi Utama | Dependency Eksternal |
| :--- | :--- | :--- |
| **Modul A** (Element Inspector) | Vanilla TS DOM API (`mouseover`, `click`, `outline` CSS) | Tidak ada |
| **Modul B** (Auto-Scroll) | Vanilla TS (`element.scrollTop`, `setTimeout` acak) | Tidak ada |
| **Modul C** (Data Capture) | `MutationObserver` / `setInterval`, `Set<T>` untuk dedup | Tidak ada |
| **Modul D** (Storage & Export) | `chrome.runtime.sendMessage`, `chrome.storage.local`, `Blob`, `URL.createObjectURL` | Tidak ada |

> **Catatan:** Proyek ini **zero runtime dependency** untuk logika inti — semua modul menggunakan API Vanilla JS/TS dan Chrome Extension API. Hanya WXT (devDependency) yang digunakan untuk build tooling.

### 4.4 Testing Strategy

| Modul | Apa yang Diuji | Tools |
| :--- | :--- | :--- |
| **Modul B** | Deteksi batas scroll, delay acak, maxScrolls | Vitest |
| **Modul C** | Dedup via `Set`, ekstraksi `innerText`/`href` | Vitest |
| **Modul D** | Serialisasi CSV/JSON, `Blob` URL, filename | Vitest |
| **Integration** | Round-trip `chrome.runtime.sendMessage` | Vitest + `vitest-chrome` (mock) |

---

## 5. Riwayat Dokumen

| Versi | Tanggal | Perubahan |
| :--- | :--- | :--- |
| 1.1 | — | Tambah bagian Tech Stack. |
| 1.0 | — | Refactor dokumen ke format Markdown terstruktur. |
