import { useRef, useState, useEffect } from "react";
import RecordRTC from "recordrtc";

const CoreVideoWithSelectBox = () => {
  const videoPreviewRef = useRef(null);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [devices, setDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState(null);
  const [selectedVideoInput, setSelectedVideoInput] = useState(null);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState(null);

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

  // Get the available media devices (audio/video input/output)
  const getAvailableDevices = async () => {
    try {
      // Prompt the user for permissions to access camera and microphone
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices(devices);
    } catch (error) {
      console.error("Error fetching media devices:", error);
    }
  };

  useEffect(() => {
    getAvailableDevices();
  }, []);

  // Get user media stream based on selected devices
  const getCameraStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedVideoInput || undefined },
        audio: { deviceId: selectedAudioInput || undefined },
      });
      setStream(mediaStream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera or microphone:", error);
    }
  };

  useEffect(() => {
    if (selectedVideoInput || selectedAudioInput) {
      getCameraStream();
    }

    // Cleanup the media stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedVideoInput, selectedAudioInput]);

  // Handle camera switch
  const switchCamera = async () => {
    if (isRecording) {
      stopRecording(); // Stop recording before switching
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  // Start recording
  const startRecording = () => {
    if (stream) {
      const recorder = new RecordRTC(stream, { type: "video" });
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

  // Handle device change
  const handleDeviceChange = (e, type) => {
    const deviceId = e.target.value;
    if (type === "audioinput") {
      setSelectedAudioInput(deviceId);
    } else if (type === "audiooutput") {
      setSelectedAudioOutput(deviceId);
      if (videoPreviewRef.current && typeof videoPreviewRef.current.sinkId !== "undefined") {
        videoPreviewRef.current.setSinkId(deviceId);
      }
    } else if (type === "videoinput") {
      setSelectedVideoInput(deviceId);
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
        playsInline // Important for iOS devices
      />

      {/* Timer display */}
      {isRecording && <h2>Recording Time: {formatTime(timer)}</h2>}

      {/* Device selectors */}
      <div>
        {/* Microphone Selector */}
        <label>Microphone:</label>
        <select
            onChange={(e) => handleDeviceChange(e, "audioinput")}
            value={selectedAudioInput || ""}
        >
        <option value="">Select Microphone</option>
        {devices
        .filter((device) => device.kind === "audioinput")
        .map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId}`}
            </option>
        ))}
    </select>

    {/* Speaker Selector */}
    <label>Speaker:</label>
    <select
        onChange={(e) => handleDeviceChange(e, "audiooutput")}
        value={selectedAudioOutput || ""}
    >
        <option value="">Select Speaker</option>
        {devices
        .filter((device) => device.kind === "audiooutput")
        .map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Speaker ${device.deviceId}`}
            </option>
        ))}
    </select>

    {/* Camera Selector */}
    <label>Camera:</label>
    <select
        onChange={(e) => handleDeviceChange(e, "videoinput")}
        value={selectedVideoInput || ""}
    >
        <option value="">Select Camera</option>
        {devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
            </option>
        ))}
    </select>
    </div>

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

export default CoreVideoWithSelectBox;