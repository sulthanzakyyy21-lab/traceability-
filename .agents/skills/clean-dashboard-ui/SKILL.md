---
name: clean-dashboard-ui
description: Aturan UI/UX untuk dashboard industri yang bersih, simpel, dan tidak ramai. Gunakan setiap kali membuat atau mengubah tampilan halaman.
---

# Prinsip utama
1. Satu layar, satu tugas utama. Tampilkan langkah yang sedang dikerjakan saja.
2. Maksimal 1 tombol utama (solid) per layar; tombol lain berupa outline/ghost.
3. Hindari kotak di dalam kotak. Maksimal 1 level card; pisahkan bagian dengan spasi, bukan garis atau border tambahan.
4. Progressive disclosure: opsi muncul bertahap setelah pilihan sebelumnya dibuat.
5. Satu warna aksen (coklat). Warna status hanya untuk hijau/abu/merah pada status data.
6. Tipografi: 1 font family, maksimal 3 ukuran (judul, isi, label kecil). Hindari teks KAPITAL panjang dan font monospace kecuali untuk kode.
7. Spasi lega: padding card minimal 24px, jarak antar bagian minimal 24px.
8. Pilihan sedikit (2-6) tampil sebagai chip/segmented control, bukan dropdown atau kartu besar.

# Pola halaman data
- Stepper: Pilih sumber -> Periksa data -> Kirim.
- Preview wajib sebelum kirim, dengan kode warna baru/duplikat/error.
- Tombol kirim terkunci sampai ada konfirmasi centang.

# Animasi
- Hanya `transform` dan `opacity`, durasi 200-350ms, easing cubic-bezier(0.22, 1, 0.36, 1).
- Hormati prefers-reduced-motion.
- Animasi untuk memberi umpan balik, bukan dekorasi. Icon mengambang hanya pada elemen aktif.

# Checklist sebelum selesai
- Apakah ada elemen yang bisa dihapus tanpa mengurangi fungsi?
- Apakah mata langsung tahu aksi utama?
- Apakah teks terbaca di mode terang dan gelap, dan layout rapi di HP?