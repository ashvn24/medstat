import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Users, Target, Award, ChevronRight, Menu, X, Mail, Phone, MapPin, TrendingUp, Database, FileText, CheckCircle, NotebookPen } from 'lucide-react';
import Papa from 'papaparse';
import ContactSection from './contact.jsx'
import SupportChat from './support-chat.jsx'
import { Helmet } from 'react-helmet';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const renderStars = (rating) => {
  const stars = [];
  const numRating = parseInt(rating) || 0;
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        className={`w-4 h-4 ${i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.386-2.46a1 1 0 00-1.175 0l-3.386 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
      </svg>
    );
  }
  return stars;
};

const MedistatLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [testimonials, setTestimonials] = useState([]);
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'work', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vStv63buxIdC2PFN8o1OnOoeIffHuJgqhAukujwp1n4m4U9h7Mu7a6W9dTz-1gqoezwRQjGvr1BoBhM/pub?output=csv')
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          complete: (results) => setTestimonials(results.data)
        });
      });
      console.log("testimonials", testimonials);

  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const services = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Statistical Analysis",
      description: "Advanced statistical modeling and analysis for research projects with comprehensive reporting.",
      features: ["Descriptive Statistics", "Inferential Testing", "Regression Analysis", "ANOVA & MANOVA"]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Thesis Assistance",
      description: "End-to-end support for thesis writing, from methodology design to final presentation.",
      features: ["Research Design", "Literature Review", "Data Collection", "Academic Writing"]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Analytics Support",
      description: "Comprehensive data analytics solutions for research teams and academic institutions.",
      features: ["Data Visualization", "Predictive Modeling", "Machine Learning", "Custom Dashboards"]
    },
    {
      icon: <NotebookPen className="w-8 h-8" />,
      title: "Professional Academic Services",
      description: "Empowering learners with personalized solutions for academic success.",
      features: ["Timely. Trusted.  Turnitin-Safe", "Essay & Report Writing. ", "Structured. Personalized. Plagiarism-Free", "Assignment Help"]
    },

  ];

  

  const workExamples = [
    {
      title: "Medical Research Analysis",
      category: "Clinical Study",
      description: "Comprehensive statistical analysis for a multi-center clinical trial involving 2,000+ participants.",
      metrics: ["95% accuracy", "6 months duration", "15 publications"],
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "PhD Thesis Support",
      category: "Academic Research",
      description: "Complete thesis assistance for doctoral candidates in biomedical engineering.",
      metrics: ["12 completed theses", "100% success rate", "Average 4.8/5 rating"],
      color: "from-green-500 to-teal-600"
    },
    {
      title: "Healthcare Analytics Platform",
      category: "Data Analytics",
      description: "Custom analytics dashboard for hospital management and patient outcome tracking.",
      metrics: ["Real-time insights", "50+ KPIs", "3x faster reporting"],
      color: "from-orange-500 to-red-600"
    }
  ];

  console.log(activeSection);
  
  // Parallax state for hero blobs
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40; // -20 to 20
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
      setParallax({ x, y });
    };
    const hero = heroRef.current;
    if (hero) hero.addEventListener('mousemove', handleMouseMove);
    return () => { if (hero) hero.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  // Animated number counters for hero stats
  const stats = [
    { label: 'Projects Completed', value: 100, color: 'text-blue-600' },
    { label: 'Success Rate', value: 98, color: 'text-purple-600', suffix: '%' },
    { label: 'Support', value: 24, color: 'text-green-600', suffix: '/7' },
  ];

  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (!statsRef.current) return;
      const rect = statsRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setStatsInView(true);
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- Bar Chart Interactivity ---
  const [barHeights, setBarHeights] = useState([64, 96, 80, 112, 72, 104, 88]); // default heights in px
  const chartRef = useRef(null);

  const handleBarChartMouseMove = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = rect.width;
    // 7 bars, get relative distance to each bar center
    const barCount = 7;
    const barWidth = chartWidth / barCount;
    const newHeights = Array.from({ length: barCount }).map((_, i) => {
      const barCenter = barWidth * (i + 0.5);
      const dist = Math.abs(x - barCenter);
      // The closer to the mouse, the taller the bar (max 120px, min 56px)
      const maxH = 120, minH = 56;
      const influence = Math.max(0, 1 - dist / (chartWidth / 2));
      return Math.round(minH + (maxH - minH) * influence);
    });
    setBarHeights(newHeights);
  };

  const handleBarChartMouseLeave = () => {
    setBarHeights([64, 96, 80, 112, 72, 104, 88]); // reset to default
  };

  // Audio ref for tick sound
  const tickAudioRef = useRef(null);
  const playTick = () => {
    if (tickAudioRef.current) {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tick sound audio */}
      <audio ref={tickAudioRef} src="/tick.wav" preload="auto" />
      <Helmet>
        <title>Medistat Solutions | Statistical Analysis, Thesis Assistance, Data Analytics</title>
        <meta name="description" content="Empowering researchers and students with expert statistical analysis, thesis assistance, and data analytics solutions. Trusted by 500+ researchers." />
        <meta name="keywords" content="statistical analysis, thesis assistance, data analytics, research support, academic writing, Medistat Solutions, medical statistics, research consulting, data science, academic services, India" />
        <meta name="author" content="Medistat Solutions" />
        <link rel="canonical" href="https://medstat-one.vercel.app/" />
        <link rel="icon" href="/images/logo.jpg" type="image/jpeg" />
        <meta property="og:title" content="Medistat Solutions | Statistical Analysis, Thesis Assistance, Data Analytics" />
        <meta property="og:description" content="Empowering researchers and students with expert statistical analysis, thesis assistance, and data analytics solutions. Trusted by 500+ researchers." />
        <meta property="og:image" content="https://medstat-one.vercel.app/images/logo.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://medstat-one.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Medistat Solutions | Statistical Analysis, Thesis Assistance, Data Analytics" />
        <meta name="twitter:description" content="Empowering researchers and students with expert statistical analysis, thesis assistance, and data analytics solutions. Trusted by 500+ researchers." />
        <meta name="twitter:image" content="https://medstat-one.vercel.app/images/logo.jpg" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Medistat Solutions",
            "url": "https://medstat-one.vercel.app/",
            "logo": "https://medstat-one.vercel.app/images/logo.jpg",
            "contactPoint": [{
              "@type": "ContactPoint",
              "email": "medistatsolutions@gmail.com",
              "telephone": "+91 9744649329",
              "contactType": "customer support",
              "areaServed": "IN"
            }],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Mangalore",
              "addressRegion": "Karnataka",
              "addressCountry": "India"
            },
            "sameAs": [
              "https://www.linkedin.com/company/medistat-solutions/",
              "https://www.facebook.com/medistatsolutions",
              "https://twitter.com/medistatsoln"
            ],
            "description": "Empowering researchers and students with expert statistical analysis, thesis assistance, and data analytics solutions."
          }
        `}</script>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Statistical Analysis, Thesis Assistance, Data Analytics Support, Professional Academic Services",
            "provider": {
              "@type": "Organization",
              "name": "Medistat Solutions"
            }
          }
        `}</script>
      </Helmet>
      {/* Navigation */}
      <header>
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-lg z-50 transition-all duration-300" aria-label="Main Navigation" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg">
                <img
                  src="/images/logo.jpg"
                  alt="Medistat Solutions Logo - Trusted Statistical Analysis and Academic Services"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Medistat Solutions
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {['home', 'services', 'work', 'testimonials', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  onMouseEnter={playTick}
                  className={`capitalize text-sm font-medium transition-all duration-200 hover:text-blue-600 relative menu-raise cursor-pointer ${
                    activeSection === item ? 'text-blue-600' : 'text-gray-700'
                  }`}
                  style={{ background: 'none' }}
                >
                  {item === 'work' ? 'Our Work' : item === 'contact' ? 'Contact Us' : item}
                  {activeSection === item && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
                  )}
                </button>
              ))}
              <a
                href="/plan"
                className="capitalize text-sm font-medium transition-all duration-300 hover:text-blue-600 relative text-gray-700"
              >
                see plans
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {['home', 'services', 'work', 'testimonials', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors capitalize"
                >
                  {item === 'work' ? 'Our Work' : item === 'contact' ? 'Contact Us' : item}
                </button>
              ))}
              <a
                href="/plan"
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Payment
              </a>
            </div>
          )}
        </div>
      </nav>
      </header>
      <main>
      {/* Hero Section */}
      <section id="home" className="pt-20 pb-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden" ref={heroRef}>
        {/* Background Elements */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
          style={{
            x: parallax.x * 0.7,
            y: parallax.y * 0.5
          }}
        ></motion.div>
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
          style={{
            x: parallax.x * -0.5,
            y: parallax.y * -0.7
          }}
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-4 sm:mt-0">
                  <Award className="w-4 h-4 mr-2" />
                  Trusted by 500+ Researchers
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Elevate Your
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    Research Impact
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Empowering PG students and research teams with expert statistical analysis, 
                  comprehensive thesis assistance, and cutting-edge data analytics solutions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSection('services')}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  Explore Services
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('work')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  View Our Work
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200" ref={statsRef}>
                {stats.map((stat, i) => (
                  <div className="text-center" key={stat.label}>
                    <div className={`text-3xl font-bold ${stat.color}`}>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={statsInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.2 }}
                      >
                        <AnimatedCounter value={stat.value} start={statsInView} suffix={stat.suffix || ''} />
                      </motion.span>
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Main Dashboard Mockup */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Research Analytics Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Chart Visualization */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Statistical Analysis Results</h4>
                    <div className="text-xs text-gray-500">Live Data</div>
                  </div>
                  
                  {/* Mock Bar Chart */}
                  <div
                    className="flex items-end space-x-2 h-32 cursor-pointer select-none"
                    ref={chartRef}
                    onMouseMove={handleBarChartMouseMove}
                    onMouseLeave={handleBarChartMouseLeave}
                  >
                    <div className="bg-blue-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[0] }}></div>
                    <div className="bg-purple-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[1] }}></div>
                    <div className="bg-green-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[2] }}></div>
                    <div className="bg-orange-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[3] }}></div>
                    <div className="bg-red-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[4] }}></div>
                    <div className="bg-indigo-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[5] }}></div>
                    <div className="bg-pink-500 w-6 rounded-t transition-all duration-200" style={{ height: barHeights[6] }}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Q1</span>
                    <span>Q2</span>
                    <span>Q3</span>
                    <span>Q4</span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                    <div className="text-2xl font-bold">R² = 0.94</div>
                    <div className="text-sm opacity-90">Model Accuracy</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                    <div className="text-2xl font-bold">p &lt; 0.001</div> {/* Corrected */}
                    <div className="text-sm opacity-90">Significance</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-lg">
                <Database className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive research support services designed to accelerate your academic and professional success
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={
                  `group p-6 bg-white rounded-xl shadow-md transition-transform duration-300 \
                  ${services.length === 4 && index === 3 ? 'lg:col-start-2' : ''}`
                }
              >
                {/* Service Image/Illustration */}
                <div className="mb-6 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                  {index === 0 && (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {/* Statistical Chart Illustration */}
                      <div className="relative">
                        <div className="flex items-end space-x-1">
                          <div className="w-2 h-8 bg-white/30 rounded-sm"></div>
                          <div className="w-2 h-12 bg-white/60 rounded-sm"></div>
                          <div className="w-2 h-6 bg-white/40 rounded-sm"></div>
                          <div className="w-2 h-16 bg-white/80 rounded-sm"></div>
                          <div className="w-2 h-10 bg-white/50 rounded-sm"></div>
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      {/* Thesis/Document Illustration */}
                      <div className="relative">
                        <div className="bg-white/20 w-16 h-20 rounded-lg border-2 border-white/40">
                          <div className="p-2 space-y-1">
                            <div className="h-1 bg-white/60 rounded w-full"></div>
                            <div className="h-1 bg-white/40 rounded w-3/4"></div>
                            <div className="h-1 bg-white/60 rounded w-full"></div>
                            <div className="h-1 bg-white/40 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      {/* Data Analytics Illustration */}
                      <div className="relative">
                        <div className="grid grid-cols-3 gap-1">
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-sm ${
                                i % 3 === 0 ? 'bg-white/80' : i % 2 === 0 ? 'bg-white/60' : 'bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 3 && (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      {/* Writing/Notebook Illustration */}
                      <div className="relative">
                        <div className="bg-white/20 w-14 h-18 rounded-lg border-2 border-white/40 relative">
                          {/* Spiral binding effect */}
                          <div className="absolute -left-1 top-2 bottom-2 w-1 bg-white/30 rounded-full"></div>
                          <div className="absolute -left-0.5 top-3 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                          <div className="absolute -left-0.5 top-5 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                          <div className="absolute -left-0.5 top-7 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                          <div className="absolute -left-0.5 top-9 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                          <div className="absolute -left-0.5 top-11 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                          <div className="absolute -left-0.5 top-13 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                          
                          {/* Writing lines */}
                          <div className="p-2 mt-2 space-y-1.5">
                            <div className="h-0.5 bg-white/60 rounded w-full"></div>
                            <div className="h-0.5 bg-white/40 rounded w-4/5"></div>
                            <div className="h-0.5 bg-white/60 rounded w-full"></div>
                            <div className="h-0.5 bg-white/40 rounded w-3/5"></div>
                            <div className="h-0.5 bg-white/60 rounded w-full"></div>
                            <div className="h-0.5 bg-white/40 rounded w-2/3"></div>
                          </div>
                        </div>
                        
                        {/* Pen illustration */}
                        <div className="absolute -bottom-2 -right-2 rotate-45">
                          <div className="w-6 h-1 bg-white/80 rounded-full"></div>
                          <div className="w-2 h-1 bg-white/60 rounded-full ml-4 -mt-0.5"></div>
                        </div>
                        
                        <div className="absolute -top-1 -right-1">
                          <NotebookPen className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:from-blue-700 group-hover:to-purple-700">
                  Learn More
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work Section */}
      <section id="work" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-purple-600">Work</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Showcasing successful projects that demonstrate our expertise and commitment to excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {workExamples.map((work, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.18 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`h-48 bg-gradient-to-br ${work.color} p-6 flex items-center justify-center relative`}>
                  {/* Project Illustrations */}
                  {index === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Medical Research Visualization */}
                      <div className="relative">
                        <div className="grid grid-cols-4 gap-2">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 rounded-full ${
                                i % 4 === 0 ? 'bg-white/80' : i % 3 === 0 ? 'bg-white/60' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-white/40 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* PhD Thesis Illustration */}
                      <div className="relative">
                        <div className="bg-white/20 w-20 h-24 rounded-lg border-2 border-white/40 p-3">
                          <div className="space-y-2">
                            <div className="h-2 bg-white/80 rounded w-full"></div>
                            <div className="h-1 bg-white/60 rounded w-3/4"></div>
                            <div className="h-1 bg-white/60 rounded w-full"></div>
                            <div className="h-1 bg-white/40 rounded w-1/2"></div>
                            <div className="h-1 bg-white/60 rounded w-full"></div>
                            <div className="h-1 bg-white/40 rounded w-2/3"></div>
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white/30 rounded-full p-2">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Analytics Dashboard Illustration */}
                      <div className="relative">
                        <div className="bg-white/20 w-24 h-16 rounded-lg border border-white/40 p-2">
                          <div className="flex items-end justify-between h-full">
                            <div className="w-2 h-6 bg-white/80 rounded-sm"></div>
                            <div className="w-2 h-8 bg-white/60 rounded-sm"></div>
                            <div className="w-2 h-4 bg-white/70 rounded-sm"></div>
                            <div className="w-2 h-10 bg-white/90 rounded-sm"></div>
                            <div className="w-2 h-7 bg-white/50 rounded-sm"></div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-white/30 rounded-full p-1">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-6 left-6 text-white z-10">
                    <div className="text-sm font-medium opacity-90 mb-2">{work.category}</div>
                    <h3 className="text-xl font-bold">{work.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{work.description}</p>
                  <div className="space-y-2">
                    {work.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* testimonial */}

   <section id="testimonials" className="py-20  bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          What Our <span className="text-pink-600">Clients</span> Say
        </motion.h2>
        
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 w-8 sm:w-16 md:w-24 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-8 sm:w-16 md:w-24 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling container */}
          <div className="flex animate-scroll w-max pl-2 sm:pl-4 md:pl-8 mb-6">
            {duplicatedTestimonials
              .filter(testimonial => testimonial['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  '] && testimonial['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  '].trim() !== '')
              .map((testimonial, idx) => (
                <div
                  key={idx}
                  className="relative flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed pb-5">
                    "{testimonial['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  '].trim()}"
                  </p>
                  <div className="flex items-center gap-2 absolute bottom-5 left-5">
                    <span className="font-semibold text-blue-700">{testimonial['1. Full Name '] || 'Anonymous'}</span>
                    {renderStars(testimonial['3. How satisfied are you with our statistical analysis services?  '])}
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .menu-raise {
          will-change: transform;
        }
        .menu-raise:hover, .menu-raise:focus {
          transform: translateY(-4px) scale(1.06);
          background: none !important;
          box-shadow: none !important;
          z-index: 2;
        }
      `}</style>
    </section>
    {/* Contact Section */}
    <section id="contact">
      <ContactSection/>
    </section>
    </main>
    {/* Footer */}
    <footer className="bg-gray-900 text-white py-12" aria-label="Footer" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                <img
                  src="/images/logo.jpg"
                  alt="Medistat Solutions Logo - Trusted Statistical Analysis and Academic Services"
                  className="w-10 h-10 object-contain rounded-full"
                />
              </div>
              <span className="text-2xl font-bold">Medistat Solutions</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering researchers and students with world-class statistical analysis, 
              thesis assistance, and data analytics solutions.
            </p>
            <div className="text-sm text-gray-500">
              © 2025 Medistat. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.linkedin.com/company/medistat-solutions/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="24" height="24" fill="currentColor" className="text-blue-400 hover:text-blue-600" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
              </a>
              <a href="https://www.facebook.com/medistatsolutions" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="24" height="24" fill="currentColor" className="text-blue-400 hover:text-blue-600" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.326v-21.349c0-.734-.593-1.326-1.326-1.326z"/></svg>
              </a>
              <a href="https://twitter.com/medistatsoln" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="24" height="24" fill="currentColor" className="text-blue-400 hover:text-blue-600" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482c-4.083-.205-7.697-2.162-10.125-5.138a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Statistical Analysis</li>
              <li>Thesis Assistance</li>
              <li>Data Analytics</li>
              <li>Research Support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>medistatsolutions@gmail.com</li>
              <li>+91 9744649329</li>
              <li>Mangalore, Karnataka</li>
              <li>India</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
    <SupportChat />
  </div>
  );
};

export default MedistatLanding;

function AnimatedCounter({ value, start, suffix = '' }) {
  const controls = useAnimation();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (start) {
      controls.start({ count: value, transition: { duration: 1.2, ease: 'easeOut' } });
    }
  }, [start, value, controls]);
  return (
    <motion.span
      animate={controls}
      initial={{ count: 0 }}
      onUpdate={latest => setDisplay(Math.round(latest.count))}
    >
      {display}{suffix}
    </motion.span>
  );
}