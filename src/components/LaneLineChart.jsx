import React, { useMemo } from 'react';
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


const LaneLineChart = ({ rateHistory, lane, pollingInterval }) => {
  
  const chartData = useMemo(() => {
    if (!rateHistory || rateHistory.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }


    // Generate time labels
    const labels = rateHistory.map((_, index) => {
      const seconds = index * pollingInterval;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    });


    return {
      labels,
      datasets: [
        {
          label: '2WHLR/min',
          data: rateHistory.map(item => item.rates?.['2WHLR'] || 0),
          borderColor: 'rgba(255, 182, 193, 1)',
          backgroundColor: 'rgba(255, 182, 193, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: 'LMV/min',
          data: rateHistory.map(item => item.rates?.['LMV'] || 0),
          borderColor: 'rgba(135, 206, 250, 1)',
          backgroundColor: 'rgba(135, 206, 250, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: 'HMV/min',
          data: rateHistory.map(item => item.rates?.['HMV'] || 0),
          borderColor: 'rgba(255, 255, 153, 1)',
          backgroundColor: 'rgba(255, 255, 153, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: 'Total Traffic Load',
          data: rateHistory.map(item => {
            const rates = item.rates || { '2WHLR': 0, 'LMV': 0, 'HMV': 0 };
            return (rates['2WHLR'] * 0.5) + (rates['LMV'] * 1) + (rates['HMV'] * 2);
          }),
          borderColor: 'rgba(64, 224, 208, 1)',
          backgroundColor: 'rgba(64, 224, 208, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderDash: [5, 5],
        }
      ]
    };
  }, [rateHistory, pollingInterval]);


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      datalabels: {
        display: false  // ← DISABLES ALL POINT LABELS
      },
      legend: {
        display: true,
        position: 'top',
        labels: { 
          color: 'white',
          font: { size: 10 },
          usePointStyle: true, 
          padding: 10,
          boxWidth: 15,
          boxHeight: 3
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,     
        padding: 10,
        displayColors: true
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Vehicles/min',
          color: 'white',
          font: { size: 11 }
        },
        ticks: { 
          color: 'white',
          font: { size: 9 },
          stepSize: 50
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          color: 'white',
          font: { size: 11 }
        },
        ticks: { 
          color: 'white',
          font: { size: 9 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          autoSkipPadding: 20
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        }
      }
    }
  };


  return (
    <div className="h-full bg-gray-800 rounded-lg p-4">
      <div className="h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};


export default LaneLineChart;
