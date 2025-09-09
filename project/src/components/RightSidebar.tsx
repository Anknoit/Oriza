import React from 'react';
import { Clock, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const newsItems = [
    {
      title: "Natural Gas Prices Surge on Cold Weather Forecast",
      sentiment: "bullish",
      time: "2 min ago",
      source: "Reuters"
    },
    {
      title: "LNG Exports from US Gulf Coast Increase 15%",
      sentiment: "bullish",
      time: "15 min ago",
      source: "Bloomberg"
    },
    {
      title: "European Gas Storage Levels Drop Below Average",
      sentiment: "bearish",
      time: "1 hour ago",
      source: "Platts"
    }
  ];

  const events = [
    { name: "EIA Natural Gas Report", time: "10:30 AM", impact: "high" },
    { name: "OPEC+ Meeting", time: "Tomorrow", impact: "high" },
    { name: "Fed Rate Decision", time: "Wed 2:00 PM", impact: "medium" },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
      {/* Market Sentiment */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200">Market Sentiment</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Natural Gas</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-green-400 rounded-full"></div>
              </div>
              <span className="text-xs text-green-400">+75%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Crude Oil</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-red-400 rounded-full"></div>
              </div>
              <span className="text-xs text-red-400">-33%</span>
            </div>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="p-4 border-b border-gray-800 flex-1 overflow-y-auto">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200">Live News</h3>
        </div>
        
        <div className="space-y-3">
          {newsItems.map((news, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors cursor-pointer">
              <h4 className="text-sm font-medium text-gray-200 mb-1">{news.title}</h4>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{news.source}</span>
                  <span className={`${getSentimentColor(news.sentiment)} capitalize`}>
                    {news.sentiment}
                  </span>
                </div>
                <span className="text-gray-400">{news.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Calendar */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200">Key Events</h3>
        </div>
        
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-200">{event.name}</div>
                <div className="text-xs text-gray-400">{event.time}</div>
              </div>
              <div className="flex items-center">
                <AlertTriangle className={`w-4 h-4 ${getImpactColor(event.impact)}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;