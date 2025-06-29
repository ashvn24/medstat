import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKvljNIsRRVNNytagXvTOg5EnZXdsB9bkD8fZKXxLIg3ZAl8rnv8kjINub735SAIGsLg/exec'; // <-- Replace with your deployed Apps Script Web App URL

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

  // Fetch testimonials from Google Sheets
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSyaO2nrOR8aFowan6wRgzKphxj1OLOh10OqncG_ewbZEPOJR02Q8OS6AzsoQwRoaWQMB9tEn9icY_T/pub?output=csv');
      const text = await response.text();
      
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          const validTestimonials = results.data.filter(item => 
            item.Name && item.Name.trim() !== '' && 
            item.Feedback && item.Feedback.trim() !== ''
          );
          setTestimonials(validTestimonials);
          setFilteredTestimonials(validTestimonials);
          setLoading(false);
          console.log(validTestimonials);
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
        testimonial.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.Feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.Rating?.toString().includes(searchTerm)
      );
      setFilteredTestimonials(filtered);
    }
  }, [searchTerm, testimonials]);

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsViewModalOpen(true);
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial({ ...testimonial });
    setIsEditModalOpen(true);
  };

  const handleDelete = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setActionLoading(true);
    try {
      // Find the row number (index + 2)
      const row = testimonials.findIndex(t => t === selectedTestimonial) + 2;
      const params = new URLSearchParams({
        action: 'update',
        row: row,
        Feedback: editingTestimonial.Feedback,
        Suggestions: editingTestimonial['Suggestions for improvement'],
        Name: editingTestimonial.Name,
        Email: editingTestimonial.Email
      });
      // Use GET with URL params and no-cors mode
      await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      await fetchTestimonials();
      setIsEditModalOpen(false);
      setEditingTestimonial({});
      setSelectedTestimonial(null);
    } catch (error) {
      alert('Failed to update testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      const row = testimonials.findIndex(t => t === selectedTestimonial) + 2;
      const params = new URLSearchParams({
        action: 'delete',
        row: row
      });
      // Use GET with URL params and no-cors mode
      await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      await fetchTestimonials();
      setIsDeleteModalOpen(false);
      setSelectedTestimonial(null);
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
                    ? (testimonials.reduce((sum, t) => sum + (parseInt(t.Rating) || 0), 0) / testimonials.length).toFixed(1)
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
                  {new Set(testimonials.map(t => t.Name)).size}
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
                    const date = new Date(t.Date || t.Timestamp || '');
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

        {/* Testimonials Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggestions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTestimonials.map((testimonial, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {testimonial.Name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {testimonial.Email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {testimonial.Feedback || 'No feedback'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {testimonial['Suggestions for improvement'] || 'No suggestions'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(testimonial)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <p className="text-gray-900">{selectedTestimonial.Name || 'Anonymous'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedTestimonial.Email || 'No email provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center">
                    {renderStars(selectedTestimonial.Rating)}
                    <span className="ml-2 text-gray-900">{selectedTestimonial.Rating || '0'}/5</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTestimonial.Feedback || 'No testimonial text'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{selectedTestimonial.Date || selectedTestimonial.Timestamp || 'No date'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions for improvement</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedTestimonial['Suggestions for improvement'] || 'No suggestions'}</p>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingTestimonial.Name || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, Name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingTestimonial.Email || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, Email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={editingTestimonial.Rating || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, Rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial</label>
                  <textarea
                    value={editingTestimonial.Feedback || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, Feedback: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions for improvement</label>
                  <textarea
                    value={editingTestimonial['Suggestions for improvement'] || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, ['Suggestions for improvement']: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                Are you sure you want to delete the testimonial from "{selectedTestimonial.Name || 'Anonymous'}"? 
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
  );
};

export default ManageReview; 