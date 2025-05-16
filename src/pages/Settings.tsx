import { useState } from 'react';
import { BellRing, Eye, EyeOff, Globe, Mic, Moon, Save, Sun, Volume, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

type SettingsSection = 'appearance' | 'language' | 'audio' | 'notifications' | 'privacy';

const Settings = () => {
  const { isDark, toggleTheme, isHighContrast, toggleContrast } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  
  // Audio settings
  const [inputVolume, setInputVolume] = useState(80);
  const [outputVolume, setOutputVolume] = useState(70);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  
  // Language settings
  const [defaultLanguage, setDefaultLanguage] = useState('twi');
  const [showTransliterations, setShowTransliterations] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  
  // Notification settings
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notifyOnTranscriptionComplete, setNotifyOnTranscriptionComplete] = useState(true);
  const [notifyOnError, setNotifyOnError] = useState(true);
  
  // Privacy settings
  const [saveRecordings, setSaveRecordings] = useState(true);
  const [shareAnonymousData, setShareAnonymousData] = useState(false);
  
  // Handle settings save
  const handleSaveSettings = () => {
    // In a real app, this would save to API/database
    // For now, we'll just show a success message
    toast.success('Settings saved successfully');
    
    // Saving to localStorage as a fallback
    localStorage.setItem('talkghana-settings', JSON.stringify({
      audio: {
        inputVolume,
        outputVolume,
        autoGainControl,
        noiseSuppression,
        echoCancellation
      },
      language: {
        defaultLanguage,
        showTransliterations,
        autoDetectLanguage
      },
      notifications: {
        enableNotifications,
        notifyOnTranscriptionComplete,
        notifyOnError
      },
      privacy: {
        saveRecordings,
        shareAnonymousData
      }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize your TalkGhana experience
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid md:grid-cols-[240px_1fr]">
          {/* Settings navigation */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-r border-gray-200 dark:border-gray-700">
            <nav className="space-y-1">
              {[
                { id: 'appearance', label: 'Appearance', icon: <Eye size={18} /> },
                { id: 'language', label: 'Language', icon: <Globe size={18} /> },
                { id: 'audio', label: 'Audio', icon: <Volume2 size={18} /> },
                { id: 'notifications', label: 'Notifications', icon: <BellRing size={18} /> },
                { id: 'privacy', label: 'Privacy', icon: <EyeOff size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#075E54]/10 text-[#075E54] dark:bg-[#075E54]/20 dark:text-green-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings content */}
          <div className="p-6">
            {/* Appearance settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">High Contrast Mode</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Increase contrast for better readability</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isHighContrast}
                          onChange={toggleContrast}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language settings */}
            {activeSection === 'language' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Language</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Default Language</label>
                    <select
                      value={defaultLanguage}
                      onChange={(e) => setDefaultLanguage(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="twi">Twi</option>
                      <option value="ga">Ga</option>
                      <option value="ewe">Ewe</option>
                      <option value="hausa">Hausa</option>
                      <option value="dagbani">Dagbani</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Transliterations</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Show pronunciation guides for Ghanaian languages</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showTransliterations}
                          onChange={() => setShowTransliterations(!showTransliterations)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-detect Language</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically detect language in recordings</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDetectLanguage}
                          onChange={() => setAutoDetectLanguage(!autoDetectLanguage)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audio settings */}
            {activeSection === 'audio' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Audio</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Microphone Volume</label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{inputVolume}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mic size={18} className="text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={inputVolume}
                        onChange={(e) => setInputVolume(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Playback Volume</label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{outputVolume}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {outputVolume === 0 ? (
                        <VolumeX size={18} className="text-gray-500" />
                      ) : outputVolume < 50 ? (
                        <Volume size={18} className="text-gray-500" />
                      ) : (
                        <Volume2 size={18} className="text-gray-500" />
                      )}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={outputVolume}
                        onChange={(e) => setOutputVolume(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Gain Control</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically adjust microphone sensitivity</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoGainControl}
                          onChange={() => setAutoGainControl(!autoGainControl)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Noise Suppression</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reduce background noise in recordings</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noiseSuppression}
                          onChange={() => setNoiseSuppression(!noiseSuppression)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Echo Cancellation</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Remove echo from audio input</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={echoCancellation}
                          onChange={() => setEchoCancellation(!echoCancellation)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Notifications</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Show notifications in the app</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableNotifications}
                          onChange={() => setEnableNotifications(!enableNotifications)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pl-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Transcription Complete</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notify when transcription is ready</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyOnTranscriptionComplete}
                          onChange={() => setNotifyOnTranscriptionComplete(!notifyOnTranscriptionComplete)}
                          disabled={!enableNotifications}
                          className="sr-only peer"
                        />
                        <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54] ${!enableNotifications ? 'opacity-50' : ''}`}></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pl-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Error Notifications</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notify when errors occur</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyOnError}
                          onChange={() => setNotifyOnError(!notifyOnError)}
                          disabled={!enableNotifications}
                          className="sr-only peer"
                        />
                        <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54] ${!enableNotifications ? 'opacity-50' : ''}`}></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy settings */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Save Recordings</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Store audio recordings on your account</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveRecordings}
                          onChange={() => setSaveRecordings(!saveRecordings)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Anonymous Data</label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Help improve our language models</p>
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareAnonymousData}
                          onChange={() => setShareAnonymousData(!shareAnonymousData)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#075E54] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#075E54]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary flex items-center"
              >
                <Save size={18} className="mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
