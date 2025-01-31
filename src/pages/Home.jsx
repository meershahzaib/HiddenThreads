import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Shield, Lock, Clock, MessageCircle, Users, Zap,
    Globe, Heart, ChevronDown, Menu, X, Twitter,
    Github, Linkedin, Mail, Star, Award, Sparkles,
    Coffee, BookOpen, Code, ExternalLink, Check
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define Card component
const Card = ({ icon: Icon, title, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <Icon className="w-10 h-10 text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};



function Home() {
    return (
        <div className="min-h-screen bg-[#141c2b]">
          <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4 md:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                            Where Privacy Meets Connection
                        </h1>
                    </motion.div>
                    <motion.p
                        {...fadeInUp}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Join anonymous discussions, share ideas freely, and connect without compromising your privacy. Experience the future of secure communication.
                    </motion.p>
                    <motion.div
                        {...fadeInUp}
                        transition={{ delay: 0.3 }}
                        className="space-x-4"
                    >
                        <Link
                            to="/chat"
                            className="inline-flex items-center px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Start a Thread
                        </Link>
                        <Link
                            to="/learn-more"
                            className="inline-flex items-center px-8 py-4 rounded-full border border-gray-600 hover:border-blue-500 text-white font-medium transition-all duration-300"
                        >
                            Learn More
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text"
                    >
                        Why Choose HiddenThreads?
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card
                            icon={Shield}
                            title="Complete Privacy"
                            description="No registration, no tracking, no data collection. Your identity remains yours alone."
                        />
                        <Card
                            icon={Lock}
                            title="Secure Communication"
                            description="End-to-end encryption ensures your conversations stay private and secure."
                        />
                        <Card
                            icon={Clock}
                            title="Ephemeral Threads"
                            description="Messages automatically disappear, leaving no digital footprint behind."
                        />
                        <Card
                            icon={Users}
                            title="Anonymous Community"
                            description="Connect with like-minded individuals without revealing personal information."
                        />
                        <Card
                            icon={Zap}
                            title="Lightning Fast"
                            description="Optimized performance ensures your messages are delivered instantly."
                        />
                        <Card
                            icon={Globe}
                            title="Global Access"
                            description="Connect with users worldwide while maintaining complete anonymity."
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-16 text-center text-white"
                    >
                        Trusted by Industry Leaders
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gray-800/30 p-8 rounded-xl border border-gray-700"
                            >
                                <div className="flex items-center mb-6">
                                    <img
                                        src={`/api/placeholder/64/64`}
                                        alt="User  avatar"
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-white">John Doe</h4>
                                        <p className="text-gray-400">CEO at TechCorp</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    "HiddenThreads has transformed how we handle sensitive communications.
                                    The security features are top-notch, and the user experience is seamless."
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Pricing Cards Section */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-16 text-center text-white"
                    >
                        Choose Your Plan
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Basic',
                                price: 'Free',
                                features: ['5 private threads', 'Basic encryption', '24/7 support', 'Mobile access'],
                                popular: false
                            },
                            {
                                name: 'Pro',
                                price: '$19/mo',
                                features: ['Unlimited threads', 'Advanced encryption', 'Priority support', 'API access'],
                                popular: true
                            },
                            {
                                name: 'Enterprise',
                                price: 'Custom',
                                features: ['Custom solutions', 'Dedicated support', 'SLA guarantee', 'Advanced analytics'],
                                popular: false
                            }
                        ].map((plan) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className={`relative bg-gray-800/30 rounded-xl border ${plan.popular ? 'border-blue-500' : 'border-gray-700'
                                    } p-8`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-4xl font-bold text-white mb-6">{plan.price}</p>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center text-gray-300">
                                            <Check className="w-5 h-5 text-blue-500 mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.popular
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}>
                                    Get Started
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12 rounded-2xl border border-gray-700"
                    >
                        <h2 className="text-4xl font-bold mb-6 text-white">
                            Ready to Experience True Privacy?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands of users who value their privacy and freedom of expression.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                            <Shield className="w-5 h-5 mr-2" />
                            Get Started for Free
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Home;