# APLIKASI E-LEARNING PELATIHAN SOFTWARE PERKANTORAN BERBASIS AI ADAPTIVE LEARNING

[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js-blue?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![AI: OpenRouter API](https://img.shields.io/badge/AI-OpenRouter%20API-orange?style=flat-square)](https://openrouter.ai/)

[cite_start]Platform *e-learning* inovatif yang dirancang khusus untuk pelatihan *software* perkantoran seperti Docs, Sheets, dan Slides[cite: 15, 124]. [cite_start]Berbeda dengan LMS (*Learning Management System*) konvensional yang umumnya bersifat statis, aplikasi ini mengintegrasikan **Artificial Intelligence (AI)** dan **Adaptive Learning** untuk menyesuaikan alur pembelajaran, tingkat kesulitan soal, serta memberikan *feedback* kontekstual secara personal berdasarkan performa dan kesalahan individu pengguna[cite: 22, 24, 85].

[cite_start]Proyek ini dikembangkan sebagai bagian dari *Capstone Project* Mata Kuliah E-Learning, Program Studi Informatika, Fakultas Teknik dan Ilmu Komputer, Universitas Pancasakti Tegal[cite: 10, 20].

---

## 📌 Tim Pengembang (Pencipta)
* [cite_start]**Fayasqii Azhar Mauludin** (6624600030) [cite: 5]
* [cite_start]**Septiawan Wahyu Nur Abadi** (6624600032) [cite: 6]
* [cite_start]**Muhammad Reza Saputra** (6624600036) [cite: 7]

**Dosen Pengampu / Pembimbing:**
* [cite_start]Gunawan, S.E., M.Kom [cite: 8]
* [cite_start]Diajeng Tyas Purwa Hapsari, S.Kom., M.Kom [cite: 9]

---

## 🚨 Latar Belakang & Masalah yang Diselesaikan
[cite_start]Sebagian besar LMS yang digunakan saat ini masih bersifat statis, di mana semua pengguna mendapatkan materi dan latihan yang sama tanpa mempertimbangkan kemampuan individu[cite: 85]. [cite_start]Dalam konteks pelatihan *software* perkantoran, hal ini membuat proses belajar kurang efektif karena setiap pengguna memiliki tingkat pemahaman yang berbeda terhadap fitur seperti *formatting*, penggunaan formula, atau pembuatan *chart*[cite: 86, 87, 88]. [cite_start]Jika sistem tidak mampu menyesuaikan latihan berdasarkan kesalahan pengguna, maka pembelajaran menjadi tidak optimal[cite: 89].

[cite_start]Aplikasi ini hadir sebagai solusi dengan memposisikan sistem bukan hanya sebagai alat penguji statis, melainkan sebagai **asisten belajar atau tutor pribadi** yang adaptif terhadap dinamika kemampuan pengguna[cite: 91, 259].

---

## ⭐ Fitur Utama Sistem

* [cite_start]**Adaptive Learning Mechanism**: Soal latihan dibagi menjadi 3 tingkatan kesulitan: *Easy*, *Medium*, dan *Hard*[cite: 165]. [cite_start]Level latihan pengguna akan naik atau turun secara dinamis otomatis berdasarkan konsistensi performa jawaban mereka[cite: 167, 168].
* [cite_start]**AI Error-Based Recommendation & Feedback**: Menggunakan AI untuk menganalisis kesalahan jawaban pengguna (terutama pada soal tipe *essay* berdasarkan makna, bukan sekadar kecocokan kata)[cite: 158]. [cite_start]AI secara otomatis memberikan tips pembelajaran spesifik dan merekomendasikan latihan remedial yang sesuai[cite: 160, 161, 162].
* [cite_start]**Interactive AI Chatbot (AI Tutor)**: Fitur konsultasi interaktif langsung di dalam *dashboard* mahasiswa untuk bertanya apa saja seputar penggunaan Word, Excel, maupun PowerPoint[cite: 61, 62].
* [cite_start]**Progress Tracking**: Menyediakan visualisasi perkembangan belajar mahasiswa, meliputi jumlah latihan yang telah diselesaikan, rata-rata skor, persentase kehadiran (*attendance rate*), serta kemajuan detail per topik[cite: 58, 208].
* [cite_start]**Role-Based Profile System**: Aksesibilitas multi-user yang disesuaikan dengan kebutuhan pengguna[cite: 295]:
  * [cite_start]👨‍🎓 **Mahasiswa**: Mengerjakan latihan, memantau *progress*, dan mendapatkan rekomendasi personal[cite: 267, 269, 270].
  * [cite_start]👨‍🏫 **Dosen**: Memantau aktivitas pembelajaran mahasiswa serta mengelola topik, materi, dan latihan[cite: 42, 272].
  * [cite_start]🛠️ **Admin**: Manajemen sistem secara menyeluruh untuk memantau data stabilitas platform[cite: 278, 280].
* [cite_start]**Modern UI Features**: Platform dilengkapi dengan fitur *Dark / Light Mode* demi kenyamanan visual pengguna saat belajar[cite: 302, 303].

---

## 🏗️ Arsitektur & Teknologi Utama

[cite_start]Sistem ini dibangun menggunakan arsitektur berbasis web dengan memanfaatkan Next.js sebagai *frontend* sekaligus *backend* melalui API *routes*[cite: 31].

### Tech Stack:
* [cite_start]**Frontend & Backend Framework**: Next.js (React Framework) [cite: 146]
* [cite_start]**Styling & UI Components**: Tailwind CSS, Lucide React (Icons) [cite: 320, 321]
* [cite_start]**Database & ORM**: MongoDB & Mongoose [cite: 31, 317]
* [cite_start]**Security & Authentication**: Bcryptjs & JSON Web Token (JWT) [cite: 318, 319]
* [cite_start]**AI Engine**: OpenRouter API Integration [cite: 148]

---

## 📊 Metode Pengujian & Hasil (*Learning Gain*)
[cite_start]Sistem telah divalidasi menggunakan skenario pengujian komprehensif[cite: 43]:
1. [cite_start]**Uji Fungsi & Adaptasi**: Memastikan perpindahan level (*Easy, Medium, Hard*) bekerja secara otomatis dan dinamis berdasarkan *trigger* performa pengerjaan soal pengguna[cite: 47, 178].
2. [cite_start]**Uji Fitur AI**: Memastikan AI berhasil mendeteksi jenis kesalahan, memberikan *feedback*, serta tips belajar yang relevan secara kontekstual[cite: 46].
3. [cite_start]**Uji Learning Gain**: Dilakukan perbandingan skor sebelum dan sesudah pengguna mendapatkan pengerjaan remedial[cite: 186]. [cite_start]Hasil pengujian menunjukkan adanya **peningkatan skor nyata pada latihan berikutnya**, membuktikan bahwa platform ini efektif membantu meningkatkan pemahaman riil pengguna[cite: 187, 188].

---

## 💻 Petunjuk Instalasi Lokal (Langkah Developer)

Jika ingin menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

### 1. Clone Repositori
```bash
git clone [https://github.com/fyasazrma/e-learning.git](https://github.com/fyasazrma/e-learning.git)
cd e-learning