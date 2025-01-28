import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Features from '../components/Features';

function Home() {
  return (
    <div className="pt-24">
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-medium mb-6"
          >
            Where Privacy Meets Connection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Join anonymous discussions, share ideas freely, and connect without compromising your privacy.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/chat" className="button-primary">
              Start a Thread
            </Link>
          </motion.div>
        </div>
      </section>

      <Features />

      <section className="py-16 px-4 md:px-8 bg-dark-lighter">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-medium mb-12 text-center">Why HiddenThreads?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-6">
              <h3 className="text-xl font-medium mb-4">Complete Privacy</h3>
              <p className="text-gray-400">No registration, no tracking, no data collection. Your identity remains yours alone.</p>
            </div>
            <div className="glass p-6">
              <h3 className="text-xl font-medium mb-4">Secure Communication</h3>
              <p className="text-gray-400">End-to-end encryption ensures your conversations stay private and secure.</p>
            </div>
            <div className="glass p-6">
              <h3 className="text-xl font-medium mb-4">Ephemeral Threads</h3>
              <p className="text-gray-400">Messages automatically disappear, leaving no digital footprint behind.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-8">Ready to start a private conversation?</h2>
          <Link to="/chat" className="button-primary">
            Create Thread
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;