"use client";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Zap,
  TrendingDown,
  Upload,
  Loader,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ShortTermSummary from "@/components/SummaryReport";

const ModelDemoPage = () => {
  const [shortTermLoading, setShortTermLoading] = useState(false);
  const [longTermLoading, setLongTermLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeModel, setActiveModel] = useState(null);

  const models = [
    {
      id: "short-term",
      title: "Short-Term Model",
      duration: "7 Days",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      description:
        "Predict coastal erosion patterns for the next 7 days. Perfect for immediate decision-making and event planning.",
      features: [
        "Daily erosion predictions",
        "Real-time satellite data",
        "Tidal condition analysis",
        "Weather impact assessment",
      ],
      apiEndpoint: "/api/predict/short-term",
    },
    {
      id: "long-term",
      title: "Long-Term Model",
      duration: "1 Month",
      icon: Calendar,
      color: "from-teal-500 to-green-500",
      description:
        "Forecast coastal changes over a full month. Ideal for planning coastal protection measures and infrastructure.",
      features: [
        "Weekly trend analysis",
        "Climate pattern integration",
        "Seasonal variations",
        "Long-term risk assessment",
      ],
      apiEndpoint: "/api/predict/long-term",
    },
  ];

  const handlePredict = async (modelId: any) => {
    const model = models.find((m) => m.id === modelId);

    if (!model) {
      console.error("Model not found:", modelId);
      return;
    }

    if (modelId === "short-term") {
      setShortTermLoading(true);
    } else {
      setLongTermLoading(true);
    }

    try {
      // Check if we should use mock data or real API
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

      let response;

      if (useMockData) {
        // Use mock data
        response = {
          ok: true,
          json: async () => mockPredictionData(modelId),
        };
      } else {
        // Make real API call
        response = await fetch(`${apiBaseUrl}${model.apiEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
      }
      console.log("response:", response);
      if (response.ok) {
        const data = await response.json();
        console.log("data:", data);

        // Handle API response format
        if (data.success && data.model_result) {
          setResults({
            modelId,
            modelTitle: model.title,
            duration: model.duration,
            data: {
              model_result: data.model_result,
            },
            timestamp: new Date(),
            modelInfo: data.model_info,
          });
        } else {
          // Fallback to mock data if API response is unexpected
          setResults({
            modelId,
            modelTitle: model.title,
            duration: model.duration,
            data: mockPredictionData(modelId),
            timestamp: new Date(),
            error: data.message || "Unexpected API response format",
          });
        }
        setActiveModel(modelId);
      } else {
        // API call failed, use mock data as fallback
        console.warn("API call failed, using mock data:", response.status);
        setResults({
          modelId,
          modelTitle: model.title,
          duration: model.duration,
          data: mockPredictionData(modelId),
          timestamp: new Date(),
          error: "API unavailable, showing demo data",
        });
        setActiveModel(modelId);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      // Fallback to mock data on any error
      setResults({
        modelId,
        modelTitle: model.title,
        duration: model.duration,
        data: mockPredictionData(modelId),
        timestamp: new Date(),
        error: "Connection failed, showing demo data",
      });
      setActiveModel(modelId);
    } finally {
      if (modelId === "short-term") {
        setShortTermLoading(false);
      } else {
        setLongTermLoading(false);
      }
    }
  };

  const mockPredictionData = (modelId) => {
    if (modelId === "short-term") {
      return {
        predictions: [
          {
            day: "Day 1",
            erosion: 0.2,
            confidence: 97,
            image:
              "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600",
          },
          {
            day: "Day 2",
            erosion: 0.3,
            confidence: 96,
            image:
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
          },
          {
            day: "Day 3",
            erosion: 0.15,
            confidence: 98,
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
          },
          {
            day: "Day 4",
            erosion: 0.25,
            confidence: 95,
            image:
              "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600",
          },
          {
            day: "Day 5",
            erosion: 0.35,
            confidence: 94,
            image:
              "https://images.unsplash.com/photo-1501426614570-ce3d7016574a?w=600",
          },
          {
            day: "Day 6",
            erosion: 0.22,
            confidence: 97,
            image:
              "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600",
          },
          {
            day: "Day 7",
            erosion: 0.28,
            confidence: 96,
            image:
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
          },
        ],
        success: true,
      };
    } else {
      return {
        predictions: [
          {
            week: "Week 1",
            erosion: 0.85,
            confidence: 97,
            image:
              "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600",
          },
          {
            week: "Week 2",
            erosion: 1.2,
            confidence: 96,
            image:
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
          },
          {
            week: "Week 3",
            erosion: 0.95,
            confidence: 95,
            image:
              "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600",
          },
          {
            week: "Week 4",
            erosion: 1.1,
            confidence: 94,
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
          },
        ],
        success: true,
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Test Our{" "}
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Prediction Models
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose between short-term (7-day) or long-term (1-month)
              predictions to see how our AI analyzes coastal erosion patterns
            </p>
          </div>

          {/* Model Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {models.map((model) => {
              const isLoading =
                model.id === "short-term" ? shortTermLoading : longTermLoading;
              const Icon = model.icon;

              return (
                <div
                  key={model.id}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
                  <div
                    className={`bg-gradient-to-br ${model.color} p-8 text-white relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">{model.title}</h2>
                          <p className="text-white/80">
                            {model.duration} Forecast
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {model.description}
                    </p>

                    {/* Features */}
                    <div className="mb-8 space-y-3">
                      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                        Features
                      </h3>
                      {model.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"></div>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Info Box */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-700">
                          <strong>How it works:</strong> Click the button below
                          to run the prediction model and receive AI-generated
                          satellite imagery analysis showing predicted erosion
                          patterns.
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handlePredict(model.id)}
                      disabled={shortTermLoading || longTermLoading}
                      className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                        shortTermLoading || longTermLoading
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : `bg-gradient-to-r ${model.color} text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`
                      }`}
                    >
                      {(
                        model.id === "short-term"
                          ? shortTermLoading
                          : longTermLoading
                      ) ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Run Prediction</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results Section */}
          {results && (
            <div className="mb-16 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Results Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {results.modelTitle} Results
                    </h3>
                    <p className="text-slate-300">
                      Generated on {results.timestamp.toLocaleString()}
                    </p>
                    {results.error && (
                      <div className="mt-2 flex items-center gap-2 text-amber-300">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{results.error}</span>
                      </div>
                    )}
                    {results.modelInfo && (
                      <div className="mt-2 text-sm text-slate-400">
                        Model: {results.modelInfo.type} • Duration:{" "}
                        {results.modelInfo.duration}
                      </div>
                    )}
                  </div>
                  {results.error ? (
                    <AlertCircle className="w-12 h-12 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  )}
                </div>

                {/* Predictions Grid */}
                {/* Results Display */}
                <div className="p-8">
                  {results.modelId === "short-term" ? (
                    // ✅ Short-term summary view
                    <div className="space-y-8">
                      {results.data.model_result && (
                        <ShortTermSummary
                          modelResult={results.data.model_result}
                        />
                      )}
                    </div>
                  ) : (
                    // ✅ Long-term existing grid view
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {results.data.predictions.map((pred, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="relative h-48 overflow-hidden bg-gray-100">
                            <img
                              src={pred.image}
                              alt={pred.day || pred.week}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                          </div>
                          <div className="p-4 bg-white">
                            <h4 className="font-bold text-gray-900 mb-3">
                              {pred.day || pred.week}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                  Erosion Rate
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                  <span className="text-lg font-bold text-red-600">
                                    {pred.erosion}m
                                  </span>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                  Confidence
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                                      style={{ width: `${pred.confidence}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-700">
                                    {pred.confidence}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download Section */}
                <div className="bg-gray-50 p-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Export Results
                    </h4>
                    <p className="text-sm text-gray-600">
                      Download the prediction data and imagery for further
                      analysis
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!results && (
            <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Predictions Yet
              </h3>
              <p className="text-gray-600">
                Select a model and click "Run Prediction" to see erosion
                forecasts and AI-generated imagery
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ModelDemoPage;
