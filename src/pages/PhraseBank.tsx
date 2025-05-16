import { useState } from "react";
import {
  Bookmark,
  Check,
  Download,
  Pencil,
  Search,
  Trash2,
  Type,
  X,
} from "lucide-react";

// Mock data for phrase bank
const mockPhrases = [
  {
    id: 1,
    text: "Me din de John",
    translation: "My name is John",
    language: "twi",
    category: "greetings",
    isFavorite: true,
    date: "2025-05-15",
  },
  {
    id: 2,
    text: "Ɛte sɛn",
    translation: "How are you",
    language: "twi",
    category: "greetings",
    isFavorite: false,
    date: "2025-05-16",
  },
  {
    id: 3,
    text: "Akwaaba",
    translation: "Welcome",
    language: "twi",
    category: "greetings",
    isFavorite: true,
    date: "2025-05-17",
  },
  {
    id: 4,
    text: "Medaase",
    translation: "Thank you",
    language: "twi",
    category: "common",
    isFavorite: false,
    date: "2025-05-18",
  },
  {
    id: 5,
    text: "Me kɔ sukuu",
    translation: "I am going to school",
    language: "twi",
    category: "education",
    isFavorite: false,
    date: "2025-05-19",
  },
];

const PhraseBank = () => {
  const [phrases, setPhrases] = useState(mockPhrases);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editTranslation, setEditTranslation] = useState("");

  // Filter phrases based on search query
  const filteredPhrases = phrases.filter(
    (phrase) =>
      phrase.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete a phrase
  const handleDelete = (id: number) => {
    setPhrases(phrases.filter((phrase) => phrase.id !== id));
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setPhrases(
      phrases.map((phrase) =>
        phrase.id === id
          ? { ...phrase, isFavorite: !phrase.isFavorite }
          : phrase
      )
    );
  };

  // Start editing a phrase
  const startEditing = (phrase: any) => {
    setEditingId(phrase.id);
    setEditText(phrase.text);
    setEditTranslation(phrase.translation);
  };

  // Save edited phrase
  const saveEdit = () => {
    if (!editingId) return;

    setPhrases(
      phrases.map((phrase) =>
        phrase.id === editingId
          ? { ...phrase, text: editText, translation: editTranslation }
          : phrase
      )
    );

    setEditingId(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Generate TTS for a phrase
  const generateTTS = (phrase: any) => {
    alert(`Generating TTS for: ${phrase.text}`);
    // Implementation would connect to TextToSpeech component
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark
              className="text-[#075E54] dark:text-green-400"
              size={28}
            />
            Phrase Bank
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your saved phrases and translations
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-[#075E54] dark:focus:ring-green-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredPhrases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phrase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Translation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPhrases.map((phrase) => (
                  <tr
                    key={phrase.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === phrase.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {phrase.text}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === phrase.id ? (
                        <input
                          type="text"
                          value={editTranslation}
                          onChange={(e) => setEditTranslation(e.target.value)}
                          className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {phrase.translation}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {phrase.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {phrase.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {editingId === phrase.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleFavorite(phrase.id)}
                            className={`${
                              phrase.isFavorite
                                ? "text-yellow-500 hover:text-yellow-600"
                                : "text-gray-400 hover:text-gray-500"
                            }`}
                          >
                            <Bookmark
                              size={18}
                              fill={phrase.isFavorite ? "currentColor" : "none"}
                            />
                          </button>
                          <button
                            onClick={() => generateTTS(phrase)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <Type size={18} />
                          </button>
                          <button
                            onClick={() => startEditing(phrase)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(phrase.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Bookmark
                size={24}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No phrases found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `No phrases match your search: "${searchQuery}"`
                : "Your phrase bank is empty. Phrases you save will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseBank;
