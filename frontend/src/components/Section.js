import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ id, title, children, bgColor = 'bg-white' }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`min-h-screen ${bgColor} p-4 sm:p-8 flex flex-col justify-center`}
    >
      <motion.h2
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-800"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
};

export default Section;

