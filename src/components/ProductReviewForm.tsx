import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ProductReviewForm() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [skinType, setSkinType] = useState('');
  const [errors, setErrors] = useState({ productName: '', skinType: '' });
  const [loading, setLoading] = useState(false);
  
  const skinTypes = [
    'Oily',
    'Dry', 
    'Combination',
    'Sensitive',
    'Normal',
    'Acne-Prone',
    'Mature'
  ];

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

  const handleSubmit = async () => {
    const newErrors = { productName: '', skinType: '' };

    if (!productName.trim()) {
      newErrors.productName = 'This field is required';
    }

    if (!skinType) {
      newErrors.skinType = 'This field is required';
    }

    setErrors(newErrors);

    if (!newErrors.productName && !newErrors.skinType) {
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/generate-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: productName,
            skinType: skinType
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to generate review');
        }

        const data = await response.json();

        navigate('/review', {
          state: {
            productName: data.productName,
            skinType: data.skinType,
            review: data.review
          }
        });
      } catch (error) {
        console.error('Error generating review:', error);
        alert('Sorry, there was an error generating the review. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={backgroundStyle} className="min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-4xl backdrop-blur-md rounded-2xl shadow-2xl p-8 border-gray-100">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors"
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="text-3xl font-bold text-gray-800">Quick Product Review</h1>
          </div>
          <p className="text-gray-600">
            Get personalized product reviews based on your skin type
          </p>
        </div>

        {/* Form */}
        <div className="flex gap-6 mb-6 items-end">
          
          {/* Product Name */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name
            </label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setErrors({ ...errors, productName: '' });
              }}
              placeholder="e.g., CeraVe Hydrating Cleanser" 
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-gray-800 bg-white shadow-sm ${
                errors.productName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-400'
              }`}
              disabled={loading}
            />
            {errors.productName && (
              <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
            )}
          </div>

          {/* Skin Type */}
          <div className="w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Skin Type
            </label>
            <select 
              value={skinType}
              onChange={(e) => {
                setSkinType(e.target.value);
                setErrors({ ...errors, skinType: '' });
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white text-gray-800 shadow-sm ${
                errors.skinType 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-400'
              }`}
              disabled={loading}
            >
              <option value="">Select your skin type</option>
              {skinTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.skinType && (
              <p className="text-red-500 text-sm mt-1">{errors.skinType}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`py-3 px-8 rounded-lg font-semibold transition-all transform shadow-lg whitespace-nowrap border-2 ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400' 
                : 'bg-blue-100 text-blue-900 hover:bg-blue-200 hover:scale-105 border-blue-200'
            }`}
          >
            {loading ? 'Generating...' : 'Get Review'}
          </button>
        </div>
        
        {loading && (
          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
            <div className="animate-pulse">
              <p className="text-blue-800 font-semibold text-lg">Analyzing {productName}...</p>
              <p className="text-blue-600 text-sm mt-2">Generating personalized review for {skinType} skin</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}