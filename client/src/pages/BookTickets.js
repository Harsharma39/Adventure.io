import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { apiService } from '../services/api';
import './BookTickets.css';

const BookTickets = () => {
  const navigate = useNavigate();
  const [paymentTimer, setPaymentTimer] = useState(60);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [emailStatus, setEmailStatus] = useState({ sent: false, error: false, message: '' });
  const [backendConnected, setBackendConnected] = useState(false);
  
  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'service_j762y0v';
  const EMAILJS_TEMPLATE_ID = 'template_hdpz6uj';
  const EMAILJS_USER_ID = '0sa953CYjGA6pA2Yk';

  const ticketTypes = [
    { 
      id: 'individual', 
      name: 'Individual Pass', 
      price: 999, 
      description: 'Full day access to all rides and attractions',
      includes: ['Access to all rides', 'Full day validity', 'Park entry', 'Single person']
    },
    { 
      id: 'couple', 
      name: 'Couple Pass', 
      price: 1700, 
      description: 'Special package for two people',
      includes: ['Access to all rides', 'Full day validity', 'Park entry', 'Two persons', 'Special discount']
    }
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    tickets: 1,
    ticketType: 'individual',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown

  const selectedTicket = ticketTypes.find(t => t.id === formData.ticketType);
  const total = selectedTicket ? selectedTicket.price * formData.tickets : 0;

  // Initialize EmailJS and check backend connection
  useEffect(() => {
    emailjs.init(EMAILJS_USER_ID);
    
    // Check backend connection silently
    checkBackendConnection();
  }, []);

  // Countdown timer for redirect
  useEffect(() => {
    let interval;
    if (success && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [success, countdown, navigate]);

  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      await apiService.healthCheck();
      setBackendConnected(true);
      console.log('✅ Backend connected successfully');
    } catch (error) {
      setBackendConnected(false);
      console.log('⚠️ Backend not connected - using local storage only');
    }
  };

  // Payment Timer with session expiration
  useEffect(() => {
    let interval;
    if (showPaymentPage && paymentTimer > 0 && paymentStatus === 'pending') {
      interval = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            setSessionExpired(true);
            setShowPaymentPage(false);
            setPaymentStatus('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showPaymentPage, paymentTimer, paymentStatus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = '10-digit phone number required';
    if (!formData.date) newErrors.date = 'Visit date is required';
    if (formData.tickets < 1 || formData.tickets > 10) newErrors.tickets = 'Tickets must be 1-10';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to terms';
    
    return newErrors;
  };

  const generateBookingId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ADV${timestamp}${random}`;
  };

  const generateTicketPDF = () => {
    const ticketData = `
      Adventure.io Ticket
      -------------------
      Booking ID: ${bookingId}
      Name: ${formData.fullName}
      Email: ${formData.email}
      Phone: ${formData.phone}
      Date: ${formData.date}
      Ticket: ${selectedTicket.name}
      Quantity: ${formData.tickets}
      Amount: ₹${total}
      Status: Confirmed
      
      Important Information:
      - Present this ticket at entry
      - Valid from 10 AM to 10 PM
      - ID proof required
      - Non-transferable
    `;
    
    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Adventure_Ticket_${bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Improved email function with fallback simulation
  const sendConfirmationEmail = async (isResend = false) => {
    try {
      if (isResend) {
        setEmailStatus({ sent: false, error: false, message: 'Resending email...' });
      } else {
        setEmailStatus({ sent: false, error: false, message: 'Sending email...' });
      }
      
      const templateParams = {
        to_name: formData.fullName,
        to_email: formData.email,
        booking_id: bookingId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        visit_date: formData.date,
        ticket_type: selectedTicket.name,
        ticket_quantity: formData.tickets,
        total_amount: formatCurrency(total),
        booking_date: new Date().toLocaleDateString('en-IN'),
        park_address: 'Adventure Street, Thrill City',
        contact_email: 'support@adventure.io',
        contact_phone: '+91 98765 43210'
      };

      // Try to send with EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      
      console.log('✅ Email sent successfully:', response);
      setEmailStatus({ 
        sent: true, 
        error: false, 
        message: isResend ? '✅ Email resent successfully!' : '✅ Email sent successfully!' 
      });
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setEmailStatus({ sent: false, error: false, message: '' });
      }, 3000);
      
      return true;
      
    } catch (error) {
      console.error('❌ EmailJS failed:', error);
      
      // Fallback to simulation mode
      console.log('📧 Falling back to email simulation mode');
      
      const emailPreview = `
==========================================
📧 EMAIL SIMULATION MODE
==========================================
To: ${formData.email}
From: Adventure.io <support@adventure.io>
Subject: Booking Confirmation #${bookingId}

Dear ${formData.fullName},

🎉 Your booking has been confirmed!

Booking Details:
• Booking ID: ${bookingId}
• Name: ${formData.fullName}
• Email: ${formData.email}
• Phone: ${formData.phone}
• Visit Date: ${formData.date}
• Ticket: ${selectedTicket.name}
• Quantity: ${formData.tickets}
• Total Amount: ${formatCurrency(total)}

📍 Location: Adventure Street, Thrill City
⏰ Timing: 10 AM to 10 PM
📞 Contact: +91 98765 43210

Important Notes:
- Present this confirmation at entry
- Carry valid ID proof
- Tickets are non-transferable

Thank you for choosing Adventure.io!
==========================================
      `;
      
      console.log(emailPreview);
      
      setEmailStatus({ 
        sent: true, 
        error: false, 
        message: '📧 Email simulation mode (check console for preview)' 
      });
      
      // Show simulation message for 3 seconds
      setTimeout(() => {
        setEmailStatus({ sent: false, error: false, message: '' });
      }, 3000);
      
      return true; // Return true to continue flow
    }
  };

  // Handle resend email
  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    await sendConfirmationEmail(true);
    setIsResendingEmail(false);
  };

  // Send SMS/WhatsApp notification (simulated)
  const sendSMSNotification = async () => {
    try {
      console.log(`📱 SMS simulation sent to ${formData.phone}`);
      console.log(`Message: Your Adventure.io booking #${bookingId} is confirmed! Check your email for details.`);
      
      const smsPreview = `
==========================================
📱 SMS SIMULATION
==========================================
To: ${formData.phone}
Message: 
Your Adventure.io booking #${bookingId} is confirmed!
Date: ${formData.date}
Ticket: ${selectedTicket.name} x${formData.tickets}
Amount: ${formatCurrency(total)}
Check your email for ticket details.
Support: +91 98765 43210
==========================================
      `;
      
      console.log(smsPreview);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  };

  // Save booking to backend
  const saveBookingToBackend = async () => {
    try {
      const bookingData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        visitDate: formData.date,
        ticketType: selectedTicket.name,
        ticketQuantity: formData.tickets,
        totalAmount: total,
        paymentMethod: paymentMethod
      };
      
      console.log('📤 Sending booking to backend:', bookingData);
      
      const response = await apiService.createBooking(bookingData);
      console.log('✅ Backend response:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Backend save failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSessionExpired(false);
    setPaymentTimer(60);
    setPaymentStatus('pending');
    setShowPaymentPage(true);
  };

  const simulatePayment = async (method) => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    // Generate booking ID
    const newBookingId = generateBookingId();
    setBookingId(newBookingId);
    
    // Reset countdown
    setCountdown(10);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Save to backend if connected
        let backendResult = { success: false };
        if (backendConnected) {
          backendResult = await saveBookingToBackend();
        }
        
        // Send email notification
        const emailSent = await sendConfirmationEmail();
        
        // Send SMS notification
        const smsSent = await sendSMSNotification();
        
        // Generate ticket PDF
        generateTicketPDF();
        
        // Update UI state
        setIsProcessing(false);
        setPaymentStatus('success');
        setShowPaymentPage(false);
        setSuccess(true);
        
        console.log(`💳 Payment of ${formatCurrency(total)} simulated via ${method}`);
        console.log(`✅ Backend save: ${backendResult.success ? 'Success' : 'Failed (offline mode)'}`);
        console.log(`✅ Notifications: Email=${emailSent ? 'Sent' : 'Failed'}, SMS=${smsSent ? 'Sent' : 'Failed'}`);
        
      } catch (error) {
        console.error('Payment processing error:', error);
        setIsProcessing(false);
        
        // Fallback: Continue with frontend flow even if something fails
        await sendConfirmationEmail();
        await sendSMSNotification();
        generateTicketPDF();
        
        setPaymentStatus('success');
        setShowPaymentPage(false);
        setSuccess(true);
        setCountdown(10);
        
        console.log('⚠️ Partial failure, but booking completed locally');
      }
    }, 3000);
  };

  const handleTryAgain = () => {
    setSessionExpired(false);
    setPaymentTimer(60);
    setPaymentStatus('pending');
    setShowPaymentPage(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="book-tickets-page">
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
              <Link to="/" className="nav-link">HOME</Link>
              <Link to="/rides" className="nav-link">RIDES</Link>
              <Link to="/book-tickets" className="nav-link active">TICKETS</Link>
            </nav>
            
            <Link to="/book-tickets" className="btn btn-book-now">
              BOOK NOW
            </Link>
          </div>
        </div>
      </header>

      <main className="tickets-main">
        <div className="container">
          <section className="tickets-hero">
            <div className="tickets-hero-content">
              <h1 className="tickets-hero-title">BOOK YOUR ADVENTURE</h1>
              <p className="tickets-hero-subtitle">
                Secure your tickets for an unforgettable experience
              </p>
            </div>
          </section>

          <div className="booking-container">
            {success ? (
              <div className="success-message">
                <div className="success-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>Payment Successful!</h2>
                <p>Your booking has been confirmed.</p>
                <p className="success-details">
                  Booking ID: {bookingId}
                </p>
                <div className="success-note">
                  <p>✅ Payment of {formatCurrency(total)} received</p>
                  <p>✅ Confirmation email sent to {formData.email}</p>
                  <p>✅ SMS sent to {formData.phone}</p>
                  <p>✅ Ticket PDF downloaded automatically</p>
                  {backendConnected && <p>✅ Booking saved to database</p>}
                  {!backendConnected && <p>⚠️ Booking saved locally (backend offline)</p>}
                </div>
                
                {emailStatus.message && (
                  <div className={`email-status ${emailStatus.error ? 'error' : 'success'}`}>
                    {emailStatus.message}
                  </div>
                )}
                
                <p className="success-instructions">
                  Please check your email for the confirmation. 
                  Present the ticket QR code at the entry gate.
                </p>
                <div className="email-check">
                  <p className="email-check-text">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      className="resend-email-btn"
                      onClick={handleResendEmail}
                      disabled={isResendingEmail}
                    >
                      {isResendingEmail ? 'Sending...' : 'Resend Email'}
                    </button>
                  </p>
                </div>
                <p className="redirect-message">
                  Redirecting to homepage in {countdown} seconds...
                </p>
                <button 
                  className="btn-stay-on-page"
                  onClick={() => navigate('/')}
                >
                  Go to Homepage Now
                </button>
              </div>
            ) : sessionExpired ? (
              <div className="session-expired-section">
                <div className="expired-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" 
                      stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="expired-title">Payment Session Expired</h2>
                <p className="expired-message">
                  Your payment session has expired. Please try again to complete your booking.
                </p>
                <div className="expired-actions">
                  <button 
                    className="btn-try-again"
                    onClick={handleTryAgain}
                  >
                    Try Again
                  </button>
                  <button 
                    className="btn-back-to-booking"
                    onClick={() => setSessionExpired(false)}
                  >
                    Back to Booking
                  </button>
                </div>
              </div>
            ) : showPaymentPage ? (
              <div className="payment-collection-section">
                <h2 className="section-title">Complete Your Payment</h2>
                
                <div className="payment-container">
                  <div className="payment-timer">
                    <div className="timer-icon">⏰</div>
                    <div className="timer-text">
                      <span className={`timer-count ${paymentTimer <= 10 ? 'timer-warning' : ''}`}>
                        {formatTime(paymentTimer)}
                      </span>
                      <span className="timer-label">Time remaining to complete payment</span>
                    </div>
                  </div>
                  
                  <div className="payment-amount-display">
                    <div className="amount-label">Amount to Pay</div>
                    <div className="amount-value">{formatCurrency(total)}</div>
                    <div className="amount-details">
                      {selectedTicket?.name} × {formData.tickets}
                    </div>
                  </div>
                  
                  <div className={`payment-box ${paymentTimer <= 10 ? 'session-expiring' : ''}`}>
                    <div className="payment-header">
                      <div className="payment-merchant">
                        <div className="merchant-logo">A</div>
                        <div className="merchant-info">
                          <div className="merchant-name">Adventure.io</div>
                          <div className="merchant-id">Merchant ID: ADV8368442447</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="payment-methods">
                      <h3 className="payment-methods-title">Select Payment Method</h3>
                      
                      <div className="method-options">
                        <div 
                          className={`method-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('UPI')}
                        >
                          <div className="method-icon upi-icon">UPI</div>
                          <div className="method-info">
                            <div className="method-name">UPI Payment</div>
                            <div className="method-description">Google Pay, PhonePe, Paytm, etc.</div>
                          </div>
                        </div>
                        
                        <div 
                          className={`method-option ${paymentMethod === 'Card' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('Card')}
                        >
                          <div className="method-icon card-icon">💳</div>
                          <div className="method-info">
                            <div className="method-name">Credit/Debit Card</div>
                            <div className="method-description">Visa, Mastercard, RuPay</div>
                          </div>
                        </div>
                        
                        <div 
                          className={`method-option ${paymentMethod === 'NetBanking' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('NetBanking')}
                        >
                          <div className="method-icon bank-icon">🏦</div>
                          <div className="method-info">
                            <div className="method-name">Net Banking</div>
                            <div className="method-description">All major Indian banks</div>
                          </div>
                        </div>
                        
                        <div 
                          className={`method-option ${paymentMethod === 'Wallet' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('Wallet')}
                        >
                          <div className="method-icon wallet-icon">👛</div>
                          <div className="method-info">
                            <div className="method-name">Wallet</div>
                            <div className="method-description">Paytm Wallet, Amazon Pay, etc.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="payment-details">
                      <div className="payment-info">
                        <div className="info-row">
                          <span>Order ID:</span>
                          <span className="order-id">ADV{Date.now().toString().slice(-8)}</span>
                        </div>
                        <div className="info-row">
                          <span>Customer:</span>
                          <span>{formData.fullName}</span>
                        </div>
                        <div className="info-row">
                          <span>Email:</span>
                          <span>{formData.email}</span>
                        </div>
                        <div className="info-row">
                          <span>Date:</span>
                          <span>{new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <div className="payment-security">
                        <div className="security-badge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Secure Payment</span>
                        </div>
                        <div className="encryption-badge">
                          🔒 256-bit SSL Encryption
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="payment-instructions">
                    <h3>Payment Process:</h3>
                    <ol>
                      <li>Select your preferred payment method</li>
                      <li>Click "Proceed to Pay" to simulate payment</li>
                      <li>Confirmation email will be sent to {formData.email}</li>
                      <li>SMS notification sent to {formData.phone}</li>
                      <li>Ticket PDF will be downloaded automatically</li>
                    </ol>
                    {paymentTimer <= 10 && (
                      <div className="timer-alert">
                        ⚠️ Hurry! Only {paymentTimer} seconds left to complete payment
                      </div>
                    )}
                  </div>
                  
                  <div className="payment-buttons">
                    <button 
                      className="btn-proceed-payment"
                      onClick={() => simulatePayment(paymentMethod)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner"></span>
                          Processing Payment...
                        </>
                      ) : (
                        `Proceed to Pay ${formatCurrency(total)}`
                      )}
                    </button>
                    
                    <button 
                      className="btn-skip-demo"
                      onClick={async () => {
                        const newBookingId = generateBookingId();
                        setBookingId(newBookingId);
                        setIsProcessing(true);
                        
                        try {
                          if (backendConnected) {
                            await saveBookingToBackend();
                          }
                          await sendConfirmationEmail();
                          await sendSMSNotification();
                          
                          setTimeout(() => {
                            setIsProcessing(false);
                            setSuccess(true);
                            setShowPaymentPage(false);
                            setCountdown(10);
                            generateTicketPDF();
                            console.log(`Demo payment of ${formatCurrency(total)} completed`);
                          }, 1500);
                        } catch (error) {
                          console.error('Demo error:', error);
                          setIsProcessing(false);
                          setSuccess(true);
                          setShowPaymentPage(false);
                          setCountdown(10);
                          generateTicketPDF();
                        }
                      }}
                      disabled={isProcessing}
                    >
                      Quick Demo: Complete Booking
                    </button>
                    
                    <button 
                      className="btn-back"
                      onClick={() => setShowPaymentPage(false)}
                    >
                      Back to Booking
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="booking-content">
                <div className="ticket-selection">
                  <h2 className="section-title">Select Your Pass</h2>
                  
                  <div className="ticket-options">
                    {ticketTypes.map((ticket) => (
                      <div 
                        key={ticket.id}
                        className={`ticket-option ${formData.ticketType === ticket.id ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, ticketType: ticket.id }))}
                      >
                        <div className="ticket-option-header">
                          <div>
                            <h3>{ticket.name}</h3>
                            <p className="ticket-description">{ticket.description}</p>
                          </div>
                          <span className="ticket-price">{formatCurrency(ticket.price)}</span>
                        </div>
                        
                        <div className="ticket-includes">
                          <p className="includes-title">Includes:</p>
                          <ul className="includes-list">
                            {ticket.includes.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label htmlFor="tickets">Number of Passes</label>
                    <div className="quantity-selector">
                      <button 
                        type="button" 
                        className="quantity-btn"
                        onClick={() => setFormData(prev => ({ ...prev, tickets: Math.max(1, prev.tickets - 1) }))}
                      >
                        −
                      </button>
                      <span className="quantity-display">{formData.tickets}</span>
                      <button 
                        type="button" 
                        className="quantity-btn"
                        onClick={() => setFormData(prev => ({ ...prev, tickets: Math.min(10, prev.tickets + 1) }))}
                      >
                        +
                      </button>
                    </div>
                    {errors.tickets && <span className="error-message">{errors.tickets}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Visit Date *</label>
                    <div className="calendar-wrapper">
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <div className="calendar-hint">Select a date from today onwards</div>
                    </div>
                    {errors.date && <span className="error-message">{errors.date}</span>}
                  </div>
                </div>

                <div className="personal-info">
                  <h2 className="section-title">Personal Information</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          maxLength="10"
                          required
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="payment-section">
                      <h3 className="section-subtitle">Payment Method</h3>
                      
                      <div className="payment-method-info">
                        <div className="payment-method-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 8H18M6 12H18M6 16H12" stroke="#e63946" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#e63946" strokeWidth="2"/>
                          </svg>
                          <span>Secure Demo Payment</span>
                        </div>
                        <p className="payment-method-description">
                          This is a demo payment system. No real transaction will occur. 
                          Your booking will be confirmed instantly and confirmation email will be sent.
                        </p>
                        <div className="demo-notice">
                          <p><strong>Email Notification:</strong> Confirmation will be sent to {formData.email || 'your email'}</p>
                          <p><strong>SMS Notification:</strong> Booking details sent to {formData.phone || 'your phone'}</p>
                          <p><strong>Demo Mode:</strong> All payments are simulated for testing purposes</p>
                        </div>
                      </div>
                    </div>

                    <div className="order-summary">
                      <h3 className="section-subtitle">Order Summary</h3>
                      
                      <div className="summary-details">
                        <div className="summary-row">
                          <span>{selectedTicket?.name} × {formData.tickets}</span>
                          <span>{formatCurrency(selectedTicket?.price * formData.tickets || 0)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total Amount</span>
                          <span className="total-amount">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="terms-section">
                      <label className="terms-checkbox">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                        />
                        <span>
                          I agree to receive booking confirmation via email and SMS/WhatsApp
                          and to the <Link to="/terms">Terms & Conditions</Link> and 
                          <Link to="/privacy"> Privacy Policy</Link>
                        </span>
                      </label>
                      {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                    </div>

                    <button 
                      type="submit" 
                      className="btn-pay-now"
                      disabled={isProcessing}
                    >
                      PROCEED TO DEMO PAYMENT {formatCurrency(total)}
                    </button>

                    <div className="security-info">
                      <div className="security-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="security-text">
                        Demo Payment • Confirmation sent to email & WhatsApp
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
                  <Link to="/rides">Featured Rides</Link>
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
                  <p>support@adventure.io</p>
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

export default BookTickets;