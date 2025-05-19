# Text-to-Speech (TTS) Integration

This document provides information about the TTS functionality in the TalkGhana application, which supports multiple Ghanaian languages.

## Supported Languages

- 🇬🇭 Twi (twi)
- 🇬🇭 Ewe (ee)
- 🇳🇬 Hausa (ha) - Also spoken in Ghana
- 🇬🇭 Dagbani (dag)
- 🇬🇭 Ga (ga)
- 🇬🇧 English (en) - Fallback language

## Features

- Real-time text-to-speech conversion
- Adjustable speech rate and volume
- Download audio as WAV files
- Responsive design for all devices
- Offline support after initial model download

## Implementation Details

The TTS system uses Facebook's Massively Multilingual Speech (MMS) models, which provide high-quality speech synthesis for over 1,100 languages, including Ghanaian languages.

### Key Files

- `src/services/tts.ts` - Core TTS service
- `src/hooks/useTextToSpeech.ts` - React hook for TTS functionality
- `src/components/SimpleTTSPanel.tsx` - Ready-to-use TTS UI component

## Usage

### Basic Usage

```tsx
import SimpleTTSPanel from './components/SimpleTTSPanel';

function MyComponent() {
  return (
    <div className="container mx-auto p-4">
      <SimpleTTSPanel />
    </div>
  );
}
```

### Programmatic Usage

```tsx
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function MyComponent() {
  const { speak, stop, isPlaying, isLoading } = useTextToSpeech();
  
  const handleSpeak = async () => {
    await speak('Mema wo akye', { language: 'twi' });
  };
  
  return (
    <div>
      <button onClick={handleSpeak} disabled={isLoading || isPlaying}>
        {isLoading ? 'Processing...' : 'Speak'}
      </button>
      <button onClick={stop} disabled={!isPlaying}>
        Stop
      </button>
    </div>
  );
}
```

## Performance Considerations

- **Initial Load**: The first time a language is used, the model (50-100MB) will be downloaded and cached in the browser's IndexedDB.
- **Memory Usage**: Each model consumes memory. Consider unloading models when not in use in a production environment.
- **Offline Support**: Once downloaded, models work offline.

## Error Handling

The TTS service includes comprehensive error handling for:
- Network issues during model download
- Unsupported languages
- Audio playback errors
- Text input validation

## License

This implementation uses Facebook's MMS models, which are available under the MIT License.
