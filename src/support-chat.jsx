import React, { useState, useRef, useEffect } from 'react';

const SERVICES = [
  {
    title: "Statistical Analysis",
    description: "Advanced statistical modeling and analysis for research projects with comprehensive reporting.",
    features: ["Descriptive Statistics", "Inferential Testing", "Regression Analysis", "ANOVA & MANOVA"]
  },
  {
    title: "Thesis Assistance",
    description: "End-to-end support for thesis writing, from methodology design to final presentation.",
    features: ["Research Design", "Literature Review", "Data Collection", "Academic Writing"]
  },
  {
    title: "Data Analytics Support",
    description: "Comprehensive data analytics solutions for research teams and academic institutions.",
    features: ["Data Visualization", "Predictive Modeling", "Machine Learning", "Custom Dashboards"]
  },
  {
    title: "Professional Academic Services",
    description: "Empowering learners with personalized solutions for academic success.",
    features: ["Timely. Trusted.  Turnitin-Safe", "Essay & Report Writing.", "Structured. Personalized. Plagiarism-Free", "Assignment Help"]
  }
];

const FAQ = [
  {
    q: "What services do you offer?",
    a: "We offer Statistical Analysis, Thesis Assistance, Data Analytics Support, and Professional Academic Services. Click a button below to learn more about each."
  },
  {
    q: "How do I get started?",
    a: "Just let us know which service you're interested in, and we'll guide you through the process!"
  },
  {
    q: "How can I contact human support?",
    a: "You can email us at medistatsolutions@gmail.com or call +91 9744649329."
  },
  {
    q: "What is the turnaround time?",
    a: "Turnaround depends on the service and project scope. Most projects are completed within 2-6 weeks."
  },
  {
    q: "Is my data confidential?",
    a: "Absolutely! We ensure strict confidentiality and data security for all clients."
  }
];

function getServiceByName(name) {
  return SERVICES.find(s => name.toLowerCase().includes(s.title.toLowerCase()));
}

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Hi! How can we help you today?\nYou can ask about our services, pricing, or type "faq" for common questions.' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Smart reply logic
  const handleUserMessage = (msg) => {
    const text = msg.toLowerCase();
    // FAQ
    if (text === 'faq' || text.includes('frequently asked')) {
      setMessages(msgs => [
        ...msgs,
        { from: 'support', text: 'Here are some frequently asked questions:', faq: true }
      ]);
      return;
    }
    // Pricing
    if (text.includes('pricing') || text.includes('price') || text.includes('cost')) {
      setMessages(msgs => [
        ...msgs,
        { from: 'support', text: 'You can view our detailed plans and pricing by clicking the button below.', plan: true }
      ]);
      return;
    }
    // Service match
    const service = SERVICES.find(s => text.includes(s.title.toLowerCase()));
    if (service) {
      setMessages(msgs => [
        ...msgs,
        { from: 'support', text: `**${service.title}**\n${service.description}\n\nKey Features:\n- ${service.features.join('\n- ')}` }
      ]);
      return;
    }
    // Human support
    if (text.includes('contact') || text.includes('human') || text.includes('email') || text.includes('phone') || text.includes('call')) {
      setMessages(msgs => [
        ...msgs,
        { from: 'support', text: 'You can reach us at medistatsolutions@gmail.com or +91 9744649329.' }
      ]);
      return;
    }
    // Service keywords
    if (text.includes('service')) {
      setMessages(msgs => [
        ...msgs,
        { from: 'support', text: 'We offer: ' + SERVICES.map(s => s.title).join(', ') + '.\nClick a button below to learn more.' }
      ]);
      return;
    }
    // Fallback
    setMessages(msgs => [
      ...msgs,
      { from: 'support', text: "I'm here to help! You can ask about our services, pricing, or type 'faq' for common questions." }
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    const userMsg = input;
    setMessages([...messages, { from: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => handleUserMessage(userMsg), 600);
  };

  // Quick reply for services
  const handleQuickService = (service) => {
    setMessages([...messages, { from: 'user', text: service.title }]);
    setTimeout(() => handleUserMessage(service.title), 400);
  };

  // Quick reply for FAQ
  const handleQuickFAQ = (faq) => {
    setMessages([...messages, { from: 'user', text: faq.q }]);
    setTimeout(() => setMessages(msgs => [...msgs, { from: 'support', text: faq.a }]), 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Open support chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.5C3.67 15.1 3 13.61 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      )}
      {/* Chat Box */}
      {isOpen && (
        <div className="w-80 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold">Support Chat</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto max-h-64 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-xs whitespace-pre-line ${msg.from === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                  {msg.faq && (
                    <div className="mt-2 space-y-1">
                      {FAQ.map((faq, i) => (
                        <button
                          key={i}
                          className="block text-left w-full text-xs text-blue-700 hover:underline"
                          onClick={() => handleQuickFAQ(faq)}
                        >
                          {faq.q}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.plan && (
                    <div className="mt-2">
                      <button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
                        onClick={() => { window.location.href = '/plan'; }}
                      >
                        View Plans & Pricing
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Quick Service Buttons */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SERVICES.map((service, i) => (
              <button
                key={i}
                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs px-3 py-1 rounded-full hover:from-blue-200 hover:to-purple-200 border border-blue-200"
                onClick={() => handleQuickService(service)}
              >
                {service.title}
              </button>
            ))}
            <button
              className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200 hover:from-green-200 hover:to-green-300"
              onClick={() => handleQuickFAQ(FAQ[0])}
            >
              FAQ
            </button>
            <button
              className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 text-xs px-3 py-1 rounded-full border border-pink-200 hover:from-pink-200 hover:to-pink-300"
              onClick={() => handleUserMessage('contact')}
            >
              Contact Human
            </button>
          </div>
          <form onSubmit={handleSend} className="flex border-t border-gray-200">
            <input
              type="text"
              className="flex-1 px-3 py-2 outline-none text-sm"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-tr-xl rounded-br-xl hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default SupportChat; 