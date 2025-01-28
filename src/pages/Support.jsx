import { motion } from 'framer-motion';

function Support() {
  return (
    <div className="pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8"
        >
          <h1 className="text-3xl font-medium mb-6">Support Center</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-medium mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">How does anonymity work?</h3>
                  <p className="text-gray-300">Your identity is never stored or tracked. Each session is completely independent.</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Are messages really secure?</h3>
                  <p className="text-gray-300">Yes, all messages are end-to-end encrypted and automatically deleted after conversations end.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Contact Support</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="issue" className="block text-sm font-medium mb-2">Issue Type</label>
                  <select id="issue" className="w-full p-2 rounded-lg bg-dark-lighter border border-gray-700/30">
                    <option>Technical Problem</option>
                    <option>Security Concern</option>
                    <option>Feature Request</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    rows="4"
                    className="w-full p-2 rounded-lg bg-dark-lighter border border-gray-700/30"
                    placeholder="Describe your issue..."
                  ></textarea>
                </div>
                <button type="submit" className="button-primary">Submit</button>
              </form>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Support;