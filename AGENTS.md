# Project Agent Instructions

Load and follow the global instructions and quality constraints from:
- `~/.ag/AG_GLOBAL_INSTRUCTIONS.md`

### Core Mandates:
1. **Anti-Halusinasi**: Selalu ikuti konteks file/schema DB, dilarang menebak parameter/API.
2. **Anti-AI Slop**: Buat kode modular (<200 baris/file), tanpa komentar berlebihan, dan gunakan UI industrial-clean ber-kontras tinggi tanpa efek visual murahan.
3. **Skills**: Gunakan skills yang terdaftar di `~/.ag/skills` sesuai kebutuhan task (TDD, debugging, UI/UX, Zod validation, dsb.).
