import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import appLogo from '/favicon.svg'
import PWABadge from './PWABadge.jsx'
// import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomVideoPlay from './components/CustomVideoPlay.jsx';
import VideoPlayer from './components/VideoPlayer.jsx';
import CustomVideoPlayer from './components/CustomVideoPlayer.jsx';
import CoreVideoPlayer from './components/CoreVideoPlayer.jsx';
import VideoRecorder from './components/VideoRecorder.jsx'
// import QualityControl from './components/QualityControl.jsx';

function App() {
  const videoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={<CustomVideoPlay src={videoUrl} poster="../../pwa-512x512.png" />} 
          />
          <Route path="/record-player" element={<VideoRecorder />} />
          {/* <Route path="/record-player" element={videoUrl && <VideoRecorder />} /> */}
          <Route path="/video-player" element={videoUrl && <VideoPlayer src={videoUrl} />} />
          <Route path="custom-video-player" element={videoUrl && <CustomVideoPlayer src={videoUrl} />} />
          <Route path="core-video-player" element={videoUrl && <CoreVideoPlayer src={videoUrl} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
