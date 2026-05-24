import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        <Route path="/" element={
          <div className="p-20 text-center font-serif text-brand-burgundy text-3xl">
            Welcome to the Twinkly Nails Homepage!
          </div>
        } />
        <Route path="/services" element={<div className="p-10 text-center">Services Page</div>} />
        <Route path="/promotions" element={<div className="p-10 text-center">Promotions Page</div>} />
        <Route path="/gallery" element={<div className="p-10 text-center">Gallery Page</div>} />
        <Route path="/contact" element={<div className="p-10 text-center">Contact Page</div>} />
      </Routes>
    </Router>
  );
}

// THIS LINE IS CRITICAL - It exports the App so main.jsx can use it
export default App;