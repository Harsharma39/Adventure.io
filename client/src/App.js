import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RidesPage from './pages/RidesPage';
import HomePage from './pages/HomePage';
import BookTickets from './pages/BookTickets'; // File is BookTickets.js

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book-tickets" element={<BookTickets />} />
        <Route path="/rides" element={<RidesPage />} />
      </Routes>
    </Router>
  );
}

export default App;