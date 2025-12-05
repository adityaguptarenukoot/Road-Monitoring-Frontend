import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import PieChart from '../components/PieChart';
import RateChart from '../components/RateChart';
import VideoUpload from '../components/VideoUpload';
import VideoFeed from '../components/VideoFeed';
import ThresholdAlert from "../components/ThresholdAlert";
import LineChart from "../components/LineChart";
import AlarmHistory from "../components/AlarmHistory";
import PollingDropdown from "../components/PollingDropdown";
import LaneLineChart from "../components/LaneLineChart";
import LiveAlarmDashboard from "../components/LiveAlarmDashboard";
import Modal from "../components/Modal";

function Dashboard() {
  const [stats, setStats] = useState({
    counts: {
      total: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
      in: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
      out: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
    },
    rates: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
    thresholds_crossed: [],
    processing_status: 'Waiting for video',
  });

  const [videoUploaded, setVideoUploaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rateHistory, setRateHistory] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(1);
  const MAX_HISTORY = Math.ceil(300 / pollingInterval);

  const [expandedComponent, setExpandedComponent] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.getCurrentStats();
        setStats(response);
        setConnected(true);
        console.log('Initial data loaded:', response);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setConnected(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.getCurrentStats();
        setStats(response);
        setConnected(true);

        if (isProcessing && response.processing_status !== "Waiting for video upload...") {
          console.log('Adding to history:', response.rates);
          setRateHistory(prev => {
            const newHistory = [...prev, { rates: response.rates }];
            if (newHistory.length > MAX_HISTORY) {
              return newHistory.slice(-MAX_HISTORY);
            }
            return newHistory;
          });
        }
      } catch (error) {
        console.error('Polling failed:', error);
        setConnected(false);
      }
    }, pollingInterval * 1000);

    return () => clearInterval(interval);
  }, [isProcessing, pollingInterval]);

  const handleStopAnalysis = async () => {
    try {
      await api.stopProcessing();
      await api.resetStats();

      setIsProcessing(false);
      setVideoUploaded(false);
      setRateHistory([]);

      setStats({
        counts: {
          total: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
          in: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
          out: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
        },
        rates: { '2WHLR': 0, 'LMV': 0, 'HMV': 0 },
        thresholds_crossed: [],
        processing_status: 'Waiting for video',
      });

      console.log('✓ Analysis stopped and reset to zero');
    } catch (error) {
      console.error('Failed to stop analysis:', error);
    }
  };

  const handleUploadSuccess = (response) => {
    setVideoUploaded(true);
    setIsProcessing(true);
    setRateHistory([]);
  };

  const totalIn = 
    stats.counts.in['2WHLR'] + 
    stats.counts.in['LMV'] + 
    stats.counts.in['HMV'];

  const totalOut = 
    stats.counts.out['2WHLR'] + 
    stats.counts.out['LMV'] + 
    stats.counts.out['HMV'];

  const totalVehicles = totalIn + totalOut;

  const renderExpandedComponent = () => {
    switch(expandedComponent) {
      case 'chart-out':
        return (
          <div className="h-full">
            <LaneLineChart 
              rateHistory={videoUploaded ? rateHistory : []}
              lane="OUT" 
              pollingInterval={pollingInterval}
            />
          </div>
        );
      
      case 'chart-in':
        return (
          <div className="h-full">
            <LaneLineChart 
              rateHistory={videoUploaded ? rateHistory : []}
              lane="IN" 
              pollingInterval={pollingInterval}
            />
          </div>
        );
      
      case 'alarm-out':
        return (
          <div className="h-full">
            <LiveAlarmDashboard lane="OUT" videoUploaded={videoUploaded} />
          </div>
        );
      
      case 'alarm-in':
        return (
          <div className="h-full">
            <LiveAlarmDashboard lane="IN" videoUploaded={videoUploaded} />
          </div>
        );
      
      case 'pie-total':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-4xl h-full">
              <PieChart title="Total Vehicles" data={stats.counts.total} />
            </div>
          </div>
        );
      
      case 'pie-incoming':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-4xl h-full">
              <PieChart title="Incoming Vehicles" data={stats.counts.in} />
            </div>
          </div>
        );
      
      case 'pie-outgoing':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-4xl h-full">
              <PieChart title="Outgoing Vehicles" data={stats.counts.out} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const titles = {
      'chart-out': 'OUT Lane - Vehicle Rate',
      'chart-in': 'IN Lane - Vehicle Rate',
      'alarm-out': 'OUT Lane Alarms',
      'alarm-in': 'IN Lane Alarms',
      'pie-total': 'Total Vehicles Distribution',
      'pie-incoming': 'Incoming Vehicles Distribution',
      'pie-outgoing': 'Outgoing Vehicles Distribution',
    };
    return titles[expandedComponent] || '';
  };

  return (
    <div className="h-screen bg-gray-900 overflow-hidden flex flex-col p-4">
    
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm">
              Status: <span className="text-green-400 font-semibold">{stats.processing_status}</span>
            </p>
            <p className="text-gray-400 text-sm">
              Connection: <span className={connected ? 'text-green-400' : 'text-red-400'}>
                {connected ? '🟢 Live' : '🔴 Disconnected'}
              </span>
            </p>
          </div>

          {isProcessing && (
            <button
              onClick={handleStopAnalysis}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              Stop Analysis
            </button>
          )}
        </div>
      </div>

  
      {stats.thresholds_crossed && stats.thresholds_crossed.length > 0 && (
        <div className="flex-shrink-0 mb-3">
          <ThresholdAlert thresholdsCrossed={stats.thresholds_crossed} />
        </div>
      )}

  
      <div className="flex-1 grid grid-cols-10 gap-3 min-h-0">
        
      
        <div className="col-span-6 flex flex-col gap-3 min-h-0">
          
       
          <div className="flex-1 min-h-0">
            {!videoUploaded ? (
              <VideoUpload onUploadSuccess={handleUploadSuccess} />
            ) : (
              <VideoFeed />
            )}
          </div>

         
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
      
            <div 
              className="min-h-0 flex flex-col gap-2 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('chart-out')}>
            
              <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-3 py-1.5">
                <PollingDropdown 
                  value={pollingInterval} 
                  onChange={setPollingInterval}
                  label="Update:"
                />
              </div>
              <div className="flex-1 min-h-0">
                <LaneLineChart 
                  rateHistory={videoUploaded ? rateHistory : []}
                  lane="OUT" 
                  pollingInterval={pollingInterval}
                />
              </div>
            </div>

            {/* IN Lane Chart */}
            <div 
              className="min-h-0 flex flex-col gap-2 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('chart-in')}
            >
              <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-3 py-1.5">
                <PollingDropdown 
                  value={pollingInterval} 
                  onChange={setPollingInterval}
                  label="Update:"
                />
              </div>
              <div className="flex-1 min-h-0">
                <LaneLineChart 
                  rateHistory={videoUploaded ? rateHistory : []}
                  lane="IN" 
                  pollingInterval={pollingInterval}
                />
              </div>
            </div>
          </div>

         
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">

            <div 
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('alarm-out')}
            >
              <LiveAlarmDashboard lane="OUT" videoUploaded={videoUploaded} />
            </div>

            <div 
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('alarm-in')}
            >
              <LiveAlarmDashboard lane="IN" videoUploaded={videoUploaded} />
            </div>
          </div>
        </div>


        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          
        
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">

            <div 
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('pie-total')}>
            
              <PieChart title="Total" data={stats.counts.total} />
            </div>
            
        
            <div 
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('pie-incoming')}>
            
              <PieChart title="Incoming" data={stats.counts.in} />
            </div>
            
  
            <div 
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onClick={() => setExpandedComponent('pie-outgoing')}
            >
              <PieChart title="Outgoing" data={stats.counts.out} />
            </div>
            

            <div className="min-h-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 flex flex-col p-4">
              <div className="border-b border-gray-700 pb-2 mb-3">
                <h3 className="text-white text-sm font-bold">📊 Live Stats</h3>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="bg-blue-900/20 border border-blue-700/50 rounded px-3 py-2">
                  <p className="text-blue-300 text-xs font-medium">Total</p>
                  <p className="text-white text-2xl font-bold">{totalVehicles}</p>
                </div>

                <div className="bg-green-900/20 border border-green-700/50 rounded px-3 py-2">
                  <p className="text-green-300 text-xs font-medium">Incoming</p>
                  <p className="text-white text-xl font-bold">{totalIn}</p>
                </div>

                <div className="bg-orange-900/20 border border-orange-700/50 rounded px-3 py-2">
                  <p className="text-orange-300 text-xs font-medium">Outgoing</p>
                  <p className="text-white text-xl font-bold">{totalOut}</p>
                </div>
              </div>
            </div>
          </div>

     
          <div className="flex-1 min-h-0">
            <AlarmHistory />
          </div>
        </div>
      </div>


      <Modal 
        isOpen={expandedComponent !== null}
        onClose={() => setExpandedComponent(null)}
        title={getModalTitle()}>
      
        {renderExpandedComponent()}
      </Modal>
    </div>
  );
}

export default Dashboard;
