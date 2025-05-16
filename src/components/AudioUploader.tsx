import { useState, useRef } from 'react';
import { FileUp, Loader, Send, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { transcribeAudio, transcribeYouTube, selectOptimalEndpoint, type WhisperTranscription, type WhisperTranslation } from '../utils/whisperApi';
import { validateAudioFile } from '../services/audioService';

interface AudioUploaderProps {
  onTranscriptionComplete: (transcription: WhisperTranscription | WhisperTranslation) => void;
  language?: string;
  showYouTubeOption?: boolean;
}

const AudioUploader = ({
  onTranscriptionComplete,
  language = 'auto',
  showYouTubeOption = true
}: AudioUploaderProps) => {
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validation = validateAudioFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    setSelectedFile(file);
    toast.success(`${file.name} selected`);
  };

  // Handle file drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-[#075E54]', 'bg-[#075E54]/5');
  };

  // Handle file drag leave
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-[#075E54]', 'bg-[#075E54]/5');
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-[#075E54]', 'bg-[#075E54]/5');
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validation = validateAudioFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    setSelectedFile(file);
    toast.success(`${file.name} selected`);
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Transcribe file
  const handleTranscribeFile = async () => {
    if (!selectedFile) return;
    
    setIsTranscribing(true);
    try {
      // Use upload audio endpoint (1)
      const result = await transcribeAudio(selectedFile, {
        language,
        endpointIndex: 1 // Upload audio endpoint
      });
      
      onTranscriptionComplete(result);
      toast.success('File transcribed successfully!');
    } catch (error) {
      console.error('Transcription error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to transcribe file. Please try again.');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Transcribe Video URL
  const handleTranscribeYouTube = async () => {
    if (!youtubeUrl) {
      toast.error('Please enter a Video URL');
      return;
    }
    
    // Simple Video URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(youtubeUrl)) {
      toast.error('Please enter a valid Video URL');
      return;
    }
    
    setIsTranscribing(true);
    try {
      toast.error('YouTube transcription is not supported by the current API');
      setShowYouTubeInput(false); // Switch back to file upload
    } catch (error) {
      console.error('Video transcription error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to transcribe video. Please try again.');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Toggle Video input
  const toggleYouTubeInput = () => {
    setShowYouTubeInput(!showYouTubeInput);
    if (showYouTubeInput) {
      setYoutubeUrl('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Audio</h2>
      
      {/* File upload area */}
      {!showYouTubeInput && (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center transition-colors duration-200"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center">
                <FileUp size={20} className="text-[#075E54] mr-2" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({Math.round(selectedFile.size / 1024)} KB)
                </span>
              </div>
              <button 
                onClick={clearSelectedFile}
                className="text-gray-500 hover:text-red-500"
                aria-label="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div>
              <FileUp size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop an audio file here, or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary text-sm py-2"
              >
                Select File
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: MP3, WAV, WebM, OGG (Max 25MB)
              </p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />
        </div>
      )}
      
      {/* Video URL input */}
      {showYouTubeInput && (
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter Video URL (e.g., https://www.youtube.com/watch?v=...)"
              className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
            <button
              onClick={handleTranscribeYouTube}
              disabled={isTranscribing || !youtubeUrl}
              className="btn bg-red-600 hover:bg-red-700 text-white rounded-l-none rounded-r-md"
            >
              {isTranscribing ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Video must be public or unlisted, max duration: 15 minutes
          </p>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between mt-4">
        {showYouTubeOption && (
          <button
            onClick={toggleYouTubeInput}
            className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center"
          >
            <Video size={18} className={showYouTubeInput ? "text-red-600 mr-2" : "text-gray-600 mr-2"} />
            {showYouTubeInput ? "Upload File Instead" : "Video URL"}
          </button>
        )}
        
        {!showYouTubeInput && (
          <button
            onClick={handleTranscribeFile}
            disabled={isTranscribing || !selectedFile}
            className={`btn btn-primary ml-auto ${(!selectedFile || isTranscribing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTranscribing ? (
              <>
                <Loader size={20} className="animate-spin mr-2" />
                Transcribing...
              </>
            ) : (
              <>
                <Send size={20} className="mr-2" />
                Transcribe
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioUploader;
