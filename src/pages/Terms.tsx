import React from "react";

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Terms of Service
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

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          1. Agreement to Terms
        </h2>
        <p className="mb-4">
          By accessing or using TalkGhana's services, you agree to be bound by
          these Terms of Service and all applicable laws and regulations. If you
          do not agree with any of these terms, you are prohibited from using or
          accessing this site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily use TalkGhana's services for
          personal, non-commercial transitory viewing only. This is the grant of
          a license, not a transfer of title, and under this license you may
          not:
        </p>
        <ul className="list-disc pl-5 mb-6">
          <li className="mb-2">Modify or copy the materials;</li>
          <li className="mb-2">
            Use the materials for any commercial purpose;
          </li>
          <li className="mb-2">
            Attempt to decompile or reverse engineer any software contained on
            TalkGhana's website;
          </li>
          <li className="mb-2">
            Remove any copyright or other proprietary notations from the
            materials; or
          </li>
          <li className="mb-2">
            Transfer the materials to another person or "mirror" the materials
            on any other server.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
        <p className="mb-4">
          TalkGhana's services are provided on an 'as is' basis. TalkGhana makes
          no warranties, expressed or implied, and hereby disclaims and negates
          all other warranties including, without limitation, implied warranties
          or conditions of merchantability, fitness for a particular purpose, or
          non-infringement of intellectual property or other violation of
          rights.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitations</h2>
        <p className="mb-4">
          In no event shall TalkGhana or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use TalkGhana's services, even if TalkGhana or a TalkGhana authorized
          representative has been notified orally or in writing of the
          possibility of such damage.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          5. Accuracy of Materials
        </h2>
        <p className="mb-4">
          The materials appearing on TalkGhana's website could include
          technical, typographical, or photographic errors. TalkGhana does not
          warrant that any of the materials on its website are accurate,
          complete or current. TalkGhana may make changes to the materials
          contained on its website at any time without notice.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Modifications</h2>
        <p className="mb-4">
          TalkGhana may revise these terms of service for its website at any
          time without notice. By using this website you are agreeing to be
          bound by the then current version of these terms of service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Governing Law</h2>
        <p className="mb-4">
          These terms and conditions are governed by and construed in accordance
          with the laws of Ghana and you irrevocably submit to the exclusive
          jurisdiction of the courts in that location.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms of Service, please contact
          us at: legal@talkghana.com
        </p>
      </div>
    </div>
  );
};

export default Terms;
