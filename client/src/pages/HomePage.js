import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [imageErrors, setImageErrors] = useState({});

  const imagePath = (folder, filename) => {
    return `/images/${folder}/${filename}`;
  };

  const handleImageError = (folder, filename) => {
    setImageErrors(prev => ({
      ...prev,
      [`${folder}-${filename}`]: true
    }));
  };

  useEffect(() => {
    console.log('Trying to load images from folders:');
    console.log('Hero: hero-bg.jpg');
    for (let i = 1; i <= 4; i++) {
      console.log(`Rides: ride-${i}.jpg`);
    }
  }, []);

  return (
    <div className="homepage">
      {/* Header/Navbar */}
      <header className="header">
        <div className="container header-container">
          <Link to="/" className="logo-link">
            <div className="logo">
              <h1>ADVENTURE<span className="logo-dot">.</span>IO</h1>
              <p className="logo-tagline">WHERE THRILL MEETS EXCITEMENT</p>
            </div>
          </Link>
          
          <div className="nav-container">
            <nav className="nav">
              <Link to="/" className="nav-link active">HOME</Link>
              <Link to="/rides" className="nav-link">RIDES</Link>
              <Link to="/book-tickets" className="nav-link">TICKETS</Link>
            </nav>
            
            <Link to="/book-tickets" className="btn btn-book-now">
              BOOK NOW
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${imagePath('hero', 'hero-bg.jpg')})`
        }}
        onError={() => handleImageError('hero', 'hero-bg.jpg')}
      >
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                EXPERIENCE THE<br />
                <span className="hero-highlight">ULTIMATE ADVENTURE</span>
              </h1>
              <p className="hero-subtitle">
                India's Premier Adventure Destination with 50+ Thrilling Rides
              </p>
              <div className="hero-cta">
  <Link to="/book-tickets" className="btn btn-hero-primary">
    BOOK YOUR ADVENTURE
  </Link>
  <Link to="/rides" className="btn btn-hero-secondary">
    DISCOVER MORE
  </Link>
</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rides Section */}
      <section id="featured-rides" className="featured-rides">
        <div className="section-divider"></div>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">FEATURED THRILL RIDES</h2>
            <p className="section-subtitle">Experience adrenaline like never before</p>
          </div>
          
          <div className="rides-grid">
            {[
              {num: 1, name: 'CYCLONE COASTER', desc: 'India\'s tallest roller coaster'},
              {num: 2, name: 'TSUNAMI SPLASH', desc: 'Giant water slide adventure'},
              {num: 3, name: 'SKY DROP', desc: '90-meter free fall experience'},
              {num: 4, name: 'VERTIGO VORTEX', desc: '360° spinning thrill ride'}
            ].map((item) => {
              const filename = `ride-${item.num}.jpg`;
              return (
                <div key={item.num} className="ride-card">
                  <div 
                    className="ride-image" 
                    style={{backgroundImage: `url(${imagePath('rides', filename)})`}}
                    onError={() => handleImageError('rides', filename)}
                  >
                    {imageErrors[`rides-${filename}`] && (
                      <div className="image-error">Image not found: {filename}</div>
                    )}
                    <div className="ride-overlay">
                      <h3 className="ride-name">{item.name}</h3>
                      <p className="ride-desc">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="more-rides-text">
            <h3 className="more-rides-title">AND MANY MORE EXCITING RIDES!</h3>
            <div className="more-rides-content">
              <div className="rides-count">
                <span className="count-number">50+</span>
                <span className="count-label">THRILLING RIDES</span>
              </div>
              <p className="more-rides-description">
                Discover 50+ thrilling attractions including roller coasters, 
                water rides, family adventures, and extreme thrill experiences. 
                From family-friendly fun to adrenaline-pumping adventures, 
                we have something for everyone.
              </p>
            </div>
            <Link to="/rides" className="btn btn-view-all">
              VIEW ALL RIDES →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-divider"></div>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">READY FOR YOUR ADVENTURE?</h2>
            <p className="cta-text">
              Plan your perfect day at Adventure.io. Book tickets, explore attractions, 
              and create unforgettable memories.
            </p>
            <div className="cta-buttons">
              <Link to="/book-tickets" className="btn btn-cta-primary">
                BOOK TICKETS NOW
              </Link>
              <Link to="/rides" className="btn btn-cta-secondary">
                EXPLORE RIDES
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-logo">
                <h3>ADVENTURE.IO</h3>
                <p>Where every moment is an adventure</p>
              </div>
              
              <div className="footer-links">
                <div className="link-group">
                  <h4>EXPLORE</h4>
                  <Link to="#featured-rides">Featured Rides</Link>
                  <Link to="/rides">All Rides</Link>
                  <Link to="#explore">Park Zones</Link>
                  <Link to="#gallery">Gallery</Link>
                </div>
                
                <div className="link-group">
                  <h4>PLAN VISIT</h4>
                  <Link to="/book-tickets">Book Tickets</Link>
                  <Link to="#tickets">Ticket Prices</Link>
                  <Link to="#contact">Contact Us</Link>
                  <Link to="#faq">FAQ</Link>
                </div>
                
                <div className="link-group">
                  <h4>CONTACT</h4>
                  <p>Adventure Street, Thrill City</p>
                  <p>+91 98765 43210</p>
                  <p>info@adventure.io</p>
                  <p>Open: 10 AM - 10 PM</p>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <div className="social-links">
                <button className="social-link">Instagram</button>
                <button className="social-link">Facebook</button>
                <button className="social-link">Twitter</button>
                <button className="social-link">YouTube</button>
              </div>
              
              <div className="footer-legal">
                <p>© 2024 Adventure.io. All rights reserved.</p>
                <div className="legal-links">
                  <Link to="/privacy">Privacy Policy</Link>
                  <Link to="/terms">Terms of Service</Link>
                  <Link to="/safety">Safety Guidelines</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;