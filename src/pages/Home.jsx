import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Shield, Lock, Clock, MessageCircle, Users, Zap,
    Globe, Check, ArrowRight, Sparkles 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { 
        y: 0, 
        opacity: 1,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 0.8
        }
    }
};

const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div 
        className="group relative bg-gradient-to-b from-gray-800/50 to-gray-900/20 p-8 rounded-2xl border border-gray-700 backdrop-blur-lg hover:border-blue-500 transition-all"
        variants={cardVariants}
        whileHover={{ scale: 1.03 }}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
        <div className="relative z-10">
            <div className="mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

function Home() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0e1422] to-gray-900">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-36 pb-24 px-4 md:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-32 -left-48 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-64 -right-48 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="inline-flex items-center bg-gray-800/50 px-6 py-2 rounded-full mb-8 border border-gray-700">
                            <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="text-gray-300">Now serving 1M+ users worldwide</span>
                        </div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
                        >
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                                Private Conversations
                            </span>
                            <br />
                            <span className="text-gray-300">Without Compromises</span>
                        </motion.h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex justify-center space-x-6"
                    >
                        <Link
                            to="/chat"
                            className="relative group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:rounded-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/30"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                            <span className="relative z-10 flex items-center text-white font-medium">
                                <MessageCircle className="w-5 h-5 mr-3" />
                                Join Public Chat
                            </span>
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.span
                                        initial={{ x: -5, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 5, opacity: 0 }}
                                        className="relative z-10 ml-3"
                                    >
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-16 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-lg bg-gray-900/30 mx-auto max-w-4xl"
                    >
                        <div className="flex flex-wrap justify-center gap-6 text-gray-300">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-green-500 mr-2" />
                                Military-Grade Encryption
                            </div>
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 text-blue-500 mr-2" />
                                100+ Countries Supported
                            </div>
                            <div className="flex items-center">
                                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                                99.9% Uptime Guarantee
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 md:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl font-bold mb-6 text-white">
                            Enterprise-Grade Security, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Simplified for Everyone
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Combining cutting-edge technology with intuitive design to protect your conversations
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Zero-Knowledge Architecture",
                                description: "Your data remains encrypted end-to-end, even we can't access it"
                            },
                            {
                                icon: Lock,
                                title: "Self-Destructing Messages",
                                description: "Auto-delete conversations with custom expiration timers"
                            },
                            {
                                icon: Users,
                                title: "Anonymous Profiles",
                                description: "Interact without revealing personal information"
                            },
                            {
                                icon: Clock,
                                title: "Real-Time Monitoring",
                                description: "24/7 threat detection and prevention systems"
                            },
                            {
                                icon: Zap,
                                title: "Lightning Fast",
                                description: "Global CDN ensures sub-100ms message delivery"
                            },
                            {
                                icon: Globe,
                                title: "Global Compliance",
                                description: "GDPR, HIPAA, SOC2 compliant infrastructure"
                            }
                        ].map((feature, index) => (
                            <FeatureCard 
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Showcase */}
            <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-gray-900 to-[#0d1525]">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        className="space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="text-4xl font-bold text-white">
                            Built with Military-Grade <span className="text-blue-400">Security Protocols</span>
                        </div>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Our multi-layered security approach ensures your data remains protected at every level
                        </p>
                        <div className="space-y-6">
                            {[
                                "AES-256 & RSA-4096 Encryption",
                                "Biometric Authentication",
                                "FIPS 140-2 Validated Modules",
                                "Regular Third-Party Audits"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="text-gray-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* Add other sections following similar patterns */}

            <Footer />
        </div>
    );
}

export default Home;