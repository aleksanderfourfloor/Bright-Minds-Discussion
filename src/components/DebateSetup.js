import React from 'react';
import { Play } from 'lucide-react';

const DebateSetup = ({ 
  speaker1, 
  speaker2, 
  topic, 
  onSpeaker1Change, 
  onSpeaker2Change, 
  onTopicChange, 
  onStartDebate, 
  isLoading, 
  availableSpeakers 
}) => {
  return (
    <div className="setup-section">
      <div className="setup-item">
        <label>Speaker 1</label>
        <select
          value={speaker1}
          onChange={(e) => onSpeaker1Change(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select the speaker</option>
          {availableSpeakers.map(speaker => (
            <option key={speaker} value={speaker}>
              {speaker}
            </option>
          ))}
        </select>
      </div>

      <div className="setup-item">
        <label>Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="Enter the discussion topic"
          disabled={isLoading}
        />
      </div>

      <div className="setup-item">
        <label>Speaker 2</label>
        <select
          value={speaker2}
          onChange={(e) => onSpeaker2Change(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select the speaker</option>
          {availableSpeakers.map(speaker => (
            <option key={speaker} value={speaker}>
              {speaker}
            </option>
          ))}
        </select>
      </div>

      <button
        className="start-debate-btn"
        onClick={onStartDebate}
        disabled={!speaker1 || !speaker2 || !topic.trim() || isLoading}
      >
        <Play size={16} />
        Start Debate
      </button>
    </div>
  );
};

export default DebateSetup; 