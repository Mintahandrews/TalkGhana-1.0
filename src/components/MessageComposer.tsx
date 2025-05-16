import { useState, useEffect } from "react";
import {
  BookMarked,
  Bookmark,
  Pen,
  Mic,
  Save,
  Share2,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { toast } from "sonner";
import TextToSpeech from "./TextToSpeech";
import WhatsAppShare from "./WhatsAppShare";
import { GhanaLanguage, languageLabels } from "../services/ttsService";

// Template interface
interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  language: GhanaLanguage;
  isFavorite: boolean;
}

// Mock templates data - would be fetched from database in production
const mockTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Greeting",
    content: "Ɛte sɛn? Me din de John. Ɛyɛ me anigye sɛ mehyia wo.",
    language: "twi",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Meeting Invitation",
    content: "Yɛrehyia ɔkyena. Wobɛtumi aba?",
    language: "twi",
    isFavorite: false,
  },
  {
    id: "3",
    name: "Thank You",
    content: "Medaase paa wɔ wo mmoa no ho.",
    language: "twi",
    isFavorite: true,
  },
];

const MessageComposer = () => {
  // States
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplate | null>(null);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<GhanaLanguage>("twi");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showTTS, setShowTTS] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Reset form when template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      setMessage(selectedTemplate.content);
      setLanguage(selectedTemplate.language);
      setEditName(selectedTemplate.name);
    } else {
      setEditName("");
    }
  }, [selectedTemplate]);

  // Handle template selection
  const selectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  // Handle create/update template
  const saveTemplate = () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (!editName.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (selectedTemplate) {
      // Update existing template
      const updatedTemplates = templates.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, name: editName, content: message, language }
          : t
      );
      setTemplates(updatedTemplates);
      toast.success("Template updated successfully");
    } else {
      // Create new template
      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        name: editName,
        content: message,
        language,
        isFavorite: false,
      };
      setTemplates([...templates, newTemplate]);
      setSelectedTemplate(newTemplate);
      toast.success("Template created successfully");
    }

    setIsEditing(false);
  };

  // Delete template
  const deleteTemplate = (template: MessageTemplate) => {
    setTemplates(templates.filter((t) => t.id !== template.id));
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      setMessage("");
    }
    toast.success("Template deleted");
  };

  // Toggle favorite status
  const toggleFavorite = (template: MessageTemplate) => {
    const updatedTemplates = templates.map((t) =>
      t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    setTemplates(updatedTemplates);

    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate({ ...template, isFavorite: !template.isFavorite });
    }
  };

  // Handle text-to-speech conversion
  const handleTextConverted = (blob: Blob) => {
    setAudioBlob(blob);
    setShowTTS(false);
  };

  // Save new template from share component
  const handleSaveTemplate = (name: string, content: string) => {
    const newTemplate: MessageTemplate = {
      id: Date.now().toString(),
      name,
      content,
      language,
      isFavorite: false,
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Type size={20} className="text-[#075E54] mr-2" />
          Message Composer
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-2 rounded-md ${
              showTemplates
                ? "bg-[#075E54]/10 text-[#075E54]"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            title="Message Templates"
          >
            <BookMarked size={18} />
          </button>

          <button
            onClick={() => {
              setSelectedTemplate(null);
              setMessage("");
              setEditName("");
              setIsEditing(false);
            }}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="New Message"
          >
            <Pen size={18} />
          </button>
        </div>
      </div>

      {/* Template selector panel */}
      {showTemplates && (
        <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-2 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Saved Templates
            </h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {templates.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {templates.map((template) => (
                  <li
                    key={template.id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        onClick={() => selectTemplate(template)}
                        className="flex-1"
                      >
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </span>
                          <span className="ml-2 text-xs bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">
                            {languageLabels[template.language]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                          {template.content}
                        </p>
                      </div>

                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template);
                          }}
                          className={
                            template.isFavorite
                              ? "text-yellow-500 hover:text-yellow-600"
                              : "text-gray-400 hover:text-gray-500"
                          }
                          title={
                            template.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Bookmark
                            size={16}
                            fill={template.isFavorite ? "currentColor" : "none"}
                          />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template);
                          }}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No templates saved yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message form */}
      <div className="space-y-4">
        {/* Template name input (when editing) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter template name..."
            />
          </div>
        )}

        {/* Selected template indicator */}
        {selectedTemplate && !isEditing && (
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-md">
            <div className="flex items-center">
              <BookMarked size={16} className="text-[#075E54] mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedTemplate.name}
              </span>
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">
                {languageLabels[selectedTemplate.language]}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-[#075E54]"
              title="Pen template"
            >
              <Pen size={16} />
            </button>
          </div>
        )}

        {/* Language selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as GhanaLanguage)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {Object.entries(languageLabels).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Message input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder={`Type your message in ${languageLabels[language]}...`}
          ></textarea>
        </div>

        {/* Audio indicator */}
        {audioBlob && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#075E54]/10 flex items-center justify-center mr-2">
                <Mic size={16} className="text-[#075E54]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Audio Ready
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(audioBlob.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setAudioBlob(null)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500"
              title="Remove Audio"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between pt-4">
          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={saveTemplate}
                  disabled={!message.trim() || !editName.trim()}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    !message.trim() || !editName.trim()
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-[#128C7E] hover:bg-[#0c6b5f] text-white"
                  }`}
                >
                  <Save size={18} className="mr-2" />
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (selectedTemplate) {
                      setMessage(selectedTemplate.content);
                      setEditName(selectedTemplate.name);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowTTS(true)}
                  disabled={!message.trim()}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    !message.trim()
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-[#128C7E] hover:bg-[#0c6b5f] text-white"
                  }`}
                >
                  <Mic size={18} className="mr-2" />
                  Generate Audio
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    if (!selectedTemplate) {
                      setEditName("");
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  {selectedTemplate ? "Pen Template" : "Save as Template"}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            disabled={!message.trim() && !audioBlob}
            className={`px-4 py-2 rounded-md flex items-center ${
              !message.trim() && !audioBlob
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-[#075E54] hover:bg-[#064c44] text-white"
            }`}
          >
            <Share2 size={18} className="mr-2" />
            Share via WhatsApp
          </button>
        </div>
      </div>

      {/* Text-to-Speech Modal */}
      {showTTS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generate Audio
              </h3>
              <button
                onClick={() => setShowTTS(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <TextToSpeech
                defaultLanguage={language}
                defaultText={message}
                onTextConverted={handleTextConverted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div>
            <WhatsAppShare
              text={message}
              audioBlob={audioBlob || undefined}
              onClose={() => setShowShareModal(false)}
              onSaveTemplate={handleSaveTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageComposer;
