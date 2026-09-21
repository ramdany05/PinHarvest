# 📍 PinHarvest

**Google Maps Lead Harvester — Chrome Extension (Manifest V3)**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Built with WXT](https://img.shields.io/badge/Built%20with-WXT-0ea5e9)
![Tests](https://img.shields.io/badge/tests-8%20passing-brightgreen)

Ekstensi Chrome tanpa kode (*no-code*) untuk memanen listing Google Maps menjadi data prospek terstruktur yang siap diimpor ke CRM — **nama, rating, jumlah review, kategori, alamat, telepon, website, dan jam buka** — lalu diekspor ke **CSV** atau **JSON** hanya dengan sekali klik.

Cukup tunjuk container hasil pencarian di peta, dan PinHarvest akan menggulir daftarnya secara otomatis sambil merekam setiap listing yang muncul — termasuk listing yang di-*virtualize* (dihapus dari DOM saat tergulir jauh).

> Dirancang untuk tim sales/B2B dan agensi yang butuh *lead list* dari Google Maps tanpa langganan alat scraping berbayar.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| 🎯 **Visual Element Picker** | Mode *inspect* dengan *hover highlight* (outline hijau) — klik elemen untuk memilih container hasil. Tidak perlu menulis selector manual. |
| 🖱️ **Auto-Scroll Engine** | Menggulir container secara otomatis dengan **jeda acak 1.2–2.5 detik** meniru perilaku manusia, mengurangi risiko terdeteksi sebagai bot. |
| 🧠 **Virtual DOM Capture** | `MutationObserver` + *polling* 500 ms memastikan listing yang sudah terhapus dari DOM tetap terekam. |
| 🚫 **Dual-Layer Dedup** | Penyaringan duplikat dua lapis (`Set` di content script + filter `id` di background) → **tidak ada baris ganda**. |
| 🧩 **Smart Parser Google Maps** | Mengekstrak `rating (reviews)`, telepon, status buka/tutup, kategori, alamat (`Jl.`/`Jalan`/`No.`), dan website secara otomatis. Bingkai "Sponsored" dilewati. |
| 💾 **Backup Bertahap** | Setiap batch data disimpan ke `chrome.storage.local`, sehingga data tidak hilang bila tab *crash*. |
| 📤 **Export CSV / JSON** | Unduhan langsung via `Blob` + `URL.createObjectURL()` — karakter khusus CSV (koma, kutip) di-escape dengan benar. |
| 📊 **Popup Dashboard** | Status real-time (idle / inspecting / scrolling), penghitung item langsung, tombol start/stop/export/clear, dan notifikasi *toast*. |
| 📦 **Zero Runtime Dependency** | Hanya Vanilla TypeScript + Chrome API — bundle produksi **~18 kB**. WXT/Vite hanya *devDependency*. |

---

## 🏗️ Arsitektur

Ekstensi mengikuti arsitektur standar **Chrome Manifest V3** dengan tiga komponen terpisah:

```
┌─────────────────────┐        chrome.runtime.sendMessage()        ┌──────────────────────┐
│      POPUP UI       │ ─────────────────────────────────────────► │   BACKGROUND WORKER  │
│  start / stop       │ ◄───────────────────────────────────────── │  state + storage     │
│  export / counter   │            STATE_CHANGED / GET_STATE       │  (chrome.storage)    │
└─────────────────────┘                                            └──────────┬───────────┘
                                                                              │
                                                              chrome.tabs.sendMessage()
                                                                              │
                                                                              ▼
                                                                   ┌──────────────────────┐
                                                                   │    CONTENT SCRIPT    │
                                                                   │  A. Element Picker   │
                                                                   │  B. Auto-Scroll      │
                                                                   │  C. Data Capture     │
                                                                   └──────────────────────┘
```

| Komponen | File | Tanggung Jawab |
| :--- | :--- | :--- |
| **Popup** | `entrypoints/popup/` | Antarmuka pengguna: mulai/hentikan proses, pantau status & jumlah item, ekspor data. |
| **Background Service Worker** | `entrypoints/background.ts` | Manajemen *state* global, dedup lapis kedua, penyimpanan `chrome.storage.local`, pembersihan data. |
| **Content Script** | `entrypoints/content.ts` | Disuntikkan ke halaman aktif: memilih elemen, menggulir, dan membaca data dari DOM. |
| **Shared Modules** | `entrypoints/shared/` | Logika murni yang bisa diuji: parser, scroll engine, capture engine, export, tipe, util. |

Pemetaan lengkap arsitektur ke spesifikasi ada di [FSD.md](./FSD.md).

---

## 🚀 Instalasi & Development

### Prasyarat

- **Node.js** ≥ 18
- **Google Chrome** (atau browser berbasis Chromium)

### Menjalankan secara lokal

```bash
# 1. Install dependencies
npm install

# 2. Mode development (WXT membuka Chrome dengan ekstensi ter-load + HMR)
npm run dev

# 3. Build produksi → .output/chrome-mv3/
npm run build

# 4. Bungkus menjadi .zip siap upload ke Chrome Web Store
npm run zip
```

### Load manual (unpacked)

1. Jalankan `npm run build`
2. Buka `chrome://extensions`
3. Aktifkan **Developer mode** (kanan atas)
4. Klik **Load unpacked** → pilih folder `.output/chrome-mv3`

---

## 📖 Cara Pakai

1. Buka **Google Maps** dan lakukan pencarian, misal `coffee shop jakarta selatan`.
2. Klik ikon **PinHarvest** di toolbar Chrome untuk membuka popup.
3. Tekan **Start Inspecting** — kursor berubah menjadi *crosshair*.
4. Arahkan kursor ke **container daftar hasil** (panel kiri yang berisi banyak listing). Elemen akan disorot dengan outline hijau.
5. **Klik** container tersebut. Auto-scroll langsung berjalan dan penghitung *Items Extracted* mulai bertambah.
6. Tunggu hingga daftar mencapai ujung, atau tekan **Stop Scraping** kapan saja.
7. Tekan **Export CSV** atau **Export JSON** untuk mengunduh hasilnya.
8. Gunakan **Clear Extracted Data** sebelum memulai sesi scraping baru.

> 💡 **Tips:** pilih elemen pembungkus yang berisi seluruh daftar kartu (bukan satu kartu saja), agar semua listing terekam.

---

## 📁 Struktur Proyek

```
PinHarvest/
├── entrypoints/
│   ├── background.ts              # Service worker: state, storage, dedup, export trigger
│   ├── content.ts                 # Modul A (picker) + orkestrasi B & C
│   ├── popup/
│   │   ├── index.html             # Markup popup
│   │   ├── main.ts                # Logic popup + komunikasi messaging
│   │   └── style.css              # Styling popup
│   └── shared/                    # Logika murni & reusable (100% unit-tested friendly)
│       ├── types.ts               # ScrapedDataItem, ExtensionState, ExtensionMessage
│       ├── channels.ts            # Konstanta kanal komunikasi
│       ├── parser.ts              # parseItemText() — ekstraksi data Google Maps
│       ├── scrollEngine.ts        # AutoScrollEngine — gulir + deteksi ujung daftar
│       ├── dataCapture.ts         # DataCaptureEngine — MutationObserver + polling + dedup
│       ├── exportUtils.ts         # convertToCSV / convertToJSON / triggerDownload
│       └── utils.ts               # Helper umum (selector, delay, dll.)
├── tests/
│   ├── dataCapture.test.ts
│   ├── parser.test.ts
│   ├── scrollEngine.test.ts
│   └── utils.test.ts
├── PRD.md                         # Product Requirements Document
├── FSD.md                         # Functional Specification Document
├── TASK.md                        # Breakdown task implementasi
├── wxt.config.ts                  # Konfigurasi WXT + manifest
├── vitest.config.ts               # Konfigurasi test runner (happy-dom)
├── tsconfig.json
└── package.json
```

---

## 📊 Skema Data Hasil

Setiap listing direkam sebagai objek `ScrapedDataItem`:

```ts
{
  id: string;          // ID unik (dipakai untuk dedup)
  title: string;       // Nama bisnis
  rating: string;      // "4.7"
  reviews: string;     // "1,234"
  category: string;    // "Coffee shop"
  address: string;     // "Jl. ... No. 12, Jakarta"
  phone: string;       // "+62 812-3456-7890"
  website: string;     // "https://..."
  status: string;      // "Open" | "Closed" | "Opens 7 AM"
  text: string;        // Teks mentah kartu (fallback)
  href: string;        // URL listing di Google Maps
  selector: string;
  timestamp: number;
}
```

**Kolom CSV/JSON:** `Title, Rating, Reviews, Category, Address, Phone, Website, Status, URL, RawText, Timestamp`

---

## 🧪 Testing

```bash
npm test        # Vitest (run once)
npm run lint    # ESLint
```

Unit test menutup logika murni yang paling rawan bug: dedup `Set`, deteksi ujung daftar pada scroll engine, ekstraksi & normalisasi field pada parser, serta serialisasi CSV/JSON.

---

## ⚙️ Konfigurasi

Parameter utama auto-scroll (`AutoScrollEngineOptions`) dan perilaku dapat disesuaikan:

| Opsi | Default | Keterangan |
| :--- | :--- | :--- |
| `minDelay` | `1000` ms | Jeda minimum antar gulir |
| `maxDelay` | `3000` ms | Jeda maksimum antar gulir |
| `maxScrolls` | `1000` | Batas keras jumlah gulir |
| `retryLimit` | `3` | Siklus tanpa perubahan sebelum daftar dianggap selesai |

Izin ekstensi (`wxt.config.ts`): `storage`, `activeTab`, `scripting`.

---

## 🗺️ Roadmap

- [ ] Validasi *scroll container* yang sesungguhnya (saat ini fallback ke `document.body`)
- [ ] Deteksi ujung daftar eksplisit via `scrollTop + clientHeight >= scrollHeight`
- [ ] Konfigurasi `maxScrolls` & delay dari UI popup
- [ ] Icon ekstensi (tema *map pin*) + screenshot untuk Chrome Web Store
- [ ] Dukungan situs lain (direktori bisnis, marketplace)
- [ ] Konfigurasi ESLint (script `lint` sudah ada, config belum)
- [ ] Ekspor langsung ke Google Sheets / CRM

---

## 📚 Dokumentasi Terkait

| Dokumen | Isi |
| :--- | :--- |
| [PRD.md](./PRD.md) | Latar belakang produk, target user, use case, metrik keberhasilan |
| [FSD.md](./FSD.md) | Spesifikasi fungsional tiap modul, arsitektur, edge case, tech stack |
| [TASK.md](./TASK.md) | Breakdown task implementasi per fase |

---

## 📄 Lisensi

Belum ada lisensi yang ditetapkan untuk proyek ini. Selama belum ditambahkan, seluruh hak cipta dilindungi oleh pemilik repositori (default GitHub).
