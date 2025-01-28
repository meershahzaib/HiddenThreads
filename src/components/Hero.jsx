import { motion } from 'framer-motion';

function Hero() {
  return (
    <section className="pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-glow">
            Chat Freely, Stay Anonymous
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience secure, anonymous conversations in real-time. No sign-up required.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="button-primary text-lg"
          >
            Start Chatting Now
          </motion.button>
        </motion.div>

        {/* Demo Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass mt-16 p-6 max-w-4xl mx-auto"
        >
          <div className="aspect-video bg-dark rounded-lg overflow-hidden">
            {/* Add demo animation or screenshot here */}
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Chat Interface Demo
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;