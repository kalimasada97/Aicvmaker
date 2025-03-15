# AI CV Maker Telegram Bot

Bot Telegram yang mengubah foto selfie menjadi pas foto dan membuat CV profesional menggunakan OpenAI API.

## Fitur

- Menggunakan Telegram Bot API untuk menerima foto selfie
- Mengedit foto menjadi pas foto menggunakan AI image processing
- Menggunakan OpenAI API untuk menghasilkan CV lengkap dan profesional
- Menggunakan Vercel sebagai hosting untuk server bot
- Merespons pengguna dengan CV yang telah di-generate dalam format PDF

## Teknologi

- Node.js
- Express.js
- Telegram Bot API
- OpenAI API
- Vercel Serverless Functions
- Sharp (untuk manipulasi gambar)
- PDFKit (untuk pembuatan CV dalam format PDF)

## Cara Penggunaan

1. Kirim foto selfie Anda ke bot
2. Tambahkan keterangan "posisi [nama posisi]" (contoh: "posisi Software Engineer")
3. Bot akan memproses foto dan membuat CV profesional
4. Anda akan menerima CV dalam format PDF

## Langkah Deployment

1. Fork atau clone repository ini
2. Install dependensi dengan `npm install`
3. Buat file `.env` berdasarkan `.env.example` dan masukkan API key Telegram serta OpenAI
4. Deploy ke Vercel dengan `vercel deploy`
5. Set webhook bot Telegram dengan menjalankan `node setup.js` (pastikan WEBHOOK_URL di .env sudah benar)

## Contoh Prompt

"Buatkan saya CV profesional berdasarkan foto selfie saya dengan posisi Software Engineer."

## Lisensi

MIT

