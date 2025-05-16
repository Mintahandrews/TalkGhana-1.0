const API_URL = "http://localhost:5000/api";

export const textToSpeech = async (text) => {
  try {
    const response = await fetch(`${API_URL}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to convert text to speech");
    }

    return response.blob();
  } catch (error) {
    console.error("TTS API error:", error);
    throw error;
  }
};
