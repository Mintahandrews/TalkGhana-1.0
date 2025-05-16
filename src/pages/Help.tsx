import { Book, FileText, CircleHelp, Lightbulb, MessageCircle, Play, Star, Youtube } from 'lucide-react';

const Help = () => {
  // FAQ data
  const faqs = [
    {
      question: "What is TalkGhana?",
      answer: "TalkGhana is an audio recording and transcription platform specifically designed for Ghanaian languages. It helps users record, transcribe, and translate content in languages like Twi, Ga, Ewe, Hausa, and Dagbani."
    },
    {
      question: "Which languages are supported?",
      answer: "Currently, TalkGhana supports Twi, Ga, Ewe, Hausa, and Dagbani. We're constantly working to add more Ghanaian languages to our platform."
    },
    {
      question: "How accurate is the transcription?",
      answer: "Our transcription accuracy varies by language. For well-represented languages like Twi, accuracy is typically between 85-95%. For languages with fewer training examples, accuracy may be lower but continuously improves as our models learn from user corrections."
    },
    {
      question: "Can I use TalkGhana offline?",
      answer: "Some features of TalkGhana work offline, like audio recording. However, transcription and translation features require an internet connection to process through our language models."
    },
    {
      question: "How can I save my transcriptions?",
      answer: "All transcriptions are automatically saved to your account. You can also export them as text files, or add specific phrases to your personal phrase bank for future reference."
    }
  ];
  
  // Tutorial sections
  const tutorials = [
    { 
      title: "Getting Started", 
      icon: <Play className="text-blue-500" size={32} />,
      description: "Learn the basics of TalkGhana and set up your account"
    },
    { 
      title: "Audio Recording", 
      icon: <Youtube className="text-red-500" size={32} />,
      description: "How to record high-quality audio in any Ghanaian language"
    },
    { 
      title: "Transcription Guide", 
      icon: <FileText className="text-green-500" size={32} />,
      description: "Convert your recordings to text with accurate transcriptions"
    },
    { 
      title: "Text-to-Speech", 
      icon: <MessageCircle className="text-purple-500" size={32} />,
      description: "Generate natural-sounding speech from text inputs"
    },
    { 
      title: "Phrase Bank Usage", 
      icon: <Book className="text-orange-500" size={32} />,
      description: "Organize and manage your saved phrases and translations"
    },
    { 
      title: "Advanced Features", 
      icon: <Star className="text-yellow-500" size={32} />,
      description: "Explore premium features and customization options"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CircleHelp className="text-[#075E54] dark:text-green-400" size={28} />
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Learn how to use TalkGhana and get answers to your questions
        </p>
      </div>
      
      {/* Quick start guide */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-start">
          <div className="hidden sm:block p-3 bg-[#075E54]/10 rounded-lg mr-4">
            <Lightbulb size={28} className="text-[#075E54] dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Start Guide</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              New to TalkGhana? Here's how to get started in 3 simple steps:
            </p>
            <ol className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#075E54] text-white font-medium text-sm">1</span>
                <span>Navigate to the <strong>ASR Interface</strong> page to record or upload audio</span>
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#075E54] text-white font-medium text-sm">2</span>
                <span>Select your language and click the microphone icon to start recording</span>
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#075E54] text-white font-medium text-sm">3</span>
                <span>Once finished, the audio will be transcribed automatically</span>
              </li>
            </ol>
            <div className="mt-4">
              <button className="px-4 py-2 bg-[#075E54] text-white rounded-lg hover:bg-[#064c44] transition-colors flex items-center gap-1">
                <Play size={16} />
                Watch Video Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video tutorials */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Video Tutorials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {tutorials.map((tutorial, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              {tutorial.icon}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">{tutorial.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{tutorial.description}</p>
            <button className="text-[#075E54] dark:text-green-400 font-medium hover:underline flex items-center">
              Watch Tutorial
              <Play size={16} className="ml-1" />
            </button>
          </div>
        ))}
      </div>
      
      {/* FAQ section */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact support */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Need More Help?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you couldn't find the answer to your question, our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 px-4 py-2 bg-[#075E54] text-white rounded-lg hover:bg-[#064c44] transition-colors flex items-center justify-center gap-1">
            <MessageCircle size={18} />
            Contact Support
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1">
            <Book size={18} />
            Browse Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;
