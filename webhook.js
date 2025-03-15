import { handleTelegramUpdate } from "../lib/telegramBot"

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const update = req.body
      await handleTelegramUpdate(update)
      res.status(200).json({ ok: true })
    } catch (error) {
      console.error("Error handling webhook:", error)
      res.status(500).json({ error: "Failed to process webhook" })
    }
  } else {
    // For setting up webhook
    res.status(200).json({ message: "Telegram webhook endpoint is working" })
  }
}

