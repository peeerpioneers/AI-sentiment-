
import React from 'react';
import { ChartBarIcon, DocumentTextIcon, LightBulbIcon } from './icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center">
        <div className="flex justify-center mb-4 text-blue-400">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{children}</p>
    </div>
);

export const Welcome: React.FC = () => {
    return (
        <div className="text-center p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-2 text-white">Welcome to the AI Sentiment Scraper</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Enter a stock symbol (e.g., TSLA, NVDA) in the search bar above to begin. Our AI will generate a plausible sentiment analysis based on simulated Yahoo Finance community comments from the last 30 days.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard icon={<DocumentTextIcon />} title="AI-Powered Analysis">
                    Leverages the power of Google's Gemini model to generate realistic sentiment data for any stock ticker.
                </FeatureCard>
                <FeatureCard icon={<ChartBarIcon />} title="Visual Insights">
                    Instantly understand market mood with an easy-to-read dashboard and sentiment distribution chart.
                </FeatureCard>
                <FeatureCard icon={<LightBulbIcon />} title="Simulated Data">
                    This tool provides AI-generated data for demonstration and is not based on live scraping of financial websites.
                </FeatureCard>
            </div>
        </div>
    );
};
