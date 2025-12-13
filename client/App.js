import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RidesPage from './pages/RidesPage';
import HomePage from './pages/HomePage';
import BookTicketsPage from './pages/BookTicketsPage'; // Note the correct name

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book-tickets" element={<BookTicketsPage />} />
        <Route path="/rides" element={<RidesPage />} />
      </Routes>
    </Router>
  );
}

export default App;