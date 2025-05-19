import { useState, useEffect } from 'react';
import { Check, Copy, Download, ListFilter, Search, Share2, User, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockContacts } from '../utils/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { shareTextViaWhatsApp, shareAudioViaWhatsApp } from '../utils/shareUtils';

// WhatsApp color constants
const WHATSAPP_GREEN = '#25D366';
const WHATSAPP_DARK_GREEN = '#128C7E';
const WHATSAPP_LIGHT_GREEN = '#DCFFEC';
const WHATSAPP_DARK_BG = '#121212';
const WHATSAPP_DARK_TEXT = '#FFFFFF';

interface Template {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: string;
  useCount: number;
}

const WhatsAppManager = () => {
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Templates mock data
  useEffect(() => {
    const templates: Template[] = [
      {
        id: '1',
        name: 'Greeting',
        content: 'Hello! How are you today?',
        language: 'en',
        createdAt: '2025-04-10T12:35:00Z',
        useCount: 15
      },
      {
        id: '2',
        name: 'Meeting Confirmation',
        content: 'I confirm our meeting on [date] at [time]. Looking forward to it!',
        language: 'en',
        createdAt: '2025-04-15T09:22:00Z',
        useCount: 8
      },
      {
        id: '3',
        name: 'Twi Greeting',
        content: 'Ɛte sɛn? Wo ho te sɛn?',
        language: 'twi',
        createdAt: '2025-05-01T14:30:00Z',
        useCount: 10
      }
    ];
    setMessageTemplates(templates);
  }, []);

  const filteredContacts = mockContacts.filter((contact) => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleGenerateAudio = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message to convert to audio');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Here you would integrate with your TTS service to generate the audio
      // For now, we'll simulate it
      const newBlob = new Blob(['Audio data here'], { type: 'audio/ogg' });
      setAudioBlob(newBlob);
      setAudioGenerated(true);
      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!selectedContact) {
      toast.error('Please select a contact');
      return;
    }
    
    const selectedContactData = mockContacts.find(c => c.id === selectedContact);
    if (!selectedContactData) return;

    try {
      // Prepare sharing options
      const shareOptions = {
        text: message,
        recipientPhone: selectedContactData.phoneNumber,
      };

      if (audioGenerated) {
        // Share with audio
        if (!audioBlob) {
          toast.error('No audio to share. Please generate audio first.');
          return;
        }
        
        const success = await shareAudioViaWhatsApp(
          audioBlob,
          `talkghana-audio-${Date.now()}.ogg`,
          shareOptions
        );
        
        if (success) {
          toast.success(`Successfully shared message and audio with ${selectedContactData.name}`);
        } else {
          toast.error('Failed to share audio. Please try again.');
        }
      } else {
        // Share text only
        const success = await shareTextViaWhatsApp(
          message,
          selectedContactData.phoneNumber
        );
        
        if (success) {
          toast.success(`Successfully shared message with ${selectedContactData.name}`);
        } else {
          toast.error('Failed to share message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      toast.error('An error occurred while sharing. Please try again.');
    }
  };

  const handleDownloadAudio = () => {
    // In a real app, this would download the actual file
    toast.success('Audio file downloaded');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard');
  };

  const handleSelectTemplate = (template: Template) => {
    setMessage(template.content);
    setSelectedLanguage(template.language);
    setShowTemplates(false);
    
    // Update usage count
    const updatedTemplates = messageTemplates.map(t => 
      t.id === template.id ? {...t, useCount: t.useCount + 1} : t
    );
    setMessageTemplates(updatedTemplates);
  };

  const handleSaveAsTemplate = () => {
    if (!message.trim()) {
      toast.error('Please enter a message to save as template');
      return;
    }
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: `Template ${messageTemplates.length + 1}`,
      content: message,
      language: selectedLanguage,
      createdAt: new Date().toISOString(),
      useCount: 0
    };
    
    setMessageTemplates([...messageTemplates, newTemplate]);
    toast.success('Template saved successfully');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">WhatsApp Integration</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Message Composer</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <ListFilter className="h-4 w-4 mr-1" />
                    Templates
                  </button>
                </div>
              </div>
              <textarea
                id="message"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              
              {showTemplates && (
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md p-2 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved Templates</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowTemplates(false)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveAsTemplate}
                        disabled={isGenerating}
                      >
                        <ListFilter className="h-4 w-4 mr-1" />
                        Save as Template
                      </Button>
                    </div>
                  </div>
                  
                  {messageTemplates.length > 0 ? (
                    <div className="space-y-4">
                      {messageTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-gray-200">{template.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {template.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="default">{template.language}</Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Used {template.useCount} times • {format(new Date(template.createdAt), 'MMM d, yyyy')}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template);
                              }}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No templates saved yet</p>
                  )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyText}
              disabled={isGenerating}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Text
            </Button>
            <Button
              onClick={handleGenerateAudio}
              disabled={isGenerating || !message.trim()}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Generate Audio
                </span>
              )}
            </Button>
            {audioGenerated && (
              <Button
                variant="outline"
                onClick={handleDownloadAudio}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Audio
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Recipient</h2>
          
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between p-3 rounded-lg 
                    ${selectedContact === contact.id 
                      ? `bg-[${WHATSAPP_LIGHT_GREEN}] dark:bg-[${WHATSAPP_DARK_BG}] border-[${WHATSAPP_GREEN}] dark:border-[${WHATSAPP_DARK_GREEN}]` 
                      : `hover:bg-[${WHATSAPP_LIGHT_GREEN}] dark:hover:bg-[${WHATSAPP_DARK_BG}] border-transparent`
                    }
                    border cursor-pointer transition-colors`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-[${WHATSAPP_LIGHT_GREEN}] dark:bg-[${WHATSAPP_DARK_BG}] flex items-center justify-center`}>
                      <User className={`w-6 h-6 text-[${WHATSAPP_GREEN}] dark:text-[${WHATSAPP_DARK_TEXT}]`} />
                    </div>
                    <div>
                      <h4 className={`font-medium text-[${WHATSAPP_GREEN}] dark:text-[${WHATSAPP_DARK_TEXT}]`}>{contact.name}</h4>
                      <p className={`text-sm text-[${WHATSAPP_GREEN}] dark:text-[${WHATSAPP_DARK_TEXT}] opacity-80 dark:opacity-90`}>
                        {contact.phoneNumber}
                      </p>
                    </div>
                  </div>
                  {selectedContact === contact.id && (
                    <Check className={`text-[${WHATSAPP_GREEN}] dark:text-[${WHATSAPP_DARK_TEXT}] h-5 w-5`} />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No contacts found</p>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={handleShareToWhatsApp}
              disabled={!selectedContact || isGenerating}
              className={`w-full bg-[${WHATSAPP_GREEN}] text-white hover:bg-[${WHATSAPP_DARK_GREEN}] 
                dark:bg-[${WHATSAPP_DARK_GREEN}] dark:text-white dark:hover:bg-[${WHATSAPP_GREEN}]`}
            >
              <Share2 className={`h-4 w-4 mr-2 text-white dark:text-white`} />
              Share to WhatsApp
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
);
};

export default WhatsAppManager;
