# ITSM Ticketing - Frontend

Frontend untuk sistem manajemen tiket IT Service Management (ITSM), dibangun dengan Vue.js 3 dan terhubung ke backend Spring Boot.

## Tech Stack

- **Vue.js 3** — Composition API + `<script setup>`
- **Vite** — Build tool & dev server
- **Tailwind CSS v4** — Utility-first CSS framework
- **Vue Router 4** — Client-side routing
- **Pinia** — State management
- **Axios** — HTTP client
- **Lucide Vue Next** — Icon library

## Fitur

### Autentikasi
- Login & Register dengan JWT
- Role-based access control (ADMIN / USER)
- Demo login tanpa backend

### Menu (ADMIN)
| Menu | Deskripsi |
|------|-----------|
| Dashboard | Overview statistik ticket, chart distribusi status |
| Tickets | Buat, lihat, search, filter, dan detail ticket |
| Knowledge Base | Referensi ticket yang sudah selesai |
| Clients | CRUD client (nama perusahaan, kontak, email, telepon) |
| Quotas | Kelola kuota PM & CM per client per tahun |
| Service Catalog | Kelola layanan maintenance yang dimiliki setiap client |
| Users | CRUD user (name, email, role) |
| SLA Report | Monitoring performa SLA per client |

### Menu (USER)
| Menu | Deskripsi |
|------|-----------|
| Dashboard | Overview statistik ticket |
| Tickets | Buat dan lihat ticket |
| Knowledge Base | Referensi ticket yang sudah selesai |

## Prasyarat

- Node.js >= 18
- npm >= 9

## Instalasi

```bash
cd frontend
npm install
```

## Menjalankan (Development)

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173/`

### Akses dari jaringan lokal

Vite sudah dikonfigurasi dengan `host: true`, sehingga bisa diakses dari komputer lain di jaringan yang sama melalui IP address.

## Build Production

```bash
npm run build
```

Output build ada di folder `dist/`.

## Konfigurasi Backend

Proxy ke backend dikonfigurasi di `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.20.133:8080',
      changeOrigin: true,
    },
  },
}
```

Ubah `target` sesuai alamat backend yang digunakan.

## Struktur Folder

```
src/
├── api/            # Axios instance & API calls
├── components/     # Komponen reusable (Sidebar, Badge, dll)
├── pages/          # Halaman utama (Login, Dashboard, Tickets, dll)
├── router/         # Konfigurasi Vue Router
├── stores/         # Pinia stores (auth)
├── utils/          # Utility & mock data
├── App.vue         # Root component
├── main.js         # Entry point
└── style.css       # Tailwind CSS import
```

## Backend API

Frontend ini terhubung ke backend Spring Boot dengan endpoint:

- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/register` — Register
- `GET/POST /api/v1/tickets` — Tickets
- `GET/POST/PUT/DELETE /api/v1/clients` — Clients
- `GET/POST/PUT/DELETE /api/v1/users` — Users
- `GET/POST/PUT/DELETE /api/v1/client-quotas` — Client Quotas

## Catatan

- Jika backend tidak aktif, halaman tetap bisa diakses melalui tombol "Demo Access" di halaman login
- Service Catalog menyimpan data di localStorage (belum ada endpoint backend)
- Knowledge Base menampilkan ticket berstatus RESOLVED atau CLOSED
