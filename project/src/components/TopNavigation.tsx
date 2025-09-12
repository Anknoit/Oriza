import React, { useState } from 'react';
import { Search, Bell, Settings, User, Terminal, TrendingUp } from 'lucide-react';

interface TopNavigationProps {
  onCommandToggle: () => void;
  commandVisible: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onCommandToggle, commandVisible }) => {
  const [command, setCommand] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('Energy');

  const markets = ['Energy', 'Metals', 'Agriculture', 'FX', 'Indices'];

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Command executed:', command);
    setCommand('');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-blue-400">ORIZA</span>
            <span className="text-sm text-gray-400">TERMINAL</span>
          </div>

          {/* Command Line */}
          {/* <div className="relative">
            <button
              onClick={onCommandToggle}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Command</span>
            </button>
            
            {commandVisible && (
              <div className="absolute top-12 left-0 w-96 bg-gray-800 border border-gray-600 rounded-md p-2 z-50">
                <form onSubmit={handleCommandSubmit}>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Type 'NG' for Natural Gas, 'FX' for Forex..."
                    className="w-full bg-gray-900 text-green-400 px-3 py-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none font-mono text-sm"
                    autoFocus
                  />
                </form>
                <div className="mt-2 text-xs text-gray-400">
                  Quick commands: NG, WTI, GOLD, EUR, SPX
                </div>
              </div>
            )}
          </div> */}

          {/* Market Selector */}
          {/* <select 
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            {markets.map(market => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select> */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <button className="p-2 hover:bg-gray-800 rounded-md transition-colors">
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-800 rounded-md transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-800 rounded-md transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>

          {/* User Profile */}
          <button className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-md transition-colors">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">Trader</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;