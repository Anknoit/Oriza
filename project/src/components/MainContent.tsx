import React from 'react';
import Dashboard from './panels/Dashboard';
import NaturalGasPanel from './panels/NaturalGasPanel';
import MarketDataPanel from './panels/MarketDataPanel';
import SupplyDemandPanel from './panels/SupplyDemandPanel';
import NewsPanel from './panels/NewsPanel';

interface MainContentProps {
  activeSection: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'natural-gas':
        return <NaturalGasPanel />;
      case 'market-data':
        return <MarketDataPanel />;
      case 'supply-demand':
        return <SupplyDemandPanel />;
      default:
        // return <Dashboard />;
        return <NewsPanel />;
    }
  };

  return (
    <main className="flex-1 bg-gray-950 overflow-auto">
      {renderContent()}
    </main>
  );
};

export default MainContent;