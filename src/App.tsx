import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ProductReviewForm from './components/ProductReviewForm';
import ReviewDisplayPage from './components/ReviewDisplayPage';
import CompatibilityChecker from './components/CompatibilityChecker';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Product Review Flow */}
        <Route path="/product-review" element={<ProductReviewForm />} />
        <Route path="/review" element={<ReviewDisplayPage />} />
        
        {/* Compatibility Checker Flow */}
        <Route path="/compatibility-checker" element={<CompatibilityChecker />} />
      </Routes>
    </Router>
  );
}

export default App;