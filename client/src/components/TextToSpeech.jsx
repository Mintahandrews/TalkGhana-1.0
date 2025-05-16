import React, { useState } from "react";
import { textToSpeech } from "../services/api";

const TextToSpeech = ({ text }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSpeak = async () => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      const audioBlob = await textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading || !text.trim()}
      className="tts-button"
    >
      {isLoading ? "Speaking..." : "Speak Text"}
    </button>
  );
};

export default TextToSpeech;
