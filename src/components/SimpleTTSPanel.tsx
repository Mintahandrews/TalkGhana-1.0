import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCw, Download } from 'lucide-react';
// Import UI components with correct paths
// Import UI components with consistent casing
import { Slider } from './ui/Slider';
import { Button } from './ui/Button';

// Create a simple textarea component since it's not in the UI directory
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// Create a simple select component since it's not in the UI directory
const Select = ({ children, value, onValueChange, ...props }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  )
);
SelectTrigger.displayName = 'SelectTrigger';

// Define props for SelectValue
interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
}

// Update SelectValue to handle placeholder and children
const SelectValue: React.FC<SelectValueProps> = ({ children, placeholder }) => (
  <span className="text-left">{children || placeholder || 'Select...'}</span>
);

// Add display name for better debugging
SelectValue.displayName = 'SelectValue';

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
    {children}
  </div>
);

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-current" />
    </span>
    <span>{children}</span>
  </div>
));
SelectItem.displayName = 'SelectItem';
import { toast } from 'sonner';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { downloadAudio, generateTTSFilename } from '../services/tts';

// Define supported languages
const SUPPORTED_LANGUAGES = [
  { value: 'twi', label: 'Twi' },
  { value: 'ewe', label: 'Ewe' },
  { value: 'hausa', label: 'Hausa' },
  { value: 'dag', label: 'Dagbani' },
  { value: 'ga', label: 'Ga' },
  { value: 'en', label: 'English' },
] as const;

type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['value'];

const SimpleTTSPanel: React.FC = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('twi');
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { 
    speak, 
    stop: stopPlayback, 
    isLoading, 
    error
  } = useTextToSpeech();

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  // Handle text-to-speech
  const handleSpeak = useCallback(async () => {
    if (!text.trim()) {
      toast.warning('Please enter some text to convert to speech');
      return;
    }

    try {
      setIsPlaying(true);
      await speak(text, { language });
    } catch (err) {
      console.error('Error in TTS:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      toast.error(errorMessage);
      setIsPlaying(false);
    }
  }, [text, language, speak]);

  // Handle stop
  const handleStop = useCallback(() => {
    stopPlayback();
    setIsPlaying(false);
  }, [stopPlayback]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!text.trim()) {
      toast.warning('No text to convert to speech');
      return;
    }

    try {
      const result = await speak(text, { language });
      
      const filename = generateTTSFilename(language);
      downloadAudio(result.audioBuffer, filename);
      toast.success('Audio download started');
    } catch (err) {
      console.error('Error downloading TTS audio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download audio';
      toast.error(errorMessage);
    }
  }, [text, language, speak]);

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value as LanguageCode);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  // Handle slider change event
  const handleSliderChange = (value: number[]) => {
    handleVolumeChange(value);
  };

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setVolume(1.0);
    } else {
      setVolume(0);
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Text to Speech
      </h2>
      
      {/* Language Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Language
        </label>
        <Select onValueChange={handleLanguageChange} value={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter Text
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="min-h-[120px]"
        />
      </div>
      
      {/* Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={isPlaying ? handleStop : handleSpeak}
            disabled={isLoading || !text.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <RotateCw className="w-4 h-4 mr-2 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Processing...' : isPlaying ? 'Stop' : 'Play'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isLoading || !text.trim()}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        
        {/* Volume Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Volume
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMuteToggle}
              disabled={isLoading}
              className="p-2"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={handleSliderChange}
            className="flex-1"
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default SimpleTTSPanel;
