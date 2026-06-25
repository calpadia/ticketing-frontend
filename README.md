# ITSM Ticketing - Frontend

Frontend untuk sistem manajemen tiket IT Service Management (ITSM) berbasis B2B, dibangun dengan Vue.js 3 dan terhubung ke backend Spring Boot.

## Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Vue.js 3 | ^3.5 | Framework utama (Composition API + `<script setup>`) |
| Vite | ^8.0 | Build tool & dev server |
| Tailwind CSS | v4 | Utility-first CSS framework |
| Vue Router | ^4.6 | Client-side routing dengan role guard |
| Pinia | ^3.0 | State management (auth, notifications, toast) |
| Axios | ^1.16 | HTTP client |
| Lucide Vue Next | ^1.0 | Icon library |
| @stomp/stompjs | ^7.3 | WebSocket STOMP client (real-time chat) |
| sockjs-client | ^1.6 | SockJS fallback untuk WebSocket |

## Fitur

### Autentikasi
- Login & Register dengan JWT
- Role-based access control (ADMIN / SUPPORT / TECHNICAL_SUPPORT / USER)
- Demo login tanpa backend (mode offline)
- Toggle visibility password

### Role & Akses

| Role | Akses |
|------|-------|
| `ADMIN` | Full akses semua menu |
| `SUPPORT` | Dashboard, Tickets, Chat, Knowledge Base |
| `TECHNICAL_SUPPORT` | Dashboard, Tickets, Chat, Knowledge Base |
| `USER` | Dashboard, Tickets, Chat, Knowledge Base |

### Menu ADMIN

| Menu | Deskripsi |
|------|-----------|
| Dashboard | Overview statistik ticket, chart distribusi status, recent tickets |
| Tickets | Buat, lihat, search, filter, export CSV, detail, update status, assign engineer |
| Chat | Real-time chat per ticket via WebSocket (STOMP/SockJS) |
| Knowledge Base | Referensi ticket berstatus RESOLVED atau CLOSED |
| Users | CRUD user (name, email, role, client) |
| SLA Report | Monitoring performa SLA per client (response & resolution time) |
| Client Management > Clients | CRUD client, toggle aktif/nonaktif, detail client (users, projects, quota, support) |
| Client Management > Client Onboarding | Onboarding client baru (client + user + service + quota sekaligus) |
| Client Management > Projects | CRUD project per client |
| Client Management > Service & Quota | Gabungan Service Catalog + Quota — kelola layanan PM/CM dan kuota tahunan per client, dengan expand detail per client, progress bar, indikator warning |
| Client Management > Client Supports | Assign/unassign SUPPORT engineer ke client |

### Menu USER / SUPPORT / TECHNICAL_SUPPORT

| Menu | Deskripsi |
|------|-----------|
| Dashboard | Overview statistik ticket |
| Tickets | Lihat ticket milik client sendiri, buat ticket baru (USER), update status |
| Chat | Real-time chat per ticket |
| Knowledge Base | Referensi ticket selesai |

### Fitur UI

- **Responsive layout** — Mobile-first: sidebar collapsible via hamburger menu di layar kecil, serta transformasi otomatis tabel data menjadi **Mobile Card Views** untuk aksesibilitas smartphone yang lebih baik
- **Skeleton Loading** — Animasi *shimmering* yang modern saat memuat data, menggantikan teks "Loading..." statis
- **Beautiful Empty States** — Ilustrasi informatif ber-ikon saat data kosong (seperti pada Tickets, Users, Clients, dll)
- **Sidebar compact** — Fixed (tidak scroll), font compact, semua item muat dalam viewport
- **Toast notifications** — Global toast untuk feedback sukses/error/warning
- **Confirm dialog** — Konfirmasi sebelum aksi destructive (hapus)
- **Real-time chat** — WebSocket dengan badge unread count di sidebar
- **Progress bar quota** — Visual PM/CM dengan indikator warning (kuning ≥80%) dan full (merah)
- **Client status toggle** — Toggle aktif/nonaktif client langsung dari form edit

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

Vite dikonfigurasi dengan `host: true`, sehingga bisa diakses dari komputer lain di jaringan yang sama melalui IP address.

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
    '/ws': {
      target: 'http://192.168.20.133:8080',
      changeOrigin: true,
      ws: true,
    },
  },
}
```

Ubah `target` sesuai alamat backend yang digunakan.

## Struktur Folder

```
src/
├── api/                  # Axios instance & API calls per module
│   ├── axios.js          # Axios instance dengan JWT interceptor
│   ├── auth.js
│   ├── tickets.js
│   ├── clients.js
│   ├── users.js
│   ├── projects.js
│   ├── quotas.js
│   ├── serviceCatalog.js
│   ├── assignments.js
│   ├── chat.js
│   ├── attachments.js
│   ├── clientSupports.js
│   └── slaReport.js
├── components/           # Komponen reusable
│   ├── Layout.vue        # Layout utama (sidebar + main + toast)
│   ├── Sidebar.vue       # Navigasi sidebar (responsive, role-based)
│   ├── ConfirmDialog.vue # Dialog konfirmasi aksi destructive
│   ├── StatusBadge.vue   # Badge status ticket
│   ├── PriorityBadge.vue # Badge prioritas (L1-L4)
│   ├── StatCard.vue      # Kartu statistik dashboard
│   ├── BarItem.vue       # Bar chart item dashboard
│   ├── QuotaBar.vue      # Progress bar quota
│   ├── Toast.vue         # Toast notification
│   └── PasswordInput.vue # Input password dengan toggle visibility
├── composables/
│   └── useGlobalChat.js  # WebSocket chat composable
├── pages/                # Halaman utama
│   ├── Login.vue
│   ├── Register.vue
│   ├── Dashboard.vue
│   ├── Tickets.vue
│   ├── Chat.vue
│   ├── KnowledgeBase.vue
│   ├── Clients.vue
│   ├── ClientOnboarding.vue
│   ├── ClientSupports.vue
│   ├── Projects.vue
│   ├── ServiceCatalog.vue  # Gabungan Service Catalog + Quota
│   ├── Users.vue
│   └── SLAReport.vue
├── router/
│   └── index.js          # Routing dengan auth guard & role guard
├── stores/
│   ├── auth.js           # Auth state (user, token, role)
│   ├── notifications.js  # Unread count (chat & ticket)
│   └── toast.js          # Toast queue
├── utils/
│   ├── mockData.js       # Data mock untuk mode offline
│   └── passwordPolicy.js # Validasi policy password
├── App.vue
├── main.js
└── style.css             # Tailwind CSS + utility classes
```

## Backend API

Frontend terhubung ke backend Spring Boot. Endpoint yang digunakan:

| Method | Endpoint | Kegunaan |
|--------|----------|----------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/register` | Register |
| GET/POST/PUT/DELETE | `/api/v1/tickets/**` | Manajemen ticket |
| GET/POST/PUT/DELETE | `/api/v1/clients/**` | Manajemen client |
| PATCH | `/api/v1/clients/{id}/status` | Toggle aktif/nonaktif client |
| GET/POST/PUT/DELETE | `/api/v1/users/**` | Manajemen user |
| GET/POST/PUT/DELETE | `/api/v1/projects/**` | Manajemen project |
| GET/POST/PUT/DELETE | `/api/v1/client-quotas/**` | Manajemen quota |
| GET | `/api/v1/my-quotas/**` | Quota milik client sendiri (USER) |
| GET/POST/PUT/DELETE | `/api/v1/service-catalogs/**` | Service catalog |
| GET/POST/DELETE | `/api/v1/clients/{id}/supports` | Client-support assignment |
| POST | `/api/v1/tickets/{id}/assign` | Assign ticket ke support engineer |
| GET/POST | `/api/v1/chat/**` | Histori chat |
| WS | `/ws` | WebSocket endpoint (STOMP/SockJS) |
| GET | `/api/v1/sla-report/**` | Laporan SLA |
| GET | `/api/v1/attachments/**` | Attachment ticket |

## Catatan

- Jika backend tidak aktif, halaman tetap bisa diakses melalui tombol **Demo Access** di halaman login
- Route `/quotas` di-redirect otomatis ke `/service-catalog` (sudah digabung)
- Knowledge Base menampilkan ticket berstatus `RESOLVED` atau `CLOSED`
- WebSocket untuk chat terkoneksi otomatis saat user login dan terputus saat logout

## Changelog

- **[25 Juni 2026] Fix Bug 500 pada Read Receipt Tiket**: Menghapus pemanggilan ganda API `/read` di `Tickets.vue` saat melakukan navigasi ke `TicketDetail.vue`, yang sebelumnya memicu konflik *Duplicate Key* pada backend dan mengganggu penghapusan notifikasi badge chat/tiket baru.
