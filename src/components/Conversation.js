import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';

const Conversation = ({ messages, isLoading, typingSpeaker, speaker1, speaker2 }) => {
  const conversationRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (conversationRef.current) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }, 100);
    }
  }, [messages, typingSpeaker]);

  // Also scroll when typing indicator appears/disappears
  useEffect(() => {
    if (conversationRef.current && typingSpeaker) {
      setTimeout(() => {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }, 50);
    }
  }, [typingSpeaker]);

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      if (conversationRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = conversationRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      }
    };

    const container = conversationRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  };

  const renderMessage = (message, index) => {
    const isUserQuestion = message.type === 'user-question';
    const isSpeaker1 = message.speaker === speaker1;
    
    return (
      <div 
        key={index} 
        className={`message ${isUserQuestion ? 'user-question' : (isSpeaker1 ? 'speaker1' : 'speaker2')}`}
      >
        {isUserQuestion ? (
          <div className="speaker-name" style={{ color: '#007bff', fontWeight: '600' }}>
            👤 {message.userName || 'User'} asks:
          </div>
        ) : (
          <div className="speaker-name">
            {message.speaker}
          </div>
        )}
        <div className="message-content">
          {message.content}
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (!typingSpeaker) return null;
    
    const isSpeaker1 = typingSpeaker === speaker1;
    
    return (
      <div className={`message ${isSpeaker1 ? 'speaker1' : 'speaker2'}`}>
        <div className="speaker-name">
          {typingSpeaker}
        </div>
        <div className="message-content">
          <div className="typing-indicator" style={{ 
            color: isSpeaker1 ? '#6c757d' : 'white' 
          }}>
            <span>{typingSpeaker} is thinking...</span>
            <div className="typing-dots">
              <div className="typing-dot" style={{ 
                backgroundColor: isSpeaker1 ? '#6c757d' : 'white' 
              }}></div>
              <div className="typing-dot" style={{ 
                backgroundColor: isSpeaker1 ? '#6c757d' : 'white' 
              }}></div>
              <div className="typing-dot" style={{ 
                backgroundColor: isSpeaker1 ? '#6c757d' : 'white' 
              }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="conversation-wrapper">
      <div className="conversation-container" ref={conversationRef}>
        {messages.length === 0 && !isLoading ? (
          <div className="loading">
            <MessageCircle size={48} />
            <p style={{ marginLeft: '12px' }}>Select speakers and a topic to start the debate</p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {renderTypingIndicator()}
            {isLoading && messages.length === 0 && (
              <div className="loading">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span style={{ marginLeft: '8px' }}>Starting debate...</span>
              </div>
            )}
          </>
        )}
      </div>
      {showScrollButton && (
        <button 
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          title="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  );
};

export default Conversation; 