'use client'
import { useState } from 'react';
import { Brain, Zap, TrendingUp, Shield, ChevronRight, Play, Cpu, Sparkles } from 'lucide-react';

const ContentSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "Deep Learning Architecture",
      description: "Built on state-of-the-art convolutional neural networks trained on 10 years of satellite imagery data.",
      stat: "98.5%",
      statLabel: "Detection Accuracy"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Analyze coastal changes in minutes, not days. Our optimized pipeline processes satellite data instantly.",
      stat: "< 5min",
      statLabel: "Processing Time"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast erosion patterns up to 5 years ahead using advanced temporal modeling and climate data.",
      stat: "5 years",
      statLabel: "Forecast Range"
    },
    {
      icon: Shield,
      title: "Validated Results",
      description: "Cross-validated with ground surveys and peer-reviewed research for reliable coastal management decisions.",
      stat: "1000+",
      statLabel: "Validation Points"
    }
  ];

  return (
    <div className="relative bg-gradient-to-b from-slate-50 to-white py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(20, 184, 166) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full mb-4">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-teal-600">AI-Powered Technology</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Shoreline Intelligence</span> Model
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI that transforms satellite imagery into actionable insights for coastal protection and climate adaptation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Interactive Model Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h3>
                  <p className="text-gray-600">Multi-stage AI pipeline for precision coastal monitoring</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border-l-4 border-teal-500">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Image Acquisition</h4>
                    <p className="text-sm text-gray-600">High-resolution satellite imagery collected from multiple sources including Sentinel-2 and Landsat-8</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border-l-4 border-blue-500">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI Detection</h4>
                    <p className="text-sm text-gray-600">Deep neural networks identify shoreline positions with sub-meter accuracy across different tidal conditions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border-l-4 border-teal-500">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Change Analysis</h4>
                    <p className="text-sm text-gray-600">Temporal algorithms track erosion patterns and calculate rates of change over time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border-l-4 border-blue-500">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Predictive Modeling</h4>
                    <p className="text-sm text-gray-600">Machine learning forecasts future shoreline positions based on historical trends and environmental factors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="group w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Model Demo
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Image with Overlay */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-blue-500 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
                alt="Aerial coastal view"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay Stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-8">
                <div className="w-full grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">15TB</div>
                    <div className="text-xs text-slate-200">Training Data</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">50K+</div>
                    <div className="text-xs text-slate-200">Images Analyzed</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-xs text-slate-200">Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`relative p-6 bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                activeFeature === idx
                  ? 'border-teal-500 shadow-lg shadow-teal-100'
                  : 'border-gray-100 hover:border-teal-200 hover:shadow-md'
              }`}
              onMouseEnter={() => setActiveFeature(idx)}
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 transition-all duration-300 ${
                activeFeature === idx
                  ? 'bg-gradient-to-br from-teal-500 to-blue-500 scale-110'
                  : 'bg-gray-100'
              }`}>
                <feature.icon className={`w-6 h-6 ${activeFeature === idx ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
              <div className="pt-4 border-t border-gray-100">
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  {feature.stat}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{feature.statLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentSection;