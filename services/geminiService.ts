
import { GoogleGenAI, Type } from "@google/genai";
import type { SentimentData, GeminiApiResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder for environments where API_KEY might not be set.
  // In a real deployed environment, this should be handled securely.
  console.warn("API_KEY is not set. The application will not be able to contact the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function fetchSentimentData(symbol: string): Promise<SentimentData> {
  const prompt = `
    Act as an expert financial sentiment analysis tool. Your first and most important task is to validate the stock symbol provided.

    **Step 1: Validation**
    First, determine if "${symbol}" is a real, publicly traded stock symbol that can be found on Yahoo Finance and has an active community comments page.

    **Step 2: Response**
    -   If the symbol is **INVALID** or cannot be found on Yahoo Finance, you MUST return ONLY the following JSON object and stop immediately:
        \`\`\`json
        {
          "validSymbol": false,
          "error": "The symbol '${symbol}' is not a valid stock ticker or has no community data on Yahoo Finance."
        }
        \`\`\`
    -   If and only if the symbol is **VALID**, then proceed with the deep analysis below and return the corresponding JSON object.

    **Deep Analysis (for valid symbols only):**
    Perform a deep analysis of the community comments on Yahoo Finance for the stock symbol over the last 30 days.

    Provide a summary of the sentiment with the following considerations:
    1.  **Sarcasm Detection:** Accurately interpret sarcasm. A comment like "Fantastic, another 10% dive" is negative.
    2.  **Contextual Analysis:** Analyze entire comment threads. A reply can change the meaning of the original comment.
    3.  **Filter Noise:** Identify and discount repetitive, low-effort comments from bots or spam accounts (e.g., users repeatedly posting rocket emojis).

    I need the output in a specific JSON format. The JSON object should contain the following keys, representing your best plausible estimation after deep analysis:
    1.  "validSymbol": Must be \`true\`.
    2.  "totalComments": An integer for the total number of *meaningful* comments.
    3.  "positiveComments": An integer for the number of positive comments.
    4.  "negativeComments": An integer for the number of negative comments.
    5.  "neutralComments": An integer for the number of neutral or unsorted comments.
    6.  "positiveThemes": An array of 3 short strings, each describing a key positive theme or reason for bullish sentiment.
    7.  "negativeThemes": An array of 3 short strings, each describing a key negative theme or reason for bearish sentiment.
    8.  "sentimentTrend": An array of 4 objects, representing the sentiment breakdown for each of the last 4 weeks. The "week" label should be descriptive (e.g., "4 Weeks Ago", "3 Weeks Ago", "2 Weeks Ago", "Last Week"). Each object must have four keys: "week", "positive", "negative", and "neutral".

    The sum of positive, negative, and neutral comments must exactly equal the total comments. Do not add any explanatory text or markdown formatting, return only the raw JSON object.
  `;
  
  // A more flexible schema to handle both success and error cases
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      validSymbol: { type: Type.BOOLEAN },
      error: { type: Type.STRING, nullable: true },
      totalComments: { type: Type.INTEGER, nullable: true },
      positiveComments: { type: Type.INTEGER, nullable: true },
      negativeComments: { type: Type.INTEGER, nullable: true },
      neutralComments: { type: Type.INTEGER, nullable: true },
      positiveThemes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        nullable: true,
      },
      negativeThemes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        nullable: true,
      },
      sentimentTrend: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.STRING },
            positive: { type: Type.INTEGER },
            negative: { type: Type.INTEGER },
            neutral: { type: Type.INTEGER },
          },
          required: ["week", "positive", "negative", "neutral"],
        },
        nullable: true,
      },
    },
    required: ["validSymbol"],
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
    });

    let text = response.text.trim();
    // Robustly find and extract the JSON object from the raw text response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("AI response did not contain a valid JSON object.");
    }
    
    text = text.substring(jsonStart, jsonEnd + 1);
    const data: GeminiApiResponse = JSON.parse(text);


    // Step 1: Check for symbol validity
    if (data.validSymbol === false) {
      throw new Error(data.error || `The symbol "${symbol}" is not valid.`);
    }

    // Step 2: Stricter validation for valid symbols
    if (
      data.totalComments === undefined ||
      data.positiveComments === undefined ||
      data.negativeComments === undefined ||
      data.neutralComments === undefined ||
      !data.positiveThemes ||
      !data.negativeThemes ||
      !data.sentimentTrend
    ) {
      throw new Error("AI data inconsistency: Missing required fields for a valid symbol.");
    }
    
    if (data.positiveComments + data.negativeComments + data.neutralComments !== data.totalComments) {
      throw new Error("AI data inconsistency: Comment totals do not match.");
    }
    if (data.positiveThemes.length !== 3 || data.negativeThemes.length !== 3 || data.sentimentTrend.length !== 4) {
      throw new Error("AI data inconsistency: Incorrect number of themes or trend points returned.");
    }
    
    return data as SentimentData;
  } catch (error) {
    console.error("Error fetching sentiment data from Gemini API:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Failed to retrieve sentiment data. The AI model may be temporarily unavailable or data validation failed.";
    throw new Error(errorMessage);
  }
}
