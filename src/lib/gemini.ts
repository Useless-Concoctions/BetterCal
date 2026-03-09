import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // We'll handle this gracefully in the UI if needed
  console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const visionModel = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });
