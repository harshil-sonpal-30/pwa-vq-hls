import { useRef, useState, useEffect } from "react";
import RecordRTC from "recordrtc";

const VideoRecorder = () => {
  const videoPreviewRef = useRef(null);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  // Timer logic for recording duration
  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRecording && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Convert timer to minutes and seconds format
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  // Function to get the user's video stream
  const getCameraStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false, // Set to true if you also want to record audio
      });
      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Handle camera switch
  const switchCamera = async () => {
    if (isRecording) {
      // Stop the recording when switching the camera
      stopRecording();
    }

    // Stop the current stream and switch the camera
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    // Ask for permission and get the camera stream on facingMode change
    getCameraStream();
  }, [facingMode]);

  // Start recording
  const startRecording = () => {
    if (stream) {
      const recorder = new RecordRTC(stream, { type: 'video' });
      recorder.startRecording();
      setRecording(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setTimer(0); // Reset timer
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recording) {
      recording.stopRecording(() => {
        const blob = recording.getBlob();
        setMediaBlobUrl(URL.createObjectURL(blob));
      });
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (recording && isRecording) {
      recording.pauseRecording();
      setIsPaused(true);
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (recording && isPaused) {
      recording.resumeRecording();
      setIsPaused(false);
    }
  };

  return (
    <div>
      {/* Video preview */}
      <video
        ref={videoPreviewRef}
        style={{
          width: "100%",
          height: "auto",
          border: "1px solid #000",
        }}
        autoPlay
        muted
      />

      {/* Timer display */}
      {isRecording && <h2>Recording Time: {formatTime(timer)}</h2>}

      {/* Recording controls */}
      <div>
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
        <button onClick={pauseRecording}>Pause Recording</button>
        <button onClick={resumeRecording}>Resume Recording</button>
        <button onClick={switchCamera}>Switch Camera</button>
      </div>

      {/* Video playback */}
      {mediaBlobUrl && (
        <video
          src={mediaBlobUrl}
          controls
          style={{ marginTop: "20px", width: "100%", height: "auto" }}
          autoPlay
          loop
        />
      )}
    </div>
  );
};

export default VideoRecorder;
