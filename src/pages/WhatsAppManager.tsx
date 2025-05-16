import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Copy, Download, ListFilter, Search, Share2, User, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockContacts, supportedLanguages } from '../utils/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleGenerateAudio = () => {
    if (!message.trim()) {
      toast.error('Please enter a message to convert to audio');
      return;
    }
    
    setIsGenerating(true);
    // Simulate audio generation
    setTimeout(() => {
      setAudioGenerated(true);
      setIsGenerating(false);
      toast.success('Audio generated successfully!');
    }, 1500);
  };

  const handleShareToWhatsApp = () => {
    if (!selectedContact) {
      toast.error('Please select a contact');
      return;
    }
    
    const selectedContactData = mockContacts.find(c => c.id === selectedContact);
    if (!selectedContactData) return;
    
    // WhatsApp Web sharing URL
    const whatsappUrl = `https://wa.me/${selectedContactData.phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    if (audioGenerated) {
      // In a real app, this would attach the audio file
      toast.success(`Sharing message and audio with ${selectedContactData.name}`);
    } else {
      // Just share the text
      window.open(whatsappUrl, '_blank');
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
                    <button 
                      onClick={() => setShowTemplates(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {messageTemplates.length > 0 ? (
                    <div className="space-y-2">
                      {messageTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{template.name}</span>
                            <Badge variant="default">{template.language}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {template.content}
                          </p>
                          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-500">
                            <span>Used {template.useCount} times</span>
                            <span>{format(new Date(template.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No templates saved yet
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-4 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{supportedLanguages.find(lang => lang.code === selectedLanguage)?.name || 'Select language'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md max-h-60 overflow-auto py-1 border border-gray-200 dark:border-gray-700">
                    {supportedLanguages.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200'}`}
                        onClick={() => {
                          setSelectedLanguage(language.code);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {language.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleGenerateAudio}
                disabled={isGenerating || !message.trim()}
              >
                {isGenerating ? 'Generating...' : 'Generate Audio'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSaveAsTemplate}
                disabled={!message.trim()}
              >
                Save as Template
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCopyText}
                disabled={!message.trim()}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
            </div>
          </Card>
          
          {audioGenerated && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generated Audio</h2>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mb-4">
                <audio controls className="w-full">
                  <source src="#" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownloadAudio}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Audio
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleGenerateAudio}
                >
                  Regenerate
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        <div>
          <Card className="mb-6">
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
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedContact === contact.id
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                    } border`}
                    onClick={() => setSelectedContact(contact.id)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phoneNumber}</p>
                      </div>
                      {selectedContact === contact.id && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Last contacted: {format(new Date(contact.lastContacted), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No contacts found</p>
              )}
            </div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Share</h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Share your message{audioGenerated ? ' and audio' : ''} via WhatsApp
            </p>
            
            <Button 
              onClick={handleShareToWhatsApp} 
              fullWidth
              disabled={!selectedContact || (!message.trim() && !audioGenerated)}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share to WhatsApp
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppManager;
