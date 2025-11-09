export interface SentimentTrendPoint {
  week: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SentimentData {
  totalComments: number;
  positiveComments: number;
  negativeComments: number;
  neutralComments: number;
  positiveThemes: string[];
  negativeThemes: string[];
  sentimentTrend: SentimentTrendPoint[];
}

// This type represents the raw, parsed JSON from the Gemini API
// which could either be a successful analysis or a validation error.
export type GeminiApiResponse = {
  validSymbol: boolean;
  error?: string;
  totalComments?: number;
  positiveComments?: number;

  negativeComments?: number;
  neutralComments?: number;
  positiveThemes?: string[];
  negativeThemes?: string[];
  sentimentTrend?: SentimentTrendPoint[];
};
