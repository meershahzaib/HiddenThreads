import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import {
    Shield, Lock, Clock, MessageCircle, Users, Zap,
    Globe, Heart, ChevronDown, Menu, X, Twitter,
    Github, Linkedin, Mail, Star, Award, Sparkles,
    Coffee, BookOpen, Code, ExternalLink, Check
} from 'lucide-react';


function Footer() {
    return (
        <footer className="bg-[#1a2436] border-t border-gray-800 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                            <li><Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
                            <li><Link to="/enterprise" className="text-gray-400 hover:text-white transition-colors">Enterprise</Link></li>
                            <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link to="/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                            <li><Link to="/guides" className="text-gray-400 hover:text-white transition-colors">Guides</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                            <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                            <li><Link to="/press" className="text-gray-400 hover:text-white transition-colors">Press</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                            <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                            <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
                            <li><Link to="/licenses" className="text-gray-400 hover:text-white transition-colors">Licenses</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Shield className="w-8 h-8 text-blue-500" />
                            <p className="text-gray-400">© 2024 HiddenThreads. All rights reserved.</p>
                        </div>
                        <div className="flex items-center space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Mail">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;