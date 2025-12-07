import React, { useState, useEffect } from 'react';

const VideoFeed = ({ videoUploaded }) => {
  const [showProcessed, setShowProcessed] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [feedLoaded, setFeedLoaded] = useState(false);
  
  // sir ye bss chek krne ke liye hai 
  useEffect(() => {
    console.log('VideoFeed mounted - videoUploaded:', videoUploaded);
  }, [videoUploaded]);
  

  // ye bata raha hai ki agar aap koi vedio upload nhi kiye honge to aapko ek error milega
  if (!videoUploaded) {
    console.log('VideoFeed: No video uploaded, showing placeholder');
    return (
      <div className="h-full bg-gray-800 rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-gray-600">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2"> No Video Uploaded</div>
          <div className="text-gray-500 text-sm">Please upload a video to start monitoring</div>
        </div>
      </div>
    );
  }
  
  console.log('VideoFeed: Rendering video feed');
  
  // yahan se aapka main UI development ka kaam chalu ho raha hai
  return (
    <div className="h-full bg-gray-900 rounded-lg overflow-hidden shadow-lg flex flex-col">
      
     {/* // ek toggle button aad hua hai   */}

      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold text-sm">

            {/* ye if else condition hai  jo showProcessed ko value assign kar raha hai or iske basis pe aage kaam hoga*/}

            {showProcessed ? ' Processed Feed' : ' Original Video'}
          </h3>
          {feedLoaded && <span className="text-green-400 text-xs">● Live</span>}
        </div>
        
        {/* ek button hai jispe click karne ke baad aap original vedio se processed vedio pe switch kar jayenge */}

        <button
          onClick={() => {
            console.log('Toggling feed. Current:', showProcessed ? 'Processed' : 'Original');
            setShowProcessed(!showProcessed);
            setImageError(false);
            setFeedLoaded(false);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showProcessed ? 'Show Original' : 'Show Processed'}
        </button>
      </div>
      
      
      <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
        {showProcessed ? (
          
          <div className="relative w-full h-full flex items-center justify-center">
            {!feedLoaded && !imageError && (

              // ye aapka loading spinner jo tab use hoga jab vedio feed loaded nhi hoga or error bhi nhi aaya hoga tab ye ek loading spinner dega

              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-gray-400">Loading processed feed...</div>
                </div>
              </div>
            )}

           {/* //actual processed image yaha pe aayega backend se  */}

            <img
              src="http://localhost:5001/processed_feed"
              alt="Processed Video Feed"
              className="max-w-full max-h-full object-contain"
              style={{
                display: feedLoaded && !imageError ? 'block' : 'none',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%'
              }}

              //error handler
              
              onError={(e) => {
                console.error(' Processed feed error');
                setImageError(true);
                setFeedLoaded(false);
              }}
              onLoad={() => {
                console.log(' Processed feed loaded successfully');
                setFeedLoaded(true);
                setImageError(false);
              }}
            />
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center p-6">
                  <div className="text-red-400 text-lg mb-2"> Feed Not Available</div>
                  <div className="text-gray-400 text-sm mb-4">
                    Processed feed endpoint not responding
                  </div>

                   {/* original feed mw jaane ke liye yaha pe setShowProcessed ki value false ho jayega or dushra conditon Original Video wala true ho jayega */}

                  <button 
                    onClick={() => {
                      console.log('Switching to original feed');
                      setShowProcessed(false);
                      setImageError(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Switch to Original Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Original Video  show karne ke liye */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              src="http://localhost:5001/video_feed"
              controls
              autoPlay
              loop
              muted
              className="max-w-full max-h-full object-contain"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              onError={(e) => {
                console.error(' Video feed error');
              }}
              onLoadedData={() => {
                console.log(' Video feed loaded');
              }}
            />
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-2 text-xs text-gray-400 flex justify-between border-t border-gray-700">
        <span>Feed: {showProcessed ? 'Processed ' : 'Original'}</span>
        <span>Status: {feedLoaded ? '🟢 Live' : imageError ? '🔴 Error' : '🟡 Loading'}</span>
      </div>
    </div>
  );
};

export default VideoFeed;
