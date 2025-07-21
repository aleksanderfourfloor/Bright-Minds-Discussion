# Bright Minds Discussion

An AI-powered web application that simulates engaging debates between influential leaders and thinkers. Experience conversations between great minds like Steve Jobs, Elon Musk, Bill Gates, and more, discussing topics of your choice.

## Features

- **Speaker Selection**: Choose from a curated list of influential leaders including Steve Jobs, Elon Musk, Bill Gates, Warren Buffett, Oprah Winfrey, and Albert Einstein
- **Topic Customization**: Set any topic for the speakers to discuss
- **Natural Conversations**: AI-powered responses that capture each speaker's unique personality, speaking style, and expertise
- **Interactive Questions**: Ask questions during the debate and get responses from both speakers
- **Realistic Timing**: Natural delays and typing indicators to simulate authentic conversation flow
- **Modern UI**: Clean, minimalist design with responsive layout

## Technology Stack

- **Frontend**: React 18 with functional components and hooks
- **Styling**: Modern CSS with responsive design
- **Icons**: Lucide React for beautiful, consistent icons
- **AI Integration**: GMI Cloud API for intelligent conversation generation
- **HTTP Client**: Axios for API communication

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- GMI Cloud API account and API key
- ElevenLabs API account (optional, for enhanced text-to-speech)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bright-minds-discussion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   **Option A: Copy the example file**
   ```bash
   cp env.example .env
   ```
   
   **Option B: Create manually**
   Create a `.env` file in the root directory with your API keys:
   ```env
   REACT_APP_GMI_API_KEY=your_gmi_api_key_here
   REACT_APP_GMI_API_URL=https://your_gmi_api_endpoint.com
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Verify your setup (optional)**
   ```bash
   npm run verify-env
   ```
   This will check if your environment variables are configured correctly.

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000` to view the application.

### ⚠️ Important Security Notes

- **Never commit your `.env` file** - it contains sensitive API keys
- **The `.gitignore` file protects your API keys** from being published
- **Use `env.example` as a template** for setting up your environment variables
- **Keep your API keys secure** and don't share them publicly

## Usage

### Starting a Debate

1. **Select Speakers**: Choose Speaker 1 and Speaker 2 from the dropdown menus
2. **Enter Topic**: Type the discussion topic in the topic field
3. **Start Debate**: Click the "Start Debate" button to begin the conversation

### During the Debate

- **Watch the Conversation**: The speakers will engage in a natural back-and-forth discussion
- **Ask Questions**: Use the question input at the bottom to ask questions to the speakers
- **Observe Responses**: Both speakers will respond to your questions in character

### Speaker Profiles

Each speaker has been carefully profiled with:

- **Personality traits** and characteristics
- **Background information** and achievements
- **Speaking style** and communication patterns
- **Expertise areas** and knowledge domains
- **Famous quotes** and signature phrases

## API Configuration

The application uses GMI Cloud API for generating intelligent responses. The API calls are configured in `src/services/gmiService.js` with:

- **Model**: `gmi-1.5-pro`
- **Temperature**: 0.8 (for creative but consistent responses)
- **Max Tokens**: 150-300 (for concise responses)
- **Top P**: 0.9 (for focused responses)

## Customization

### Adding New Speakers

To add new speakers, edit the `SPEAKER_PROFILES` object in `src/services/gmiService.js`:

```javascript
'New Speaker': {
  personality: 'Description of personality',
  background: 'Background and achievements',
  speaking_style: 'How they communicate',
  expertise: 'Areas of expertise',
  quotes: 'Famous quotes',
  knowledge_sources: 'Sources of information'
}
```

### Modifying Conversation Behavior

Adjust the conversation parameters in `src/services/gmiService.js`:

- **Response Length**: Modify `max_tokens` in API calls
- **Creativity**: Adjust `temperature` (0.0-1.0)
- **Conversation Duration**: Change `maxTurns` in `App.js`

## Project Structure

```
src/
├── components/
│   ├── Conversation.js      # Main conversation display
│   ├── DebateSetup.js       # Speaker and topic selection
│   └── UserQuestionInput.js # User question interface
├── services/
│   └── gmiService.js        # GMI Cloud API integration
├── App.js                   # Main application component
├── App.css                  # Application styles
├── index.js                 # React entry point
└── index.css                # Global styles
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_GMI_API_KEY` | Your GMI Cloud API key for AI conversation generation | Yes | - |
| `REACT_APP_GMI_API_URL` | GMI Cloud API endpoint URL | No | https://api.gmi.cloud |
| `REACT_APP_ELEVENLABS_API_KEY` | ElevenLabs API key for enhanced text-to-speech | No | - |

### Getting API Keys

1. **GMI Cloud API Key**:
   - Sign up at [GMI Cloud](https://gmi.cloud)
   - Navigate to your dashboard
   - Generate a new API key
   - Copy the key to your `.env` file

2. **ElevenLabs API Key** (Optional):
   - Sign up at [ElevenLabs](https://elevenlabs.io)
   - Go to your profile settings
   - Copy your API key
   - Add to your `.env` file for enhanced TTS

### Security Best Practices

- ✅ **Use `.env` file** for local development
- ✅ **Never commit `.env` to Git** (protected by `.gitignore`)
- ✅ **Use `env.example` as template** for setup
- ✅ **Rotate API keys regularly** for security
- ❌ **Never share API keys** in public repositories
- ❌ **Don't hardcode keys** in your source code

## Troubleshooting

### Common Issues

1. **API Key Error**: 
   - Ensure your GMI API key is correctly set in the `.env` file
   - Check that the key is valid and has sufficient credits
   - Verify the API endpoint URL is correct

2. **Environment Variables Not Loading**:
   - Make sure your `.env` file is in the root directory
   - Restart the development server after changing `.env`
   - Check that variable names start with `REACT_APP_`

3. **Network Errors**: 
   - Check your internet connection and GMI Cloud service status
   - Verify your API endpoint is accessible
   - Try the "Test API Connection" button in the app

4. **Speaker Not Responding**: 
   - Verify the speaker profile exists in the service
   - Check browser console for error messages
   - Ensure API calls are completing successfully

5. **Text-to-Speech Issues**:
   - Verify ElevenLabs API key if using enhanced TTS
   - Check browser permissions for audio playback
   - Try the "Test TTS" button in the app

### Debug Mode

Enable debug logging by adding to your `.env` file:
```env
REACT_APP_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- GMI Cloud for providing the AI capabilities
- Lucide React for the beautiful icons
- The influential leaders whose personalities inspire this application 