
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StockInput } from './components/StockInput';
import { SentimentDisplay } from './components/SentimentDisplay';
import { fetchSentimentData } from './services/geminiService';
import type { SentimentData } from './types';
import { Welcome } from './components/Welcome';
import { LoadingSpinner } from './components/icons';

const loadingMessages = [
  'Gathering comments for $SYMBOL...',
  'Analyzing for sarcasm and context...',
  'Filtering out bot activity...',
  'Finalizing sentiment scores...',
];

const App: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('TSLA');
  const [lastAnalyzedSymbol, setLastAnalyzedSymbol] = useState<string>('');
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const intervalRef = useRef<number | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSentimentData(null);
    try {
      const data = await fetchSentimentData(symbol.toUpperCase());
      setSentimentData(data);
      setLastAnalyzedSymbol(symbol.toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setSentimentData(null);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[0].replace('$SYMBOL', symbol.toUpperCase()));

      intervalRef.current = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex].replace('$SYMBOL', symbol.toUpperCase()));
      }, 2500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, symbol]);

  const isValidationError = error && (error.includes('not a valid stock ticker') || error.includes('no community data'));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            AI Sentiment Scraper
          </h1>
          <p className="text-gray-400 mt-2">
            Analyze Yahoo Finance community sentiment for any stock symbol.
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
            <StockInput
              symbol={symbol}
              setSymbol={setSymbol}
              onSubmit={handleAnalyze}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-gray-400">{loadingMessage}</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
              </div>
            )}
            {error && (
              isValidationError ? (
                 <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-center">
                    <strong>Validation Failed:</strong> {error}
                 </div>
              ) : (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                  <strong>Error:</strong> {error}
                </div>
              )
            )}
            {!isLoading && !error && sentimentData && (
              <SentimentDisplay data={sentimentData} symbol={lastAnalyzedSymbol} />
            )}
            {!isLoading && !error && !sentimentData && <Welcome />}
          </div>
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by Google Gemini. Data is AI-generated for illustrative purposes.</p>
          <p>&copy; {new Date().getFullYear()} AI Sentiment Scraper</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
