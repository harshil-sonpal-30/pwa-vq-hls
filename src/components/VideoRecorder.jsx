import React, { useRef, useState, useEffect } from 'react';

const VideoRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const isMediaRecorderSupported = () => MediaRecorder.isTypeSupported('video/webm; codecs=vp8');

  const startRecording = async () => {
    if (!isMediaRecorderSupported()) {
      console.error('MediaRecorder is not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Request permission if needed (replace with your permission handling logic)
      // if (!stream) {
      //   const permission = await navigator.mediaDevices.getUserMedia({ video: true });
      //   stream = permission;
      // }

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      recordedChunks.current = []; // Reset recorded chunks

      const mimeType = 'video/webm; codecs=vp8'; // Use preferred mimeType

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setPaused(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      // Handle error gracefully (e.g., show a user-friendly message)
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setRecording(false);
      setPaused(false);
    } else {
      console.error('MediaRecorder is not initialized.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setPaused(true);
    } else {
      console.error('MediaRecorder is not initialized.');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.resume();
      setPaused(false);
    } else {
      console.error('MediaRecorder is not initialized.');
    }
  };

  const retakeRecording = () => {
    setVideoURL('');
    setRecording(false);
    setPaused(false);
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', height: 'auto' }} controls />

      <div className="controls">
        {!recording && !videoURL && (
          <button onClick={startRecording}>Start Recording</button>
        )}

        {recording && (
          <>
            <button onClick={stopRecording}>Stop Recording</button>
            {!paused ? (
              <button onClick={pauseRecording}>Pause Recording</button>
            ) : (
              <button onClick={resumeRecording}>Resume Recording</button>
            )}
          </>
        )}

        {!recording && videoURL && (
          <>
            <h3>Recorded Video Preview:</h3>
            <video src={videoURL} controls style={{ width: '100%' }} />
            <button onClick={retakeRecording}>Retake Recording</button>
            <a href={videoURL} download="recorded-video.webm">
              Download Video
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;