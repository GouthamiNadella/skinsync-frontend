import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CompatibilityChecker() {
  const [step, setStep] = useState('skinType');
  const [skinType, setSkinType] = useState('');
  const [amProducts, setAmProducts] = useState([]);
  const [pmProducts, setPmProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({});
  const [newProductRoutine, setNewProductRoutine] = useState('');
  const [productInput, setProductInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (productInput.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    
    // First try local database
    fetch(`http://localhost:8000/api/products/search?query=${productInput}`)
      .then(res => res.json())
      .then(results => {
        if (results.length === 0) {
          // Not found in database, try Gemini
          setError('Not found in database. Searching online...');
          return fetch('http://localhost:8000/api/fetch-ingredients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_name: productInput })
          }).then(res => res.json());
        }
        // Mark database results with source
        return { found: true, data: results.map(r => ({ ...r, source: 'database' })) };
      })
      .then(result => {
        if (result.found) {
          // Results from local database
          setSearchResults(result.data);
          setShowDropdown(true);
          setError('');
        } else if (result.error) {
          // Gemini couldn't find it
          setError('Product not found online. Please enter ingredients manually.');
          setSearchResults([]);
        } else {
          // Gemini found it - mark as online source
          setSearchResults([{ ...result, source: 'online' }]);
          setShowDropdown(true);
          setError('');
        }
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('Failed to search. Please enter ingredients manually.');
        setSearchResults([]);
      })
      .finally(() => setLoading(false));
  };

  const selectProduct = async (product) => {
    const productObj = {
      title: product.title || 'Unknown Product',
      brand: product.brand || 'Unknown Brand',
      ingredients: Array.isArray(product.ingredients) 
        ? product.ingredients 
        : (typeof product.ingredients === 'string' 
          ? product.ingredients.split(',').map(i => i.trim()).filter(i => i)
          : []),
      sku: product.sku || `prod-${Date.now()}`,
      source: product.source || 'database'
    };

    console.log('📦 Selected Product:', productObj);
    console.log('🧪 Ingredients:', productObj.ingredients);
    console.log('📍 Source:', productObj.source);

    // If from online (Gemini), save to database
    if (product.source === 'online') {
      try {
        console.log('💾 Saving product to database...');
        const saveResponse = await fetch('http://localhost:8000/api/products/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productObj)
        });

        const saveResult = await saveResponse.json();
        console.log('✅ Save response:', saveResult);

        if (saveResponse.ok) {
          console.log('✅ Product saved to database successfully');
        } else {
          console.warn('⚠️ Failed to save product:', saveResult);
        }
      } catch (err) {
        console.error('❌ Error saving product to database:', err);
      }
    }

    if (step === 'selectNewProduct') {
      setNewProduct(productObj);
      setStep('results');
    } else {
      if (step === 'addAmProducts') {
        setAmProducts([...amProducts, productObj]);
      } else if (step === 'addPmProducts') {
        setPmProducts([...pmProducts, productObj]);
      }
    }

    setProductInput('');
    setShowDropdown(false);
    setError('');
  };

  const removeProduct = (index, routine) => {
    if (routine === 'AM') {
      setAmProducts(amProducts.filter((_, i) => i !== index));
    } else {
      setPmProducts(pmProducts.filter((_, i) => i !== index));
    }
  };

  const fetchAIAnalysis = async () => {
    const sameRoutineProducts = newProductRoutine === 'AM' ? amProducts : pmProducts;

    setAiLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/analyze-compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentProducts: sameRoutineProducts,
          newProduct: newProduct,
          skinType: skinType,
          detectedConflicts: []  // Backend will detect conflicts
        })
      });

      const analysis = await response.json();
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAiAnalysis(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'results' && Object.keys(newProduct).length > 0) {
      fetchAIAnalysis();
    }
  }, [step, newProduct]);

  const handleNext = () => {
    if (step === 'skinType' && skinType) {
      setStep('addAmProducts');
    } else if (step === 'addAmProducts') {
      setStep('addPmProducts');
    } else if (step === 'addPmProducts') {
      setStep('selectNewProductRoutine');
    } else if (step === 'selectNewProductRoutine' && newProductRoutine) {
      setStep('selectNewProduct');
    }
  };

  const getPreviousStep = (currentStep) => {
    const steps = {
      addAmProducts: 'skinType',
      addPmProducts: 'addAmProducts',
      selectNewProductRoutine: 'addPmProducts',
      selectNewProduct: 'selectNewProductRoutine',
      results: 'selectNewProduct'
    };
    return steps[currentStep] || 'skinType';
  };

  const resetForm = () => {
    setStep('skinType');
    setSkinType('');
    setAmProducts([]);
    setPmProducts([]);
    setNewProduct({});
    setNewProductRoutine('');
    setProductInput('');
    setAiAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-4">
      <div className="max-w-2xl mx-auto mt-8">
        {step !== 'skinType' && (
          <button onClick={() => setStep(getPreviousStep(step))} className="text-blue-500 mb-4 font-semibold hover:text-blue-700 transition-colors">
            ← Back
          </button>
        )}

        {step === 'skinType' && (
          <SkinTypeStep skinType={skinType} setSkinType={setSkinType} onNext={handleNext} navigate={navigate} />
        )}

        {step === 'addAmProducts' && (
          <AddProductsStep
            title="Add AM Products"
            subtitle={`Skin type: ${skinType}`}
            searchResults={searchResults}
            showDropdown={showDropdown}
            loading={loading}
            error={error}
            productInput={productInput}
            setProductInput={setProductInput}
            onSearch={handleSearch}
            onSelectProduct={selectProduct}
            products={amProducts}
            onRemove={(idx) => removeProduct(idx, 'AM')}
            routineLabel="AM Products:"
            onContinue={handleNext}
          />
        )}

        {step === 'addPmProducts' && (
          <AddProductsStep
            title="Add PM Products"
            subtitle={`Skin type: ${skinType} | AM Products: ${amProducts.length}`}
            searchResults={searchResults}
            showDropdown={showDropdown}
            loading={loading}
            error={error}
            productInput={productInput}
            setProductInput={setProductInput}
            onSearch={handleSearch}
            onSelectProduct={selectProduct}
            products={pmProducts}
            onRemove={(idx) => removeProduct(idx, 'PM')}
            routineLabel="PM Products:"
            onContinue={handleNext}
          />
        )}

        {step === 'selectNewProductRoutine' && (
          <SelectRoutineStep
            amCount={amProducts.length}
            pmCount={pmProducts.length}
            selected={newProductRoutine}
            onSelect={setNewProductRoutine}
            onContinue={handleNext}
          />
        )}

        {step === 'selectNewProduct' && (
          <SearchProductStep
            searchResults={searchResults}
            showDropdown={showDropdown}
            loading={loading}
            error={error}
            productInput={productInput}
            setProductInput={setProductInput}
            onSearch={handleSearch}
            onSelectProduct={selectProduct}
            newProductRoutine={newProductRoutine}
          />
        )}

        {step === 'results' && (
          <ResultsPage
            newProduct={newProduct}
            newProductRoutine={newProductRoutine}
            amProducts={amProducts}
            pmProducts={pmProducts}
            skinType={skinType}
            aiLoading={aiLoading}
            aiAnalysis={aiAnalysis}
            onReset={resetForm}
          />
        )}
      </div>
    </div>
  );
}

// ===== UI COMPONENTS =====
function SkinTypeStep({ skinType, setSkinType, onNext, navigate }) {
  const skinTypes = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];
  return (
    <div className="max-w-md mx-auto mt-12">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors"
      >
        ← Back to Home
      </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Skincare Compatibility</h1>
      <p className="text-gray-600 mb-8">Check if new products work with your routine</p>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">What's your skin type?</h2>
        <div className="space-y-2">
          {skinTypes.map(type => (
            <button
              key={type}
              onClick={() => setSkinType(type)}
              className={`w-full p-3 text-left rounded-lg border-2 transition ${
                skinType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <button
          onClick={onNext}
          disabled={!skinType}
          className="w-full mt-6 bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:hover:scale-100 disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function AddProductsStep({ title, subtitle, searchResults, showDropdown, loading, error, productInput, setProductInput, onSearch, onSelectProduct, products, onRemove, routineLabel, onContinue }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{subtitle}</p>
      <SearchBox
        searchResults={searchResults}
        showDropdown={showDropdown}
        loading={loading}
        error={error}
        productInput={productInput}
        setProductInput={setProductInput}
        onSearch={onSearch}
        onSelectProduct={onSelectProduct}
      />
      <ProductList products={products} onRemove={onRemove} label={routineLabel} />
      <button onClick={onContinue} className="w-full bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200 mt-6">
        Continue
      </button>
    </div>
  );
}

function SelectRoutineStep({ amCount, pmCount, selected, onSelect, onContinue }) {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">New Product Routine</h1>
      <p className="text-gray-600 mb-8">Which routine do you want to add the new product to?</p>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-2">
          <button
            onClick={() => onSelect('AM')}
            className={`w-full p-4 text-left rounded-lg border-2 transition ${
              selected === 'AM' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold">AM Routine</div>
            <div className="text-sm text-gray-600">{amCount} products currently</div>
          </button>
          <button
            onClick={() => onSelect('PM')}
            className={`w-full p-4 text-left rounded-lg border-2 transition ${
              selected === 'PM' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold">PM Routine</div>
            <div className="text-sm text-gray-600">{pmCount} products currently</div>
          </button>
        </div>
        <button
          onClick={onContinue}
          disabled={!selected}
          className="w-full mt-6 bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:hover:scale-100 disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function SearchProductStep({ searchResults, showDropdown, loading, error, productInput, setProductInput, onSearch, onSelectProduct, newProductRoutine }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Select New Product</h1>
      <p className="text-gray-600 mb-6">Adding to: {newProductRoutine} Routine</p>
      <SearchBox
        searchResults={searchResults}
        showDropdown={showDropdown}
        loading={loading}
        error={error}
        productInput={productInput}
        setProductInput={setProductInput}
        onSearch={onSearch}
        onSelectProduct={onSelectProduct}
      />
    </div>
  );
}

function SearchBox({ searchResults, showDropdown, loading, error, productInput, setProductInput, onSearch, onSelectProduct }) {
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [manualIngredients, setManualIngredients] = React.useState('');

  const handleManualSubmit = () => {
    if (manualIngredients.trim()) {
      const ingredientsList = manualIngredients
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      const productObj = {
        title: productInput || 'Manual Entry',
        brand: 'Custom',
        ingredients: ingredientsList,
        sku: 'manual-' + Date.now()
      };

      onSelectProduct(productObj);
      setManualIngredients('');
      setShowManualEntry(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <label className="block text-sm font-semibold mb-2">Search Product</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          placeholder="e.g., CeraVe, The Ordinary"
          className="flex-1 border rounded-lg p-2"
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2"
        >
          {loading ? <Loader className="animate-spin" size={20} /> : 'Search'}
        </button>
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="border rounded-lg bg-gray-50 max-h-64 overflow-y-auto mb-4">
          {searchResults.map((product, idx) => (
            <button
              key={idx}
              onClick={() => onSelectProduct(product)}
              className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold">{product.brand} - {product.title}</div>
                {product.source === 'online' && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded ml-2 flex-shrink-0">
                    Found online
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
          <p>{error}</p>
          <button
            onClick={() => setShowManualEntry(true)}
            className="text-yellow-700 font-semibold hover:underline mt-2"
          >
            Enter ingredients manually instead
          </button>
        </div>
      )}

      {showManualEntry && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold mb-2">Enter Ingredients Manually</h4>
          <p className="text-sm text-gray-600 mb-3">Separate ingredients with commas (e.g., Water, Glycerin, Retinol)</p>
          <textarea
            value={manualIngredients}
            onChange={(e) => setManualIngredients(e.target.value)}
            placeholder="Water, Glycerin, Ceramide NP, Hyaluronic Acid"
            className="w-full border rounded-lg p-2 mb-3 text-sm"
            rows="4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleManualSubmit}
              className="flex-1 bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200"
            >
              Add Product
            </button>
            <button
              onClick={() => setShowManualEntry(false)}
              className="flex-1 bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductList({ products, onRemove, label }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="font-semibold mb-3">{label}</h3>
      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">No products added yet</p>
      ) : (
        <div className="space-y-2">
          {products.map((prod, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
              <div className="font-semibold">{prod.brand} - {prod.title}</div>
              <button onClick={() => onRemove(idx)} className="text-red-500">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsPage({ newProduct, newProductRoutine, amProducts, pmProducts, skinType, aiLoading, aiAnalysis, onReset }) {
  const score = aiAnalysis?.score || 0;

  const getScoreColor = () => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (score >= 4) return 'bg-green-50';
    if (score >= 3) return 'bg-yellow-50';
    if (score >= 2) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Compatibility Analysis</h1>
      {aiLoading ? (
        <div className="max-w-2xl mx-auto bg-blue-50 rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <Loader className="animate-spin inline-block mb-4" size={32} />
            <p className="text-blue-700 font-semibold">Analyzing product compatibility with AI...</p>
            <p className="text-blue-600 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      ) : (
        <div className={`${getScoreBg()} rounded-lg shadow-lg p-8 mb-6`}>
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Compatibility Score</p>
            <div className={`text-6xl font-bold ${getScoreColor()}`}>{score}/5</div>
            <p className="text-gray-600 mt-2">
              {score >= 4 && "Perfect fit! This product complements your routine."}
              {score >= 3 && score < 4 && "Good fit. This product works with your routine."}
              {score >= 2 && score < 3 && "Caution. There may be some compatibility issues."}
              {score < 2 && "Not recommended. This product may damage your skin."}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">New Product:</h3>
            <p className="text-gray-700">{newProduct.brand} - {newProduct.title}</p>
            <p className="text-sm text-gray-600 mt-1">Adding to: {newProductRoutine} Routine</p>
          </div>

          {aiAnalysis && (
            <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500 mt-4">
              <h3 className="font-semibold text-indigo-600 mb-3">AI Personalized Analysis</h3>
              <div className="space-y-3">
                {aiAnalysis.explanation && <p className="text-sm text-gray-700">{aiAnalysis.explanation}</p>}
                {aiAnalysis.recommendations?.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Recommendations:</p>
                    <ul className="space-y-1 ml-4">
                      {aiAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="list-disc">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={onReset} className="w-full bg-blue-100 text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-200">
        Start Over
      </button>
    </div>
  );
}