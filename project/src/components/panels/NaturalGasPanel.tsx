import React, { useState } from 'react';
import { TrendingUp, MapPin, Thermometer, Ship, BarChart3 } from 'lucide-react';

const NaturalGasPanel: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const timeframes = ['5M', '1H', '4H', '1D', '1W', '1M'];

  const priceData = {
    current: 2.847,
    change: 0.023,
    changePercent: 0.81,
    high: 2.890,
    low: 2.820
  };

  const storageData = [
    { region: 'US Total', current: 3240, average: 3180, percent: 102 },
    { region: 'East', current: 1120, average: 1089, percent: 103 },
    { region: 'Midwest', current: 1045, average: 1034, percent: 101 },
    { region: 'West', current: 285, average: 298, percent: 96 },
    { region: 'South Central', current: 790, average: 759, percent: 104 }
  ];

  const lngData = [
    { terminal: 'Sabine Pass', status: 'Loading', vessels: 2, capacity: '98%' },
    { terminal: 'Cameron LNG', status: 'Active', vessels: 1, capacity: '87%' },
    { terminal: 'Freeport', status: 'Maintenance', vessels: 0, capacity: '0%' },
    { terminal: 'Corpus Christi', status: 'Active', vessels: 3, capacity: '95%' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Natural Gas Trading</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-3xl font-mono text-white">${priceData.current.toFixed(3)}</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono">
                  +{priceData.change.toFixed(3)} (+{priceData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Day Range</div>
            <div className="text-white font-mono">
              ${priceData.low.toFixed(3)} - ${priceData.high.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Price Chart Panel */}
        <div className="col-span-8 bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Henry Hub Spot Price</h3>
            <div className="flex space-x-2">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedTimeframe === tf 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 h-80 bg-gray-950 rounded-b-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400">Interactive price chart would render here</p>
              <p className="text-sm text-gray-500 mt-2">Real-time candlestick data with technical indicators</p>
            </div>
          </div>
        </div>

        {/* Futures Curve */}
        <div className="col-span-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Futures Curve</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {['Feb24', 'Mar24', 'Apr24', 'May24', 'Jun24'].map((month, index) => (
                <div key={month} className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-sm">{month}</span>
                  <div className="text-right">
                    <div className="text-white font-mono">
                      ${(priceData.current + index * 0.05).toFixed(3)}
                    </div>
                    <div className="text-xs text-green-400">+0.12%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Storage Levels */}
        <div className="col-span-6 bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Storage Levels (Bcf)</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {storageData.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">{region.region}</span>
                      <span className={`text-sm ${region.percent >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {region.percent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${region.percent >= 100 ? 'bg-green-400' : 'bg-yellow-400'}`}
                        style={{ width: `${Math.min(region.percent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Current: {region.current}</span>
                      <span>5Y Avg: {region.average}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LNG Terminals */}
        <div className="col-span-6 bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Ship className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">LNG Export Terminals</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {lngData.map((terminal, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{terminal.terminal}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      terminal.status === 'Active' 
                        ? 'bg-green-900 text-green-400' 
                        : terminal.status === 'Loading'
                        ? 'bg-blue-900 text-blue-400'
                        : 'bg-red-900 text-red-400'
                    }`}>
                      {terminal.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vessels: {terminal.vessels}</span>
                    <span className="text-gray-400">Capacity: {terminal.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalGasPanel;