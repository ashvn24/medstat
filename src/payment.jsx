import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Target, Award, ChevronRight, Menu, X, Mail, Phone, MapPin, TrendingUp, Database, FileText, CheckCircle, NotebookPen, ArrowLeft, Star, Shield, Clock, Zap } from 'lucide-react';

const MedistatPackages = () => {
  const [currentStep, setCurrentStep] = useState('packages'); // 'packages' or 'payment'
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentData, setPaymentData] = useState({
    name: '',
    email: '',
    phone: '',
    upiId: '',
    institution: '',
    transactionId: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [googlePayQR, setGooglePayQR] = useState('');
  const [qrGeneratedTime, setQrGeneratedTime] = useState(null);
  const [completeButtonClickedTime, setCompleteButtonClickedTime] = useState(null);
  const [showUpiSuggestions, setShowUpiSuggestions] = useState(false);
  const [filteredUpiSuggestions, setFilteredUpiSuggestions] = useState([]);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Vendor UPI details
  const VENDOR_UPI_ID = 'sujishasudheer0@okhdfcbank'; // Replace with actual vendor UPI ID
  const VENDOR_NAME = 'Medistat Solutions';

  // Common UPI ID formats for suggestions
  const upiSuggestions = [
    '@okaxis',
    '@okhdfcbank',
    '@paytm',
    '@ibl',
    '@ybl',
    '@upi',
    '@apl',
    '@dbs',
    '@icici',
    '@sbi',
    '@axis',
    '@hdfc',
    '@kotak',
    '@yesbank',
    '@unionbank',
    '@canara',
    '@pnb',
    '@bob',
    '@idbi',
    '@iob'
  ];

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (showQRPopup && timeLeft > 0 && !paymentSuccess) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !paymentSuccess) {
      setShowQRPopup(false);
      setTimeLeft(120);
      alert('Payment time expired. Please try again.');
    }
    return () => clearTimeout(timer);
  }, [showQRPopup, timeLeft, paymentSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to handle UPI ID input and show suggestions
  const handleUpiInputChange = (value) => {
    handleInputChange('upiId', value);
    
    if (value.includes('@')) {
      const beforeAt = value.split('@')[0];
      const afterAt = value.split('@')[1] || '';
      
      if (afterAt.length > 0) {
        // Filter suggestions based on what user typed after @
        const filtered = upiSuggestions.filter(suggestion => 
          suggestion.toLowerCase().includes(afterAt.toLowerCase())
        );
        setFilteredUpiSuggestions(filtered);
        setShowUpiSuggestions(filtered.length > 0);
      } else {
        // Show all suggestions if user just typed @
        setFilteredUpiSuggestions(upiSuggestions);
        setShowUpiSuggestions(true);
      }
    } else {
      setShowUpiSuggestions(false);
    }
  };

  // Function to select a UPI suggestion
  const selectUpiSuggestion = (suggestion) => {
    const beforeAt = paymentData.upiId.split('@')[0];
    const newUpiId = beforeAt + suggestion;
    handleInputChange('upiId', newUpiId);
    setShowUpiSuggestions(false);
  };

  // Function to verify payment (simulated)
  const verifyPayment = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      // Simulate payment verification
      // In a real implementation, this would call your payment gateway API
      const isSuccess = Math.random() > 0.3; // 70% success rate for testing
      
      if (isSuccess) {
        setPaymentVerified(true);
        console.log('Payment verified successfully!');
        
        // Automatically proceed to complete payment
        await handleCompletePayment();
      } else {
        console.log('Payment verification failed. Please try again.');
        setIsProcessingPayment(false);
        alert('Payment verification failed. Please try again.');
      }
    }, 2000); // 2 second processing delay
  };

  // Function to handle Complete button click
  const handleCompletePayment = async () => {
    const completeTime = new Date().toISOString();
    setCompleteButtonClickedTime(completeTime);
    
    // Prepare data for Google Sheets submission
    const formData = {
      name: paymentData.name,
      email: paymentData.email,
      phone: paymentData.phone,
      upiId: paymentData.upiId,
      institution: paymentData.institution,
      amount: selectedPackage.price,
      packageName: selectedPackage.name,
      transactionId: paymentData.transactionId,
      qrGeneratedTime: qrGeneratedTime,
      completeButtonClickedTime: completeTime
    };
    
    // Submit to Google Sheets
    await submitToGoogleSheets(formData);
    
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowQRPopup(false);
      setPaymentSuccess(false);
      setTimeLeft(120);
      setPaymentVerified(false);
      setIsProcessingPayment(false);
      alert('Payment successful! You will receive a confirmation email shortly.');
      setCurrentStep('packages');
      setSelectedPackage(null);
      setPaymentData({
        name: '',
        email: '',
        phone: '',
        upiId: '',
        institution: '',
        transactionId: ''
      });
    }, 3000);
  };

  // Generate Google Pay QR code URL with transaction ID
  const generateGooglePayQR = (amount, packageName) => {
    const numericAmount = amount.replace('₹', '').replace(',', '');
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Store transaction ID for tracking
    setPaymentData(prev => ({ ...prev, transactionId }));
    
    const upiUrl = `upi://pay?pa=${VENDOR_UPI_ID}&pn=${encodeURIComponent(VENDOR_NAME)}&am=${numericAmount}&cu=INR&tn=${encodeURIComponent(`Payment for ${packageName} Package - ${transactionId}`)}`;
    
    // Generate QR code using a QR code API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    return { qrCodeUrl, transactionId };
  };


  // Google Sheets submission function
  const submitToGoogleSheets = async (formData) => {
    try {
      // Replace with your Google Apps Script web app URL
      const googleScriptUrl = 'https://script.google.com/macros/s/AKfycby3A6-snJlhzitBJXgjTAavFlG039EohoQ6ehtfdA8CVH-JOkdi9S0_NqA2blBYuKqi/exec';
      
      // Prepare data for Google Sheets
      const sheetData = {
        timestamp: new Date().toISOString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        upiId: formData.upiId,
        institution: formData.institution || 'N/A',
        amount: formData.amount,
        packageName: formData.packageName,
        transactionId: formData.transactionId,
        qrGeneratedTime: formData.qrGeneratedTime,
        completeButtonClickedTime: formData.completeButtonClickedTime
      };

      // Convert data to URL parameters to avoid CORS issues
      const params = new URLSearchParams();
      Object.keys(sheetData).forEach(key => {
        params.append(key, sheetData[key]);
      });

      // Submit to Google Sheets via Apps Script using GET request
      const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors' // This is required for Google Apps Script
      });

      console.log('Data submitted to Google Sheets successfully');
      return true;
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      return false;
    }
  };

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      price: '₹1',
      originalPrice: '₹20,000',
      duration: '2-3 weeks',
      popular: false,
      color: 'from-blue-500 to-blue-600',
      hover: 'ring-blue-500',
      icon: <FileText className="w-8 h-8" />,
      description: 'Perfect for individual researchers and small projects',
      features: [
        'Basic Statistical Analysis (Descriptive Statistics)',
        'Data Cleaning & Preparation',
        'Simple Visualization (Charts & Graphs)',
        'Research Methodology Guidance',
        'Basic Report Generation',
        'Email Support',
        'Single Revision Included',
        'Data Security & Confidentiality'
      ],
      limitations: [
        'Limited to 2 statistical tests',
        'Basic visualization only',
        'No advanced modeling'
      ]
    },
    {
      id: 'enhanced',
      name: 'Enhanced',
      price: '₹35,000',
      originalPrice: '₹45,000',
      duration: '3-4 weeks',
      popular: true,
      color: 'from-purple-500 to-purple-600',
      hover: 'ring-purple-500',
      icon: <BarChart3 className="w-8 h-8" />,
      description: 'Comprehensive solution for advanced research projects',
      features: [
        'Advanced Statistical Analysis (Inferential Statistics)',
        'Multiple Statistical Tests & Models',
        'Professional Data Visualization',
        'Research Design Consultation',
        'Comprehensive Report with Interpretation',
        'Literature Review Assistance',
        'Priority Email & Phone Support',
        'Up to 3 Revisions',
        'Publication-Ready Outputs',
        'SPSS/R/Python Analysis',
        'Sample Size Calculation'
      ],
      limitations: [
        'Limited to standard statistical methods',
        'No machine learning models'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '₹75,000',
      originalPrice: '₹95,000',
      duration: '4-6 weeks',
      popular: false,
      color: 'from-green-500 to-green-600',
      hover: 'green-500',
      icon: <Award className="w-8 h-8" />,
      description: 'Premium package for PhD research and publications',
      features: [
        'Complete Research Support (Proposal to Publication)',
        'Advanced Statistical Modeling & Machine Learning',
        'Meta-Analysis & Systematic Review',
        'Custom Dashboard & Interactive Visualizations',
        'Dedicated Research Consultant',
        'Manuscript Writing Support',
        '24/7 Priority Support',
        'Unlimited Revisions',
        'Journal Submission Assistance',
        'Plagiarism Check & Formatting',
        'Video Consultations',
        'Advanced Software Training',
        'Follow-up Support (3 months)'
      ],
      limitations: []
    }
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCurrentStep('payment');
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async () => {
    if (!paymentData.name || !paymentData.email || !paymentData.phone || !paymentData.upiId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    // Record QR generation time
    const qrTime = new Date().toISOString();
    setQrGeneratedTime(qrTime);
    
    // Generate Google Pay QR code with transaction ID
    const { qrCodeUrl, transactionId } = generateGooglePayQR(selectedPackage.price, selectedPackage.name);
    setGooglePayQR(qrCodeUrl);
    
    // Show QR popup
    setShowQRPopup(true);
    setTimeLeft(120); // Reset timer to 2 minutes
    setIsProcessing(false);
    
  };

  const goBack = () => {
    setCurrentStep('packages');
    setSelectedPackage(null);
  };

  const closePaymentPopup = () => {
    setShowQRPopup(false);
    setPaymentSuccess(false);
    setTimeLeft(120);
  };

  if (currentStep === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Complete Your Order</h1>
                  <p className="text-gray-600">Secure payment for {selectedPackage?.name} Package</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h2>
              
              <div className={`bg-gradient-to-r ${selectedPackage?.color} rounded-xl p-6 text-white mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {selectedPackage?.icon}
                    <div>
                      <h3 className="text-xl font-bold">{selectedPackage?.name} Package</h3>
                      <p className="text-sm opacity-90">{selectedPackage?.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{selectedPackage?.price}</div>
                    <div className="text-sm opacity-75 line-through">{selectedPackage?.originalPrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Delivery Time</div>
                    <div className="font-semibold">{selectedPackage?.duration}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">What's Included:</h3>
                <div className="space-y-2">
                  {selectedPackage?.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {selectedPackage?.features.length > 5 && (
                    <div className="text-sm text-blue-600">
                      +{selectedPackage.features.length - 5} more features
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Money Back Guarantee</span>
                </div>
                <p className="text-xs text-gray-600">
                  100% satisfaction guaranteed or your money back within 7 days
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Payment Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={paymentData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={paymentData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={paymentData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={paymentData.upiId}
                      onChange={(e) => handleUpiInputChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your-upi@bank"
                    />
                    
                    {/* UPI Suggestions Dropdown */}
                    {showUpiSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredUpiSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectUpiSuggestion(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">@</span>
                              <span className="font-medium">{suggestion.substring(1)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution / Organization (optional)
                  </label>
                  <input
                    type="text"
                    value={paymentData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Your institution name"
                  />
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 mt-6 ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl transform hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Zap className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...
                  </span>
                ) : (
                  `Pay with Google Pay ${selectedPackage?.price}`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Google Pay QR Code Payment Popup */}
        {showQRPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 relative">
              {!paymentSuccess && (
                <button
                  onClick={closePaymentPopup}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}

              {paymentSuccess ? (
                // Success Message
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Submitted!</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your payment will be verified and we will get back to you shortly.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-blue-800">
                      <div className="font-semibold">Order Details:</div>
                      <div>{selectedPackage?.name} Package - {selectedPackage?.price}</div>
                      <div>Delivery: {selectedPackage?.duration}</div>
                    </div>
                  </div>
                </div>
              ) : (
                // QR Code Payment
                <>
                  {/* Timer */}
                  <div className="text-center mb-3">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      Pay with Google Pay
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className={`text-sm font-semibold ${timeLeft <= 30 ? 'text-red-500' : 'text-gray-700'}`}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${(timeLeft / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="text-center mb-3">
                    <div className="bg-gray-100 rounded-lg p-4 mx-auto w-48 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <img 
                          src={googlePayQR} 
                          alt="Google Pay QR Code" 
                          className="w-36 h-36 object-contain rounded-lg border-2 border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {selectedPackage?.name} Package
                      </div>
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {selectedPackage?.price}
                      </div>
                      <div className="text-xs text-gray-600">
                        Pay to: {VENDOR_NAME}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-3">
                      <div className="font-medium mb-1">Payment Status:</div>
                      <div className="space-y-0.5">
                        <div>1. Scan QR code with any UPI app</div>
                        <div>2. Complete payment in your app</div>
                        <div>3. Click "Complete" once payment is verified</div>
                      </div>
                    </div>
                    
                    {/* Payment Verification and Complete Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={verifyPayment}
                        disabled={isProcessingPayment}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                          isProcessingPayment
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isProcessingPayment ? (
                          <span className="flex items-center justify-center">
                            <Zap className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          'Complete'
                        )}
                      </button>
                      
                      <button
                        onClick={closePaymentPopup}
                        disabled={isProcessingPayment}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                          isProcessingPayment
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel Payment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Medistat Solutions
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Research Package</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your research needs. All packages include our commitment to quality and timely delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`group relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:ring-4 hover:ring-opacity-50 ${
                pkg.popular 
                  ? 'ring-4 ring-purple-500 ring-opacity-50 hover:ring-purple-600' 
                  : `hover:${pkg.hover}`
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  {pkg.icon}
                  <div className="text-right">
                    <div className="text-3xl font-bold">{pkg.price}</div>
                    <div className="text-sm opacity-75 line-through">{pkg.originalPrice}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-sm opacity-90 mb-4">{pkg.description}</p>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Delivery: {pkg.duration}</span>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {pkg.limitations.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Limitations:</h5>
                    <ul className="space-y-1">
                      {pkg.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <X className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                          <span className="text-xs text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => handlePackageSelect(pkg)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white group-hover:from-purple-700 group-hover:to-purple-800 hover:shadow-2xl transform hover:-translate-y-1'
                      : 'bg-gray-100 text-gray-800 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white hover:shadow-2xl transform hover:-translate-y-1'
                  }`}
                >
                  Select {pkg.name} Package
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose Medistat Solutions?</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Team</h3>
              <p className="text-sm text-gray-600">PhD qualified statisticians and researchers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Confidential</h3>
              <p className="text-sm text-gray-600">Your data is secure and never shared</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">On-Time Delivery</h3>
              <p className="text-sm text-gray-600">Guaranteed delivery within promised timeframe</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Round-the-clock assistance for all clients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedistatPackages;