import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const portfolioData = [
    { name: 'Natural Gas', value: '$2,847,000', change: '+2.1%', trend: 'up' },
    { name: 'Crude Oil', value: '$1,234,500', change: '-0.8%', trend: 'down' },
    { name: 'Gold', value: '$987,650', change: '+1.5%', trend: 'up' },
    { name: 'Silver', value: '$543,210', change: '-1.2%', trend: 'down' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">$5.6M</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-sm text-green-400">+12.5% Today</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Positions</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-400">Across 8 commodities</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">P&L Today</p>
              <p className="text-2xl font-bold text-green-400">+$127K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-400">Best performing day</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Risk Score</p>
              <p className="text-2xl font-bold text-yellow-400">7.2</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-yellow-400">Moderate Risk</span>
          </div>
        </div>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Portfolio Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.value}</div>
                    <div className={`text-sm ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Bought Natural Gas Futures</div>
                  <div className="text-sm text-gray-400">100 contracts @ $2.85</div>
                </div>
                <div className="text-sm text-gray-400">2 min ago</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Sold WTI Crude</div>
                  <div className="text-sm text-gray-400">50 contracts @ $71.20</div>
                </div>
                <div className="text-sm text-gray-400">15 min ago</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Updated Stop Loss</div>
                  <div className="text-sm text-gray-400">Gold position @ $1980</div>
                </div>
                <div className="text-sm text-gray-400">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;