import { useState, useEffect } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { ttsService } from "../services/ttsService";

interface Speaker {
  id: string;
  name: string;
  language: string;
  gender: "male" | "female";
}

const TTSInterface = () => {
  const [text, setText] = useState("");
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpeakers = async () => {
      try {
        const availableSpeakers = await ttsService.getSpeakers();
        setSpeakers(availableSpeakers);
        if (availableSpeakers.length > 0) {
          setSelectedSpeaker(availableSpeakers[0].id);
        }
      } catch (err) {
        setError("Failed to load available speakers");
        console.error("Error loading speakers:", err);
      }
    };

    loadSpeakers();
  }, []);

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert to speech");
      return;
    }

    if (!selectedSpeaker) {
      setError("Please select a speaker");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const audioBlob = await ttsService.textToSpeech(text, selectedSpeaker);
      await ttsService.playAudio(audioBlob);
    } catch (err) {
      setError("Failed to convert text to speech. Please try again.");
      console.error("TTS error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Text to Speech
        </h2>

        <div className="space-y-4">
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
                  {speaker.name} ({speaker.language} - {speaker.gender})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter Text
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] dark:bg-gray-700 dark:text-white"
              placeholder="Enter text to convert to speech..."
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleTextToSpeech}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#075E54] hover:bg-[#064e45] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Convert to Speech
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TTSInterface;
