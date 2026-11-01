# toko-online-mobile
Mobile Application Toko Online (Android) berbasis React Native (Expo) yang terhubung ke Central REST API.

Stack: Expo SDK 58 · React Native 0.88 · TypeScript · Expo Router · axios · expo-secure-store · expo-image

## Fitur

| Layar | Isi | Endpoint |
| --- | --- | --- |
| Katalog (tab) | Grid produk 2 kolom, cari produk, filter kategori, tarik untuk refresh, scroll tak terbatas. Bisa dibuka tanpa login. | `GET /products`, `GET /products/categories`, `POST /cart` |
| Detail Produk | Foto, kategori, harga, stok, deskripsi, pilih jumlah, **+ Keranjang** & **Beli Sekarang** | `GET /products/:id` |
| Keranjang (tab) | Checkbox per produk & pilih semua, counter +/−, hapus, ringkasan total (hanya yang dicentang) | `GET/PUT/DELETE /cart` |
| Checkout | Alamat pengiriman, metode bayar (Transfer Bank / E-Wallet), ringkasan, **Konfirmasi & Bayar** | `POST /orders`, `PUT /orders/:id/pay` |
| Pembayaran Berhasil | Notifikasi pesanan berhasil + ringkasan | `GET /orders/:id` |
| Pesanan (tab) | Riwayat pesanan dengan badge status | `GET /orders/my` |
| Detail Pesanan | Rincian, alamat, metode, bayar ulang / batalkan pesanan `pending` | `GET /orders/:id`, `PUT /orders/:id/pay`, `PUT /orders/:id/cancel` |
| Login / Daftar | Form seperti web, tombol lihat password, sesi tersimpan aman di HP | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Akun (tab) | Profil, menu cepat, logout | – |

Alur login: katalog & detail bisa dilihat tanpa login. Saat menekan **+ Keranjang**, **Beli Sekarang**,
atau membuka keranjang, pengguna diarahkan ke Login lalu dikembalikan ke halaman semula.
(Keranjang disimpan di server, jadi butuh login — sama seperti versi web.)

## Menjalankan (development)

Butuh Node.js 20+ dan aplikasi **Expo Go** di HP Android (versi yang mendukung SDK 58).

```bash
npm install
cp .env.example .env        # isi EXPO_PUBLIC_API_URL, atau kosongkan untuk backend lokal
npx expo start              # scan QR code dengan Expo Go
```

Pakai backend lokal? Jalankan `toko-online-backend` (`npm run dev`, port 5000) di komputer yang sama,
pastikan HP & komputer satu Wi-Fi, lalu biarkan `EXPO_PUBLIC_API_URL` kosong — app otomatis memakai
`http://<IP komputer>:5000/api`. Untuk emulator Android tanpa Expo Go, alamat cadangannya `http://10.0.2.2:5000/api`.

Akun demo dari `npm run seed` di backend: `user@toko.com` / `user123`.

## Build APK (Expo EAS)

```bash
npm install -g eas-cli      # atau pakai npx eas-cli@latest
eas login                   # akun expo.dev (gratis)
# pastikan .env berisi EXPO_PUBLIC_API_URL backend yang sudah online (https)
eas build -p android --profile preview
```

Setelah selesai, EAS memberi link untuk mengunduh file `.apk`. Profil `preview` dan `production`
di `eas.json` sama-sama menghasilkan APK.

> Build rilis Android memblokir `http://` biasa, jadi APK harus diarahkan ke backend **https**
> (misalnya yang sudah di-deploy ke Vercel/Render/Railway).

## Struktur

```
src/
  app/                    layar (Expo Router — setiap file = 1 route)
    _layout.tsx           Stack utama + provider (toast, auth, cart)
    (tabs)/               tab bar bawah: Katalog, Keranjang, Pesanan, Akun
    product/[id].tsx      Detail Produk
    checkout.tsx          Checkout & pembayaran
    order-success.tsx     Pembayaran berhasil
    order/[id].tsx        Detail pesanan
    login.tsx, register.tsx
  components/             UI (Button, TextField, Card, ProductCard, OrderCard, Navbar, dll)
  context/                AuthContext, CartContext, ToastContext
  lib/                    api (axios + token), storage, format Rupiah/tanggal, tipe data
  theme.ts                warna & ukuran — disalin dari kelas Tailwind di web
```

## Perintah

```bash
npm run lint        # ESLint (aturan Expo + React Hooks)
npm run typecheck   # cek TypeScript
npm run web         # preview cepat di browser (opsional)
npm run build:apk   # build APK lewat EAS (profil preview)
```
