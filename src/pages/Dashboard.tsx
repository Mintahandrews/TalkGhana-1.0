import { Link } from 'react-router-dom';
import { BookOpen, Hand, Mic, Settings, Volume2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TalkGhana</h1>
          <p className="text-gray-600 dark:text-gray-300">Your Ghanaian language assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/asr" className="transition-transform hover:scale-105">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Speech to Text</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Convert spoken words to written text with our accurate transcription service</p>
              <Badge variant="info">New API</Badge>
            </div>
          </Card>
        </Link>

        <Link to="/tts" className="transition-transform hover:scale-105">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Volume2 className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Text to Speech</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Convert your text into natural sounding speech in multiple languages</p>
              <Badge variant="success">Multiple Voices</Badge>
            </div>
          </Card>
        </Link>

        <Link to="/phrases" className="transition-transform hover:scale-105">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Phrase Bank</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Store and organize your frequently used phrases for quick access</p>
              <Badge variant="default">Save & Reuse</Badge>
            </div>
          </Card>
        </Link>

        <Link to="/settings" className="transition-transform hover:scale-105">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Settings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Customize your app preferences and account settings</p>
            </div>
          </Card>
        </Link>

        <Link to="/help" className="transition-transform hover:scale-105">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                <Hand className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Hand & Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Get assistance and learn how to use all features</p>
              <Badge variant="warning">Tutorials</Badge>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
