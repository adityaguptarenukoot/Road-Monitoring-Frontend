import React from 'react';

const VideoFeed = () => {
  return (
    <div className="chart-container h-full flex flex-col">
      <h3 className="text-sm font-bold mb-2">Live Video Feed</h3>
      <div className="flex-1 bg-black rounded-lg overflow-hidden">
        <video 
          src="http://localhost:5001/video_feed" 
          controls
          autoPlay
          loop
          muted
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default VideoFeed;
