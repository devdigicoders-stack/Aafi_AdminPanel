import React, { useState, useEffect } from 'react';
import { 
  Search, Edit, Trash2, X, MessageSquare, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch requests');
        toast.error(data.message || 'Failed to fetch requests');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request permanently?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setRequests(requests.filter(req => req._id !== id));
        toast.success('Request deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete request');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const openEditModal = (request) => {
    setEditFormData({
      _id: request._id,
      user: request.user,
      title: request.title,
      description: request.description,
      status: request.status,
      adminResponse: request.adminResponse || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/requests/${editFormData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editFormData.status,
          adminResponse: editFormData.adminResponse
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(requests.map(req => 
          req._id === editFormData._id ? { ...data.data, user: req.user } : req
        ));
        toast.success('Request updated successfully');
        setIsEditModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update request');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setEditLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
      case 'in-progress':
        return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">In Progress</span>;
      case 'completed':
        return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">Completed</span>;
      case 'rejected':
        return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  // Search logic
  const filteredRequests = requests.filter(req => {
    const searchLower = searchQuery.toLowerCase();
    const userName = req.user?.name || '';
    const userEmail = req.user?.email || '';
    const title = req.title || '';
    const idStr = req._id.toString();
    
    return userName.toLowerCase().includes(searchLower) ||
           userEmail.toLowerCase().includes(searchLower) ||
           title.toLowerCase().includes(searchLower) ||
           idStr.toLowerCase().includes(searchLower);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Header & Toolbar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Support Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Manage user issues and support tickets</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search by User, Email, Title or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Loading requests...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>No requests found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50/80 text-gray-800 sticky top-0 z-10">
              <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4 w-1/3">Request Details</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Admin Response</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((req) => (
                <tr key={req._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    {req.user ? (
                      <div>
                        <p className="font-medium text-gray-800">{req.user.name}</p>
                        <p className="text-xs text-gray-500">{req.user.email}</p>
                        {req.user.mobile && <p className="text-xs text-gray-400 mt-0.5">{req.user.mobile}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">User deleted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800 mb-1">{req.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-2" title={req.description}>
                      {req.description}
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4">
                    {req.adminResponse ? (
                      <p className="text-sm text-gray-600 line-clamp-2 italic border-l-2 border-blue-300 pl-2">
                        {req.adminResponse}
                      </p>
                    ) : (
                      <span className="text-gray-300 text-sm italic">No response yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => openEditModal(req)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium" 
                        title="Respond / Update Status"
                      >
                        <Edit size={16} /> <span>Respond</span>
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteRequest(req._id)}
                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" 
                        title="Delete Request"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && !error && filteredRequests.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded text-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                      currentPage === page 
                        ? 'bg-[#0c1a32] text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1 text-gray-400">...</span>;
              }
              return null;
            })}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded text-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Respond/Edit Request Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !editLoading && setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                Respond to Request
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                disabled={editLoading}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: Original Request Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requester Info</h4>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {editFormData.user ? (
                        <>
                          <p className="font-semibold text-gray-800">{editFormData.user.name}</p>
                          <p className="text-sm text-gray-600">{editFormData.user.email}</p>
                          <p className="text-sm text-gray-600">{editFormData.user.mobile}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">User not found</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Request Subject</h4>
                    <p className="font-medium text-gray-900 border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/50 rounded-r-md">
                      {editFormData.title}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Description</h4>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100 min-h-[120px] whitespace-pre-wrap">
                      {editFormData.description}
                    </div>
                  </div>
                </div>

                {/* Right Side: Admin Response & Actions */}
                <div className="space-y-4 border-l border-gray-100 pl-0 md:pl-6">
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Update Status</label>
                    <select 
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="in-progress">🔵 In Progress</option>
                      <option value="completed">🟢 Completed</option>
                      <option value="rejected">🔴 Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Admin Response</label>
                    <textarea 
                      value={editFormData.adminResponse}
                      onChange={(e) => setEditFormData({...editFormData, adminResponse: e.target.value})}
                      rows={6}
                      placeholder="Type your response to the user here..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-400"
                    />
                    <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
                      <AlertCircle size={14} className="mt-0.5 text-blue-400" />
                      <p>This response will be visible to the user in their account dashboard.</p>
                    </div>
                  </div>

                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#0c1a32] rounded-lg hover:bg-[#152744] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                >
                  {editLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : null}
                  {editLoading ? 'Saving...' : 'Save & Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
