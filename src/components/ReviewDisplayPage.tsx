import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { CSSProperties } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function ReviewDisplayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [showFullReview, setShowFullReview] = useState(false);

  const { productName, skinType, review } = location.state || {};

  useEffect(() => {
    if (!productName || !review) {
      navigate('/');
      return;
    }
    fetchProductImage(productName);
  }, [productName, review, navigate]);

  const fetchProductImage = async (product: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/product-image?product_name=${encodeURIComponent(product)}`
      );
      const data = await response.json();

      if (data.imageUrl) {
        setProductImage(data.imageUrl);
      } else {
        setProductImage("https://images.placeholders.dev/?width=400&height=400&text=Product+Image");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setProductImage("https://images.placeholders.dev/?width=400&height=400&text=Product+Image");
    } finally {
      setImageLoading(false);
    }
  };

  if (!productName || !review) {
    return null;
  }

  const extractKeyPoints = (reviewText: string) => {
    const decisionMatch = reviewText.match(/\*\*Decision:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const prosMatch = reviewText.match(/\*\*👍.*?\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const consMatch = reviewText.match(/\*\*👎.*?\*\*\s*(.+?)(?=\n\*\*|$)/s);

    const decision = decisionMatch ? decisionMatch[1].trim() : '';

    const parseList = (text: string) => {
      if (!text) return [];
      return text
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^-\s*/, '').trim())
        .filter((item: string) => item.length > 0)
        .slice(0, 3);
    };

    const pros = parseList(prosMatch ? prosMatch[1] : '');
    const cons = parseList(consMatch ? consMatch[1] : '');

    return { decision, pros, cons };
  };

  const keyPoints = extractKeyPoints(review);

  const renderReviewHtml = (markdownText: string) => {
    const rawMarkup = marked.parse(markdownText) as string;
    return DOMPurify.sanitize(rawMarkup);
  };

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
    <div style={backgroundStyle} className="p-8 flex justify-center py-12 min-h-screen">
      <div className="w-full max-w-6xl backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/20 bg-white/10 my-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors"
        >
          ← Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{productName}</h1>
          <p className="text-gray-600">Review for <span className="font-semibold text-blue-700">{skinType}</span> skin</p>
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">

          {/* Product Image Section */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-6">
              {imageLoading ? (
                <div className="bg-gray-200 w-full h-80 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">Loading image...</p>
                </div>
              ) : (
                <img 
                  src={productImage || undefined}
                  alt={productName}
                  className="w-full h-80 object-cover rounded-xl shadow-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.placeholders.dev/?width=400&height=400&text=Product+Image';
                  }}
                />
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {productName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Skin Type:</strong> {skinType}
                </p>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl border-2 border-white/40 shadow-sm">

              {!showFullReview ? (
                <div className="text-gray-900">
                  <div className="mb-4">
                    <p className="font-semibold text-lg">{keyPoints.decision}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-md mb-2 flex items-center gap-2">
                      <span>👍</span> Pros
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {keyPoints.pros.map((pro: string, idx: number) => (<li key={idx}>{pro}</li>))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-md mb-2 flex items-center gap-2">
                      <span>👎</span> Cons
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {keyPoints.cons.map((con: string, idx: number) => (<li key={idx}>{con}</li>))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowFullReview(true)}
                    className="mt-4 text-blue-700 hover:text-blue-900 font-semibold underline"
                  >
                    Know More →
                  </button>
                </div>
              ) : (
                <div className="text-gray-900 leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ __html: renderReviewHtml(review) }}
                  />
                  <button
                    onClick={() => setShowFullReview(false)}
                    className="mt-4 text-blue-700 hover:text-blue-900 font-semibold underline"
                  >
                    ← Show Less
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => navigate('/product-review')}
                className="flex-1 bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all border-2 border-blue-200"
              >
                Analyze Another Product
              </button>
              <button
                onClick={() => navigate('/compatibility-checker')}
                className="flex-1 bg-purple-100 text-purple-900 py-3 px-6 rounded-lg font-semibold hover:bg-purple-200 transition-all border-2 border-purple-200"
              >
                Check Compatibility
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}