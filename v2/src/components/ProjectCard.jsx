import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

const ProjectCard = ({ title, description, image, tags, link, github }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="glass rounded-3xl overflow-hidden group border border-white/5 hover:border-accent/30 transition-all"
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-3 font-display">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-gray-300 border border-white/10">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-4">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="p-2 bg-accent rounded-full hover:bg-white hover:text-accent transition-colors">
              <ExternalLink size={18} />
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
              <Github size={18} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
