import React from 'react';
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

const LineChart = ({ rateHistory }) => {
  // Handle empty history
  if (!rateHistory || rateHistory.length === 0) {
    return (
      <div className="chart-container h-full p-3 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No data available. Upload video to start monitoring.</p>
      </div>
    );
  }

  const labels = rateHistory.map((_, index) => `${index}s`);
  
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Total Count (Sum)',
        data: rateHistory.map(item => {
          const total = (item.rates?.['2WHLR'] || 0) + 
                       (item.rates?.LMV || 0) + 
                       (item.rates?.HMV || 0);
          return total;
        }),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Traffic Load (Equivalent)',
        data: rateHistory.map(item => {
          const bikes = item.rates?.['2WHLR'] || 0;
          const lmv = item.rates?.LMV || 0;
          const hmv = item.rates?.HMV || 0;
          
          
          const totalLoad = (bikes * 0.5) + (lmv * 1) + (hmv * 2);
          return totalLoad;
        }),
        borderColor: 'rgba(251, 191, 36, 1)',  
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderDash: [5, 5],  
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false  
      },
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: { size: 11, weight: 'bold' },
          boxWidth: 15,
          padding: 8,
        },
      },
      title: {
        display: true,
        text: 'Total Vehicle Rate (Live)',
        color: 'white',
        font: { size: 14, weight: 'bold' },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context) {
            if (context.dataset.label.includes('Equivalent')) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} units/min`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} vehicles/min`;
          },
          footer: function(tooltipItems) {
            return [
              '',
              'Formula: (Bikes × 0.5) + (LMV × 1) + (HMV × 2)'
            ];
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: 'white',
          font: { size: 10 }
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        title: {
          display: true,
          text: 'Vehicles/Units per min',
          color: 'white',
          font: { size: 11, weight: 'bold' }
        }
      },
      x: {
        ticks: { 
          color: 'white',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        title: {
          display: true,
          text: 'Time (seconds)',
          color: 'white',
          font: { size: 10 }
        }
      },
    },
  };

  return ( 
    <div className="chart-container h-full p-3">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
