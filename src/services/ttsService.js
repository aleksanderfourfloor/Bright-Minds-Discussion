import axios from 'axios';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different speakers (you can customize these)
const VOICE_IDS = {
  'Steve Jobs': 'pNInz6obpgDQGcFmaJgB', // Adam voice (confident, clear)
  'Elon Musk': 'VR6AewLTigWG4xSOukaG', // Arnold voice (deep, authoritative)
  'Bill Gates': 'pNInz6obpgDQGcFmaJgB', // Adam voice (analytical)
  'Warren Buffett': 'VR6AewLTigWG4xSOukaG', // Arnold voice (wise, measured)
  'Oprah Winfrey': 'pNInz6obpgDQGcFmaJgB', // Adam voice (warm, empathetic)
  'Albert Einstein': 'VR6AewLTigWG4xSOukaG' // Arnold voice (thoughtful)
};

// Initialize ElevenLabs API
const elevenLabsApi = axios.create({
  baseURL: ELEVENLABS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'xi-api-key': ELEVENLABS_API_KEY
  }
});

// Convert text to speech
export const textToSpeech = async (text, speaker) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured. Using browser TTS as fallback.');
      
      // Use browser's built-in speech synthesis as fallback
      return new Promise((resolve) => {
        console.log('Starting browser TTS for:', speaker);
        console.log('Text to speak:', text.substring(0, 50) + '...');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Set different voices for different speakers
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        if (voices.length > 0) {
          // Use different voices based on speaker
          const voiceIndex = speaker === 'Elon Musk' ? 1 : 0;
          utterance.voice = voices[voiceIndex % voices.length];
          console.log('Selected voice:', utterance.voice?.name);
        }
        
        utterance.onstart = () => {
          console.log('Browser TTS started speaking');
        };
        
        utterance.onend = () => {
          console.log('Browser TTS finished');
          resolve(null); // Return null since we can't create a URL for browser TTS
        };
        
        utterance.onerror = (event) => {
          console.log('Browser TTS failed:', event.error);
          resolve(null);
        };
        
        try {
          speechSynthesis.speak(utterance);
          console.log('Speech synthesis speak() called');
        } catch (error) {
          console.error('Error calling speechSynthesis.speak():', error);
          resolve(null);
        }
        
        resolve(null); // Return null for browser TTS
      });
    }

    const voiceId = VOICE_IDS[speaker] || VOICE_IDS['Steve Jobs']; // Default fallback
    
    console.log(`Converting text to speech for ${speaker} using voice ${voiceId}`);
    
    const response = await elevenLabsApi.post(`/text-to-speech/${voiceId}`, {
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }, {
      responseType: 'blob'
    });

    // Create audio blob and URL
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('TTS conversion successful');
    return audioUrl;
  } catch (error) {
    console.error('TTS conversion failed:', error);
    return null;
  }
};

// Play audio
export const playAudio = (audioUrl) => {
  if (!audioUrl) return;
  
  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Failed to play audio:', error);
  });
  
  return audio;
};

// Stop audio
export const stopAudio = (audio) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

// Get available voices from ElevenLabs
export const getAvailableVoices = async () => {
  try {
    if (!ELEVENLABS_API_KEY) {
      return [];
    }
    
    const response = await elevenLabsApi.get('/voices');
    return response.data.voices;
  } catch (error) {
    console.error('Failed to get available voices:', error);
    return [];
  }
};

// Validate ElevenLabs configuration
export const validateElevenLabsConfig = () => {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured. TTS will be disabled.');
    return false;
  }
  return true;
}; 