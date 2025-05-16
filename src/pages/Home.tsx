import { Link } from "react-router-dom";
import { Check, Globe, Mic, Type, Volume2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import AudioRecorder, {
  TranscriptionResult,
} from "../components/AudioRecorder";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [transcription, setTranscription] = useState<string>("");

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    setTranscription(result.text);
  };

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero section */}
      <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Record, Transcribe and Speak in{" "}
            <span className="text-[#075E54] dark:text-[#25D366] font-extrabold">
              Ghanaian Languages
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-200 mb-8">
            TalkGhana helps you record audio, transcribe, and generate speech in
            local Ghanaian languages using advanced AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white text-lg px-8 py-3 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#075E54] to-[#25D366] rounded-lg blur-lg opacity-50 dark:opacity-70"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-[#075E54] dark:bg-[#075E54] text-white p-4">
                <h3 className="text-lg font-medium">Audio Recording</h3>
              </div>
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <AudioRecorder
                    onTranscriptionComplete={handleTranscriptionComplete}
                  />
                </div>
                {transcription && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Transcription:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {transcription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 -mx-4 px-4 rounded-xl shadow-inner">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
            Powerful tools to help you capture and transcribe speech in Ghanaian
            languages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 bg-[#075E54]/10 dark:bg-[#25D366]/20 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Mic size={24} className="text-[#075E54] dark:text-[#25D366]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Audio Recording
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Record high-quality audio directly from your browser with our
              easy-to-use interface.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 bg-[#075E54]/10 dark:bg-[#25D366]/20 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Type size={24} className="text-[#075E54] dark:text-[#25D366]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              AI Transcription
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically transcribe your recordings with our advanced AI
              model optimized for Ghanaian languages.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 bg-[#075E54]/10 dark:bg-[#25D366]/20 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Volume2
                size={24}
                className="text-[#075E54] dark:text-[#25D366]"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Text to Speech
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Convert text to natural-sounding speech in multiple Ghanaian
              languages with different voice options.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 bg-[#075E54]/10 dark:bg-[#25D366]/20 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Globe size={24} className="text-[#075E54] dark:text-[#25D366]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Multiple Languages
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Support for multiple Ghanaian languages, including Twi, Ga, Ewe,
              Dagbani, and more.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[#075E54] text-white rounded-xl p-8 md:p-12 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg opacity-90 mb-6">
              Join thousands of users who are already using TalkGhana to record
              and transcribe.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check size={20} className="mr-2 text-[#25D366]" />
                <span>Free account with basic features</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="mr-2 text-[#25D366]" />
                <span>No credit card required</span>
              </li>
              <li className="flex items-center">
                <Check size={20} className="mr-2 text-[#25D366]" />
                <span>Upgrade anytime for more features</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-auto">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn bg-white text-[#075E54] hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 text-lg px-8 py-3 w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn bg-white text-[#075E54] hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 text-lg px-8 py-3 w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign Up for Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
