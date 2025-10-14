'use client'
import { useState, useEffect } from 'react';
import { Waves, TrendingDown, AlertCircle } from 'lucide-react';

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-screen min-h-[600px] mt-16 overflow-hidden bg-slate-900">
      {/* Animated Background with Parallax */}
      <div 
        className="absolute inset-0"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-blue-900">
          <img
            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200"
            alt="Coastal view"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
        
        {/* Dynamic Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="enhanced-grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="30" cy="30" r="1.5" fill="white" className="animate-pulse" />
                <line x1="30" y1="30" x2="60" y2="30" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <line x1="30" y1="30" x2="30" y2="60" stroke="white" strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#enhanced-grid)" />
          </svg>
        </div>

        {/* Floating Particles - Only render on client to avoid hydration mismatch */}
        {isMounted && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full mb-8 animate-fade-in">
          <Waves className="w-4 h-4 text-teal-300" />
          <span className="text-sm text-teal-200 font-medium">Climate Action Initiative</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
          <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            AI-Powered
          </span>
          <br />
          <span className="text-white">Shoreline Change Detection</span>
        </h1>

        {/* Location Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-white/90 text-sm font-medium">Frankston, Victoria</span>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
          Monitoring coastal erosion with cutting-edge AI technology to protect our shores for future generations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Explore Data</span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-white hover:bg-white/20 transition-all duration-300">
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="text-center group cursor-pointer">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-white">24%</div>
            </div>
            <div className="text-sm text-slate-400">Erosion Rate</div>
          </div>
          
          <div className="w-px h-16 bg-white/10" />
          
          <div className="text-center group cursor-pointer">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Waves className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-white">5.2km</div>
            </div>
            <div className="text-sm text-slate-400">Coastline Monitored</div>
          </div>
          
          <div className="w-px h-16 bg-white/10" />
          
          <div className="text-center group cursor-pointer">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-white">98%</div>
            </div>
            <div className="text-sm text-slate-400">AI Accuracy</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;