import { GoogleGenAI } from "@google/genai";
import type { SentimentData, GeminiApiResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not set. Please ensure the environment variable is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function fetchSentimentData(symbol: string): Promise<SentimentData> {
  const prompt = `
    Analyze the stock symbol "${symbol}" and return a JSON object.

    IMPORTANT: Your entire response must be ONLY a single valid JSON object.
    Do NOT include any other text before or after the JSON. This is for an educational project and is not financial advice.

    **If the symbol is VALID:**
    Return a JSON object with the following structure. ALL fields are required.
    {
      "validSymbol": true,
      "error": null,
      "totalComments": <integer, a realistic estimate between 500 and 500000>,
      "positiveComments": <integer>,
      "negativeComments": <integer>,
      "neutralComments": <integer>,
      "positiveThemes": ["<theme 1>", "<theme 2>", "<theme 3>"],
      "negativeThemes": ["<theme 1>", "<theme 2>", "<theme 3>"],
      "sentimentTrend": [
        {"week": "4 Weeks Ago", "positive": 100, "negative": 50, "neutral": 20},
        {"week": "3 Weeks Ago", "positive": 120, "negative": 40, "neutral": 25},
        {"week": "2 Weeks Ago", "positive": 150, "negative": 30, "neutral": 30},
        {"week": "Last Week", "positive": 180, "negative": 20, "neutral": 20}
      ]
    }
    Ensure that positive, negative, and neutral comments sum up to the total. Provide concrete numbers for the sentiment trend.

    **If the symbol is INVALID:**
    Return this exact JSON structure:
    {
      "validSymbol": false,
      "error": "The symbol '${symbol}' is not a valid stock ticker or has no community data on Yahoo Finance."
    }
  `;

  try {
    // FIX: Replaced deprecated getGenerativeModel with ai.models.generateContent, updated model name, and configured for JSON output.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (response.promptFeedback?.blockReason) {
      const blockReason = response.promptFeedback.blockReason;
      throw new Error(`Request was blocked by the API for safety reasons: ${blockReason}. Please modify your input.`);
    }

    // FIX: Access response text via the `.text` property instead of the deprecated `.text()` method and remove regex parsing.
    const text = response.text;

    if (!text) {
      throw new Error("AI response was empty.");
    }

    const jsonString = text;
    let data: GeminiApiResponse;

    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from response:", jsonString);
      throw new Error(`Failed to parse JSON from AI response. Raw text:\n${jsonString}`);
    }

    if (data.validSymbol === false) {
      throw new Error(data.error || `The symbol "${symbol}" is not valid.`);
    }

    if (
      typeof data.totalComments !== 'number' ||
      typeof data.positiveComments !== 'number' ||
      typeof data.negativeComments !== 'number' ||
      typeof data.neutralComments !== 'number' ||
      !Array.isArray(data.positiveThemes) ||
      !Array.isArray(data.negativeThemes) ||
      !Array.isArray(data.sentimentTrend)
    ) {
      console.error("Incomplete data received from API:", data);
      throw new Error(`The AI model failed to generate complete data for '${symbol}'. This may be due to a temporary model issue or content policies.`);
    }

    // A final simple sanity check on the numbers
    if (data.totalComments < 0 || data.positiveComments < 0 || data.negativeComments < 0 || data.neutralComments < 0) {
        throw new Error("AI data inconsistency: Comment counts cannot be negative.");
    }
    
    return data as SentimentData;
  } catch (error) {
    console.error("Error in fetchSentimentData:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Error fetching sentiment data from Gemini API: ${errorMessage}`);
  }
}
