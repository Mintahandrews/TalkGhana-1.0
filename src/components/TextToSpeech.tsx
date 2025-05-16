import { useState, useEffect, useRef } from "react";
import {
  Download,
  Loader,
  Pause,
  Play,
  RotateCcw,
  Square,
  Type,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

import {
  ttsService,
  type GhanaLanguage,
  type Speaker,
  languageLabels,
} from "../services/ttsService";

import {
  AudioPlayer,
  formatTime,
  type PlaybackState,
} from "../services/audioPlaybackService";

interface TextToSpeechProps {
  defaultLanguage?: GhanaLanguage;
  defaultText?: string;
  onTextConverted?: (audioBlob: Blob) => void;
}

const TextToSpeech = ({
  defaultLanguage = "twi",
  defaultText = "",
  onTextConverted,
}: TextToSpeechProps) => {
  // States
  const [language, setLanguage] = useState<GhanaLanguage>(defaultLanguage);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [text, setText] = useState(defaultText);
  const [isConverting, setIsConverting] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Refs
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize audio player
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer({
      volume: volume,
      playbackRate: speed,
    });

    // Set up callbacks
    audioPlayerRef.current.onProgressChange((time, duration) => {
      setPlaybackProgress(time);
      setPlaybackDuration(duration);
    });

    audioPlayerRef.current.onStateChangeEvent((state) => {
      setPlaybackState(state);
    });

    audioPlayerRef.current.onErrorEvent((error) => {
      toast.error(error.message);
    });

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.destroy();
      }
    };
  }, []);

  // Load speakers for selected language
  useEffect(() => {
    const loadSpeakers = async () => {
      try {
        const availableSpeakers = await ttsService.getSpeakers();
        const filteredSpeakers = availableSpeakers.filter(
          (speaker) => speaker.language === language
        );
        setSpeakers(filteredSpeakers);

        // Clear existing audio and reset player when language changes
        if (audioPlayerRef.current) {
          audioPlayerRef.current.stop();
        }
        setAudioBlob(null);
        setPlaybackProgress(0);
        setPlaybackDuration(0);
        setPlaybackState("idle");

        // Set default speaker if available
        if (filteredSpeakers.length > 0) {
          const currentSpeakerStillValid = filteredSpeakers.some(
            (s) => s.id === selectedSpeaker
          );
          if (!currentSpeakerStillValid || !selectedSpeaker) {
            setSelectedSpeaker(filteredSpeakers[0].id);
          }
        } else {
          setSelectedSpeaker("");
        }
      } catch (err) {
        console.error("Error loading speakers:", err);
        toast.error("Failed to load available speakers");
      }
    };

    loadSpeakers();
  }, [language]);

  // Effect to clear audio when selected speaker changes
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
    setAudioBlob(null);
    setPlaybackProgress(0);
    setPlaybackDuration(0);
    setPlaybackState("idle");
  }, [selectedSpeaker]);

  // Handle volume changes
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Handle speed changes
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setPlaybackRate(speed);
    }
  }, [speed]);

  // Convert text to speech
  const handleConvert = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to convert");
      return;
    }

    if (!selectedSpeaker) {
      toast.error("Please select a speaker");
      return;
    }

    // Check if API token is available
    const apiKey = import.meta.env.VITE_GHANA_NLP_API_KEY;
    const usingMock = !apiKey || apiKey === "your_ghananlp_api_key_here";

    setIsConverting(true);
    setAudioBlob(null); // Clear previous audio blob
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop(); // Stop any current playback
    }
    setPlaybackProgress(0);
    setPlaybackDuration(0);

    try {
      // Get audio blob from API or mock
      const blob = await ttsService.textToSpeech(text, selectedSpeaker);
      setAudioBlob(blob);

      // Load audio in player
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.loadAudio(blob);
      }

      // Callback if provided
      if (onTextConverted) {
        onTextConverted(blob);
      }

      if (usingMock) {
        toast.success(
          "Using mock TTS data. Add API key for real speech output."
        );
      } else {
        toast.success("Text converted to speech successfully");
      }
    } catch (error) {
      console.error("Error converting text to speech:", error);
      setAudioBlob(null); // Clear audio blob on error

      if (error instanceof Error) {
        if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          toast.error("API authentication failed. Please check your API key.");
        } else if (
          error.message.includes("429") ||
          error.message.includes("rate limit")
        ) {
          toast.error("API rate limit exceeded. Please try again later.");
        } else if (
          error.message.includes("timeout") ||
          error.message.includes("ECONNABORTED")
        ) {
          toast.error(
            "Request timed out. Please check your internet connection."
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to convert text to speech. Please try again.");
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Playback controls
  const handlePlay = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const handleStop = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Download audio
  const handleDownload = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talkghana-tts-${language}-${new Date().getTime()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset functionality
  const handleReset = () => {
    setText("");
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }
    setAudioBlob(null);
    setPlaybackProgress(0);
    setPlaybackDuration(0);
    setPlaybackState("idle"); // Reset playback state
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    toast.info("TTS reset");
  };

  return (
    <div className="space-y-4">
      {/* Language Selection */}
      <div>
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as GhanaLanguage)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(languageLabels).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Speaker Selection */}
      <div>
        <label
          htmlFor="speaker"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Speaker
        </label>
        <select
          id="speaker"
          value={selectedSpeaker}
          onChange={(e) => setSelectedSpeaker(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] dark:bg-gray-700 dark:text-white"
        >
          {speakers.map((speaker) => (
            <option key={speaker.id} value={speaker.id}>
              {speaker.name} ({speaker.gender})
            </option>
          ))}
        </select>
      </div>

      {/* Text Input */}
      <div>
        <label
          htmlFor="text"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Enter Text
        </label>
        <textarea
          id="text"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] dark:bg-gray-700 dark:text-white"
          placeholder="Enter text to convert to speech..."
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleConvert}
          disabled={isConverting || !text.trim() || !selectedSpeaker}
          className="flex items-center gap-2 bg-[#075E54] hover:bg-[#064e45] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConverting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Type className="w-5 h-5" />
              Convert to Speech
            </>
          )}
        </button>

        {audioBlob && (
          <>
            <button
              onClick={handlePlay}
              disabled={playbackState === "playing"}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Play
            </button>

            <button
              onClick={handlePause}
              disabled={playbackState !== "playing"}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>

            <button
              onClick={handleStop}
              disabled={playbackState === "idle"}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              Download
            </button>

            <button
              onClick={handleToggleMute}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </>
        )}
      </div>

      {/* Playback Progress */}
      {audioBlob && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{formatTime(playbackProgress)}</span>
            <span>{formatTime(playbackDuration)}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#075E54] transition-all duration-200"
              style={{
                width: `${
                  playbackDuration > 0
                    ? (playbackProgress / playbackDuration) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Volume Control */}
      <div className="mt-4">
        <label
          htmlFor="volume"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Volume
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            id="volume"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>

      {/* Speed Control */}
      <div className="mt-4">
        <label
          htmlFor="speed"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Playback Speed
        </label>
        <select
          id="speed"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] dark:bg-gray-700 dark:text-white"
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

export default TextToSpeech;
