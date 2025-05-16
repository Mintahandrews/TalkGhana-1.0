import React, { useState } from "react";
import axios from "axios";

const TTSPage = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/tts",
        { text },
        {
          responseType: "blob",
        }
      );

      const audioBlob = new Blob([response.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setError("Failed to convert text to speech. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tts-container">
      <h1>Text to Speech</h1>
      <p>Enter text below and convert it to speech</p>

      <div className="tts-input-area">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          rows={6}
          className="tts-textarea"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleTextToSpeech}
        disabled={isLoading || !text.trim()}
        className="tts-button"
      >
        {isLoading ? "Converting..." : "Convert to Speech"}
      </button>
    </div>
  );
};

export default TTSPage;
