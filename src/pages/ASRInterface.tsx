import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import AudioRecorder, {
  TranscriptionResult,
} from "../components/AudioRecorder";
import AudioUploader from "../components/AudioUploader";
import { BookMarked, ExternalLink, Save, Info, Share2 } from "lucide-react";
import { toast } from "sonner";
import { asrService } from "../services/asrService";

const ASRInterface = () => {
  const [transcription, setTranscription] =
    useState<TranscriptionResult | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [selectedTab, setSelectedTab] = useState("record");

  // Check if the ASR service is available
  useEffect(() => {
    setApiAvailable(asrService.isAvailable());
  }, []);

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    setTranscription(result);

    // Show success toast if we got a non-empty transcription
    if (
      result.text &&
      !result.text.includes("unavailable") &&
      !result.text.includes("failed")
    ) {
      toast.success("Audio transcribed successfully!");
    }
  };

  const handleSaveToBank = () => {
    if (!transcription) return;

    // Logic to save to phrase bank would go here
    // For now, just show a toast
    toast.success("Phrase saved to bank");
  };

  const handleExport = () => {
    if (!transcription) return;

    // Create a text file for download
    const blob = new Blob([transcription.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Transcription exported to text file");
  };

  const handleCopyToClipboard = () => {
    if (!transcription) return;

    navigator.clipboard
      .writeText(transcription.text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy text"));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Speech to Text
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Convert speech to text in various Ghanaian languages
          </p>
        </div>
      </div>

      {!apiAvailable && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">
              API Configuration Required
            </h3>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
              The speech recognition service requires a valid Hugging Face
              token. Please add your token to the .env file as
              VITE_HUGGINGFACE_TOKEN.
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900 dark:hover:text-amber-200 ml-1"
              >
                Get a token here
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Tabs
            defaultValue="record"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="record">Record Audio</TabsTrigger>
                <TabsTrigger value="upload">Upload Audio</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="record" className="mt-0 p-4 pt-0">
              <AudioRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
                showTranslateOption={true}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-0 p-4 pt-0">
              <AudioUploader
                onTranscriptionComplete={(result) => {
                  // Convert WhisperTranscription to our TranscriptionResult format
                  const convertedResult: TranscriptionResult = {
                    text: result.text,
                    language: result.language || "auto",
                    confidence: result.confidence,
                    segments: result.segments,
                  };
                  setTranscription(convertedResult);
                }}
                showYouTubeOption={true}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transcription
            </h2>

            {transcription &&
              transcription.text &&
              !transcription.text.includes("unavailable") &&
              !transcription.text.includes("failed") && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center space-x-1 text-sm px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  <button
                    onClick={handleSaveToBank}
                    className="flex items-center space-x-1 text-sm px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors"
                    title="Save to phrase bank"
                  >
                    <BookMarked size={14} />
                    <span className="hidden sm:inline">Save</span>
                  </button>

                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-1 text-sm px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                    title="Export as text file"
                  >
                    <Save size={14} />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              )}
          </div>

          {transcription ? (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {transcription.text}
                </p>
              </div>

              {transcription.language && transcription.language !== "auto" && (
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Language:{" "}
                    <span className="font-medium">
                      {transcription.language}
                    </span>
                  </div>
                  {transcription.confidence !== undefined && (
                    <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      Confidence:{" "}
                      <span className="font-medium">
                        {(transcription.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <ExternalLink
                  size={24}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                No Transcription Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                {selectedTab === "record"
                  ? "Click the microphone button to start recording"
                  : "Upload an audio file to see the transcription results here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ASRInterface;
