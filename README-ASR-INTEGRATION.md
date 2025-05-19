# Speech-to-Text (ASR) Integration

This document explains how to set up and use the Speech-to-Text (ASR) functionality in the TalkGhana application.

## Prerequisites

1. Node.js (v16 or later)
2. npm or yarn
3. A Hugging Face account and API key

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Hugging Face API key to the `.env` file

3. **Start the Development Server**
   ```bash
   # Start the frontend
   npm run dev
   
   # In a separate terminal, start the backend
   cd server
   node index.js
   ```

## Using the Speech-to-Text Component

Import and use the `SpeechToTextButton` component in your React components:

```tsx
import { SpeechToTextButton } from './components/SpeechToTextButton';

function MyComponent() {
  const handleTranscription = (text: string) => {
    console.log('Transcribed text:', text);
    // Handle the transcribed text
  };

  return (
    <div>
      <h1>Speech to Text Demo</h1>
      <SpeechToTextButton onTranscriptionComplete={handleTranscription} />
    </div>
  );
}
```

## API Endpoints

- `POST /api/asr/transcribe` - Transcribe audio file
  - Accepts: Multipart form with `audio` field containing the audio file
  - Returns: JSON with `{ text: string, language?: string, duration?: number }`

## Error Handling

- If the API key is missing or invalid, the server will return a 401 Unauthorized response
- If there's an error during transcription, the server will return a 500 error with details
- The client-side hook (`useSpeechToText`) will throw an error if there are any issues with the microphone access or API call

## Troubleshooting

1. **Microphone Access Issues**
   - Ensure your browser has permission to access the microphone
   - Try in a different browser if the issue persists

2. **API Errors**
   - Verify your Hugging Face API key is correct
   - Check your internet connection
   - Check the server logs for detailed error messages

3. **CORS Issues**
   - Make sure the frontend is making requests to the correct backend URL
   - In development, ensure the backend is running on the port specified in your `.env` file
