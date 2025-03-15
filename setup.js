import fetch from "node-fetch"

// This script helps set up the Telegram webhook
async function setupWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const webhookUrl = process.env.WEBHOOK_URL || "https://your-vercel-app.vercel.app/api/webhook"

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not set")
    process.exit(1)
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`)
    const data = await response.json()

    if (data.ok) {
      console.log("Webhook set successfully!")
      console.log(`Webhook URL: ${webhookUrl}`)
    } else {
      console.error("Failed to set webhook:", data.description)
    }
  } catch (error) {
    console.error("Error setting webhook:", error)
  }
}

setupWebhook()

