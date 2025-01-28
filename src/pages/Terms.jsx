import { motion } from 'framer-motion';

function Terms() {
  return (
    <div className="pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8"
        >
          <h1 className="text-3xl font-medium mb-6">Terms of Service</h1>
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-medium mb-4">Acceptance of Terms</h2>
              <p>By accessing HiddenThreads, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Use Guidelines</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Do not use the service for illegal activities</li>
                <li>Respect other users' privacy</li>
                <li>Do not attempt to bypass security measures</li>
                <li>Do not share harmful content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Disclaimer</h2>
              <p>HiddenThreads is provided "as is" without any warranties of any kind, either express or implied.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Terms;