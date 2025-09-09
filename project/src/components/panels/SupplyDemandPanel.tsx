import React from 'react';
import { Factory, Truck, Zap, MapPin } from 'lucide-react';

const SupplyDemandPanel: React.FC = () => {
  const productionData = [
    { region: 'Permian Basin', production: 5240, capacity: 6000, utilization: 87 },
    { region: 'Eagle Ford', production: 1680, capacity: 1850, utilization: 91 },
    { region: 'Bakken', production: 1150, capacity: 1300, utilization: 88 },
    { region: 'Marcellus', production: 20450, capacity: 22000, utilization: 93 }
  ];

  const demandData = [
    { sector: 'Power Generation', demand: 14500, share: 38, trend: 'up' },
    { sector: 'Industrial', demand: 9800, share: 26, trend: 'stable' },
    { sector: 'Residential/Commercial', demand: 7200, share: 19, trend: 'down' },
    { sector: 'LNG Exports', demand: 6500, share: 17, trend: 'up' }
  ];

  const pipelineData = [
    { name: 'Transco Pipeline', flow: 12500, capacity: 14000, direction: 'South to North' },
    { name: 'Kinder Morgan', flow: 8700, capacity: 9200, direction: 'West to East' },
    { name: 'Energy Transfer', flow: 6300, capacity: 7500, direction: 'Permian to Gulf' },
    { name: 'Enbridge', flow: 4200, capacity: 4800, direction: 'Canada to US' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Supply & Demand Analytics</h1>
        <div className="text-sm text-gray-400">
          Updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Production Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Factory className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Production by Region</h3>
            </div>
            <p className="text-sm text-gray-400 mt-1">Natural Gas Production (MMcf/d)</p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {productionData.map((region, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{region.region}</span>
                    <div className="text-right">
                      <span className="text-white font-mono">{region.production.toLocaleString()}</span>
                      <span className="text-sm text-gray-400 ml-2">({region.utilization}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-400 rounded-full"
                      style={{ width: `${region.utilization}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Capacity: {region.capacity.toLocaleString()}</span>
                    <span>Utilization: {region.utilization}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Demand by Sector</h3>
            </div>
            <p className="text-sm text-gray-400 mt-1">Natural Gas Consumption (MMcf/d)</p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {demandData.map((sector, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{sector.sector}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{sector.demand.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        sector.trend === 'up' 
                          ? 'bg-green-900 text-green-400' 
                          : sector.trend === 'down'
                          ? 'bg-red-900 text-red-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {sector.trend}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 bg-yellow-400 rounded-full"
                        style={{ width: `${sector.share}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap">{sector.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Flows */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Major Pipeline Flows</h3>
          </div>
          <p className="text-sm text-gray-400 mt-1">Current Flow vs Capacity (MMcf/d)</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pipelineData.map((pipeline, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-medium">{pipeline.name}</h4>
                  <span className="text-sm text-gray-400">{Math.round((pipeline.flow / pipeline.capacity) * 100)}%</span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{pipeline.direction}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (pipeline.flow / pipeline.capacity) > 0.9 ? 'bg-red-400' : 
                        (pipeline.flow / pipeline.capacity) > 0.75 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${(pipeline.flow / pipeline.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Flow: {pipeline.flow.toLocaleString()}</span>
                  <span className="text-gray-400">Capacity: {pipeline.capacity.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supply/Demand Balance */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Market Balance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">28.9</div>
              <div className="text-sm text-gray-400">Total Supply (Bcf/d)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">28.0</div>
              <div className="text-sm text-gray-400">Total Demand (Bcf/d)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">+0.9</div>
              <div className="text-sm text-gray-400">Net Balance (Bcf/d)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyDemandPanel;