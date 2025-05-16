import TextToSpeech from '../components/TextToSpeech';

const TTSInterface = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Text to Speech</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Convert text to natural speech in Ghanaian languages
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <TextToSpeech defaultLanguage="twi" defaultText="" />
      </div>
    </div>
  );
};

export default TTSInterface;
