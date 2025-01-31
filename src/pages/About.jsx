import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import React, { useState } from 'react';
import Footer from '../components/Footer';

function About() {
  return (
    <div>
      <Navbar/>
    <div className="pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto mb-10" style={{ marginBottom: '2.5rem', display: 'block' }} >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8"
        >
          <h1 className="text-3xl font-medium mb-6">About HiddenThreads</h1>
          <div className="space-y-6 text-gray-300">
            <p>
              HiddenThreads was created with a simple yet powerful mission: to provide a secure and truly anonymous platform for open communication.
            </p>
            <p>
              In today's digital age, privacy has become increasingly scarce. We believe that everyone deserves a space where they can express themselves freely without fear of judgment or surveillance.
            </p>
            <h2 className="text-xl font-medium mt-8 mb-4">Our Principles</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>No data collection or storage</li>
              <li>End-to-end encryption for all communications</li>
              <li>No registration required</li>
              <li>Automatic message deletion</li>
              <li>No tracking or analytics</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
    
    <Footer/>
    </div>
  );
}

export default About;