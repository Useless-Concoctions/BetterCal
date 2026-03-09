'use server'

import { visionModel } from './gemini'

export async function processGenericScreenshot(base64Image: string) {
    if (!visionModel) {
        throw new Error("Gemini API not configured")
    }

    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "")

    const prompt = `Analyze this image (could be a flyer, screenshot of a text message, social media post, etc.) and extract event details.
    
    Return the result strictly as a JSON object with the following keys:
    - title (string, concise)
    - start (ISO String format datetime, guess the year if missing based on current time)
    - end (ISO String format datetime, or null if only start time known)
    - location (string, or null if unknown)
    - description (string, a brief summary of what the event is)
    - emoji (string, a single emoji that represents the event)
    
    If no event information can be found, return {"error": "No event found"}. Do not return any other text or markdown.`

    try {
        const result = await visionModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageData,
                    mimeType: "image/png" // Default to png
                }
            }
        ])

        let text = result.response.text().trim()

        // Strip out markdown code block if gemini hallucinated one
        if (text.startsWith('\`\`\`json')) {
            text = text.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '')
        }

        const data = JSON.parse(text)

        if (data.error) {
            return null
        }

        return data

    } catch (error) {
        console.error("Error processing event screenshot with Gemini:", error)
        throw new Error("Failed to process event screenshot")
    }
}
