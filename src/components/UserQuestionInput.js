
import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';

const UserQuestionInput = ({ onAskQuestion, disabled, userName = 'User' }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !disabled) {
      onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="user-question-input" style={{ marginTop: 0 }}>
      <label>
        <MessageCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        {userName}'s Question
      </label>
      <form onSubmit={handleSubmit}>
        <div className="question-input-container">
          <input
            type="text"
            className="question-input"
            placeholder={`Ask a question to shape the debate...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!question.trim()}
            title="Send your question to the speakers"
          >
            <Send size={20} />
          </button>
        </div>
        {!disabled && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#28a745', 
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            💬 You can ask questions anytime during the debate!
          </div>
        )}
      </form>
    </div>
  );
};

export default UserQuestionInput; 