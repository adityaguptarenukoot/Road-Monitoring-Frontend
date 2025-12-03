import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PieChart = ({ title, data }) => {
  const total = data['2WHLR'] + data['LMV'] + data['HMV'];
  
  const calculatePercentage = (value) => {
    if (total === 0) return '0.0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const chartData = {
    labels: ['2 WHLRS', 'LMV', 'HMV'],
    datasets: [
      {
        data: [data['2WHLR'], data['LMV'], data['HMV']],
        backgroundColor: [
          'rgba(255, 182, 193, 1)',
          'rgba(255, 127, 127, 1)',
          'rgba(173, 216, 230, 1)',
        ],
        borderColor: 'rgba(17, 24, 39, 1)',
        borderWidth: 8,
        spacing: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
      datalabels: {
        color: '#000',
        font: {
          weight: 'bold',
          size: 16
        },
        formatter: (value) => {
          return calculatePercentage(value);
        },
        anchor: 'center',
        align: 'center',
      }
    },
  };

  return (
    <div className="chart-container h-full flex flex-col p-3">
      <h3 className="text-sm font-bold mb-2 flex-shrink-0 text-center">{title}</h3>
      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        <div className="w-full h-full max-w-[280px] max-h-[280px]">
          <Pie data={chartData} options={options} />
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-3 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'rgba(255, 182, 193, 1)'}}></div>
          <span className="text-xs text-gray-300">2 WHLRS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'rgba(255, 127, 127, 1)'}}></div>
          <span className="text-xs text-gray-300">LMV</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'rgba(173, 216, 230, 1)'}}></div>
          <span className="text-xs text-gray-300">HMV</span>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
