import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, UploadCloud, CheckCircle, Briefcase, Users, TrendingUp, HeartHandshake, Sparkles, FileText } from 'lucide-react';
import Sidebar from './Sidebar';

const OPEN_POSITIONS = [
  {
    title: 'Statistical Analyst',
    location: 'Remote',
    type: 'Full Time',
    description: 'Analyze research data, prepare reports, and support client projects.'
  }
];

const Career = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    coverLetter: '',
    resume: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const formRef = React.useRef(null);
  const fileInputRef = React.useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleApplyClick = (pos) => {
    setForm((f) => ({ ...f, position: pos.title }));
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('position', form.position);
      formData.append('coverLetter', form.coverLetter);
      formData.append('resume', form.resume);
      // Replace with your backend endpoint
      const response = await fetch('http://127.0.0.1:8000/career-application/', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to submit application');
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', position: '', coverLetter: '', resume: null });
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Careers at Medistat | Join Our Team</title>
        <meta name="description" content="Explore career opportunities at Medistat Solutions. Apply for open positions and join our mission to empower research and healthcare." />
      </Helmet>
      <div className="flex min-h-screen flex-col md:flex-row bg-gradient-to-br from-blue-50 to-slate-100">
        <Sidebar />
        <div className="flex-1">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 py-14 px-4 md:px-0 text-white text-center shadow-lg mb-8 rounded-b-3xl overflow-hidden">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">Join Medistat Solutions</h1>
              <p className="text-lg md:text-2xl font-medium mb-6 opacity-90">Empowering research and healthcare through innovation. <span className="font-semibold">Grow your career with us!</span></p>
              <a href="#career-apply-form" className="inline-block px-8 py-3 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-blue-100 transition text-lg">Apply Now</a>
            </div>
            <svg className="absolute bottom-0 left-0 w-full h-12" viewBox="0 0 1440 320"><path fill="#f8fafc" fillOpacity="1" d="M0,224L1440,320L1440,320L0,320Z"></path></svg>
          </div>
          {/* Why Join Us Section */}
          <div className="max-w-4xl mx-auto mb-10 px-4">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Why Join Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-blue-100">
                <TrendingUp size={32} className="text-blue-600 mb-2" />
                <div className="font-semibold text-blue-900">Career Growth</div>
                <div className="text-slate-600 text-sm mt-1">Opportunities to learn, grow, and lead in a fast-growing company.</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-blue-100">
                <Users size={32} className="text-blue-600 mb-2" />
                <div className="font-semibold text-blue-900">Collaborative Team</div>
                <div className="text-slate-600 text-sm mt-1">Work with passionate professionals who support each other.</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-blue-100">
                <HeartHandshake size={32} className="text-blue-600 mb-2" />
                <div className="font-semibold text-blue-900">Meaningful Impact</div>
                <div className="text-slate-600 text-sm mt-1">Contribute to research and healthcare that makes a difference.</div>
              </div>
              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-blue-100">
                <Sparkles size={32} className="text-blue-600 mb-2" />
                <div className="font-semibold text-blue-900">Flexible & Modern</div>
                <div className="text-slate-600 text-sm mt-1">Enjoy remote work, flexible hours, and a modern work culture.</div>
              </div>
            </div>
          </div>
          {/* About Us Section */}
          <div className="max-w-3xl mx-auto py-6 px-4 md:px-8 mb-8 bg-white/90 rounded-2xl shadow border border-slate-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">About Us</h2>
            <p className="text-slate-700 mb-2">Medistat Solutions is a leading provider of research analytics and medical writing services, trusted by 500+ researchers and students. We are passionate about advancing science and healthcare through data-driven insights and expert support.</p>
            <div className="flex flex-wrap gap-4 mt-4 text-slate-600 text-sm">
              <span className="inline-flex items-center gap-1"><MapPin size={16}/> Mangalore, Karnataka, India</span>
              <span className="inline-flex items-center gap-1"><Mail size={16}/> medistatsolutions@gmail.com</span>
              <span className="inline-flex items-center gap-1"><Phone size={16}/> +91 9744649329</span>
            </div>
          </div>
          {/* Open Position Card */}
          <div className="max-w-2xl mx-auto mb-10 px-4">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Open Position</h2>
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <Briefcase size={40} className="text-blue-700" />
                <div>
                  <div className="font-bold text-blue-900 text-xl">Statistical Analyst</div>
                  <div className="text-slate-600 text-sm">Mangalore, Karnataka, India &bull; Full Time</div>
                  <div className="text-slate-700 mt-1 max-w-md">Analyze research data, prepare reports, and support client projects.</div>
                  <div className="mt-4">
                    <div className="font-semibold text-blue-800 mb-1">Requirements:</div>
                    <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                      <li><span className="font-medium">R language</span> (data analysis, scripting)</li>
                      <li><span className="font-medium">Statistics</span> (applied/statistical methods)</li>
                      <li><span className="font-medium">Power BI</span> (dashboard/reporting)</li>
                      <li><span className="font-medium">MS Excel</span> (advanced functions, data handling)</li>
                      <li><span className="font-medium">Communication skills</span> (written & verbal)</li>
                      <li>Attention to detail, teamwork, and a passion for research</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold text-base shadow hover:bg-blue-700 transition mt-2 md:mt-0"
                onClick={() => handleApplyClick(OPEN_POSITIONS[0])}
                type="button"
              >
                Apply Now
              </button>
            </div>
          </div>
          {/* Application Form */}
          <div id="career-apply-form" ref={formRef} className="max-w-2xl mx-auto mb-12 px-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2"><FileText size={28} className="text-blue-600" /> Application Form</h2>
              {success && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <CheckCircle size={20} />
                  Application submitted successfully! We will contact you soon.
                </div>
              )}
              {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-4">{error}</div>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1"><Users size={16}/> Full Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1"><Mail size={16}/> Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1"><Phone size={16}/> Phone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1"><Briefcase size={16}/> Position</label>
                    <select name="position" value={form.position} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
                      <option value="">Select Position</option>
                      {OPEN_POSITIONS.map((pos, idx) => (
                        <option key={idx} value={pos.title}>{pos.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1"><Sparkles size={16}/> Cover Letter</label>
                  <textarea name="coverLetter" value={form.coverLetter} onChange={handleChange} rows={4} required className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 flex items-center gap-1"><UploadCloud size={16}/> Resume (PDF/DOC)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200 transition border border-blue-200"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      Select Resume
                    </button>
                    <span className="text-slate-600 text-sm truncate max-w-xs">{form.resume ? form.resume.name : 'No file selected'}</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    required
                    className="hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60 mt-2"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Career; 