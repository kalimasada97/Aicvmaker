import fetch from "node-fetch"
import { processImage } from "./imageProcessor"
import { generateCV } from "./cvGenerator"
import { createPDF } from "./pdfGenerator"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// Send message to user
async function sendMessage(chatId, text, parseMode = "Markdown") {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  })
  return response.json()
}

// Send document (PDF) to user
async function sendDocument(chatId, document, caption) {
  const formData = new FormData()
  formData.append("chat_id", chatId)
  formData.append("document", new Blob([document], { type: "application/pdf" }), "your_cv.pdf")
  if (caption) formData.append("caption", caption)

  const response = await fetch(`${API_URL}/sendDocument`, {
    method: "POST",
    body: formData,
  })
  return response.json()
}

// Get file from Telegram
async function getFile(fileId) {
  const response = await fetch(`${API_URL}/getFile?file_id=${fileId}`)
  const data = await response.json()

  if (data.ok) {
    const filePath = data.result.file_path
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
    const fileResponse = await fetch(fileUrl)
    return await fileResponse.buffer()
  }
  throw new Error("Failed to get file from Telegram")
}

// Main handler for Telegram updates
export async function handleTelegramUpdate(update) {
  // Check if this is a message with photo
  if (update.message && update.message.photo) {
    const chatId = update.message.chat.id
    const photoId = update.message.photo[update.message.photo.length - 1].file_id
    const messageText = update.message.caption || ""

    try {
      // Send acknowledgment
      await sendMessage(chatId, "✅ Saya telah menerima foto Anda. Sedang memproses...")

      // Get photo from Telegram
      const photoBuffer = await getFile(photoId)

      // Process image to create ID photo
      await sendMessage(chatId, "🖼️ Mengubah foto menjadi pas foto...")
      const processedImageBuffer = await processImage(photoBuffer)

      // Generate CV using OpenAI
      await sendMessage(chatId, "📝 Menghasilkan CV profesional menggunakan AI...")

      // Extract job position from message if available
      let position = "Professional"
      const positionMatch = messageText.match(/posisi\s+(.+)/i)
      if (positionMatch) {
        position = positionMatch[1]
      }

      const cvData = await generateCV(position)

      // Create PDF with the CV data and processed image
      await sendMessage(chatId, "📄 Membuat dokumen CV...")
      const pdfBuffer = await createPDF(cvData, processedImageBuffer)

      // Send the PDF to the user
      await sendDocument(chatId, pdfBuffer, "CV Profesional Anda telah siap!")

      // Send follow-up message
      await sendMessage(
        chatId,
        "✨ CV Anda telah berhasil dibuat! Jika Anda ingin membuat CV baru, silakan kirim foto selfie lain dengan keterangan posisi yang diinginkan.",
      )
    } catch (error) {
      console.error("Error processing request:", error)
      await sendMessage(chatId, "❌ Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.")
    }
  }
  // Handle start command
  else if (update.message && update.message.text === "/start") {
    const chatId = update.message.chat.id
    await sendMessage(
      chatId,
      "👋 Selamat datang di AI CV Maker Bot!\n\n" +
        "Kirimkan foto selfie Anda dengan keterangan posisi yang diinginkan, dan saya akan membuat CV profesional untuk Anda.\n\n" +
        'Contoh: Kirim foto dengan keterangan "posisi Software Engineer"',
    )
  }
  // Handle help command
  else if (update.message && update.message.text === "/help") {
    const chatId = update.message.chat.id
    await sendMessage(
      chatId,
      "🔍 *Cara Menggunakan Bot*\n\n" +
        "1. Kirim foto selfie Anda\n" +
        '2. Tambahkan keterangan "posisi [nama posisi]" (contoh: "posisi Software Engineer")\n' +
        "3. Tunggu beberapa saat sementara saya memproses foto dan membuat CV\n" +
        "4. Anda akan menerima CV dalam format PDF\n\n" +
        "Untuk hasil terbaik, gunakan foto dengan pencahayaan yang baik dan latar belakang yang bersih.",
    )
  }
}

