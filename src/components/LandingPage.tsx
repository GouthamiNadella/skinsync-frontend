import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  const backgroundStyle: CSSProperties = {
    backgroundImage: 'url(/bgImage.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    overflowY: 'auto',
  };

  return (
    <div style={backgroundStyle} className="min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-5xl backdrop-blur-md rounded-2xl shadow-2xl p-12 border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            SkinSync
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI-Powered Skincare Intelligence
          </p>
          <p className="text-gray-500">
            Get personalized product reviews and routine compatibility analysis
          </p>
        </div>

        {/* Two Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Quick Product Review */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-8 border-2 border-white/60 hover:border-blue-300 transition-all hover:shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-200">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Quick Product Review
              </h2>
              <p className="text-gray-600 text-sm">
                Get instant AI-powered review for any skincare product based on your skin type
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">✓</span>
                <p className="text-sm text-gray-700">
                  Personalized review for your skin type
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">✓</span>
                <p className="text-sm text-gray-700">
                  Pros, cons, and usage tips
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 mt-1">✓</span>
                <p className="text-sm text-gray-700">
                  Instant AI-generated insights
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/product-review')}
              className="w-full bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200"
            >
              Get Product Review →
            </button>
          </div>

          {/* Routine Compatibility Checker */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl p-8 border-2 border-white/60 hover:border-purple-300 transition-all hover:shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-200">
                <span className="text-3xl">🔬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Routine Compatibility
              </h2>
              <p className="text-gray-600 text-sm">
                Analyze if a new product works with your existing skincare routine
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 mt-1">✓</span>
                <p className="text-sm text-gray-700">
                  Detect ingredient conflicts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 mt-1">✓</span>
                <p className="text-sm text-gray-700">
                  AI-powered compatibility score
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 mt-1">✓</span>
                <p className="text-sm text-gray-700">
                  Safe usage recommendations
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/compatibility-checker')}
              className="w-full bg-purple-100 text-purple-900 py-3 px-6 rounded-lg font-semibold hover:bg-purple-200 transition-all transform hover:scale-105 shadow-lg border-2 border-purple-200"
            >
              Check Compatibility →
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 p-6 bg-white/30 backdrop-blur-sm rounded-xl border-2 border-white/40">
          <p className="text-gray-700 text-sm">
            <strong>New to skincare?</strong> Start with a Quick Product Review to understand individual products.
          </p>
          <p className="text-gray-700 text-sm mt-2">
            <strong>Building a routine?</strong> Use Routine Compatibility to ensure all products work together safely.
          </p>
        </div>

      </div>
    </div>
  );
}