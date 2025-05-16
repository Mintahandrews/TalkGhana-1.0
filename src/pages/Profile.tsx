import { useState } from "react";
import {
  Book,
  Calendar,
  Camera,
  History,
  Lock,
  Mic,
  Save,
  Squircle,
  User,
  Volume2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Profile form state
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    language: "twi",
    location: "Accra, Ghana",
    bio: "Language enthusiast interested in preserving and documenting Ghanaian languages.",
  });

  // Mock activity data
  const recentActivity = [
    {
      id: 1,
      type: "recording",
      title: "Audio Recording",
      language: "Twi",
      date: "2025-05-10",
    },
    {
      id: 2,
      type: "transcription",
      title: "Transcription",
      language: "Ewe",
      date: "2025-05-08",
    },
    {
      id: 3,
      type: "phrase",
      title: "Added to Phrase Bank",
      language: "Ga",
      date: "2025-05-05",
    },
    {
      id: 4,
      type: "tts",
      title: "Text-to-Speech",
      language: "Dagbani",
      date: "2025-05-01",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // In a real app, this would save to API/database
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      setErrors({ submit: "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="text-[#075E54] dark:text-green-400" size={28} />
          User Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={20} />
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-sm font-medium text-[#075E54] dark:text-green-400 hover:underline"
                >
                  <Squircle size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preferred Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                      disabled={isSubmitting}
                    >
                      <option value="twi">Twi</option>
                      <option value="ga">Ga</option>
                      <option value="ewe">Ewe</option>
                      <option value="hausa">Hausa</option>
                      <option value="dagbani">Dagbani</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full p-2 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#075E54] text-white rounded-md hover:bg-[#064c44] transition-colors flex items-center gap-1"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      <User
                        size={40}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#075E54] rounded-full flex items-center justify-center text-white border-2 border-white dark:border-gray-800">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </h3>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formData.fullName}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email Address
                    </h3>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formData.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Preferred Language
                    </h3>
                    <p className="text-base text-gray-900 dark:text-white capitalize">
                      {formData.language}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Location
                    </h3>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formData.location}
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Bio
                  </h3>
                  <p className="text-base text-gray-900 dark:text-white">
                    {formData.bio}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Activity section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <History size={20} />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                    {activity.type === "recording" && (
                      <Mic size={18} className="text-blue-500" />
                    )}
                    {activity.type === "transcription" && (
                      <Book size={18} className="text-green-500" />
                    )}
                    {activity.type === "phrase" && (
                      <Book size={18} className="text-purple-500" />
                    )}
                    {activity.type === "tts" && (
                      <Volume2 size={18} className="text-orange-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {activity.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Language: {activity.language}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock size={20} />
              Account Security
            </h2>

            <div className="space-y-4">
              <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Change Password
              </button>

              <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Two-Factor Authentication
              </button>

              <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Login History
              </button>

              <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Connected Accounts
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#4267B2] flex items-center justify-center text-white mr-3">
                        f
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Facebook
                      </span>
                    </div>
                    <button className="text-sm text-[#075E54] dark:text-green-400 hover:underline">
                      Connect
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white mr-3">
                        t
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Twitter
                      </span>
                    </div>
                    <button className="text-sm text-[#075E54] dark:text-green-400 hover:underline">
                      Connect
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#DB4437] flex items-center justify-center text-white mr-3">
                        g
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Google
                      </span>
                    </div>
                    <button className="text-sm text-gray-500 hover:underline">
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
