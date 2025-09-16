import React from 'react';
import { 
  Home, 
  BarChart3, 
  Zap, 
  Globe, 
  TrendingUp, 
  FileText, 
  Folder,
  Flame,
  Droplets,
  Wheat,
  DollarSign,
  Building2
} from 'lucide-react';

interface LeftSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeSection, onSectionChange }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'News', icon: <Home className="w-5 h-5" /> },
    { id: 'market-data', label: 'Market Data', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'supply-demand', label: 'Supply & Demand', icon: <Zap className="w-5 h-5" />, badge: '3' },
    { id: 'macro', label: 'Macro & Geopolitics', icon: <Globe className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics / AI', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-5 h-5" /> },
    { id: 'workspaces', label: 'Saved Workspaces', icon: <Folder className="w-5 h-5" /> },
  ];

  const commodityItems: NavItem[] = [
    { id: 'natural-gas', label: 'Natural Gas', icon: <Flame className="w-4 h-4" /> },
    { id: 'oil', label: 'Crude Oil', icon: <Droplets className="w-4 h-4" /> },
    { id: 'agriculture', label: 'Agriculture', icon: <Wheat className="w-4 h-4" /> },
    { id: 'metals', label: 'Metals', icon: <Building2 className="w-4 h-4" /> },
    { id: 'forex', label: 'Forex', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</h2>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Commodities</h3>
          <ul className="mt-3 space-y-1">
            {commodityItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Market Status</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Markets Open</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;