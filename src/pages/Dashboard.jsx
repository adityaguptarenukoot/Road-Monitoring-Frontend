import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import socketService from '../services/socket';
import StatsCard from '../components/StatsCard';
import PieChart from '../components/PieChart';
import RateChart from '../components/RateChart';
import VideoUpload from '../components/VideoUpload';
import VideoFeed from '../components/VideoFeed';
import ThresholdAlert from "../components/ThresholdAlert";
import AlarmHistory from "../components/AlarmHistory";
import LaneLineChart from "../components/LaneLineChart";
import LiveAlarmDashboard from "../components/LiveAlarmDashboard";
import Modal from "../components/Modal";
import ThresholdSettings from "../components/ThresholdSettings";

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
  const [pollingInterval, setPollingInterval] = useState(5);
 
  const [backendSynced, setBackendSynced] = useState(false);
  const [expandedComponent, setExpandedComponent] = useState(null);

  const MAX_HISTORY = React.useMemo(
    () => Math.ceil(300 / pollingInterval),
    [pollingInterval]
  );

  useEffect(() => {
    const syncBackendPollingRate = async () => {
      setBackendSynced(false);
      try {
        await api.updatePollingRate(pollingInterval);
        console.log('Backend polling rate synced to:', pollingInterval, 'seconds');
        setBackendSynced(true);
        setTimeout(() => setBackendSynced(false), 2000);
        setRateHistory([]);
      } catch (error) {
        console.error('Failed to sync backend polling rate:', error);
      }
    };

    syncBackendPollingRate();
  }, [pollingInterval]);

  useEffect(() => {
    const socket = socketService.connect();

    socketService.on('connect', () => {
      console.log('Socket connected to backend');
      setConnected(true);
    });

    socketService.on('disconnect', () => {
      console.log('Socket disconnected from backend');
      setConnected(false);
    });

    socketService.on('stats_update', (data) => {
      console.log('Stats update received via Socket.IO:', data);
      setStats(data);

      if (isProcessing && data.processing_status !== "Waiting for video upload...") {
        console.log('Adding to history:', data.rates);
        setRateHistory(prev => {
          const newHistory = [...prev, { rates: data.rates }];
          if (newHistory.length > MAX_HISTORY) {
            return newHistory.slice(-MAX_HISTORY);
          }
          return newHistory;
        });
      }
    });

   

    socketService.on('video_uploaded', (data) => {
      console.log('Video uploaded event received:', data);
    });

    socketService.on('threshold_updated', (thresholds) => {
      console.log('Thresholds updated via Socket.IO:', thresholds);
    });

    return () => {
      socketService.disconnect();
    };
  }, [isProcessing, MAX_HISTORY]);



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

      console.log('Analysis stopped and reset to zero');
    } catch (error) {
      console.error('Failed to stop analysis:', error);
    }
  };

  const handleUploadSuccess = (response) => {
    console.log('Response from backend:', response);
    setVideoUploaded(true);
    setIsProcessing(true);
    setRateHistory([]);
    console.log('videoUploaded set to true, isProcessing set to true');
  };





  const totalIn =
    stats.counts.in['2WHLR'] +
    stats.counts.in['LMV'] +
    stats.counts.in['HMV'];

  const totalOut =
    stats.counts.out['2WHLR'] +
    stats.counts.out['LMV'] +
    stats.counts.out['HMV'];

  const totalVehicles = totalIn - totalOut;

  const renderExpandedComponent = () => {
    switch (expandedComponent) {
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
            <LiveAlarmDashboard 
              lane="OUT" 
              videoUploaded={videoUploaded}
              thresholdsCrossed={stats.thresholds_crossed || []}
            />
          </div>
        );
      case 'alarm-in':
        return (
          <div className="h-full">
            <LiveAlarmDashboard 
              lane="IN" 
              videoUploaded={videoUploaded}
              
              thresholdsCrossed={stats.thresholds_crossed || []}
            />
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
              Status:{' '}
              <span className="text-green-400 font-semibold">
                {stats.processing_status}
              </span>
            </p>
            <p className="text-gray-400 text-sm">
              Connection:{' '}
              <span className={connected ? 'text-green-400' : 'text-red-400'}>
                {connected ? '🟢 Live ' : '🔴 Disconnected'}
              </span>
            </p>

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

            {backendSynced && (
              <p className="text-green-400 text-sm flex items-center gap-1 animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Backend synced to {pollingInterval}s
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThresholdSettings
              pollingInterval={pollingInterval}
              onChangePollingInterval={setPollingInterval}
            />
          </div>
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
              <div className="h-full">
                <VideoUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            ) : (
              <div className="h-full">
                <VideoFeed videoUploaded={videoUploaded} />
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            <div
              className="min-h-0 flex flex-col gap-2 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onDoubleClick={() => setExpandedComponent('chart-out')}
            >
              <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-3 py-1.5">
                <span className="text-xs font-semibold text-gray-300">
                  OUT Lane - Rate per Minute
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <LaneLineChart
                  rateHistory={videoUploaded ? rateHistory : []}
                  lane="OUT"
                  pollingInterval={pollingInterval}
                />
              </div>
            </div>

            <div
              className="min-h-0 flex flex-col gap-2 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onDoubleClick={() => setExpandedComponent('chart-in')}
            >
              <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-3 py-1.5">
                <span className="text-xs font-semibold text-gray-300">
                  IN Lane - Rate per Minute
                </span>
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
              onDoubleClick={() => setExpandedComponent('alarm-out')}
            >
              <LiveAlarmDashboard
                lane="OUT"
                videoUploaded={videoUploaded}
                
                thresholdsCrossed={stats.thresholds_crossed || []}
              />
            </div>

            <div
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onDoubleClick={() => setExpandedComponent('alarm-in')}
            >
              <LiveAlarmDashboard
                lane="IN"
                videoUploaded={videoUploaded}
                
                thresholdsCrossed={stats.thresholds_crossed || []}
              />
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
            <div
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onDoubleClick={() => setExpandedComponent('pie-total')}
            >
              <PieChart title="Total" data={stats.counts.total} />
            </div>

            <div
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onDoubleClick={() => setExpandedComponent('pie-incoming')}
            >
              <PieChart title="Incoming" data={stats.counts.in} />
            </div>

            <div
              className="min-h-0 cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              onDoubleClick={() => setExpandedComponent('pie-outgoing')}
            >
              <PieChart title="Outgoing" data={stats.counts.out} />
            </div>

            <div className="min-h-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 flex flex-col p-4">
              <div className="border-b border-gray-700 pb-2 mb-3">
                <h3 className="text-white text-sm font-bold">Live Stats</h3>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <table className="w-full h-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-600 bg-gray-700/50 p-2 text-gray-300 font-semibold text-sm"></th>
                      <th className="border border-gray-600 bg-purple-900/30 p-2 text-purple-300 font-semibold text-sm">2WHLR</th>
                      <th className="border border-gray-600 bg-cyan-900/30 p-2 text-cyan-300 font-semibold text-sm">LMV</th>
                      <th className="border border-gray-600 bg-yellow-900/30 p-2 text-yellow-300 font-semibold text-sm">HMV</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-600 bg-blue-900/20 p-3 text-blue-300 font-semibold text-center">Total</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.total['2WHLR']}</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.total['LMV']}</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.total['HMV']}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-600 bg-green-900/20 p-3 text-green-300 font-semibold text-center">In</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.in['2WHLR']}</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.in['LMV']}</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.in['HMV']}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-600 bg-orange-900/20 p-3 text-orange-300 font-semibold text-center">Out</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.out['2WHLR']}</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.out['LMV']}</td>
                      <td className="border border-gray-600 p-3 text-white font-bold text-lg text-center">{stats.counts.out['HMV']}</td>
                    </tr>
                  </tbody>
                </table>
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
        title={getModalTitle()}
      >
        {renderExpandedComponent()}
      </Modal>
    </div>
  );
}

export default Dashboard;
