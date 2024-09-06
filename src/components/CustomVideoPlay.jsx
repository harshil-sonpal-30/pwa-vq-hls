import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Player, ControlBar, PlaybackRateMenuButton, VolumeMenuButton, FullscreenToggle } from 'video-react';
import 'video-react/dist/video-react.css';
import { FaPlay, FaPause } from 'react-icons/fa';

const CustomVideoPlay = ({ src, poster }) => {
  const playerRef = useRef(null);
  const [hls, setHls] = useState(null);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1); // Default volume
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); // Default playback rate
  const [inputValue, setInputValue] = useState(''); // For input field
  const [isPlaying, setIsPlaying] = useState(false);

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

    const video = playerRef.current.video.video;
    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [src]);

  const handlePlay = () => playerRef.current.video.video.play();
  const handlePause = () => playerRef.current.video.video.pause();
  const handleResume = () => playerRef.current.video.video.play();
  const handleStop = () => {
    const video = playerRef.current.video.video;
    video.pause();
    video.currentTime = 0;
  };

  const toggleMute = () => {
    const video = playerRef.current.video.video;
    setMuted(!muted);
    video.muted = !muted;
  };

  const changeVolume = (delta) => {
    const video = playerRef.current.video.video;
    const newVolume = Math.min(Math.max(video.volume + delta, 0), 1);
    setVolume(newVolume);
    video.volume = newVolume;
  };

  const handleQualityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setSelectedQuality(value);
    if (value === -1) {
      hls.currentLevel = -1; // Auto quality
    } else {
      hls.currentLevel = value;
    }
  };

  const handleSeekForward = () => {
    const video = playerRef.current.video.video;
    video.currentTime = Math.min(video.currentTime + 5, video.duration);
  };

  const handleSeekBackward = () => {
    const video = playerRef.current.video.video;
    video.currentTime = Math.max(video.currentTime - 5, 0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFullscreenToggle = () => {
    const video = playerRef.current.video.video;
    if (!isFullscreen) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handlePlaybackRateChange = (rate) => {
    const video = playerRef.current.video.video;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleSeek = (event) => {
    const video = playerRef.current.video.video;
    const seekTime = (event.target.value / 100) * video.duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleJump = () => {
    const video = playerRef.current.video.video;
    const jumpTime = parseInt(inputValue, 10);
    if (!isNaN(jumpTime)) {
      const newTime = video.currentTime + jumpTime;
      if (newTime <= video.duration) {
        video.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  const handleSeekToTime = () => {
    const video = playerRef.current.video.video;
    const timeInSeconds = parseFloat(inputValue);
    if (!isNaN(timeInSeconds) && timeInSeconds <= duration) {
      video.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    } else {
      alert('Please enter a valid time within the video duration.');
    }
  };

  const handlePlayPause = () => {
    const video = playerRef.current.video.video;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <Player ref={playerRef} fluid={false} width={800} height={450} poster={poster}>
        <ControlBar autoHide={false}>
          <PlaybackRateMenuButton rates={[1, 1.5, 2]} />
          <VolumeMenuButton />
          <FullscreenToggle />
        </ControlBar>
      </Player>

      {/* Custom play/pause button */}
      {!isPlaying && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            zIndex: 10,
          }}
          onClick={handlePlayPause}
        >
          {isPlaying ? <FaPause size={50} color="white" /> : <FaPlay size={50} color="white" />}
        </div>
      )}

      {/* Display current time and total time */}
      <div style={{ marginTop: '10px' }}>
        <span>Current Time: {formatTime(currentTime)}</span> / <span>Total Time: {formatTime(duration)}</span>
      </div>

      {/* Playback control buttons */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleResume}>Resume</button>
        <button onClick={handleStop}>Stop</button>
      </div>

      {/* Volume control and Mute/Unmute */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
        <button onClick={() => changeVolume(0.1)}>Volume +</button>
        <button onClick={() => changeVolume(-0.1)}>Volume -</button>
      </div>

      {/* Seek forward/backward buttons */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSeekBackward}>Back 5s</button>
        <button onClick={handleSeekForward}>Forward 5s</button>
      </div>

      {/* Seekbar */}
      <div style={{ marginTop: '10px' }}>
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
        />
      </div>

      {/* Playback speed */}
      <div style={{ marginTop: '10px' }}>
        <label>Playback Speed: </label>
        <button onClick={() => handlePlaybackRateChange(1)}>1x</button>
        <button onClick={() => handlePlaybackRateChange(1.5)}>1.5x</button>
        <button onClick={() => handlePlaybackRateChange(2)}>2x</button>
      </div>

      {/* Fullscreen */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleFullscreenToggle}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* Quality selection */}
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

      {/* Input field with buttons for seeking */}
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter time in seconds"
        />
        <button onClick={handleJump}>Jump</button>
        <button onClick={handleSeekToTime}>Seek to Time</button>
      </div>
    </div>
  );
};

export default CustomVideoPlay;
