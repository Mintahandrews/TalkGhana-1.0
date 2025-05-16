import React from "react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        About TalkGhana
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          TalkGhana is a platform designed to bridge language barriers through
          technology, specifically focusing on Ghanaian languages. Our mission
          is to make communication more accessible and inclusive for speakers of
          Ghanaian languages through cutting-edge speech recognition and
          text-to-speech technologies.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="mb-4">
          We believe that language should never be a barrier to communication.
          By providing tools that can accurately transcribe and generate speech
          in Ghanaian languages, we aim to:
        </p>
        <ul className="list-disc pl-5 mb-6">
          <li className="mb-2">
            Preserve and promote Ghanaian languages in the digital space
          </li>
          <li className="mb-2">
            Make digital tools more accessible to non-English speakers
          </li>
          <li className="mb-2">
            Help language learners practice and improve their skills
          </li>
          <li className="mb-2">
            Support businesses and organizations in reaching wider audiences
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
        <p className="mb-4">
          TalkGhana uses advanced artificial intelligence and machine learning
          technologies to power our speech recognition and text-to-speech
          services. Our models are specifically trained and fine-tuned for
          Ghanaian languages, ensuring high accuracy and natural-sounding
          results.
        </p>
        <p className="mb-4">
          We currently support several Ghanaian languages, including Twi, Ga,
          Ewe, Dagbani, and are continuously working to expand our language
          offerings.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions, feedback, or partnership inquiries, please
          don't hesitate to reach out to us at:
        </p>
        <p className="mb-4">
          <strong>Email:</strong> support@talkghana.com
        </p>
      </div>
    </div>
  );
};

export default About;
