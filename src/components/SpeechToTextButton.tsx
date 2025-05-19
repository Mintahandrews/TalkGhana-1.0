import { useState, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { getSupportedLanguages, type LanguageOption } from '../services/asr';

export function SpeechToTextButton({
  onTranscriptionComplete,
  className = '',
  defaultLanguage = 'en',
}: {
  onTranscriptionComplete?: (text: string) => void;
  className?: string;
  defaultLanguage?: string;
}) {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  // Load supported languages on component mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const supportedLanguages = await getSupportedLanguages();
        setLanguages(supportedLanguages);
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    };

    loadLanguages();
  }, []);
  const {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useSpeechToText({
    language: selectedLanguage,
    onTranscriptionEnd: (text) => {
      if (onTranscriptionComplete) {
        onTranscriptionComplete(text);
      }
    },
  });

  // Handle click outside of language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLanguageSelect && !target.closest('.language-selector')) {
        setShowLanguageSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelect]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      resetTranscript();
      startRecording();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLanguageSelect(!showLanguageSelect)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LanguageIcon className="h-4 w-4 mr-1" aria-hidden="true" />
            {languages.find(lang => lang.code === selectedLanguage)?.nativeName || 'Language'}
          </button>
          
          {showLanguageSelect && (
            <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setSelectedLanguage(language.code);
                      setShowLanguageSelect(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedLanguage === language.code
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex justify-between items-center">
                      <span>{language.nativeName}</span>
                      <span className="text-xs text-gray-500">{language.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleToggleRecording}
          disabled={isTranscribing}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isRecording ? (
            <>
              <StopIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Stop
            </>
          ) : (
            <>
              <MicrophoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              {isTranscribing ? 'Transcribing...' : 'Speak'}
            </>
          )}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {isTranscribing && (
        <div className="mt-2 text-sm text-gray-500">
          Transcribing your speech...
        </div>
      )}
    </div>
  );
}
