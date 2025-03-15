import sharp from "sharp"

export async function processImage(imageBuffer) {
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()

    // Detect face and crop to proper ID photo dimensions
    // For simplicity, we'll just crop to a square and add white background
    // In a real implementation, you might want to use a face detection library

    const minDimension = Math.min(metadata.width, metadata.height)

    // Crop to square focusing on the center (where face likely is)
    const croppedImage = await sharp(imageBuffer)
      .extract({
        left: Math.floor((metadata.width - minDimension) / 2),
        top: Math.floor((metadata.height - minDimension) / 4), // Slightly higher to focus on face
        width: minDimension,
        height: minDimension,
      })
      .resize(500, 600) // Standard ID photo size
      .extend({
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    return croppedImage
  } catch (error) {
    console.error("Error processing image:", error)
    throw new Error("Failed to process image")
  }
}

