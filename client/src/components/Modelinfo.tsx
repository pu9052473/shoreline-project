'use client'
import { useState } from 'react';
import { TrendingDown, Target, CheckCircle2, Activity, Layers, ChevronRight, Calendar, MapPin } from 'lucide-react';

const ModelSection = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedPrediction, setSelectedPrediction] = useState(0);

  const predictions = [
    {
      date: 'Oct 2024',
      location: 'Frankston Beach North',
      erosionRate: '-2.3m/yr',
      confidence: '97%',
      riskLevel: 'High',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    },
    {
      date: 'Sep 2024',
      location: 'Seaford Foreshore',
      erosionRate: '-1.8m/yr',
      confidence: '95%',
      riskLevel: 'Medium',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400'
    },
    {
      date: 'Aug 2024',
      location: 'Olivers Hill',
      erosionRate: '-3.1m/yr',
      confidence: '98%',
      riskLevel: 'Critical',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
    },
    {
      date: 'Jul 2024',
      location: 'Kananook Creek',
      erosionRate: '-1.2m/yr',
      confidence: '94%',
      riskLevel: 'Low',
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400'
    }
  ];

  const metrics = [
    { label: 'Model Accuracy', value: '98.5%', icon: Target, bgClass: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { label: 'Predictions Made', value: '2,847', icon: Activity, bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Validated Cases', value: '1,234', icon: CheckCircle2, bgClass: 'bg-gradient-to-br from-green-500 to-green-600' },
    { label: 'Data Points', value: '50K+', icon: Layers, bgClass: 'bg-gradient-to-br from-purple-500 to-purple-600' }
  ];

  const getRiskColor = (risk: any) => {
    switch(risk) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Live Model Output</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">AI Model</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time predictions and validated results from our state-of-the-art coastal erosion detection system
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className={`inline-flex p-3 rounded-xl mb-4 ${metric.bgClass}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Model Description */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Model Overview</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our deep learning model uses advanced computer vision techniques to analyze multi-temporal satellite imagery. 
              Trained on over 15TB of coastal data spanning 10 years, it achieves unprecedented accuracy in detecting 
              shoreline changes and predicting future erosion patterns.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Multi-Spectral Analysis</div>
                  <div className="text-sm text-gray-600">Processes RGB, NIR, and SWIR bands</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Temporal Modeling</div>
                  <div className="text-sm text-gray-600">Tracks changes over time with LSTM networks</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Validated Accuracy</div>
                  <div className="text-sm text-gray-600">Cross-validated with ground surveys</div>
                </div>
              </div>
            </div>
          </div>

          {/* Erosion Risk Chart */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Coastal Erosion Risk by Zone</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">North Zone</span>
                  <span className="text-sm font-bold text-red-600">Critical</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Central Zone</span>
                  <span className="text-sm font-bold text-orange-600">High</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">South Zone</span>
                  <span className="text-sm font-bold text-yellow-600">Medium</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full" style={{width: '54%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Protected Areas</span>
                  <span className="text-sm font-bold text-green-600">Low</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{width: '28%'}}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="text-sm font-medium text-blue-900 mb-1">Prediction Horizon</div>
              <div className="text-xs text-blue-700">Risk assessment valid for next 12-18 months</div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Shoreline Retreat Trend</h3>
            <div className="relative h-48">
              <svg className="w-full h-full" viewBox="0 0 300 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#chartGradient)"
                  stroke="none"
                  points="0,180 0,120 50,100 100,85 150,75 200,60 250,45 300,30 300,180"
                />
                <polyline
                  fill="none"
                  stroke="rgb(20, 184, 166)"
                  strokeWidth="3"
                  points="0,120 50,100 100,85 150,75 200,60 250,45 300,30"
                />
                <circle cx="300" cy="30" r="5" fill="rgb(20, 184, 166)" />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                <span>2000</span>
                <span>2005</span>
                <span>2010</span>
                <span>2015</span>
                <span>2020</span>
                <span>2025</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">-24.3m</div>
                  <div className="text-xs text-gray-600">Total retreat (2000-2025)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Predictions Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Predictions</h2>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {predictions.map((pred, idx) => (
              <div
                key={idx}
                className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  selectedPrediction === idx
                    ? 'border-teal-500 shadow-lg shadow-teal-100'
                    : 'border-gray-200 hover:border-teal-200 hover:shadow-md'
                }`}
                onClick={() => setSelectedPrediction(idx)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pred.image}
                    alt={pred.location}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border-2 backdrop-blur-sm ${getRiskColor(pred.riskLevel)}`}>
                    {pred.riskLevel} Risk
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-1" />
                    <div className="font-semibold text-gray-900 text-sm">{pred.location}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {pred.date}
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Erosion Rate:</span>
                      <span className="font-bold text-red-600">{pred.erosionRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-bold text-teal-600">{pred.confidence}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Prediction Details */}
          <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Analysis: {predictions[selectedPrediction].location}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Our AI model detected significant shoreline retreat at this location. The predicted erosion rate of {predictions[selectedPrediction].erosionRate} 
                  indicates {predictions[selectedPrediction].riskLevel.toLowerCase()} risk requiring immediate attention. Confidence level of {predictions[selectedPrediction].confidence} based 
                  on {predictions[selectedPrediction].date} satellite imagery analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModelSection;