import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-10 py-6 flex justify-between items-center glass">
      <div className="text-2xl font-bold font-display tracking-tight text-gradient">
        KALYAN.AI
      </div>
      <div className="flex gap-8 text-sm font-medium">
        <a href="#" className="hover:text-accent transition-colors">Home</a>
        <a href="#projects" className="hover:text-accent transition-colors">Projects</a>
        <a href="#ui-ux" className="hover:text-accent transition-colors">UI/UX</a>
        <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar;
