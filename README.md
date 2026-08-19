# Peta Digital Desa Raba

Web GIS sederhana untuk Peta Digital Desa Raba, Kecamatan Wawo, Kabupaten Bima, Nusa Tenggara Barat.

## Fitur

- Peta interaktif menggunakan Leaflet.js
- Pilihan basemap: OpenStreetMap, Google Maps, Citra Dunia Esri, Google Satellite Hybrid, Google Satellite
- Layer data peta: Titik Penting, Batas Wilayah, Bangunan, Jalan, Sungai, Penggunaan Lahan
- Legenda otomatis
- Popup informasi dengan tautan Google Maps
- Responsive untuk mobile, tablet, dan desktop
- Static website, bisa di-host di GitHub Pages

## Struktur Folder

```
peta-desa-raba/
├── index.html
├── style.css
├── script.js
├── README.md
└── data/
    ├── titik-penting.geojson
    ├── batas-provinsi.geojson
    ├── batas-kabupaten.geojson
    ├── batas-kecamatan.geojson
    ├── batas-desa.geojson
    ├── batas-rt.geojson
    ├── bangunan.geojson
    ├── jalan-lokal.geojson
    ├── jalan.geojson
    ├── sungai.geojson
    ├── hutan.geojson
    ├── permukiman.geojson
    └── sawah.geojson
```

## Cara Menjalankan

1. Clone atau download repository ini
2. Buka folder project
3. Jalankan dengan salah satu cara:

**Menggunakan Python:**
```bash
python3 -m http.server 8000
```

**Menggunakan Node.js:**
```bash
npx serve .
```

4. Buka browser dan akses `http://localhost:8000`

> **Penting:** Jangan buka `index.html` langsung (file://). Gunakan HTTP server karena GeoJSON dimuat dengan `fetch()`.

## Cara Memasukkan Data GeoJSON

### Format File

Setiap file GeoJSON harus berformat `FeatureCollection`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nama": "Nama Lokasi"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [118.850, -8.550]
      }
    }
  ]
}
```

### Membuat Data GeoJSON

1. **QGIS**: Buka QGIS → Import data → Export as GeoJSON
2. **geojson.io**: Buka https://geojson.io → Gambar fitur → Copy JSON
3. **GitHub**: Cari data GIS open source → Download format GeoJSON

### Tips

- Simpan file di folder `data/`
- Nama file harus sesuai dengan yang ada di `script.js`
- Koordinat dalam format `[longitude, latitude]`
- Untuk polygon, koordinat harus tertutup (titik pertama = titik terakhir)

## Cara Mengubah Koordinat Titik Penting

Buka file `data/titik-penting.geojson` dan edit koordinat:

```json
{
  "type": "Feature",
  "properties": {
    "nama": "Masjid An-Nur",
    "kategori": "Tempat Ibadah"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [118.8505, -8.5495]
  }
}
```

**Cara mengetahui koordinat:**
1. Buka https://www.google.com/maps
2. Cari lokasi yang diinginkan
3. Klik kanan pada lokasi → "What's here?"
4. Koordinat akan muncul di bagian bawah (format: `-8.5495, 118.8505`)
5. Masukkan ke GeoJSON sebagai `[longitude, latitude]` → `[118.8505, -8.5495]`

## Data yang Perlu Diisi

Beberapa file GeoJSON masih berisi data placeholder yang perlu diganti dengan data resmi:

| File | Status |
|------|--------|
| `titik-penting.geojson` | Koordinat perlu diverifikasi |
| `batas-provinsi.geojson` | Placeholder - perlu data resmi |
| `batas-kabupaten.geojson` | Placeholder - perlu data resmi |
| `batas-kecamatan.geojson` | Placeholder - perlu data resmi |
| `batas-desa.geojson` | Placeholder - perlu data resmi |
| `batas-rt.geojson` | Placeholder - perlu data resmi |
| `bangunan.geojson` | Placeholder - perlu data resmi |
| `jalan-lokal.geojson` | Placeholder - perlu data resmi |
| `jalan.geojson` | Placeholder - perlu data resmi |
| `sungai.geojson` | Placeholder - perlu data resmi |
| `hutan.geojson` | Placeholder - perlu data resmi |
| `permukiman.geojson` | Placeholder - perlu data resmi |
| `sawah.geojson` | Placeholder - perlu data resmi |

## Cara Deploy ke GitHub Pages

1. **Buat repository baru** di GitHub
2. **Upload semua file** project ke repository tersebut
3. Buka **Settings** → **Pages**
4. Pada **Source**, pilih branch `main` (atau `master`) dan folder `/ (root)`
5. Klik **Save**
6. Tunggu beberapa menit, website akan tersedia di:
   ```
   https://USERNAME.github.io/NAMA-REPOSITORY/
   ```

### Menggunakan GitHub CLI

```bash
# Inisialisasi git
git init
git add .
git commit -m "Initial commit: Peta Digital Desa Raba"

# Hubungkan ke GitHub
git remote add origin https://github.com/USERNAME/peta-desa-raba.git
git branch -M main
git push -u origin main
```

## Cara Membuat QR Code

1. Buka website yang sudah di-deploy di GitHub Pages
2. Salin URL lengkap (contoh: `https://username.github.io/peta-desa-raba/`)
3. Buka pembuat QR Code online seperti:
   - https://www.qrcode-monkey.com/
   - https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=URL
4. Masukkan URL website
5. Generate dan download QR Code
6. Cetak QR Code untuk distribusi

### Alur Penggunaan

```
SCAN QR CODE
     ↓
PETA DIGITAL DESA RABA
     ↓
PILIH LAYER (sidebar)
     ↓
PILIH TITIK / WILAYAH
     ↓
LIHAT INFORMASI (popup)
     ↓
BUKA GOOGLE MAPS (opsional)
```

## Teknologi

- [Leaflet.js](https://leafletjs.com/) - Pustaka peta interaktif
- [OpenStreetMap](https://www.openstreetmap.org/) - Basemap utama
- [Esri World Imagery](https://www.esri.com/) - Basemap citra satelit
- HTML5, CSS3, JavaScript vanilla

## Lisensi

MIT License
