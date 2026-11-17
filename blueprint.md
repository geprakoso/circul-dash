## Blueprint: Circul Web — Map dengan Pin Point

### 1. Project Setup

**Stack yang direkomendasikan:**

| Komponen | Pilihan |
| --- | --- |
| Framework | Next.js 14+ (App Router) |
| Map Library | **Leaflet** + **React-Leaflet** |
| Clustering | `react-leaflet-cluster` atau `leaflet.markercluster` |
| Heatmap | `leaflet.heat` |
| Geocoding | Nominatim API (sama seperti Flutter) |
| Icons | Lucide React atau Heroicons |
| State | React state + Context (ringan, mock data) |
| Styling | Tailwind CSS |

### 2. Struktur Folder

```
circul-web/
├── app/
│   ├── layout.tsx
│   └── page.tsx                    # Halaman utama dengan full-screen map
├── components/
│   ├── MapView.tsx                 # Komponen utama map (Leaflet)
│   ├── MapSearchBar.tsx            # Search bar overlay
│   ├── CheckInMarker.tsx           # Pin point marker dengan gaya Circul
│   ├── ClusterMarker.tsx           # Cluster marker (angka hijau)
│   ├── IssueMarker.tsx             # Issue cluster marker (warna sesuai count)
│   ├── HeatmapLayer.tsx            # Layer heatmap lingkaran
│   ├── FocusedMarker.tsx           # Marker hijau terfokus
│   ├── SearchResultMarker.tsx      # Marker biru hasil pencarian
│   ├── ActivityMarker.tsx          # Marker aktivitas (event/kampanye)
│   ├── CurrentLocationMarker.tsx   # Marker lokasi user saat ini
│   ├── CheckInDetailSheet.tsx      # Bottom sheet detail check-in
│   └── LocateButton.tsx            # Tombol pusatkan lokasi
├── data/
│   ├── mock-posts.ts               # Mock data FeedPost
│   ├── mock-clusters.ts            # Mock data issue clusters
│   └── mock-activities.ts          # Mock data activity markers
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── clustering.ts               # Algoritma clustering (dari Flutter)
│   └── distance.ts                 # Fungsi distanceMeters
└── public/
    └── images/                     # Asset gambar
```

### 3. TypeScript Types (diterjemahkan dari Dart)

```tsx
// lib/types.ts

export interface FeedPost {
  id: string;
  author: string;
  city: string;
  timeAgo: string;
  title: string;
  body: string;
  imageAsset: string;
  createdAt?: string;
  topic: string;
  imagePaths: string[];
  locationEnabled: boolean;
  locationLabel?: string;
  coordinateLabel?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  checkoutCompleted: boolean;
  likes: number;
  comments: number;
}

export interface MapIssueCluster {
  point: [number, number]; // [lat, lng]
  count: number;
  radiusMeters: number;
}

export interface MapFocusedCheckIn {
  id: number;
  point: [number, number];
  label: string;
  coordinateLabel?: string;
  caption?: string;
  author: string;
  timeLabel: string;
  imageAsset?: string;
  imagePaths: string[];
  authorImagePath?: string;
}

export interface VisibleCheckIn {
  point: [number, number];
  author: string;
  timeLabel: string;
  title: string;
  subtitle: string;
  meta: string;
  color: string;
  icon: string;
  distanceMeters: number;
  imageAsset?: string;
  imagePaths: string[];
  authorImagePath?: string;
  post?: FeedPost;
  isFocused: boolean;
  isPostRecord: boolean;
}
```

### 4. Fitur Map — Satu per Satu

### a. Tile Map (OpenStreetMap / Geoapify)

Flutter menggunakan `flutter_map` dengan `TileLayer` dari Geoapify. Di Leaflet, equivalentnya:

```tsx
// Pilih salah satu:
const osmTile = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const geoapifyTile = '<https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=YOUR_KEY>';
```

Gunakan `TileLayer` dari react-leaflet. Untuk production, pakai Geoapify (seperti Flutter) karena lebih responsif dan ada styling carto.

### b. Pin Point Check-in (FeedPost markers)

Flutter membuat marker untuk setiap `_feedCheckIns` yang punya `locationPoint`. Tiap marker bisa:

- **Single** → menampilkan foto thumbnail atau icon flag hijau (lihat `_FeedPostCheckInMarker`)
- **Cluster** → menampilkan angka jumlah (lihat `_FeedPostCheckInClusterMarker`)

Di Leaflet, pakai `Marker` dengan custom `DivIcon` untuk meniru tampilan CircleAvatar + flag seperti di Flutter.

### c. Clustering Pin Point

Flutter punya algoritma clustering sendiri di `_feedCheckInMarkerGroups()`:

- Radius cluster = `90 * 2^(16 - zoom)` meter
- Jika zoom < 17, marker yang berjarak < radius akan digabung

Di Leaflet, kamu bisa:

- **Pilihan 1**: `react-leaflet-cluster` (tinggal pakai, otomatis)
- **Pilihan 2**: Implementasi sendiri algoritma yang sama persis dengan Flutter (kontrol penuh)

Saran saya pilih **Pilihan 1** dulu untuk prototyping. Nanti bisa diganti dengan custom clustering kalau mau match persis dengan Flutter.

### d. Heatmap Issue Clusters

Flutter menggunakan `CircleLayer` dengan beberapa lapisan semi-transparan (`_clusterGlows`):

- 4 circle glow per cluster dengan opacity dan radius berbeda
- Warna berubah: hijau (1-2) → kuning (3-5) → merah (6+)

Di Leaflet, implementasinya:

- `CircleMarker` dengan `fillOpacity` gradasi (sama seperti Flutter)
- Atau pakai `leaflet.heat` untuk heatmap yang lebih smooth (tapi tidak match persis)

Saya rekomendasikan pakai **CircleMarker** bertumpuk agar visualnya konsisten dengan Flutter.

### e. Search Lokasi

Flutter menggunakan **Nominatim API** (OpenStreetMap):

```
GET <https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=QUERY>
```

Di web, bisa langsung panggil dari browser (tidak ada CORS issue). Fitur yang perlu ada:

- Input search dengan debounce (420ms, sama seperti Flutter)
- Auto-suggest dropdown (5 hasil)
- Parse koordinat manual (format `lat, lng`)
- Pindah kamera ke lokasi hasil + drop marker biru (`_SearchResultMarker`)

### f. Marker Details (Bottom Sheet)

Flutter punya `DraggableScrollableSheet` untuk:

1. **List sheet**: daftar check-in yang terlihat di viewport
2. **Detail sheet**: detail satu check-in + tombol checkout

Di web, bisa pakai komponen **Sheet/Drawer** sederhana (Tailwind + CSS) atau dari library seperti `@radix-ui/react-dialog` atau `vaul` (untuk bottom sheet yang bisa di-drag).

### g. Marker Gaya Lainnya

| Marker | Flutter Class | Deskripsi |
| --- | --- | --- |
| Current location | `_CurrentLocationMarker` | Lingkaran hijau dengan border putih, pulsing |
| Search result | `_SearchResultMarker` | Lingkaran biru `#2563EB` |
| Focused check-in | `_FocusedCheckInMarker` | Lingkaran hijau dengan icon flag |
| Activity | `_ActivityMarker` | Lingkaran putih dengan icon berwarna (event, kampanye, dll) |
| Issue quantity | `_IssueQuantityMarker` | Lingkaran berwarna (hijau/kuning/merah) dengan angka |

Semua marker ini bisa dirender sebagai `L.divIcon` dengan HTML/CSS custom.

### 5. Algoritma yang Perlu Ditiru

Dari Flutter, ada beberapa fungsi penting yang perlu di-port ke TypeScript:

| Fungsi | Lokasi di Flutter | Untuk |
| --- | --- | --- |
| `distanceMeters()` | `MapScreen.distanceMeters` | Hitung jarak antar titik (Haversine) |
| `_feedCheckInMarkerGroups()` | `_MapScreenState` | Clustering marker |
| `_clusterGlows()` | Top-level function | Generate circle layers untuk heatmap |
| `_clusterColorForCount()` | Top-level | Pilih warna berdasarkan jumlah |
| `_clusterMarkerSizeForCount()` | Top-level | Ukuran marker berdasarkan jumlah |
| `_heatmapColorForIntensity()` | Top-level | Warna heatmap dari intensitas |
| `_distanceLabel()` | Top-level | Format jarak (m/km) |
| `formatRelativeTimestamp()` | `shared/relative_timestamp.dart` | Format waktu relatif |

### 6. Mock Data (dari mock_data.dart)

Buat file `data/mock-posts.ts` dengan data yang sama persis dari `const feedPosts` di mock_data.dart. Ambil 10-15 post dengan koordinat real di sekitar Solo/Gondang Manis.

Contoh koordinat yang sudah ada di Flutter:

- Pusat map: `(-7.5584, 110.8199)` — Gondang Manis
- Activity markers: `(-7.5559, 110.8186)`, `(-7.5571, 110.8214)`, `(-7.5606, 110.8192)`
- Impact spots: spread di sekitar area tersebut

### 7. Perbedaan Data Flow (Flutter vs Web)

| Aspek | Flutter | Web (Next.js) |
| --- | --- | --- |
| Data source | SQLite (sqflite) | Mock JSON → nanti Supabase REST API |
| Gambar | `Image.file()` / `Image.asset()` | `<img src="/images/...">` atau URL |
| Location | Geolocator plugin | `navigator.geolocation` API |
| Camera | image_picker plugin | `navigator.mediaDevices` atau file input |
| Storage | Local file paths | URL atau object storage |

### 8. Rekomendasi Arsitektur Awal

```
┌─────────────────────────────────────────────┐
│  page.tsx (full-screen layout)               │
│  ┌─────────────────────────────────────────┐ │
│  │  <MapSearchBar /> (overlay, top)         │ │
│  ├─────────────────────────────────────────┤ │
│  │  <MapContainer>                          │ │
│  │    <TileLayer />                         │ │
│  │    <HeatmapLayer />  (CircleMarkers)     │ │
│  │    <MarkerCluster>                       │ │
│  │      <CheckInMarker /> × N               │ │
│  │    </MarkerCluster>                      │ │
│  │    <IssueMarker /> × N                   │ │
│  │    <CurrentLocationMarker />             │ │
│  │    <SearchResultMarker /> (conditional)  │ │
│  │    <FocusedMarker /> (conditional)       │ │
│  │  </MapContainer>                         │ │
│  ├─────────────────────────────────────────┤ │
│  │  <LocateButton /> (overlay, bottom-right)│ │
│  │  <CheckInDetailSheet /> (overlay, bottom)│ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 9. Library Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "leaflet": "^1.9",
    "react-leaflet": "^4",
    "react-leaflet-cluster": "^2",
    "leaflet.heat": "^0.2",
    "lucide-react": "^0.300",
    "vaul": "^0.9"
  },
  "devDependencies": {
    "@types/leaflet": "^1",
    "@types/node": "^20",
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}
```

### 10. Pertimbangan Penting

1. **Geoapify API Key**: Key `4085f2be1bd8446197b7d0601b3a391f` yang dipakai di Flutter bisa dipakai di web juga, tapi **restrict domain** di dashboard Geoapify untuk keamanan.
2. **Nominatim Usage Policy**: Max 1 request per detik, wajib `User-Agent` header. Di web, pastikan ada rate limiting di client.
3. **Responsive Layout**: Map harus full-height di mobile & desktop. Bottom sheet bisa pakai `vaul` yang emulasinya mirip DraggableScrollableSheet.
4. **PWA**: Next.js bisa dikonfigurasi jadi PWA dengan `next-pwa` — berguna karena aplikasi ini berat ke map (cocok di-install di HP).
5. **Performa**: Untuk banyak marker (100+), pastikan pakai clustering dan `Marker` di-throttle. `react-leaflet` sudah cukup efisien.

---