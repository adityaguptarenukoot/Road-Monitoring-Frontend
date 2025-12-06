import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ThresholdSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // NEW STRUCTURE: time_period at lane level
  const defaultThresholds = {
    out: {
      time_period: 5,
      '2WHLR': { max_count: 100 },
      'LMV': { max_count: 80 },
      'HMV': { max_count: 50 }
    },
    in: {
      time_period: 5,
      '2WHLR': { max_count: 100 },
      'LMV': { max_count: 80 },
      'HMV': { max_count: 50 }
    }
  };

  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchThresholds();
    }
  }, [isOpen]);

  const fetchThresholds = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/thresholds');
      if (response.data && response.data.thresholds) {
        setThresholds(response.data.thresholds);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch thresholds:', err);
      setError('Failed to load thresholds. Using defaults.');
      setThresholds(defaultThresholds);
    }
  };

  // Handle time_period change for entire lane
  const handleTimePeriodChange = (lane, value) => {
    setThresholds(prev => {
      const newThresholds = JSON.parse(JSON.stringify(prev));
      
      if (!newThresholds[lane]) {
        newThresholds[lane] = { time_period: '' };
      }
      
      if (value === '' || value === null || value === undefined) {
        newThresholds[lane].time_period = '';
      } else {
        const numValue = parseInt(value);
        newThresholds[lane].time_period = isNaN(numValue) ? '' : numValue;
      }
      
      return newThresholds;
    });
    setSaved(false);
  };

  // Handle max_count change for specific vehicle type
  const handleCountChange = (lane, vehicleType, value) => {
    setThresholds(prev => {
      const newThresholds = JSON.parse(JSON.stringify(prev));
      
      if (!newThresholds[lane]) {
        newThresholds[lane] = { time_period: 5 };
      }
      if (!newThresholds[lane][vehicleType]) {
        newThresholds[lane][vehicleType] = { max_count: '' };
      }
      
      if (value === '' || value === null || value === undefined) {
        newThresholds[lane][vehicleType].max_count = '';
      } else {
        const numValue = parseInt(value);
        newThresholds[lane][vehicleType].max_count = isNaN(numValue) ? '' : numValue;
      }
      
      return newThresholds;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const cleanedThresholds = JSON.parse(JSON.stringify(thresholds));
      
      ['out', 'in'].forEach(lane => {
        // Clean time_period for lane
        const timePeriod = cleanedThresholds[lane]?.time_period;
        cleanedThresholds[lane].time_period = 
          (timePeriod === '' || timePeriod === null || timePeriod === undefined || timePeriod < 1) ? 1 : timePeriod;
        
        // Clean max_count for each vehicle type
        ['2WHLR', 'LMV', 'HMV'].forEach(vehicleType => {
          if (cleanedThresholds[lane] && cleanedThresholds[lane][vehicleType]) {
            const maxCount = cleanedThresholds[lane][vehicleType].max_count;
            cleanedThresholds[lane][vehicleType].max_count = 
              (maxCount === '' || maxCount === null || maxCount === undefined || maxCount < 1) ? 1 : maxCount;
          }
        });
      });
      
      await axios.post('http://localhost:5001/api/thresholds', { 
        thresholds: cleanedThresholds
      });
      
      setThresholds(cleanedThresholds);
      
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 3000);
      console.log('✓ Thresholds saved:', cleanedThresholds);
    } catch (err) {
      console.error('Failed to save thresholds:', err);
      setError('Failed to save thresholds. Please try again.');
    }
  };

  const handleReset = () => {
    setThresholds(JSON.parse(JSON.stringify(defaultThresholds)));
    setSaved(false);
  };

  const getTimePeriod = (lane) => {
    try {
      const value = thresholds?.[lane]?.time_period;
      return (value === undefined || value === null || value === '') ? '' : value;
    } catch {
      return '';
    }
  };

  const getMaxCount = (lane, vehicleType) => {
    try {
      const value = thresholds?.[lane]?.[vehicleType]?.max_count;
      return (value === undefined || value === null || value === '') ? '' : value;
    } catch {
      return '';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Threshold Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-700/50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white text-2xl font-bold tracking-tight">Threshold Configuration</h2>
                  
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Success Message */}
              {saved && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Thresholds saved successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">
                  <span className="font-medium">{error}</span>
                </div>
              )}

             

              {/* OUT Lane Settings */}
              <div className="bg-gray-800/50 rounded-xl p-7 border border-orange-500/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-500/50"></div>
                  <h3 className="text-white text-xl font-bold">OUT Lane Thresholds</h3>
                </div>

                {/* Time Period for OUT Lane */}
                <div className="mb-7 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 rounded-xl border border-orange-500/30">
                  <label className="text-orange-300 font-semibold text-sm block mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time Period 
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={getTimePeriod('out')}
                    onChange={(e) => handleTimePeriodChange('out', e.target.value)}
                    placeholder="Enter minutes"
                    className="w-full max-w-xs px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-2">Time period in minutes (1-60)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* 2WHLR */}
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 hover:border-pink-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <h4 className="text-pink-400 font-semibold text-base">2-Wheeler</h4>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-2 uppercase tracking-wide">Maximum Count</label>
                      <input
                        type="number"
                        min="1"
                        value={getMaxCount('out', '2WHLR')}
                        onChange={(e) => handleCountChange('out', '2WHLR', e.target.value)}
                        placeholder="Enter count"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* LMV */}
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-blue-400 font-semibold text-base">LMV</h4>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-2 uppercase tracking-wide">Maximum Count</label>
                      <input
                        type="number"
                        min="1"
                        value={getMaxCount('out', 'LMV')}
                        onChange={(e) => handleCountChange('out', 'LMV', e.target.value)}
                        placeholder="Enter count"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* HMV */}
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <h4 className="text-yellow-400 font-semibold text-base">HMV </h4>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-2 uppercase tracking-wide">Maximum Count</label>
                      <input
                        type="number"
                        min="1"
                        value={getMaxCount('out', 'HMV')}
                        onChange={(e) => handleCountChange('out', 'HMV', e.target.value)}
                        placeholder="Enter count"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* IN Lane Settings */}
              <div className="bg-gray-800/50 rounded-xl p-7 border border-green-500/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/50"></div>
                  <h3 className="text-white text-xl font-bold">IN Lane Thresholds</h3>
                </div>

                {/* Time Period for IN Lane */}
                <div className="mb-7 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border border-green-500/30">
                  <label className="text-green-300 font-semibold text-sm block mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time Period 
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={getTimePeriod('in')}
                    onChange={(e) => handleTimePeriodChange('in', e.target.value)}
                    placeholder="Enter minutes"
                    className="w-full max-w-xs px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-2">Time period in minutes (1-60)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* 2WHLR */}
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 hover:border-pink-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <h4 className="text-pink-400 font-semibold text-base">2-Wheeler</h4>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-2 uppercase tracking-wide">Maximum Count</label>
                      <input
                        type="number"
                        min="1"
                        value={getMaxCount('in', '2WHLR')}
                        onChange={(e) => handleCountChange('in', '2WHLR', e.target.value)}
                        placeholder="Enter count"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* LMV */}
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-blue-400 font-semibold text-base">LMV </h4>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-2 uppercase tracking-wide">Maximum Count</label>
                      <input
                        type="number"
                        min="1"
                        value={getMaxCount('in', 'LMV')}
                        onChange={(e) => handleCountChange('in', 'LMV', e.target.value)}
                        placeholder="Enter count"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* HMV */}
                  <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <h4 className="text-yellow-400 font-semibold text-base">HMV </h4>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-medium block mb-2 uppercase tracking-wide">Maximum Count</label>
                      <input
                        type="number"
                        min="1"
                        value={getMaxCount('in', 'HMV')}
                        onChange={(e) => handleCountChange('in', 'HMV', e.target.value)}
                        placeholder="Enter count"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-600/50 hover:border-gray-500 font-medium"
                >
                  Reset to Defaults
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-600/50 hover:border-gray-500 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThresholdSettings;
