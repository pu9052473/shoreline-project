'use client'
import { useState } from 'react';
import { Upload, Image, Zap, BarChart3, ExternalLink, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';


const TryOutSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  const steps = [
    { icon: Upload, label: 'Upload Image', color: 'from-blue-500 to-blue-600' },
    { icon: Zap, label: 'AI Processing', color: 'from-purple-500 to-purple-600' },
    { icon: BarChart3, label: 'Get Results', color: 'from-teal-500 to-teal-600' }
  ];

  const features = [
    'Upload satellite or aerial imagery',
    'Real-time AI analysis',
    'Detailed erosion reports',
    'Interactive visualizations'
  ];

  return (
    <div className="relative bg-gradient-to-b from-slate-50 to-white py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-gray-700">Interactive Demo</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Try It <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Yourself</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of our AI model. Upload your own coastal imagery and get instant erosion analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - CTA Card */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 rounded-full mb-6">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-teal-700">Live Demo Available</span>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Test Our Model
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload your own satellite or drone imagery to see our AI in action. Get instant predictions on coastal erosion patterns.
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href='/model'>
                  <button
                    className="group w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center gap-3">
                      <Sparkles className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`} />
                          <span>Launch Demo</span>
                      <ExternalLink className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1 -translate-y-1' : ''}`} />
                    </div>
                  </button>
                </Link>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Opens in a new window • No account required
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Process Flow Diagram */}
          <div className="order-1 lg:order-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl">
              <h4 className="text-white font-bold text-xl mb-8 flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-400" />
                How It Works
              </h4>

              {/* Process Steps */}
              <div className="space-y-6">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-teal-400">Step {idx + 1}</span>
                          </div>
                          <div className="text-white font-semibold">{step.label}</div>
                        </div>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    {idx < steps.length - 1 && (
                      <div className="ml-8 my-2">
                        <ArrowRight className="w-6 h-6 text-teal-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Demo Preview */}
              <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Image className="w-5 h-5 text-teal-400" />
                  <span className="text-white font-semibold text-sm">Supported Formats</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['JPEG', 'PNG', 'TIFF', 'GeoTIFF'].map((format) => (
                    <span key={format} className="px-3 py-1 bg-white/10 rounded-lg text-xs text-white font-medium border border-white/20">
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Info Bar */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">Instant</div>
            <div className="text-sm text-gray-600">Analysis in seconds</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">Free</div>
            <div className="text-sm text-gray-600">No credit card required</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">Accurate</div>
            <div className="text-sm text-gray-600">98.5% precision rate</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TryOutSection;