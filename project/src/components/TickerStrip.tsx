import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const TickerStrip: React.FC = () => {
  const [tickerData, setTickerData] = useState<TickerItem[]>([
    { symbol: 'HENRY HUB', price: 2.847, change: 0.023, changePercent: 0.81 },
    { symbol: 'TTF', price: 28.45, change: -0.85, changePercent: -2.90 },
    { symbol: 'JKM LNG', price: 11.20, change: 0.15, changePercent: 1.36 },
    { symbol: 'WTI', price: 71.23, change: -0.45, changePercent: -0.63 },
    { symbol: 'BRENT', price: 75.89, change: -0.32, changePercent: -0.42 },
    { symbol: 'DXY', price: 103.45, change: 0.12, changePercent: 0.12 },
    { symbol: 'S&P 500', price: 4567.89, change: 12.34, changePercent: 0.27 },
    { symbol: 'GOLD', price: 1985.50, change: -8.25, changePercent: -0.41 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * 0.1,
        change: (Math.random() - 0.5) * 2,
        changePercent: (Math.random() - 0.5) * 4
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-950 border-b border-gray-800 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap py-1">
        {tickerData.concat(tickerData).map((item, index) => (
          <div key={index} className="inline-flex items-center space-x-2 mx-6 py-1">
            <span className="text-blue-400 font-mono text-sm">{item.symbol}</span>
            <span className="text-white font-mono text-sm">{item.price.toFixed(2)}</span>
            <div className={`flex items-center space-x-1 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-mono text-sm">
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerStrip;