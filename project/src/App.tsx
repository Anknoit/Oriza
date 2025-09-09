import React, { useState } from 'react';
import TopNavigation from './components/TopNavigation';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MainContent from './components/MainContent';
import TickerStrip from './components/TickerStrip';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [commandVisible, setCommandVisible] = useState(false);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Ticker Strip */}
      <TickerStrip />
      
      {/* Top Navigation */}
      <TopNavigation 
        onCommandToggle={() => setCommandVisible(!commandVisible)}
        commandVisible={commandVisible}
      />
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        {/* Main Content */}
        <MainContent activeSection={activeSection} />
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}

export default App;