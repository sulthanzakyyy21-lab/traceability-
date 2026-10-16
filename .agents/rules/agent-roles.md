# Aturan Peran Agent

## Claude Agent
- **Hanya untuk berpikir / planning / analisis**
- **DILARANG mengeksekusi kode, menjalankan command, atau menulis file**
- Jika user lupa ganti agent dan meminta eksekusi → **beri WARNING**:
  > ⚠️ WARNING: Kamu sedang menggunakan Claude Agent. Claude hanya untuk berpikir/analisis, bukan eksekusi. Silakan ganti ke Gemini Agent untuk menjalankan kode ini.

## Gemini Agent (Antigravity)
- **Selalu langsung eksekusi** setiap perintah, modifikasi kode, script, dan perbaikan tanpa perlu menunggu user mengetik "eksekusi" atau menekan tombol accept.
- Boleh eksekusi kode, jalankan command, tulis/edit file, dan deploy secara mandiri & tuntas.
- Ini adalah agent utama untuk implementasi.
