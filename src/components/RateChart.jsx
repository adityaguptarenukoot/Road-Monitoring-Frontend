import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PollingDropdown from './PollingDropdown';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RateChart = ({ rates }) => {
  
  console.log('🔴 Component loaded with default: 20');
  
  const [historicalData, setHistoricalData] = useState([]);
  const [updateInterval, setUpdateInterval] = useState(20); // DEFAULT: 20 seconds
  const maxDataPoints = 30;

  
  console.log('🟢 Current updateInterval state:', updateInterval);

  useEffect(() => {
    console.log('🟡 Setting interval timer to:', updateInterval, 'seconds');
    
    const interval = setInterval(() => {
      setHistoricalData(prev => {
        const newData = {
          timestamp: new Date().toLocaleTimeString(),
          '2WHLR': rates?.['2WHLR'] || 0,
          'LMV': rates?.['LMV'] || 0,
          'HMV': rates?.['HMV'] || 0
        };

        const updated = [...prev, newData];
        return updated.slice(-maxDataPoints);
      });
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [rates, updateInterval]);

  const chartData = {
    labels: historicalData.map(d => d.timestamp),
    datasets: [
      {
        label: '2-Wheeler',
        data: historicalData.map(d => d['2WHLR']),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'LMV (Car)',
        data: historicalData.map(d => d['LMV']),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'HMV (Truck)',
        data: historicalData.map(d => d['HMV']),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          font: { size: 10 },
          padding: 10,
          boxWidth: 12,
          boxHeight: 12
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: { size: 10 },
          precision: 0
        }
      }
    }
  };

  return (
    <div className="chart-container h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-bold text-white">
          Vehicle Detection Rate (Default: 20s)
        </h3>
        
        <PollingDropdown 
          value={updateInterval} 
          onChange={(val) => {
            console.log('🔵 Dropdown changed to:', val);
            setUpdateInterval(val);
          }}
          label="Update:"
        />
      </div>

      <div className="flex-1 min-h-0 relative">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RateChart;
