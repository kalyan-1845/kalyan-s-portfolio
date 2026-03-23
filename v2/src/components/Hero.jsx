import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-10">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-7xl md:text-9xl font-bold font-display tracking-tighter mb-4"
      >
        KALYAN <span className="text-gradient">PRASAD</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-xl md:text-2xl text-gray-400 max-w-2xl"
      >
        Software Engineer & AI Specialist crafting the next generation of 
        <span className="text-white"> Intelligent Platforms</span> and 
        <span className="text-white"> 3D Experiences</span>.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-12"
      >
        <a href="#projects" className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/10 transition-colors">
          Explore Work
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;
