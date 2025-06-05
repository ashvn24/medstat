import React, { useRef, useState } from 'react';
import emailjs from 'emailjs-com';
import { Mail, Phone } from 'lucide-react'; // Adjust import as needed

const ContactSection = () => {
  const form = useRef();
  const [status, setStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      'service_q50h704',      // replace with your EmailJS service ID
      'template_889ifta',     // replace with your EmailJS template ID
      form.current,
      'pLSjx9DMWjRn2HAYz'       // replace with your EmailJS public key
    )
    .then((result) => {
      setStatus('Message sent successfully!');
      form.current.reset();
    }, (error) => {
      setStatus('Failed to send message. Please try again.');
    });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get In <span className="text-green-600">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to elevate your research? Contact us today for a consultation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600">medistatsolutions@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-gray-600">+91 9744649329</p>
                  <p className="text-gray-600">+91 6282614312</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
            <form ref={form} onSubmit={sendEmail}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="number"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <select
                  name="service"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Service</option>
                  <option>Statistical Analysis</option>
                  <option>Thesis Assistance</option>
                  <option>Data Analytics Support</option>
                  <option>Professional Academic Services</option>
                </select>
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
                >
                  Send Message
                </button>
                {status && (
                  <div className="text-center mt-4 text-green-600 font-medium">
                    {status}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
