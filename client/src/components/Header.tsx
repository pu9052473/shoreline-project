'use client'
import { useState, useEffect } from 'react';
import { Waves, Menu, X, ChevronDown, BarChart3, Users, BookOpen, Database, MapPin, Bell } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Live Data',
      icon: BarChart3,
      dropdown: [
        { name: 'Real-time Monitoring', desc: 'Current shoreline status' },
        { name: 'Historical Data', desc: 'Past 10 years analysis' },
        { name: 'Predictions', desc: 'AI forecasts' },
      ]
    },
    {
      label: 'AI Models',
      icon: Database,
      dropdown: [
        { name: 'Detection Model', desc: 'Erosion detection AI' },
        { name: 'Prediction Engine', desc: 'Future trends' },
        { name: 'API Access', desc: 'Developer integration' },
      ]
    },
    {
      label: 'Frankston Coast',
      icon: MapPin,
      dropdown: [
        { name: 'Interactive Map', desc: 'Explore the coastline' },
        { name: 'Impact Zones', desc: 'High-risk areas' },
        { name: 'Reports', desc: 'Detailed assessments' },
      ]
    },
    {
      label: 'Community',
      icon: Users,
      href: '#community'
    },
    {
      label: 'Resources',
      icon: BookOpen,
      dropdown: [
        { name: 'Documentation', desc: 'Technical guides' },
        { name: 'Research Papers', desc: 'Scientific studies' },
        { name: 'Case Studies', desc: 'Success stories' },
      ]
    },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-teal-500/10 border-b border-teal-500/20' 
          : 'bg-slate-900/80 backdrop-blur-sm border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all duration-300 group-hover:scale-110">
              <Waves className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-lg leading-tight">CoastWatch</div>
              <div className="text-teal-300 text-xs">AI Monitoring</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, idx) => (
              <div 
                key={idx} 
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(idx)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href || '#'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === idx ? 'rotate-180' : ''}`} />
                  )}
                </a>

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === idx && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-teal-500/20 shadow-2xl overflow-hidden animate-dropdown">
                    {item.dropdown.map((subItem, subIdx) => (
                      <a
                        key={subIdx}
                        href="#"
                        className="block px-4 py-3 hover:bg-teal-500/10 transition-colors duration-200 group"
                      >
                        <div className="text-white text-sm font-medium group-hover:text-teal-300 transition-colors">
                          {subItem.name}
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5">{subItem.desc}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 hidden md:block group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* Auth Buttons */}
            <button className="hidden md:block px-4 py-2 text-sm font-medium text-white hover:text-teal-300 rounded-lg hover:bg-white/10 transition-all duration-200">
              Sign In
            </button>
            <button className="hidden md:block px-5 py-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-blue-400 rounded-lg hover:from-teal-300 hover:to-blue-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-200 hover:scale-105">
              Get Access
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-800/98 backdrop-blur-xl border-t border-teal-500/20 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navItems.map((item, idx) => (
              <div key={idx}>
                <a
                  href={item.href || '#'}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    if (item.dropdown) {
                      e.preventDefault();
                      setActiveDropdown(activeDropdown === idx ? null : idx);
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.dropdown && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === idx ? 'rotate-180' : ''}`} />
                  )}
                </a>
                
                {item.dropdown && activeDropdown === idx && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.dropdown.map((subItem, subIdx) => (
                      <a
                        key={subIdx}
                        href="#"
                        className="block px-4 py-2 text-slate-400 hover:text-teal-300 text-sm rounded-lg hover:bg-white/5 transition-all duration-200"
                      >
                        {subItem.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <button className="w-full px-4 py-3 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200">
                Sign In
              </button>
              <button className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-blue-400 rounded-lg hover:from-teal-300 hover:to-blue-300 transition-all duration-200">
                Get Access
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Header;