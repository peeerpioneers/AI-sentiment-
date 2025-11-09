
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SentimentTrendPoint } from '../types';

interface SentimentTrendChartProps {
  data: SentimentTrendPoint[];
}

const COLORS = {
  positive: '#22c55e', // green-500
  negative: '#ef4444', // red-500
  neutral: '#eab308',  // yellow-500
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-3 border border-gray-600 rounded-md shadow-lg">
        <p className="label font-bold text-white mb-2">{`${label}`}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
        <XAxis dataKey="week" tick={{ fill: '#a0aec0' }} stroke="#4a5568" />
        <YAxis tick={{ fill: '#a0aec0' }} stroke="#4a5568" />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4a5568', strokeWidth: 1 }}/>
        <Legend wrapperStyle={{ color: '#a0aec0' }} />
        <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
