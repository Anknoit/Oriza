import React from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

const MarketDataPanel: React.FC = () => {
  const marketData = [
    { symbol: 'NG1!', name: 'Natural Gas Front Month', price: 2.847, change: 0.023, volume: '145,234' },
    { symbol: 'CL1!', name: 'Crude Oil Front Month', price: 71.23, change: -0.45, volume: '298,567' },
    { symbol: 'GC1!', name: 'Gold Front Month', price: 1985.50, change: -8.25, volume: '87,432' },
    { symbol: 'SI1!', name: 'Silver Front Month', price: 24.87, change: 0.12, volume: '45,678' },
    { symbol: 'HG1!', name: 'Copper Front Month', price: 3.82, change: 0.05, volume: '67,890' },
    { symbol: 'ZW1!', name: 'Wheat Front Month', price: 645.25, change: -2.50, volume: '23,456' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Market Data</h1>
        <div className="text-sm text-gray-400">
          Real-time data • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Futures Prices</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Instrument</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Change %</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {marketData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-400 font-mono text-sm">{item.symbol}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-mono">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`flex items-center justify-end space-x-1 ${
                      item.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${item.change < 0 ? 'rotate-180' : ''}`} />
                      <span className="font-mono">
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-mono ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {((item.change / item.price) * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-400 font-mono">{item.volume}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Market Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Market Volatility</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">VIX</span>
              <span className="text-white font-mono">18.45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Oil Volatility</span>
              <span className="text-white font-mono">24.67</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gas Volatility</span>
              <span className="text-white font-mono">31.82</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Currency Impact</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">USD Index</span>
              <span className="text-white font-mono">103.45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">EUR/USD</span>
              <span className="text-white font-mono">1.0876</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">USD/CNY</span>
              <span className="text-white font-mono">7.234</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Sector Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Energy</span>
              <span className="text-green-400 font-mono">+2.34%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Metals</span>
              <span className="text-red-400 font-mono">-0.87%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Agriculture</span>
              <span className="text-green-400 font-mono">+1.56%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPanel;