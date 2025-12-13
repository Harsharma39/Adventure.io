import React from 'react';
import { Link } from 'react-router-dom';
import './RidesPage.css';

const RidesPage = () => {
  // Collage images with varied aspect ratios for masonry effect
  const collageImages = [
    {
      id: 1,
      name: 'Cyclone Coaster',
      category: 'Extreme',
      icon: '⚡',
      image: 'https://images.unsplash.com/photo-1642717841683-c0323214617c?w=800&h=1200&fit=crop',
      aspect: 'portrait'
    },
    {
      id: 2,
      name: 'Tsunami Splash',
      category: 'Water',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1701361650313-9b20b1d76820?w=1200&h=800&fit=crop',
      aspect: 'landscape'
    },
    {
      id: 3,
      name: 'Ferris Wheel',
      category: 'Family',
      icon: '👨‍👩‍👧‍👦',
      image: 'https://images.unsplash.com/photo-1586864101969-d7564be25804?w-800&h=1000&fit=crop',
      aspect: 'portrait'
    },
    {
      id: 4,
      name: 'Drop Tower',
      category: 'Extreme',
      icon: '⚡',
      image: 'https://images.unsplash.com/photo-1503505946976-e489ce29e0fd?w=1200&h=900&fit=crop',
      aspect: 'landscape'
    },
    {
      id: 5,
      name: 'Water Coaster',
      category: 'Water',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1506064851526-ef4f17d8cc36?w=900&h=600&fit=crop',
      aspect: 'landscape'
    },
    {
      id: 6,
      name: 'Carousel',
      category: 'Kids',
      icon: '🎈',
      image: 'https://images.unsplash.com/photo-1763063713846-5348959fdcf9?w=600&h=900&fit=crop',
      aspect: 'portrait'
    },
    {
      id: 7,
      name: 'Swing Ride',
      category: 'Family',
      icon: '👨‍👩‍👧‍👦',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=1200&fit=crop',
      aspect: 'portrait'
    },
    {
      id: 8,
      name: 'Free Fall',
      category: 'Extreme',
      icon: '⚡',
      image: 'https://plus.unsplash.com/premium_photo-1757687767695-d7c0d5c62c63?w=1200&h=800&fit=crop',
      aspect: 'landscape'
    },
    {
      id: 9,
      name: 'Wave Pool',
      category: 'Water',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1000&h=800&fit=crop',
      aspect: 'landscape'
    },
    {
      id: 10,
      name: 'Pirate Ship',
      category: 'Family',
      icon: '👨‍👩‍👧‍👦',
      image: 'https://images.unsplash.com/photo-1596618810292-31973b6cce3a?w=700&h=1000&fit=crop',
      aspect: 'portrait'
    },
    {
      id: 2,
      name: 'Tsunami Splash',
      category: 'Water',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1701361650313-9b20b1d76820?w=1200&h=800&fit=crop',
      aspect: 'landscape'
    },
    {
      id: 4,
      name: 'Drop Tower',
      category: 'Extreme',
      icon: '⚡',
      image: 'https://images.unsplash.com/photo-1503505946976-e489ce29e0fd?w=1200&h=900&fit=crop',
      aspect: 'landscape'
    }
  ];

  // Featured rides with details
  const featuredRides = [
    {
      id: 1,
      name: 'Cyclone Coaster',
      description: 'India\'s tallest roller coaster with breathtaking 360-degree loops and speeds up to 150 km/h. Experience the ultimate adrenaline rush!',
      image: 'https://images.unsplash.com/photo-1642717841683-c0323214617c?w=800&h=400&fit=crop',
      stats: {
        Height: '95m',
        Speed: '150 km/h',
        Duration: '2:30',
        'G-Force': '4.5G'
      }
    },
    {
      id: 2,
      name: 'Tsunami Splash',
      description: 'Massive water slide with 45-meter vertical drop into a giant wave pool. Perfect for beating the summer heat with family and friends.',
      image: 'https://images.unsplash.com/photo-1701361650313-9b20b1d76820?w=800&h=400&fit=crop',
      stats: {
        Height: '45m',
        Speed: '80 km/h',
        Duration: '1:15',
        Capacity: '4 riders'
      }
    },
    {
      id: 3,
      name: 'Starship Galaxy',
      description: 'Space-themed dark ride with immersive special effects, animatronics, and intergalactic storytelling. A family favorite!',
      image: 'https://images.unsplash.com/photo-1580915038297-25ea2adedfb2?q=80&w=800&h=400&fit=crop',
      stats: {
        Height: '10m',
        Speed: '25 km/h',
        Duration: '5:00',
        Effects: '3D/4D'
      }
    }
  ];

  // Handle image errors
  const handleImageError = (e, imageName) => {
    e.target.onerror = null;
    const colors = ['#1e293b', '#334155', '#475569'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="${color}"/><text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="#60a5fa" font-weight="bold">${imageName}</text></svg>`;
  };

  return (
    <div className="rides-page">
      {/* Navbar with new layout */}
      <header className="header">
        <div className="header-container">
          {/* Clickable Logo on Left */}
          <Link to="/" className="logo-link">
            <div className="logo">
              <h1>ADVENTURE<span className="logo-dot">.</span>IO</h1>
              <p className="logo-tagline">WHERE THRILL MEETS EXCITEMENT</p>
            </div>
          </Link>
          
          {/* Navigation Container (Nav links on left, Book Now on right) */}
          <div className="nav-container">
            {/* Navigation Links on Left */}
            <nav className="nav">
              <Link to="/" className="nav-link">HOME</Link>
              <Link to="/rides" className="nav-link active">RIDES</Link>
              <Link to="/book-tickets" className="nav-link">TICKETS</Link>
            </nav>
            
            {/* Book Now Button on Right */}
            <Link to="/book-tickets" className="btn-book-now">
              BOOK NOW
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="rides-hero">
        <div className="container">
          <h1 className="hero-title">Explore Thrilling Rides</h1>
          <p className="hero-subtitle">
            Discover over 50 amazing attractions designed for maximum fun and excitement. 
            From extreme coasters to family adventures, create unforgettable memories.
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Total Rides</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">12</div>
              <div className="stat-label">Hours Daily</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95m</div>
              <div className="stat-label">Tallest Ride</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">150km/h</div>
              <div className="stat-label">Fastest Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pinterest Style Masonry Collage */}
      <section className="image-collage-section">
        <div className="container">
          <h2 className="section-title">Gallery Of Adventure</h2>
          
          <div className="masonry-grid">
            {collageImages.map((image) => (
              <div 
                key={image.id}
                className="masonry-item"
              >
                <img 
                  src={image.image}
                  alt={image.name}
                  className="masonry-image"
                  onError={(e) => handleImageError(e, image.name)}
                  loading="lazy"
                />
                <div className="masonry-overlay">
                  <h3 className="masonry-name">{image.name}</h3>
                  <div className="masonry-category">
                    <span>{image.icon}</span>
                    {image.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p style={{ 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.6)', 
            marginTop: '40px', 
            fontSize: '14px'
          }}>
            
          </p>
        </div>
      </section>

      {/* Featured Rides Section */}
      <section className="featured-rides">
        <div className="container">
          <h2 className="section-title">Featured Attractions</h2>
          <p className="section-subtitle">
            Don't miss these park favorites that everyone loves
          </p>
          
          <div className="featured-cards">
            {featuredRides.map((ride) => (
              <div key={ride.id} className="featured-card">
                <div className="featured-image">
                  <img 
                    src={ride.image}
                    alt={ride.name}
                    className="featured-img"
                    onError={(e) => handleImageError(e, ride.name)}
                  />
                </div>
                <div className="featured-content">
                  <h3 className="featured-name">{ride.name}</h3>
                  <p className="featured-desc">{ride.description}</p>
                  <div className="featured-stats">
                    {Object.entries(ride.stats).map(([key, value]) => (
                      <div key={key} className="featured-stat">
                        <span className="stat-value">{value}</span>
                        <span className="stat-label">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Ride?</h2>
          <p className="cta-text">
            Plan your visit today and experience the thrill of our amazing rides. 
            Book tickets online to skip the queues and get exclusive deals.
          </p>
          <div className="cta-buttons">
            <Link to="/book-tickets" className="btn-primary">
              Book Tickets Now
            </Link>
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

export default RidesPage;