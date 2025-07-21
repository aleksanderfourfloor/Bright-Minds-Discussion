import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'lucide-react';
import DebateSetup from './components/DebateSetup';
import Conversation from './components/Conversation';
import UserQuestionInput from './components/UserQuestionInput';
import { 
  generateConversation, 
  generateConversationWithUserQuestion,
  generateUserQuestionResponse, 
  getAvailableSpeakers, 
  validateGMIConfig,
  testGMIConnection,
  testGMIConnectivity,
  testBasicConnectivity
} from './services/gmiService';
import { 
  textToSpeech, 
  playAudio, 
  stopAudio, 
  validateElevenLabsConfig 
} from './services/ttsService';
import './App.css';

function App() {
  const [speaker1, setSpeaker1] = useState('');
  const [speaker2, setSpeaker2] = useState('');
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebateActive, setIsDebateActive] = useState(false);
  const [typingSpeaker, setTypingSpeaker] = useState(null);
  const [availableSpeakers, setAvailableSpeakers] = useState([]);
  const [userName, setUserName] = useState('Aleksander');
  const [error, setError] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true); // Enable TTS by default for testing
  const [currentAudio, setCurrentAudio] = useState(null);

  // Initialize available speakers
  useEffect(() => {
    try {
      const speakers = getAvailableSpeakers();
      setAvailableSpeakers(speakers);
    } catch (error) {
      console.error('Error loading speakers:', error);
      setError('Failed to load available speakers');
    }
  }, []);

  // Validate GMI configuration on mount
  useEffect(() => {
    try {
      console.log('Environment variables check:');
      console.log('REACT_APP_GMI_API_KEY:', process.env.REACT_APP_GMI_API_KEY ? 'Set' : 'Not set');
      console.log('REACT_APP_GMI_API_URL:', process.env.REACT_APP_GMI_API_URL);
      
      validateGMIConfig();
      console.log('GMI configuration validated successfully');
      
      // Check TTS configuration
      const ttsAvailable = validateElevenLabsConfig();
      setTtsEnabled(ttsAvailable);
      console.log('TTS enabled:', ttsAvailable);
      console.log('ElevenLabs API key:', process.env.REACT_APP_ELEVENLABS_API_KEY ? 'Set' : 'Not set');
      
      // Test browser TTS availability
      if ('speechSynthesis' in window) {
        console.log('Browser TTS is available');
        const voices = speechSynthesis.getVoices();
        console.log('Available browser voices:', voices.length);
        if (voices.length > 0) {
          console.log('First voice:', voices[0].name);
        }
      } else {
        console.log('Browser TTS is NOT available');
      }
    } catch (error) {
      console.error('GMI configuration error:', error);
      setError(error.message);
    }
  }, []);

  // Generate a conversation turn with delay for natural feel
  const generateTurn = useCallback(async (currentSpeaker, otherSpeaker, currentMessages) => {
    try {
      setTypingSpeaker(currentSpeaker);
      
      // Very short typing delay (0.2-0.8 seconds for faster responses)
      const typingDelay = 200 + Math.random() * 600;
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      const response = await generateConversation(
        currentSpeaker, 
        otherSpeaker, 
        topic, 
        currentMessages
      );
      
      setTypingSpeaker(null);
      
      // Generate TTS for the response
      let audioUrl = null;
      if (ttsEnabled) {
        try {
          console.log(`Generating TTS for ${currentSpeaker}:`, response.substring(0, 100) + '...');
          audioUrl = await textToSpeech(response, currentSpeaker);
          console.log('TTS generated successfully:', audioUrl ? 'Yes' : 'No');
        } catch (ttsError) {
          console.error('TTS generation failed:', ttsError);
        }
      } else {
        console.log('TTS is disabled');
      }
      
      return {
        speaker: currentSpeaker,
        content: response,
        timestamp: new Date().toISOString(),
        audioUrl: audioUrl
      };
    } catch (error) {
      console.error('Error generating turn:', error);
      setTypingSpeaker(null);
      throw error;
    }
  }, [topic, ttsEnabled]);

  // Generate a conversation turn that incorporates user question
  const generateTurnWithUserQuestion = useCallback(async (currentSpeaker, otherSpeaker, topic, userQuestion, userName, currentMessages) => {
    try {
      setTypingSpeaker(currentSpeaker);
      
      // Very short typing delay (0.2-0.8 seconds for faster responses)
      const typingDelay = 200 + Math.random() * 600;
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      const response = await generateConversationWithUserQuestion(
        currentSpeaker, 
        otherSpeaker, 
        topic, 
        userQuestion,
        userName,
        currentMessages
      );
      
      setTypingSpeaker(null);
      
      // Generate TTS for the response
      let audioUrl = null;
      if (ttsEnabled) {
        try {
          console.log(`Generating TTS for ${currentSpeaker}:`, response.substring(0, 100) + '...');
          audioUrl = await textToSpeech(response, currentSpeaker);
          console.log('TTS generated successfully:', audioUrl ? 'Yes' : 'No');
        } catch (ttsError) {
          console.error('TTS generation failed:', ttsError);
        }
      } else {
        console.log('TTS is disabled');
      }
      
      return {
        speaker: currentSpeaker,
        content: response,
        timestamp: new Date().toISOString(),
        audioUrl: audioUrl
      };
    } catch (error) {
      console.error('Error generating turn with user question:', error);
      setTypingSpeaker(null);
      throw error;
    }
  }, [topic, ttsEnabled]);

  // Start the debate
  const handleStartDebate = async () => {
    if (!speaker1 || !speaker2 || !topic.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessages([]);
    setIsDebateActive(true);

    try {
      // Generate initial responses from both speakers
      const initialMessages = [];
      
      // First speaker starts
      const firstResponse = await generateTurn(speaker1, speaker2, []);
      initialMessages.push(firstResponse);
      setMessages([firstResponse]);
      
      // Start generating second speaker's response while first speaker's audio plays
      const secondResponsePromise = generateTurn(speaker2, speaker1, [firstResponse]);
      
      // Wait for first speaker's audio to finish
      await playMessageAudio(firstResponse.audioUrl);

      // Very short pause between speakers (0.1-0.3 seconds)
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

      // Get the second speaker's response (should be ready by now)
      const secondResponse = await secondResponsePromise;
      initialMessages.push(secondResponse);
      setMessages([firstResponse, secondResponse]);
      
      // Wait for second speaker's audio to finish
      await playMessageAudio(secondResponse.audioUrl);

      // Continue conversation for 5-10 minutes (simulated with more turns)
      const maxTurns = 8; // Simulate 5-10 minutes of conversation
      let currentSpeaker = speaker1;
      let otherSpeaker = speaker2;
      
      for (let i = 2; i < maxTurns; i++) {
        // Very short pause before next speaker (0.1-0.3 seconds)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // Start generating next response
        const nextMessagePromise = generateTurn(currentSpeaker, otherSpeaker, initialMessages);
        
        // Get the generated response (should be ready by now)
        const newMessage = await nextMessagePromise;
        initialMessages.push(newMessage);
        setMessages([...initialMessages]);
        
        // Wait for current speaker's audio to finish
        await playMessageAudio(newMessage.audioUrl);
        
        // Switch speakers
        [currentSpeaker, otherSpeaker] = [otherSpeaker, currentSpeaker];
      }
      
    } catch (error) {
      console.error('Error starting debate:', error);
      setError('Failed to start debate. Please check your GMI API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user question
  const handleUserQuestion = async (question) => {
    if (!question.trim() || !isDebateActive) return;

    // Stop any currently playing audio to prioritize user question
    if (currentAudio) {
      stopAudio(currentAudio);
      setCurrentAudio(null);
    }

    // Add user question to messages
    const userQuestionMessage = {
      type: 'user-question',
      content: question,
      userName: userName,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userQuestionMessage]);

    try {
      // Continue the debate with the user question integrated
      await continueDebateWithQuestion(question);
    } catch (error) {
      console.error('Error handling user question:', error);
      setError('Failed to generate response to your question.');
    }
  };

  // Continue debate with user question integrated
  const continueDebateWithQuestion = async (userQuestion) => {
    // Add 2-3 more turns to the debate incorporating the user question
    const additionalTurns = 3;
    let currentSpeaker = speaker1;
    let otherSpeaker = speaker2;
    
    for (let i = 0; i < additionalTurns; i++) {
      // Short pause before next speaker
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
      
      // Generate next response incorporating the user question
      const newMessage = await generateTurnWithUserQuestion(
        currentSpeaker, 
        otherSpeaker, 
        topic, 
        userQuestion,
        userName,
        messages // Use the current messages state which includes the user question
      );
      
      // Add the new message to the state
      setMessages(prev => [...prev, newMessage]);
      
      // Wait for current speaker's audio to finish
      await playMessageAudio(newMessage.audioUrl);
      
      // Switch speakers
      [currentSpeaker, otherSpeaker] = [otherSpeaker, currentSpeaker];
    }
  };

  // Play audio for a message and return a promise that resolves when audio finishes
  const playMessageAudio = (audioUrl) => {
    return new Promise((resolve) => {
      console.log('playMessageAudio called with:', audioUrl ? 'audio URL' : 'no audio');
      console.log('TTS enabled:', ttsEnabled);
      
      if (audioUrl && ttsEnabled) {
        // Stop any currently playing audio
        if (currentAudio) {
          stopAudio(currentAudio);
        }
        
        // Play new audio
        const audio = playAudio(audioUrl);
        setCurrentAudio(audio);
        
        console.log('Audio playback started:', audio ? 'Yes' : 'No');
        
        // Resolve when audio finishes
        if (audio) {
          audio.onended = () => {
            console.log('Audio finished playing');
            setCurrentAudio(null);
            resolve();
          };
          // Fallback in case audio fails to load
          audio.onerror = () => {
            console.log('Audio playback failed');
            setCurrentAudio(null);
            resolve();
          };
        } else {
          console.log('No audio object created');
          resolve();
        }
      } else if (ttsEnabled && !audioUrl) {
        // Browser TTS case - audioUrl is null but TTS is enabled
        console.log('Using browser TTS (no audio URL)');
        // For browser TTS, we need to wait a bit to simulate audio duration
        const estimatedDuration = 1000; // 1 second estimate for short responses
        setTimeout(() => {
          console.log('Browser TTS estimated duration completed');
          resolve();
        }, estimatedDuration);
      } else {
        // If no audio, resolve immediately
        console.log('No audio URL or TTS disabled, resolving immediately');
        resolve();
      }
    });
  };

  // Reset debate
  const handleReset = () => {
    // Stop any playing audio
    if (currentAudio) {
      stopAudio(currentAudio);
      setCurrentAudio(null);
    }
    
    setMessages([]);
    setIsDebateActive(false);
    setTypingSpeaker(null);
    setError(null);
  };

  // Test API connection
  const handleTestAPI = async () => {
    setError(null);
    try {
      console.log('Starting API connection test...');
      
      // First test basic internet connectivity
      const basicConnectivity = await testBasicConnectivity();
      console.log('Basic connectivity test result:', basicConnectivity);
      
      if (!basicConnectivity) {
        setError('Basic internet connectivity failed. Please check your internet connection.');
        return;
      }
      
      // Then test AI service connectivity
      const connectivitySuccess = await testGMIConnectivity();
      console.log('AI service connectivity test result:', connectivitySuccess);
      
      if (!connectivitySuccess) {
        setError('Cannot reach any AI service servers. This could be due to: 1) Network restrictions, 2) Incorrect API URL, 3) Service being down. Check console for details.');
        return;
      }
      
      // Finally test API functionality
      const success = await testGMIConnection();
      if (success) {
        setError('API connection test successful!');
      } else {
        setError('API connection test failed. Check console for details.');
      }
    } catch (error) {
      setError(`API test error: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Bright Minds Discussion</h1>
        <div className="user-info">
          <User size={16} />
          <span>User: </span>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6c757d',
              fontSize: '0.9rem',
              fontWeight: '600',
              width: '120px',
              outline: 'none',
              textAlign: 'left'
            }}
            placeholder="Your name"
          />
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <DebateSetup
        speaker1={speaker1}
        speaker2={speaker2}
        topic={topic}
        onSpeaker1Change={setSpeaker1}
        onSpeaker2Change={setSpeaker2}
        onTopicChange={setTopic}
        onStartDebate={handleStartDebate}
        isLoading={isLoading}
        availableSpeakers={availableSpeakers}
      />

      <Conversation
        messages={messages}
        isLoading={isLoading}
        typingSpeaker={typingSpeaker}
        speaker1={speaker1}
        speaker2={speaker2}
      />

      {isDebateActive && (
        <div className="floating-input-container">
          <UserQuestionInput
            onAskQuestion={handleUserQuestion}
            disabled={false}
            userName={userName}
          />
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleTestAPI}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginRight: '10px'
          }}
        >
          Test API Connection
        </button>
        
        <button
          onClick={() => {
            console.log('Testing TTS...');
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance('Hello, this is a test of text to speech.');
              utterance.onstart = () => console.log('TTS test started');
              utterance.onend = () => console.log('TTS test finished');
              utterance.onerror = (e) => console.log('TTS test error:', e.error);
              speechSynthesis.speak(utterance);
            } else {
              console.log('Speech synthesis not available');
            }
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginRight: '10px'
          }}
        >
          Test TTS
        </button>
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          style={{
            backgroundColor: ttsEnabled ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginRight: '10px'
          }}
        >
          {ttsEnabled ? '🎤 TTS ON' : '🔇 TTS OFF'}
        </button>
        {isDebateActive && (
          <button
            onClick={handleReset}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reset Debate
          </button>
        )}
      </div>
    </div>
  );
}

export default App; 