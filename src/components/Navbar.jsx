import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Menu, X, BookOpen, Users, Star, ChevronDown,
  Info, Video
} from 'lucide-react';

// Dropdown Menu Data
const resources = [
  { title: 'Documentation', icon: BookOpen, description: 'Learn how to use our platform', link: '/docs' },
  { title: 'Community', icon: Users, description: 'Join our growing community', link: '/community' },
  { title: 'Showcase', icon: Star, description: 'See what others have built', link: '/showcase' },
];

// Desktop NavLink (without icons)
const NavLink = ({ href, children }) => (
  <Link
    to={href}
    className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
  >
    {children}
  </Link>
);

const DropdownMenuItem = ({ icon: Icon, title, description, link }) => (
  <Link
    to={link}
    className="flex items-start p-4 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
  >
    <div className="flex-shrink-0 mt-1">
      <Icon className="w-5 h-5 text-blue-500" />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </Link>
);

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResources, setShowResources] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full top-0 z-[9999] bg-[#141c2b]/95 backdrop-blur-lg border-b border-gray-800"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold text-white">HiddenThreads</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div
                className="relative"
                onMouseEnter={() => setShowResources(true)}
                onMouseLeave={() => setShowResources(false)}
              >
                {/*
                <button
                  className="px-4 py-2 text-gray-300 hover:text-white flex items-center space-x-1"
                  aria-label="Resources"
                >
                  <span>Resources</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                */}
                <AnimatePresence>
                  {showResources && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 w-80 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl"
                    >
                      <div className="p-2">
                        {resources.map((item) => (
                          <DropdownMenuItem key={item.title} {...item} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/video-voice">Video Chat</NavLink>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-white"
                aria-label="Toggle mobile menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile off-canvas menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 w-64 h-full bg-gray-900 z-[10001] shadow-lg"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="mb-4 text-gray-400 hover:text-white"
                  aria-label="Close mobile menu"
                >
                  <X className="w-6 h-6" />
                </button>
                <nav className="space-y-4">
                  <Link
                    to="/about"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                  >
                    <Info className="w-5 h-5" />
                    <span>About</span>
                  </Link>
                  <Link
                    to="/video-voice"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                  >
                    <Video className="w-5 h-5" />
                    <span>Video Chat</span>
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
