import { motion } from 'framer-motion';

const features = [
  {
    title: 'Complete Anonymity',
    description: 'Chat without revealing your identity. No registration or personal information required.',
    icon: '🎭'
  },
  {
    title: 'Real-time Messaging',
    description: 'Instant message delivery with typing indicators and read receipts.',
    icon: '⚡'
  },
  {
    title: 'Secure & Private',
    description: 'End-to-end encryption and automatic message deletion for maximum privacy.',
    icon: '🔒'
  },
  {
    title: 'Custom Rooms',
    description: 'Create and join temporary chat rooms for group discussions.',
    icon: '🚪'
  }
];

function Features() {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;