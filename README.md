# 🇬🇭 TalkGhana

TalkGhana is an AI-powered conversational platform designed for Ghanaian languages with speech recognition, text-to-speech, and WhatsApp integration capabilities. Built by team DevForChange(DFC) for the [Tek Yerema Pa Hackathon](https://www.tekyeremapahackathon.com/).

## 🌟 Features

- **Speech Recognition (ASR)**: Transcribe spoken Ghanaian languages to text
  - Supports Twi, Ga, Ewe, Hausa, and Dagbani
  - Real-time transcription
  - High accuracy with native language models

- **Text-to-Speech (TTS)**: Convert text to natural-sounding speech
  - Supports multiple Ghanaian languages (Twi, Ewe, Hausa, Dagbani, Ga)
  - Adjustable speech rate and volume
  - Downloadable audio output
  - Offline support after initial download

- **WhatsApp Integration**: Share audio and text messages via WhatsApp
- **Phrase Bank**: Store and organize frequently used phrases
- **Dark/Light Mode**: User-friendly interface with theme preferences
- **Mobile-Friendly**: Responsive design for all devices

## 🚀 Key Technologies

- **Frontend**: React.js & TypeScript
- **Styling**: Tailwind CSS
- **AI Models**:
  - Hugging Face MMS (Massively Multilingual Speech) for TTS
  - Custom fine-tuned models for Ghanaian languages
- **Audio Processing**: Web Audio API
- **State Management**: React Hooks & Context API
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)
- Modern web browser with Web Audio API support
- Internet connection (required for initial model download)

## 💻 Installation

1. Clone the repository

```bash
git clone https://github.com/DevForChange/TalkGhana.git
cd TalkGhana
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```
# API keys for services
VITE_HUGGINGFACE_TOKEN=your_huggingface_token_here
```

### API Keys

- **VITE_HUGGINGFACE_TOKEN**: Get from [Hugging Face](https://huggingface.co/settings/tokens)

## 🔊 Speech Recognition Configuration

To use the speech recognition (ASR) features, you need to configure a Hugging Face API token:

1. Create a Hugging Face account at [huggingface.co](https://huggingface.co) if you don't have one
2. Generate an API token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Copy your token and add it to the `.env` file

## ▶️ Running the Application

1. Start the development server

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
```

## 💡 About Team DevForChange(DFC)

We are a team of developers passionate about creating technology solutions that address local challenges in Ghana. Our mission is to bridge language barriers through innovative applications.

## 📜 License

MIT
