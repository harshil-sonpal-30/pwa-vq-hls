import React, { useState, useEffect } from "react";
// import "./QualityControl.css";

const QualityControl = ({ hlsInstance }) => {
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(-1);

  useEffect(() => {
    if (hlsInstance) {
      setQualityLevels(hlsInstance.levels);
      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setSelectedLevel(hlsInstance.currentLevel);
      });
    }
  }, [hlsInstance]);

  const handleQualityChange = (levelIndex) => {
    if (hlsInstance) {
      hlsInstance.currentLevel = levelIndex;
    }
  };

  return (
    <div className="quality-control-wrapper">
      <select
        className="quality-control"
        value={selectedLevel}
        onChange={(e) => handleQualityChange(parseInt(e.target.value))}
      >
        <option value={-1}>Auto</option>
        {qualityLevels.map((level, index) => (
          <option key={index} value={index}>
            {level.height}p
          </option>
        ))}
      </select>
    </div>
  );
};

export default QualityControl;