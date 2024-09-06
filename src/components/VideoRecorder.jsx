import React, { useEffect, useRef, useState } from 'react';
import RecordRTC from 'recordrtc';


const VideoRecorder = () => {
     const [recording, setRecording] = useState(false);
     const [mediaRecorder, setMediaRecorder] = useState(null);
     const [videoURL, setVideoURL] = useState('');
     const [isPlaying, setIsPlaying] = useState(false);
     const [maxTime, setMaxTime] = useState(60 * 5); // Max recording time (5 minutes)
     const mediaStreamRef = useRef(null);

     const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        const recorder = RecordRTC(stream, { type: 'video' });
        setMediaRecorder(recorder);
        recorder.startRecording();
        setRecording(true);
    
        setTimeout(() => {
          if (recording) {
            stopRecording();
          }
        }, maxTime * 1000);
      };
    
      const stopRecording = () => {
        if (mediaRecorder) {
          mediaRecorder.stopRecording(() => {
            const videoURL = URL.createObjectURL(mediaRecorder.getBlob());
            setVideoURL(videoURL);
            setRecording(false);
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          });
        }
      };
    
      const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
      };
    
      const handleRetake = () => {
        setVideoURL('');
        setRecording(false);
      };
    

    return (
        <div>
        {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        {videoURL && (
          <div>
            <video src={videoURL} controls />
            <button onClick={handleRetake}>Retake</button>
            <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
          </div>
        )}
      </div>
    );
  };
  
  export default VideoRecorder;