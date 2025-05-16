/**
 * Text-to-Speech Service for Ghanaian Languages
 * Connects to GhanaNLP models to generate speech in Ghanaian languages
 */

import localforage from "localforage";
import axios from "axios";

// Supported languages
export type GhanaLanguage = "twi" | "ga" | "ewe" | "hausa" | "dagbani";

// Voice profiles for each language
export interface VoiceProfile {
  id: string;
  name: string;
  gender: "male" | "female";
  language: GhanaLanguage;
  description: string;
  sampleUrl?: string;
}

// TTS options
export interface TTSOptions {
  language: GhanaLanguage;
  voiceId: string;
  speed: number;
  pitch?: number;
  volume?: number;
}

// TTS cache setup
const ttsCache = localforage.createInstance({
  name: "tts-cache",
  description: "Cache for TTS audio data",
});

// Available voice profiles
export const voiceProfiles: VoiceProfile[] = [
  // Twi voices
  {
    id: "twi-kofi",
    name: "Kofi",
    gender: "male",
    language: "twi",
    description: "Deep, authoritative male voice with Ashanti accent",
  },
  {
    id: "twi-ama",
    name: "Ama",
    gender: "female",
    language: "twi",
    description: "Warm, friendly female voice with Akuapem accent",
  },

  // Ga voices
  {
    id: "ga-nii",
    name: "Nii",
    gender: "male",
    language: "ga",
    description: "Clear, authoritative male voice",
  },
  {
    id: "ga-naa",
    name: "Naa",
    gender: "female",
    language: "ga",
    description: "Articulate, pleasant female voice",
  },

  // Ewe voices
  {
    id: "ewe-kwami",
    name: "Kwami",
    gender: "male",
    language: "ewe",
    description: "Strong male voice with authentic Ewe tone",
  },
  {
    id: "ewe-afi",
    name: "Afi",
    gender: "female",
    language: "ewe",
    description: "Gentle female voice with clear pronunciation",
  },

  // Hausa voices
  {
    id: "hausa-ibrahim",
    name: "Ibrahim",
    gender: "male",
    language: "hausa",
    description: "Rich, deep male voice with traditional accent",
  },
  {
    id: "hausa-fatima",
    name: "Fatima",
    gender: "female",
    language: "hausa",
    description: "Smooth, expressive female voice",
  },

  // Dagbani voices
  {
    id: "dagbani-abdul",
    name: "Abdul",
    gender: "male",
    language: "dagbani",
    description: "Authentic male voice with clear diction",
  },
  {
    id: "dagbani-amina",
    name: "Amina",
    gender: "female",
    language: "dagbani",
    description: "Melodic female voice with natural flow",
  },
];

// GhanaNLP API endpoints
const GHANA_NLP_API_BASE = "https://translation-api.ghananlp.org/tts/v1";

export interface Speaker {
  id: string;
  name: string;
  language: string;
  gender: "male" | "female";
}

class TTSService {
  private apiKey: string;
  private speakers: Speaker[] = [];
  private useMockData: boolean;

  constructor() {
    this.apiKey = import.meta.env.VITE_GHANA_NLP_API_KEY;
    this.useMockData =
      !this.apiKey || this.apiKey === "your_ghananlp_api_key_here";

    if (!this.apiKey && !this.useMockData) {
      throw new Error(
        "GhanaNLP API key is required. Please set VITE_GHANA_NLP_API_KEY in your .env file"
      );
    }

    // Use top-level await in modern browsers/environments
    // If not supported, the speakers will load asynchronously
    this.loadSpeakers().catch((err) => {
      console.error("Failed to load initial speakers data:", err);
    });
  }

  // Mock data for speakers - expanded to include all supported languages
  private getMockSpeakers(): Speaker[] {
    return [
      // Twi speakers
      { id: "twi-male-1", name: "Kofi", language: "twi", gender: "male" },
      { id: "twi-female-1", name: "Ama", language: "twi", gender: "female" },
      { id: "twi-male-2", name: "Kwame", language: "twi", gender: "male" },

      // Ga speakers
      { id: "ga-male-1", name: "Nii", language: "ga", gender: "male" },
      { id: "ga-female-1", name: "Naa", language: "ga", gender: "female" },

      // Ewe speakers
      { id: "ewe-male-1", name: "Kwami", language: "ewe", gender: "male" },
      { id: "ewe-female-1", name: "Afi", language: "ewe", gender: "female" },

      // Hausa speakers
      {
        id: "hausa-male-1",
        name: "Ibrahim",
        language: "hausa",
        gender: "male",
      },
      {
        id: "hausa-female-1",
        name: "Fatima",
        language: "hausa",
        gender: "female",
      },

      // Dagbani speakers
      {
        id: "dagbani-male-1",
        name: "Abdul",
        language: "dagbani",
        gender: "male",
      },
      {
        id: "dagbani-female-1",
        name: "Amina",
        language: "dagbani",
        gender: "female",
      },
    ];
  }

  private async loadSpeakers() {
    if (this.useMockData) {
      console.log("Using mock TTS data instead of API calls");
      this.speakers = this.getMockSpeakers();
      return;
    }

    try {
      const response = await axios.get(`${GHANA_NLP_API_BASE}/speakers`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 10000, // 10 second timeout for API response
      });

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        this.speakers = response.data;
        console.log(`Loaded ${this.speakers.length} speakers from API`);
      } else {
        console.warn(
          "API returned empty speakers data, falling back to mock data"
        );
        this.speakers = this.getMockSpeakers();
      }
    } catch (error) {
      console.error("Error loading speakers:", error);
      console.log("Falling back to mock speakers data");
      this.speakers = this.getMockSpeakers();

      // If it's an authentication error, switch to mock mode permanently
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn("API authentication failed. Switching to mock mode.");
        this.useMockData = true;
      }
    }
  }

  async getSpeakers(): Promise<Speaker[]> {
    if (this.speakers.length === 0) {
      await this.loadSpeakers();
    }
    return this.speakers;
  }

  async textToSpeech(text: string, speakerId: string): Promise<Blob> {
    if (this.useMockData) {
      // Generate a mock audio blob with pattern based on text length
      const sampleRate = 44100;
      const seconds = Math.min(Math.max(text.length / 10, 1), 10); // 1-10 seconds based on text length
      const audioCtx = new AudioContext();
      const buffer = audioCtx.createBuffer(1, sampleRate * seconds, sampleRate);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      // Create some pattern in the mock audio instead of pure silence
      const data = buffer.getChannelData(0);
      const frequency = 0.1; // Pattern frequency

      for (let i = 0; i < data.length; i++) {
        // Generate a very quiet sine wave pattern (almost silent)
        if (i % 22050 < 5000) {
          // Short bursts to simulate speech
          data[i] = Math.sin(i * frequency) * 0.01; // Very low volume
        } else {
          data[i] = 0; // Silence between "words"
        }
      }

      // Create audio blob
      const offlineCtx = new OfflineAudioContext(
        1,
        sampleRate * seconds,
        sampleRate
      );
      const mockSource = offlineCtx.createBufferSource();
      mockSource.buffer = buffer;
      mockSource.connect(offlineCtx.destination);
      mockSource.start();

      const audioBuffer = await offlineCtx.startRendering();
      const blob = await this.audioBufferToBlob(audioBuffer);

      console.log(
        `Mock TTS: Generated audio pattern for text: "${text}" (${seconds.toFixed(
          1
        )}s)`
      );
      return blob;
    }

    try {
      // Add timeout to prevent hanging requests
      const response = await axios.post(
        `${GHANA_NLP_API_BASE}/synthesize`,
        {
          text,
          speaker_id: speakerId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: "blob",
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      if (!response.data || response.data.size === 0) {
        throw new Error("Received empty response from API");
      }

      return new Blob([response.data], { type: "audio/mpeg" });
    } catch (error) {
      console.error("Error converting text to speech:", error);

      if (axios.isAxiosError(error)) {
        // Handle specific API errors with more descriptive messages
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const status = error.response.status;
          if (status === 401) {
            throw new Error("API authentication failed: Invalid API key");
          } else if (status === 429) {
            throw new Error("API rate limit exceeded: Too many requests");
          } else if (status >= 500) {
            throw new Error("GhanaNLP server error: Please try again later");
          } else {
            throw new Error(
              `API error: ${error.response.statusText || status}`
            );
          }
        } else if (error.request) {
          // The request was made but no response was received
          if (error.code === "ECONNABORTED") {
            throw new Error(
              "Request timed out: The server took too long to respond"
            );
          } else {
            throw new Error("Network error: Could not connect to the API");
          }
        } else {
          // Something happened in setting up the request
          throw new Error(`Configuration error: ${error.message}`);
        }
      }

      throw new Error(
        "Failed to convert text to speech: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  // Helper method to convert AudioBuffer to Blob
  private async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const wav = this.audioBufferToWav(audioBuffer);
    return new Blob([wav], { type: "audio/wav" });
  }

  // Convert AudioBuffer to WAV format
  private audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels = [];
    let pos = 0;

    // Extract channels
    for (let i = 0; i < numOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    // Write WAV header
    this.setUint32(view, pos, 0x52494646); // 'RIFF'
    pos += 4;
    this.setUint32(view, pos, 36 + length, true); // file size
    pos += 4;
    this.setUint32(view, pos, 0x57415645); // 'WAVE'
    pos += 4;
    this.setUint32(view, pos, 0x666d7420); // 'fmt '
    pos += 4;
    this.setUint32(view, pos, 16, true); // format chunk length
    pos += 4;
    this.setUint16(view, pos, 1, true); // PCM format
    pos += 2;
    this.setUint16(view, pos, numOfChannels, true); // channels
    pos += 2;
    this.setUint32(view, pos, audioBuffer.sampleRate, true); // sample rate
    pos += 4;
    this.setUint32(view, pos, audioBuffer.sampleRate * numOfChannels * 2, true); // byte rate
    pos += 4;
    this.setUint16(view, pos, numOfChannels * 2, true); // block align
    pos += 2;
    this.setUint16(view, pos, 16, true); // bits per sample
    pos += 2;
    this.setUint32(view, pos, 0x64617461); // 'data'
    pos += 4;
    this.setUint32(view, pos, length, true); // data chunk length
    pos += 4;

    // Write interleaved audio data
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numOfChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i])); // clamp
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        this.setInt16(view, pos, int16, true);
        pos += 2;
      }
    }

    return buffer;
  }

  // Helper methods for writing data
  private setUint16(
    view: DataView,
    offset: number,
    value: number,
    littleEndian: boolean = false
  ): void {
    view.setUint16(offset, value, littleEndian);
  }

  private setUint32(
    view: DataView,
    offset: number,
    value: number,
    littleEndian: boolean = false
  ): void {
    view.setUint32(offset, value, littleEndian);
  }

  private setInt16(
    view: DataView,
    offset: number,
    value: number,
    littleEndian: boolean = false
  ): void {
    view.setInt16(offset, value, littleEndian);
  }

  // Helper method to play audio
  async playAudio(audioBlob: Blob): Promise<void> {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play();
    });
  }
}

export const ttsService = new TTSService();

// Export the textToSpeech function for direct use
export const textToSpeech = async (
  text: string,
  speakerId: string
): Promise<Blob> => {
  return ttsService.textToSpeech(text, speakerId);
};

/**
 * Get available voices for a specific language
 */
export const getVoicesForLanguage = (
  language: GhanaLanguage
): VoiceProfile[] => {
  return voiceProfiles.filter((voice) => voice.language === language);
};

/**
 * Get voice profile by ID
 */
export const getVoiceById = (voiceId: string): VoiceProfile | undefined => {
  return voiceProfiles.find((voice) => voice.id === voiceId);
};

/**
 * Clear TTS cache
 */
export const clearTTSCache = async (): Promise<void> => {
  await ttsCache.clear();
};

// Display labels for supported languages
export const languageLabels: Record<GhanaLanguage, string> = {
  twi: "Twi",
  ga: "Ga",
  ewe: "Ewe",
  hausa: "Hausa",
  dagbani: "Dagbani",
};
