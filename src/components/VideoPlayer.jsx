import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Player, ControlBar, PlaybackRateMenuButton, VolumeMenuButton, FullscreenToggle } from 'video-react';
import 'video-react/dist/video-react.css';

const VideoPlayer = ({ src }) => {
    
  const playerRef = useRef(null);
  const [hls, setHls] = useState(null);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hlsInstance = new Hls();
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(playerRef.current.video.video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hlsInstance.levels.map((level, index) => ({
          label: `${level.height}p`,
          value: index,
        }));

        levels.unshift({ label: 'Auto', value: -1 });
        setQualityLevels(levels);
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setSelectedQuality(hlsInstance.autoLevelEnabled ? -1 : data.level);
      });

      setHls(hlsInstance);
    } else if (playerRef.current.video.video.canPlayType('application/vnd.apple.mpegurl')) {
      playerRef.current.video.video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  const handleQualityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    console.log(value,'qua')
    setSelectedQuality(value);
    if (value === -1) {
      hls.currentLevel = -1; // Auto quality
    } else {
      hls.currentLevel = value;
    }
  };

  return (
    <div>
      <Player ref={playerRef} fluid={false} width={800} height={450}>
        <ControlBar autoHide={false}>
          <PlaybackRateMenuButton rates={[1, 1.5, 2]} />
          <VolumeMenuButton />
          <FullscreenToggle />
        </ControlBar>
      </Player>
      {qualityLevels.length > 0 && (
        <div style={{ marginTop: '10px' }}>
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
  );
};

export default VideoPlayer;
