import { useState, useEffect } from 'react';
import { Check, Download, MessageSquare, Save, Send, Share2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { 
  shareTextViaWhatsApp, 
  shareAudioViaWhatsApp, 
  downloadAudio, 
  type ShareOptions 
} from '../utils/shareUtils';

// Component Props
interface WhatsAppShareProps {
  text?: string;
  audioBlob?: Blob;
  onClose?: () => void;
  onSaveTemplate?: (name: string, text: string) => void;
}

// Recipient suggestion interface
interface Recipient {
  id: string;
  name: string;
  phoneNumber: string;
  shareCount: number;
}

// Mock recipients data - would be fetched from database in production
const mockRecipients: Recipient[] = [
  { id: '1', name: 'Kofi Mensah', phoneNumber: '233501234567', shareCount: 12 },
  { id: '2', name: 'Ama Owusu', phoneNumber: '233207654321', shareCount: 8 },
  { id: '3', name: 'Kwame Addo', phoneNumber: '233559876543', shareCount: 5 },
];

const WhatsAppShare = ({ text = '', audioBlob, onClose, onSaveTemplate }: WhatsAppShareProps) => {
  // States
  const [message, setMessage] = useState(text);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [showRecipients, setShowRecipients] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState(mockRecipients);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Effect to filter recipients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecipients(mockRecipients);
    } else {
      const filtered = mockRecipients.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.phoneNumber.includes(searchTerm)
      );
      setFilteredRecipients(filtered);
    }
  }, [searchTerm]);
  
  // Handle message sharing
  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      const shareOptions: ShareOptions = {
        text: message,
        recipientPhone: selectedRecipient?.phoneNumber
      };
      
      if (audioBlob) {
        // Share audio with text
        const result = await shareAudioViaWhatsApp(audioBlob, shareOptions);
        if (result) {
          toast.success('Content shared successfully');
          if (onClose) onClose();
        } else {
          toast.error('Failed to share content');
        }
      } else if (message) {
        // Share text only
        shareTextViaWhatsApp(message, selectedRecipient?.phoneNumber);
        toast.success('Message shared successfully');
        if (onClose) onClose();
      } else {
        toast.error('No content to share');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share content');
    } finally {
      setIsSharing(false);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (audioBlob) {
      downloadAudio(audioBlob);
      toast.success('Audio downloaded successfully');
    } else {
      toast.error('No audio to download');
    }
  };
  
  // Handle saving template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    
    if (!message.trim()) {
      toast.error('Cannot save empty template');
      return;
    }
    
    if (onSaveTemplate) {
      onSaveTemplate(templateName, message);
      setShowSaveTemplate(false);
      setTemplateName('');
      toast.success('Template saved successfully');
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Share2 size={20} className="text-[#075E54] mr-2" />
          Share via WhatsApp
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Message input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows={4}
          placeholder="Enter your message here..."
        ></textarea>
      </div>
      
      {/* Audio attachment indicator */}
      {audioBlob && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-md flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#075E54]/10 flex items-center justify-center mr-2">
              <MessageSquare size={16} className="text-[#075E54]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Audio Message</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(audioBlob.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#075E54] dark:hover:text-[#128C7E]"
            title="Download Audio"
          >
            <Download size={18} />
          </button>
        </div>
      )}
      
      {/* Recipient selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Recipient
        </label>
        <div className="relative">
          <div
            onClick={() => setShowRecipients(!showRecipients)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex justify-between items-center cursor-pointer"
          >
            {selectedRecipient ? (
              <div className="flex items-center">
                <User size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                <span>{selectedRecipient.name} ({selectedRecipient.phoneNumber})</span>
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Select a recipient (optional)</span>
            )}
            <span className="text-gray-500">{showRecipients ? '▲' : '▼'}</span>
          </div>
          
          {showRecipients && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or number..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map(recipient => (
                    <div
                      key={recipient.id}
                      onClick={() => {
                        setSelectedRecipient(recipient);
                        setShowRecipients(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{recipient.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{recipient.phoneNumber}</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {recipient.shareCount} shares
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    No recipients found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowSaveTemplate(!showSaveTemplate)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Save size={18} className="mr-2" />
          Save Template
        </button>
        
        <button
          onClick={handleShare}
          disabled={isSharing || (!message && !audioBlob)}
          className={`px-4 py-2 bg-[#075E54] text-white rounded-md flex items-center hover:bg-[#064c44] transition-colors ${
            isSharing || (!message && !audioBlob) ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {isSharing ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Sharing...
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Share
            </>
          )}
        </button>
      </div>
      
      {/* Save template dialog */}
      {showSaveTemplate && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/80">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Save as Template</h4>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowSaveTemplate(false)}
              className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-3 py-1 bg-[#128C7E] text-white rounded-md flex items-center hover:bg-[#0c6b5f]"
            >
              <Check size={16} className="mr-1" />
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppShare;
