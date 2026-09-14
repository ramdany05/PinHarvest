# 📄 Product Requirements Document (PRD)

## PinHarvest Extension

| Atribut | Detail |
| :--- | :--- |
| **Nama Produk** | PinHarvest — Google Maps Lead Harvester |
| **Platform** | Chrome Browser Extension (Manifest V3) |
| **Status** | Draf / Proposal |

---

## 1. Ringkasan Eksekutif

**PinHarvest** adalah ekstensi browser berbasis antarmuka visual (UI) yang memungkinkan pengguna awam (tanpa latar belakang pemrograman) untuk mengekstrak data dari elemen web yang memuat data secara dinamis (*infinite scroll*).

Pengguna cukup:

1. Mengarahkan kursor untuk **menyorot (*highlight*)** elemen *list/feed*;
2. **Mengklik** elemen tersebut; dan
3. Ekstensi akan melakukan **auto-scroll** serta **ekstraksi data** secara otomatis.

---

## 2. Latar Belakang & Tujuan

### 2.1 Masalah

- Platform modern seperti **Google Maps** dan **Instagram** menggunakan *virtual scrolling* dan JavaScript rendering.
- Scraping statis tidak berfungsi pada konten dinamis.
- Menulis skrip kustom membutuhkan waktu dan keahlian teknis.

### 2.2 Tujuan

Memberikan alat **no-code** yang dapat:

- Mengidentifikasi area *scrollable* secara **visual**;
- Melakukan **simulasi aktivitas manusia** (*scroll*); dan
- **Mengamankan data** sebelum hilang dari *Virtual DOM*.

---

## 3. Target Pengguna

| Segmen Pengguna | Use Case |
| :--- | :--- |
| **Tim Sales / B2B** | Mengumpulkan prospek/klien dari Google Maps. |
| **Digital Marketer** | Mengumpulkan data audiens, *list* followers/following dari media sosial. |
| **Data Researcher** | Menarik data dari tabel dinamis atau direktori *online*. |

---

## 4. Fitur Utama (User Stories)

### 4.1 Interactive Element Picker

> **Sebagai** pengguna, **saya ingin** mengarahkan kursor ke area web dan melihat garis tepi (*outline*) berwarna, **sehingga** saya tahu ekstensi mendeteksi area yang benar.

### 4.2 Smart Auto-Scroll Engine

> **Sebagai** pengguna, **saya ingin** ekstensi melakukan *scroll* otomatis pada area yang saya pilih dengan jeda manusiawi, **sehingga** saya tidak perlu menekan tombol *scroll* secara manual.

### 4.3 Real-Time Data Capture

> **Sebagai** pengguna, **saya ingin** data tersimpan langsung ke memori ekstensi saat muncul di layar, **agar** data tidak hilang meskipun web menghapusnya dari layar (*Virtual DOM*).

### 4.4 One-Click Export

> **Sebagai** pengguna, **saya ingin** mengunduh hasil ekstraksi ke format **CSV** atau **JSON** saat proses selesai atau dihentikan secara manual.

---

## 5. Batasan & Out-of-Scope (OOS)

- Ekstensi **tidak** dirancang untuk mem-*bypass* CAPTCHA atau sistem *login*. Pengguna harus *login* ke platform (seperti Instagram) secara manual sebelum menggunakan ekstensi.
- Ekstensi berjalan pada tab yang **aktif** (tidak berjalan di *background*/*headless browser*).

---

## 6. Tech Stack (Ringkasan)

| Lapisan | Pilihan | Alasan |
| :--- | :--- | :--- |
| **Framework / Tooling** | **WXT** (di atas Vite) | DX terbaik untuk ekstensi MV3, HMR, build lintas-browser, aktif dikembangkan (2026). |
| **Bahasa** | **TypeScript** | Keamanan tipe untuk DOM, *messaging*, dan storage. |
| **UI Popup** | Vanilla HTML + CSS (opsional Tailwind via WXT) | Popup sederhana (start/stop + export); tanpa framework berat. |
| **Bundler** | **Vite** (via WXT) | HMR untuk popup & content script. |
| **Testing** | **Vitest** | Unit test logika murni (dedup `Set`, export CSV/JSON, deteksi scroll). |
| **Linting** | **ESLint + Prettier** | Standar kualitas kode. |

> **Catatan:** Mapping detail ke arsitektur & modul ada di **[FSD.md §4 — Tech Stack](./FSD.md#4-tech-stack)**.

---

## 7. Riwayat Dokumen

| Versi | Tanggal | Perubahan |
| :--- | :--- | :--- |
| 1.1 | — | Tambah bagian Tech Stack. |
| 1.0 | — | Refactor dokumen ke format Markdown terstruktur. |

