import { Waves, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Github, ArrowRight } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: 'Live Data Dashboard', href: '#' },
      { name: 'AI Models', href: '#' },
      { name: 'Predictions', href: '#' },
      { name: 'Interactive Maps', href: '#' },
      { name: 'API Access', href: '#' },
      { name: 'Documentation', href: '#' }
    ],
    research: [
      { name: 'Publications', href: '#' },
      { name: 'Case Studies', href: '#' },
      { name: 'Methodology', href: '#' },
      { name: 'Data Sources', href: '#' },
      { name: 'Validation Reports', href: '#' },
      { name: 'Climate Data', href: '#' }
    ],
    community: [
      { name: 'About Us', href: '#' },
      { name: 'Partners', href: '#' },
      { name: 'Contributors', href: '#' },
      { name: 'News & Updates', href: '#' },
      { name: 'Events', href: '#' },
      { name: 'Contact', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Data Usage', href: '#' },
      { name: 'Cookies', href: '#' }
    ]
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated - SignUp for our Newsletter</h3>
              <p className="text-slate-400">Get the latest coastal monitoring insights and AI predictions delivered to your inbox.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold hover:from-teal-400 hover:to-blue-400 transition-all duration-300 flex items-center justify-center gap-2 group">
                Subscribe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Waves className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">CoastWatch</div>
                <div className="text-sm text-teal-400">AI Monitoring</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Advanced AI-powered coastal erosion detection and prediction system protecting Frankston's shoreline through cutting-edge technology and data science.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Frankston, Victoria 3199, Australia</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <a href="mailto:info@coastwatch.ai" className="text-slate-400 hover:text-teal-400 transition-colors">
                  info@coastwatch.ai
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <a href="tel:+61312345678" className="text-slate-400 hover:text-teal-400 transition-colors">
                  +61 3 1234 5678
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <Twitter className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <Facebook className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-teal-400 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Research</h3>
            <ul className="space-y-3">
              {footerLinks.research.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-teal-400 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-teal-400 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-slate-400 hover:text-teal-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-teal-400 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-white/10">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-400 mb-1">98.5%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Model Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">5.2km</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Coast Monitored</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">50K+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Images Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">24/7</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Live Monitoring</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} CoastWatch AI. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-slate-500">Powered by</span>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-white/5 rounded text-slate-400 text-xs font-medium">TensorFlow</span>
              <span className="px-3 py-1 bg-white/5 rounded text-slate-400 text-xs font-medium">Sentinel-2</span>
              <span className="px-3 py-1 bg-white/5 rounded text-slate-400 text-xs font-medium">AWS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500"></div>
    </footer>
  );
};

export default Footer;