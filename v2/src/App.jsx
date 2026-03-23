import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Experience from './components/Experience';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

function App() {
  return (
    <div className="relative w-full h-screen bg-black">
      <Navbar />
      
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 0, 10], fov: 45 }}
        >
          <color attach="background" args={['#050505']} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
          
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth">
        <Hero />
        
        <section id="projects" className="min-h-screen py-20 px-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-12 text-gradient">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Projects will be rendered here */}
            </div>
          </div>
        </section>

        <section id="ui-ux" className="min-h-screen py-20 px-10 bg-[#050505]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-12 text-gradient">UI/UX Design</h2>
            <p className="text-xl text-gray-400 mb-8">
              Crafting intuitive and aesthetically pleasing experiences.
            </p>
            {/* UI/UX Showcase */}
          </div>
        </section>

        <section id="contact" className="min-h-screen flex items-center justify-center py-20 px-10">
          <div className="glass p-12 rounded-3xl max-w-2xl w-full text-center">
            <h2 className="text-4xl font-bold mb-6">Let's Connect</h2>
            <p className="text-gray-400 mb-8">
              Available for collaborations on AI and 3D web projects.
            </p>
            <a href="mailto:contact@kalyan.dev" className="inline-block px-8 py-4 bg-accent text-white rounded-full font-bold hover:scale-105 transition-transform">
              Contact Me
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
