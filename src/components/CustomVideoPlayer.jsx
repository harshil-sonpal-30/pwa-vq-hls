import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import Hls from 'hls.js';
// import './CustomVideoPlayer.css';

const CustomVideoPlayer = ({ src }) => {
  console.log('src', src);  
  const playerRef = useRef(null);
  const [hlsInstance, setHlsInstance] = useState(null);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1); // Default to Auto quality
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const videoElement = playerRef.current.getInternalPlayer();
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level, index) => ({
          label: `${level.height}p`,
          value: index,
        }));

        levels.unshift({ label: 'Auto', value: -1 }); // Add Auto option
        setQualityLevels(levels);
        setSelectedQuality(-1); // Default to Auto
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setSelectedQuality(hls.autoLevelEnabled ? -1 : data.level);
      });

      setHlsInstance(hls);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  const handleQualityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    console.log('value', value);
    setSelectedQuality(value);
  
    if (value === -1) {
      hlsInstance.currentLevel = -1; // Set Auto quality (auto-level mode)
    } else {
      hlsInstance.currentLevel = value; // Set specific quality
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    const videoElement = playerRef.current.getInternalPlayer();
    videoElement.playbackRate = rate;
  };

  return (
    <div>
      <ReactPlayer
        ref={playerRef}
        url={src}
        controls
        width="100%"
        height="100%"
        playing
        playbackRate={playbackRate}
        config={{
              file: {
                attributes:
                {
                  crossorigin: 'anonymous'
                },
                forceVideo:true,
                forceAudio:true,
                forceHLS: true, // Ensure HLS.js is used for HLS streams
                forceSafariHLS:false,
                hlsOptions: {
                  // HLS.js options
                  startLevel: selectedQuality, // Start with the selected quality level
                  maxBufferLength:10,
                  enableWorker: true
                },
                hlsVersion: 'latest', // Load the latest HLS.js version
              },
            }}
      />
      <div className="controls">
        {/* Playback Speed */}
        <label htmlFor="playbackRate">Playback Speed: </label>
        <select id="playbackRate" onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>

        {/* Quality Selector */}
        {qualityLevels.length > 0 && (
          <div className="quality-selector">
            <label htmlFor="quality-selector">Quality: </label>
            <select id="quality-selector" value={selectedQuality} onChange={handleQualityChange}>
              {qualityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
