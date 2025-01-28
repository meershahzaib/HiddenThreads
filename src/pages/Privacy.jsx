import { motion } from 'framer-motion';

function Privacy() {
  return (
    <div className="pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8"
        >
          <h1 className="text-3xl font-medium mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-medium mb-4">Data Collection</h2>
              <p>HiddenThreads does not collect or store any personal information. We operate on a zero-data retention policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Message Security</h2>
              <p>All messages are end-to-end encrypted and automatically deleted after the conversation ends.</p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Cookies & Local Storage</h2>
              <p>We use minimal local storage only for maintaining your current session. No persistent cookies are used.</p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Third-Party Services</h2>
              <p>HiddenThreads does not integrate with any third-party services that could compromise your privacy.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Privacy;