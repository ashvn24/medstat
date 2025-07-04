import React, { useState, useEffect, useRef } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  User,
  Star,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  X,
  BarChart3,
  NotebookPen,
  Package
} from 'lucide-react';
import Papa from 'papaparse';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKvljNIsRRVNNytagXvTOg5EnZXdsB9bkD8fZKXxLIg3ZAl8rnv8kjINub735SAIGsLg/exec'; // <-- Replace with your deployed Apps Script Web App URL
const BACKEND_URL = 'https://medstat-backend.onrender.com'; // Backend URL for API calls

const ManageReview = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Define all columns and their keys/labels
  const ALL_COLUMNS = [
    { label: "Date", key: "Timestamp" },
    { label: "Full Name", key: "1. Full Name " },
    { label: "Educational Qualification", key: " 2. Educational Qualification  " },
    { label: "Satisfaction", key: "3. How satisfied are you with our statistical analysis services?  " },
    { label: "Turnaround Time", key: "5. How would you rate our turnaround time?" },
    { label: "Communication & Support", key: "6. How would you describe our communication and support?  " },
    { label: "Recommendation", key: "7. Would you recommend Medistat Solutions to others?  " },
    { label: "Stay Connected", key: "  8. Stay Connected!   👉 Follow us on LinkedIn for updates, insights, and offers: www.linkedin.com/in/medistat-solutions-3a9262356" },
    { label: "Feedback", key: "  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  " }
  ];

  const [selectedColumns, setSelectedColumns] = useState([
    "Timestamp",
    "1. Full Name ",
    " 2. Educational Qualification  ",
    "3. How satisfied are you with our statistical analysis services?  ",
    "  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  "
  ]);

  // Fetch testimonials from Google Sheets
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vStv63buxIdC2PFN8o1OnOoeIffHuJgqhAukujwp1n4m4U9h7Mu7a6W9dTz-1gqoezwRQjGvr1BoBhM/pub?output=csv');
      const text = await response.text();
      
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          console.log('First row keys:', Object.keys(results.data[0]));
          const validTestimonials = results.data.filter(item => 
            item['1. Full Name '] && item['1. Full Name '].trim() !== ''
          );
          setTestimonials(validTestimonials);
          setFilteredTestimonials(validTestimonials);
          setLoading(false);
          // Debug: log a sample testimonial object
          if (validTestimonials.length > 0) {
            console.log('Sample testimonial object:', validTestimonials[0]);
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setError('Failed to parse testimonials data');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch testimonials');
      setLoading(false);
    }
  };

  // Filter testimonials based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTestimonials(testimonials);
    } else {
      const filtered = testimonials.filter(testimonial =>
        testimonial['1. Full Name ']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial[' 9.Any additional feedback? \u21b5 Thank you for your time! Your feedback helps us improve and serve you better. 😊 ']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial['3. How satisfied are you with our statistical analysis services? ']?.toString().includes(searchTerm)
      );
      setFilteredTestimonials(filtered);
    }
  }, [searchTerm, testimonials]);

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsViewModalOpen(true);
  };

  const handleEdit = (testimonial, index) => {
    setEditingTestimonial({ ...testimonial });
    setSelectedTestimonial(testimonial);
    setSelectedTestimonialIndex(index);
    setIsEditModalOpen(true);
  };

  const handleDelete = (testimonial, index) => {
    setSelectedTestimonial(testimonial);
    setSelectedTestimonialIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setActionLoading(true);
    try {
      // Use the tracked index for row calculation
      console.log('Selected testimonial index:', selectedTestimonialIndex);
      const row = selectedTestimonialIndex + 2;
      console.log('Row:', row);
      console.log('Editing testimonial:', editingTestimonial);
      const payload = {
        row: row,
        Feedback: editingTestimonial['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  '],
        Suggestions: editingTestimonial['Suggestions'] || '',
        Name: editingTestimonial['1. Full Name '],
        Email: editingTestimonial['Email'] || ''
      };
      console.log('Payload being sent to backend:', payload);
      await fetch(`${BACKEND_URL}/update-testimonial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchTestimonials();
      setIsEditModalOpen(false);
      setEditingTestimonial({});
      setSelectedTestimonial(null);
      setSelectedTestimonialIndex(null);
    } catch (error) {
      alert('Failed to update testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      const row = selectedTestimonialIndex + 2;
      await fetch(`${BACKEND_URL}/delete-testimonial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row: row })
      });
      await fetchTestimonials();
      setIsDeleteModalOpen(false);
      setSelectedTestimonial(null);
      setSelectedTestimonialIndex(null);
    } catch (error) {
      alert('Failed to delete testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseInt(rating) || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Testimonials</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTestimonials}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Hamburger icon */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 101,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 8,
          display: sidebarOpen ? 'none' : 'block',
          boxShadow: '0 2px 8px #0001',
        }}
        aria-label="Open sidebar"
      >
        <Menu size={28} color="#2563eb" />
      </button>
      {/* Sidebar with transition */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30,41,59,0.25)',
            zIndex: 100,
            transition: 'opacity 0.3s',
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Testimonial Management</h1>
                    <p className="text-sm text-gray-600">Manage and moderate customer testimonials</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={fetchTestimonials}
                    className="flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                    <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {testimonials.length > 0 
                        ? (testimonials.reduce((sum, t) => sum + (parseInt(t['3. How satisfied are you with our statistical analysis services? ']) || 0), 0) / testimonials.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <User className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(testimonials.map(t => t['1. Full Name '])).size}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {testimonials.filter(t => {
                        const date = new Date(t['Timestamp'] || '');
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search testimonials by name, content, or rating..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Showing {filteredTestimonials.length} of {testimonials.length}</span>
                </div>
              </div>
            </div>

            {/* Add column selector UI before the table */}
            <div className="relative mb-4">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
                onClick={() => setShowColumnDropdown(open => !open)}
                type="button"
              >
                Select Columns
              </button>
              {showColumnDropdown && (
                <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg p-3 max-h-64 overflow-y-auto">
                  {ALL_COLUMNS.map(col => (
                    <label key={col.key} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col.key)}
                        onChange={() => {
                          setSelectedColumns(selectedColumns =>
                            selectedColumns.includes(col.key)
                              ? selectedColumns.filter(k => k !== col.key)
                              : [...selectedColumns, col.key]
                          );
                        }}
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                  <button
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setShowColumnDropdown(false)}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Testimonials Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {ALL_COLUMNS.filter(col => selectedColumns.includes(col.key)).map(col => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTestimonials.map((testimonial, index) => {
                      // Use a unique key (Timestamp + Full Name) to find the index in the full testimonials array, trimming whitespace
                      const fullIndex = testimonials.findIndex(
                        t =>
                          (t['Timestamp'] || '').trim() === (testimonial['Timestamp'] || '').trim() &&
                          (t['1. Full Name '] || '').trim() === (testimonial['1. Full Name '] || '').trim()
                      );
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          {ALL_COLUMNS.filter(col => selectedColumns.includes(col.key)).map(col => (
                            col.label === 'Feedback' ? (
                              <td key={col.key} className="px-4 py-3 max-w-xs truncate" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={testimonial[col.key] || ''}>
                                {testimonial[col.key]}
                              </td>
                            ) : col.label === 'Date' ? (
                              <td key={col.key} className="px-4 py-3">{testimonial[col.key] ? testimonial[col.key].split(' ')[0] : ''}</td>
                            ) : col.label === 'Satisfaction' ? (
                              <td key={col.key} className="px-4 py-3"><div className="flex flex-row items-center gap-1">{renderStars(testimonial[col.key])}</div></td>
                            ) : (
                              <td key={col.key} className="px-4 py-3">{testimonial[col.key]}</td>
                            )
                          ))}
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleView(testimonial)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="View"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleEdit(testimonial, fullIndex)} className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(testimonial, fullIndex)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredTestimonials.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No testimonials available yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* View Modal */}
          {isViewModalOpen && selectedTestimonial && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-gray-900">View Testimonial</h2>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div><label>Timestamp</label><p>{selectedTestimonial['Timestamp']}</p></div>
                    <div><label>Full Name</label><p>{selectedTestimonial['1. Full Name ']}</p></div>
                    <div><label>Educational Qualification</label><p>{selectedTestimonial[' 2. Educational Qualification  ']}</p></div>
                    <div><label>Satisfaction</label><p>{selectedTestimonial['3. How satisfied are you with our statistical analysis services?  ']}</p></div>
                    <div><label>Turnaround Time</label><p>{selectedTestimonial['5. How would you rate our turnaround time?']}</p></div>
                    <div><label>Communication & Support</label><p>{selectedTestimonial['6. How would you describe our communication and support?  ']}</p></div>
                    <div><label>Recommendation</label><p>{selectedTestimonial['7. Would you recommend Medistat Solutions to others?  ']}</p></div>
                    <div><label>Stay Connected</label><p>{selectedTestimonial['  8. Stay Connected!   👉 Follow us on LinkedIn for updates, insights, and offers: www.linkedin.com/in/medistat-solutions-3a9262356']}</p></div>
                    <div><label>Feedback</label><p>{selectedTestimonial['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  ']}</p></div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Testimonial</h2>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label><input type="text" value={editingTestimonial['Timestamp'] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['Timestamp']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={editingTestimonial['1. Full Name '] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['1. Full Name ']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Educational Qualification</label><input type="text" value={editingTestimonial[' 2. Educational Qualification  '] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, [' 2. Educational Qualification  ']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Satisfaction</label><input type="text" value={editingTestimonial['3. How satisfied are you with our statistical analysis services?  '] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['3. How satisfied are you with our statistical analysis services?  ']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Turnaround Time</label><input type="text" value={editingTestimonial['5. How would you rate our turnaround time?'] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['5. How would you rate our turnaround time?']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Communication & Support</label><input type="text" value={editingTestimonial['6. How would you describe our communication and support?  '] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['6. How would you describe our communication and support?  ']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label><input type="text" value={editingTestimonial['7. Would you recommend Medistat Solutions to others?  '] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['7. Would you recommend Medistat Solutions to others?  ']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Stay Connected</label><input type="text" value={editingTestimonial['  8. Stay Connected!   👉 Follow us on LinkedIn for updates, insights, and offers: www.linkedin.com/in/medistat-solutions-3a9262356'] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['  8. Stay Connected!   👉 Follow us on LinkedIn for updates, insights, and offers: www.linkedin.com/in/medistat-solutions-3a9262356']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label><textarea value={editingTestimonial['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  '] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['  9.Any additional feedback?   \n Thank you for your time! Your feedback helps us improve and serve you better. 😊  ']: e.target.value})} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    {/* Suggestions field if present */}
                    {'Suggestions' in editingTestimonial && (
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Suggestions</label><input type="text" value={editingTestimonial['Suggestions'] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['Suggestions']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    )}
                    {/* Email field if present */}
                    {'Email' in editingTestimonial && (
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editingTestimonial['Email'] || ''} onChange={e => setEditingTestimonial({...editingTestimonial, ['Email']: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && selectedTestimonial && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Delete Testimonial</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete the testimonial from "{selectedTestimonial['1. Full Name '] || 'Anonymous'}"? 
                    This action cannot be undone.
                  </p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReview; 