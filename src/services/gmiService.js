import axios from 'axios';

// GMI Cloud API configuration
const GMI_API_URL = process.env.REACT_APP_GMI_API_URL || 'https://api.gmi-serving.com';
const GMI_API_KEY = process.env.REACT_APP_GMI_API_KEY;

// GMI Cloud base URLs
const GMI_BASE_URLS = [
  'https://api.gmi-serving.com'
];

// Debug environment variables
console.log('Environment variables loaded:');
console.log('GMI_API_URL:', GMI_API_URL);
console.log('GMI_API_KEY exists:', !!GMI_API_KEY);

// Utility function to clean markdown formatting from responses
const cleanMarkdown = (text) => {
  return text
    .replace(/\*\*\*\*/g, '') // Remove ****
    .replace(/\*\*/g, '')     // Remove **
    .replace(/\*/g, '')       // Remove *
    .replace(/`/g, '')        // Remove backticks
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .trim();
};

// Speaker profiles with their characteristics and knowledge
const SPEAKER_PROFILES = {
  'Steve Jobs': {
    personality: 'Visionary, perfectionist, focused on design and user experience',
    background: 'Co-founder of Apple, Pixar, and NeXT. Known for revolutionizing personal computing, mobile phones, and digital music.',
    speaking_style: 'Direct, passionate, uses metaphors and stories. Emphasizes simplicity and elegance.',
    expertise: 'Technology innovation, design philosophy, business strategy, creative leadership',
    quotes: 'Stay hungry, stay foolish. Design is not just what it looks like and feels like. Design is how it works.',
    knowledge_sources: 'Apple keynotes, interviews, Stanford commencement speech, biographies'
  },
  'Elon Musk': {
    personality: 'Ambitious, risk-taking, focused on solving big problems',
    background: 'CEO of Tesla and SpaceX, founder of Neuralink and The Boring Company. Known for electric vehicles, space exploration, and AI.',
    speaking_style: 'Technical, direct, uses data and engineering principles. Often discusses future possibilities.',
    expertise: 'Electric vehicles, space exploration, artificial intelligence, renewable energy, neural interfaces',
    quotes: 'When something is important enough, you do it even if the odds are not in your favor. The future of humanity is going to be on multiple planets.',
    knowledge_sources: 'Tesla presentations, SpaceX launches, interviews, Twitter posts, TED talks'
  },
  'Bill Gates': {
    personality: 'Analytical, philanthropic, focused on global problems',
    background: 'Co-founder of Microsoft, philanthropist through Bill & Melinda Gates Foundation. Known for personal computing and global health.',
    speaking_style: 'Thoughtful, data-driven, uses statistics and research. Emphasizes global impact and innovation.',
    expertise: 'Software development, global health, education, climate change, philanthropy',
    quotes: 'Success is a lousy teacher. It seduces smart people into thinking they can\'t lose. We always overestimate the change that will occur in the next two years and underestimate the change that will occur in the next ten.',
    knowledge_sources: 'Microsoft presentations, Gates Notes, interviews, TED talks, annual letters'
  },
  'Warren Buffett': {
    personality: 'Wise, patient, value-oriented, down-to-earth',
    background: 'CEO of Berkshire Hathaway, known as the "Oracle of Omaha". One of the most successful investors ever.',
    speaking_style: 'Simple, clear, uses analogies and stories. Emphasizes long-term thinking and value.',
    expertise: 'Value investing, business analysis, economics, philanthropy, life philosophy',
    quotes: 'Be fearful when others are greedy and greedy when others are fearful. Price is what you pay. Value is what you get.',
    knowledge_sources: 'Berkshire annual meetings, interviews, shareholder letters, documentaries'
  },
  'Oprah Winfrey': {
    personality: 'Empathetic, inspiring, focused on personal growth and human connection',
    background: 'Media mogul, talk show host, philanthropist. Known for The Oprah Winfrey Show and OWN network.',
    speaking_style: 'Warm, personal, uses stories and emotional connection. Emphasizes authenticity and purpose.',
    expertise: 'Media, personal development, philanthropy, leadership, human psychology',
    quotes: 'The biggest adventure you can take is to live the life of your dreams. What I know for sure is that speaking your truth is the most powerful tool we all have.',
    knowledge_sources: 'The Oprah Winfrey Show, interviews, speeches, books, Super Soul Sunday'
  },
  'Albert Einstein': {
    personality: 'Curious, revolutionary, focused on fundamental understanding',
    background: 'Theoretical physicist, developed the theory of relativity. One of the most influential scientists ever.',
    speaking_style: 'Philosophical, uses thought experiments and analogies. Emphasizes imagination and questioning.',
    expertise: 'Physics, mathematics, philosophy of science, education, peace advocacy',
    quotes: 'Imagination is more important than knowledge. The important thing is not to stop questioning. Curiosity has its own reason for existence.',
    knowledge_sources: 'Scientific papers, interviews, letters, biographies, philosophical writings'
  }
};

// Initialize axios instance for GMI Cloud
const gmiApi = axios.create({
  baseURL: GMI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GMI_API_KEY}`
  },
  timeout: 30000 // 30 second timeout
});

// Alternative authentication headers for GMI Cloud
const gmiApiAlt = axios.create({
  baseURL: GMI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': GMI_API_KEY
  },
  timeout: 30000
});

const gmiApiAlt2 = axios.create({
  baseURL: GMI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': GMI_API_KEY
  },
  timeout: 30000
});

// Log the API configuration
console.log('GMI API Configuration:', {
  baseURL: GMI_API_URL,
  hasApiKey: !!GMI_API_KEY,
  apiKeyPrefix: GMI_API_KEY ? GMI_API_KEY.substring(0, 20) + '...' : 'None'
});

// Log environment variables directly
console.log('Environment variables check:');
console.log('process.env.REACT_APP_GMI_API_URL:', process.env.REACT_APP_GMI_API_URL);
console.log('process.env.REACT_APP_GMI_API_KEY exists:', !!process.env.REACT_APP_GMI_API_KEY);

// Generate speaker-specific prompt
const generateSpeakerPrompt = (speaker, topic, conversationHistory = []) => {
  const profile = SPEAKER_PROFILES[speaker];
  if (!profile) {
    throw new Error(`Speaker profile not found for: ${speaker}`);
  }

  const historyContext = conversationHistory.length > 0 
    ? `\n\nPrevious conversation context:\n${conversationHistory.map(msg => `${msg.speaker}: ${msg.content}`).join('\n')}`
    : '';

  return `You are ${speaker}, having a natural conversation about "${topic}".

${speaker}'s characteristics:
- Personality: ${profile.personality}
- Background: ${profile.background}
- Speaking style: ${profile.speaking_style}
- Expertise: ${profile.expertise}
- Famous quotes: ${profile.quotes}

Instructions:
1. Respond as ${speaker} would naturally speak about this topic
2. Keep responses to ONE SENTENCE only - be concise and direct
3. Reference your background, expertise, and speaking style
4. Respond to what the other speaker just said, creating a natural flow
5. Stay focused on the topic: ${topic}
6. Use your characteristic speaking style and personality
7. Don't break character or mention that you're an AI

${historyContext}

Respond as ${speaker} would naturally continue this conversation:`;
};

// Generate user question prompt
const generateUserQuestionPrompt = (speaker1, speaker2, topic, userQuestion, userName, conversationHistory = []) => {
  const profile1 = SPEAKER_PROFILES[speaker1];
  const profile2 = SPEAKER_PROFILES[speaker2];

  const historyContext = conversationHistory.length > 0 
    ? `\n\nPrevious conversation:\n${conversationHistory.map(msg => `${msg.speaker}: ${msg.content}`).join('\n')}`
    : '';

  return `You are ${speaker1} and ${speaker2} having a discussion about "${topic}".

${speaker1}'s characteristics:
- Personality: ${profile1.personality}
- Background: ${profile1.background}
- Speaking style: ${profile1.speaking_style}

${speaker2}'s characteristics:
- Personality: ${profile2.personality}
- Background: ${profile2.background}
- Speaking style: ${profile2.speaking_style}

${userName} from the audience has asked: "${userQuestion}"

Instructions:
1. Both speakers should acknowledge ${userName} by name and respond to their question
2. Keep responses to ONE SENTENCE each - be concise and direct
3. Respond in character as each speaker would naturally
4. Reference their background and expertise
5. If the question is relevant to the topic, incorporate it naturally into the discussion
6. If the question seems off-topic, politely acknowledge it but redirect to the main topic
7. Use their characteristic speaking styles
8. Start responses with phrases like "Great question from ${userName}" or "Thank you ${userName} for that question"

${historyContext}

Provide responses from both ${speaker1} and ${speaker2} to ${userName}'s question:`;
};

// Generate conversation with user question integrated
export const generateConversationWithUserQuestion = async (speaker1, speaker2, topic, userQuestion, userName, conversationHistory = []) => {
  try {
    console.log('Generating conversation with user question for:', speaker1, 'about topic:', topic);
    const prompt = generateSpeakerPromptWithUserQuestion(speaker1, speaker2, topic, userQuestion, userName, conversationHistory);
    
    console.log('Making API request to GMI Cloud...');
    console.log('Using URL:', gmiApi.defaults.baseURL);
    
    // GMI Cloud request format
    const requestPayload = {
      model: 'moonshotai/Kimi-K2-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps simulate conversations between influential leaders. Respond naturally and in character. Keep responses to ONE SENTENCE only - be concise and direct. When a user asks a question, acknowledge them by name and incorporate their question naturally into the ongoing discussion.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 50, // Reduced to one sentence for natural conversation flow
      temperature: 0.8
    };
    
    try {
      console.log('Making request to GMI Cloud:', gmiApi.defaults.baseURL + '/v1/chat/completions');
      console.log('Request payload:', requestPayload);
      
      const response = await gmiApi.post('/v1/chat/completions', requestPayload);
      console.log('API response received:', response.data);
      
      let content = response.data.choices?.[0]?.message?.content?.trim() || 
                   response.data.text?.trim() || 
                   response.data.response?.trim() || 
                   'I understand your point.';
      
      // Clean markdown formatting from the response
      content = cleanMarkdown(content);
      
      console.log('Extracted content:', content);
      return content;
    } catch (error) {
      console.error('GMI Cloud API request failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  } catch (error) {
    console.error('Error generating conversation with user question:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Failed to generate conversation response: ${error.message}`);
  }
};

// Generate speaker prompt with user question integrated
const generateSpeakerPromptWithUserQuestion = (speaker, otherSpeaker, topic, userQuestion, userName, conversationHistory = []) => {
  const profile = SPEAKER_PROFILES[speaker];
  if (!profile) {
    throw new Error(`Speaker profile not found for: ${speaker}`);
  }

  const historyContext = conversationHistory.length > 0 
    ? `\n\nPrevious conversation context:\n${conversationHistory.map(msg => `${msg.speaker}: ${msg.content}`).join('\n')}`
    : '';

  return `You are ${speaker}, having a natural conversation about "${topic}".

${speaker}'s characteristics:
- Personality: ${profile.personality}
- Background: ${profile.background}
- Speaking style: ${profile.speaking_style}
- Expertise: ${profile.expertise}
- Famous quotes: ${profile.quotes}

${userName} has just asked: "${userQuestion}"

Instructions:
1. Respond as ${speaker} would naturally speak about this topic
2. Keep responses to ONE SENTENCE only - be concise and direct
3. Reference your background, expertise, and speaking style
4. Respond to what the other speaker just said, creating a natural flow
5. Stay focused on the topic: ${topic}
6. Use your characteristic speaking style and personality
7. Don't break character or mention that you're an AI
8. Incorporate ${userName}'s question naturally into your response
9. Acknowledge ${userName} by name when responding to their question
10. Continue the debate flow naturally after addressing ${userName}'s input

${historyContext}

Respond as ${speaker} would naturally continue this conversation, incorporating ${userName}'s question:`;
};

// Call GMI Cloud API for conversation generation
export const generateConversation = async (speaker1, speaker2, topic, conversationHistory = []) => {
  try {
    console.log('Generating conversation for:', speaker1, 'about topic:', topic);
    const prompt = generateSpeakerPrompt(speaker1, topic, conversationHistory);
    
    console.log('Making API request to GMI Cloud...');
    console.log('Using URL:', gmiApi.defaults.baseURL);
    
    // GMI Cloud request format
    const requestPayload = {
      model: 'moonshotai/Kimi-K2-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps simulate conversations between influential leaders. Respond naturally and in character. Keep responses to ONE SENTENCE only - be concise and direct.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 50, // Reduced to one sentence for natural conversation flow
      temperature: 0.8
    };
    
    try {
      console.log('Making request to GMI Cloud:', gmiApi.defaults.baseURL + '/v1/chat/completions');
      console.log('Request payload:', requestPayload);
      
      const response = await gmiApi.post('/v1/chat/completions', requestPayload);
      console.log('API response received:', response.data);
      
      let content = response.data.choices?.[0]?.message?.content?.trim() || 
                   response.data.text?.trim() || 
                   response.data.response?.trim() || 
                   'I understand your point.';
      
      // Clean markdown formatting from the response
      content = cleanMarkdown(content);
      
      console.log('Extracted content:', content);
      return content;
    } catch (error) {
      console.error('GMI Cloud API request failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  } catch (error) {
    console.error('Error generating conversation:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Failed to generate conversation response: ${error.message}`);
  }
};

// Generate responses to user questions
export const generateUserQuestionResponse = async (speaker1, speaker2, topic, userQuestion, userName, conversationHistory = []) => {
  try {
    const prompt = generateUserQuestionPrompt(speaker1, speaker2, topic, userQuestion, userName, conversationHistory);
    
    const response = await gmiApi.post('/v1/chat/completions', {
      model: 'moonshotai/Kimi-K2-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps simulate conversations between influential leaders. Provide responses from both speakers to audience questions. Keep each response to ONE SENTENCE only - be concise and direct.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 80, // Reduced for user questions to prevent overlapping
      temperature: 0.8
    });

    let fullResponse = response.data.choices[0].message.content.trim();
    
    // Clean markdown formatting from the response
    fullResponse = cleanMarkdown(fullResponse);
    
    // Parse the response to separate the two speakers
    const lines = fullResponse.split('\n');
    const speaker1Response = lines.find(line => line.includes(speaker1 + ':'))?.replace(speaker1 + ':', '').trim();
    const speaker2Response = lines.find(line => line.includes(speaker2 + ':'))?.replace(speaker2 + ':', '').trim();

    return {
      speaker1: speaker1Response || 'I appreciate that question.',
      speaker2: speaker2Response || 'That\'s an interesting point.'
    };
  } catch (error) {
    console.error('Error generating user question response:', error);
    throw new Error('Failed to generate response to user question');
  }
};

// Get available speakers
export const getAvailableSpeakers = () => {
  return Object.keys(SPEAKER_PROFILES);
};

// Validate GMI API configuration
export const validateGMIConfig = () => {
  if (!GMI_API_KEY) {
    throw new Error('GMI API key is not configured. Please set REACT_APP_GMI_API_KEY environment variable.');
  }
  console.log('GMI API Key configured:', GMI_API_KEY ? 'Yes' : 'No');
  console.log('GMI API URL:', GMI_API_URL);
  return true;
};

// Test basic internet connectivity
export const testBasicConnectivity = async () => {
  try {
    console.log('Testing basic internet connectivity...');
    const response = await axios.get('https://httpbin.org/get', { timeout: 5000 });
    console.log('Basic internet connectivity: OK');
    return true;
  } catch (error) {
    console.error('Basic internet connectivity failed:', error.message);
    return false;
  }
};

// Test basic connectivity to AI services
export const testGMIConnectivity = async () => {
  try {
    console.log('Testing basic connectivity to AI services...');
    
    // Try a simple API call to test connectivity
    const testPayload = {
      model: 'moonshotai/Kimi-K2-Instruct',
      messages: [
        {
          role: 'user',
          content: 'Hello'
        }
      ],
      max_tokens: 5
    };
    
    for (const baseUrl of GMI_BASE_URLS) {
      try {
        console.log(`Testing connectivity to: ${baseUrl}`);
        
        // Create a test API instance
        const testApi = axios.create({
          baseURL: baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GMI_API_KEY}`
          },
          timeout: 10000
        });
        
        // Try a simple API call
        const response = await testApi.post('/v1/chat/completions', testPayload);
        console.log(`Successfully connected to ${baseUrl}:`, response.status);
        return true;
      } catch (error) {
        console.log(`Failed to connect to ${baseUrl}:`, error.message);
        if (error.response) {
          console.log(`Response status: ${error.response.status}`);
          // If we get a 401/403, it means the server is reachable but auth failed
          if (error.response.status === 401 || error.response.status === 403) {
            console.log(`Server is reachable but authentication failed`);
            return true; // Server is reachable
          }
        }
        continue;
      }
    }
    return false;
  } catch (error) {
    console.error('Connectivity test failed:', error);
    return false;
  }
};

// Test GMI API connection
export const testGMIConnection = async () => {
  try {
    console.log('Testing GMI API connection...');
    
    // Try different possible endpoints for GMI Cloud
    const endpoints = [
      '/v1/chat/completions',
      '/chat/completions',
      '/api/v1/chat/completions',
      '/completions',
      '/api/chat/completions',
      '/v1/completions',
      '/api/generate',
      '/generate',
      '/v1/generate',
      '/chat',
      '/api/chat'
    ];
    
    // Try different base URLs and endpoints
    for (const baseUrl of GMI_BASE_URLS) {
      console.log(`Trying base URL: ${baseUrl}`);
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${baseUrl}${endpoint}`);
          
          // Try different authentication methods for this base URL
          const authMethods = [
            {
              name: 'Bearer Token',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GMI_API_KEY}`
              }
            },
            {
              name: 'X-API-Key',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': GMI_API_KEY
              }
            },
            {
              name: 'Direct Authorization',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': GMI_API_KEY
              }
            }
          ];
          
          for (const authMethod of authMethods) {
            try {
              console.log(`Trying ${authMethod.name} authentication...`);
              const tempApi = axios.create({
                baseURL: baseUrl,
                headers: authMethod.headers
              });
              
              try {
                console.log(`Trying GMI Cloud API with ${authMethod.name} authentication`);
                const response = await tempApi.post(endpoint, {
                  model: 'moonshotai/Kimi-K2-Instruct',
                  messages: [
                    {
                      role: 'user',
                      content: 'Hello, this is a test message.'
                    }
                  ],
                  max_tokens: 10
                });
                
                console.log(`GMI API test successful with ${baseUrl}${endpoint} using ${authMethod.name}:`, response.data);
                return true;
              } catch (apiError) {
                console.log(`API test failed with ${authMethod.name}:`, apiError.message);
                continue;
              }
            } catch (authError) {
              console.log(`${authMethod.name} authentication failed:`, authError.message);
              continue;
            }
          }
        } catch (endpointError) {
          console.log(`Endpoint ${baseUrl}${endpoint} failed:`, endpointError.message);
          continue;
        }
      }
    }
    
    console.error('All GMI API endpoints failed');
    return false;
  } catch (error) {
    console.error('GMI API test failed:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
}; 