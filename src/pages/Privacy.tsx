import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Privacy Policy
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
        <p className="mb-4">
          TalkGhana ("we," "our," or "us") is committed to protecting your
          privacy. This Privacy Policy explains how your personal information is
          collected, used, and disclosed by TalkGhana.
        </p>
        <p className="mb-4">
          This Privacy Policy applies to our website, and its associated
          subdomains (collectively, our "Service"). By accessing or using our
          Service, you signify that you have read, understood, and agree to our
          collection, storage, use, and disclosure of your personal information
          as described in this Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Information We Collect
        </h2>
        <p className="mb-4">
          We collect information from you when you register on our website,
          submit audio for transcription, or use our text-to-speech services.
          The information we collect may include:
        </p>
        <ul className="list-disc pl-5 mb-6">
          <li className="mb-2">
            Personal information such as your name and email address
          </li>
          <li className="mb-2">
            Audio recordings you submit for transcription
          </li>
          <li className="mb-2">Text submitted for text-to-speech conversion</li>
          <li className="mb-2">Usage data and analytics</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          How We Use Your Information
        </h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-5 mb-6">
          <li className="mb-2">Provide, maintain, and improve our services</li>
          <li className="mb-2">
            Process and complete transcription and text-to-speech requests
          </li>
          <li className="mb-2">
            Send you technical notices, updates, and support messages
          </li>
          <li className="mb-2">
            Respond to your comments, questions, and requests
          </li>
          <li className="mb-2">
            Improve our machine learning models and service accuracy
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Data Storage and Security
        </h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to
          protect the data we collect and maintain. However, no security system
          is impenetrable, and we cannot guarantee the security of our systems
          with 100% certainty.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p className="mb-4">
          You have the right to access, correct, or delete your personal
          information that we collect and maintain. You can update your account
          information directly through our website or contact us to request
          changes or deletion of your information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us
          at: privacy@talkghana.com
        </p>
      </div>
    </div>
  );
};

export default Privacy;
