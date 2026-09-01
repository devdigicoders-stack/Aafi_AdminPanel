import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Sliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', imageUrl: '', link: '', isActive: true });
  const [editLoading, setEditLoading] = useState(false);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ title: '', imageUrl: '', link: '', isActive: true });
  const [addLoading, setAddLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSliders();
  }, []);

  // Reset pagination when search or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const fetchSliders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch from the new admin endpoint to get ALL sliders (active and inactive)
      const response = await fetch(`${baseUrl}/sliders/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSliders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch sliders');
      }
    } catch (err) {
      setError('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/sliders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setSliders(sliders.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
        toast.success(`Slider ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update slider status');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDeleteSlider = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/sliders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSliders(sliders.filter(s => s._id !== id));
        toast.success('Slider deleted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete slider');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const openEditModal = (slider) => {
    setEditingSlider(slider);
    setEditFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl || '',
      link: slider.link || '',
      isActive: slider.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setImageUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        // Construct full URL (e.g., http://localhost:5000/uploads/...)
        const hostUrl = baseUrl.replace('/api', '');
        const fullImageUrl = `${hostUrl}${data.url}`;
        
        if (isEdit) {
          setEditFormData({ ...editFormData, imageUrl: fullImageUrl });
        } else {
          setAddFormData({ ...addFormData, imageUrl: fullImageUrl });
        }
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(data.message || 'Image upload failed');
      }
    } catch (error) {
      toast.error('Network error during image upload');
    } finally {
      setImageUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/sliders/${editingSlider._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      if (response.ok) {
        setSliders(sliders.map(s => s._id === editingSlider._id ? data.data : s));
        setIsEditModalOpen(false);
        toast.success('Slider updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update slider');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/sliders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addFormData)
      });

      const data = await response.json();
      if (response.ok) {
        setSliders([data.data, ...sliders]);
        setIsAddModalOpen(false);
        setAddFormData({ title: '', imageUrl: '', link: '', isActive: true });
        toast.success('Slider created successfully!');
      } else {
        toast.error(data.message || 'Failed to create slider');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredSliders = sliders.filter(slider => 
    slider.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    slider.link?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSliders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSliders = filteredSliders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sliders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage app sliders and banners</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search sliders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-gray-50 hover:bg-white transition-colors"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0c1a32] hover:bg-[#152744] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap shadow-sm"
          >
            <Plus size={16} />
            Add New Slider
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Loading sliders...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
        ) : filteredSliders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>No sliders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedSliders.map((slider) => (
              <div key={slider._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col">
                {/* Image Section */}
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  <img 
                    src={slider.imageUrl} 
                    alt={slider.title || 'Slider'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=No+Image'; }}
                  />
                  
                  {/* Overlay Gradient for Title */}
                  {slider.title && (
                    <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent">
                      <h3 className="text-white font-medium truncate text-base drop-shadow-sm">{slider.title}</h3>
                    </div>
                  )}

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={() => openEditModal(slider)}
                      className="w-8 h-8 rounded-full bg-white/90 text-gray-700 shadow-sm flex items-center justify-center hover:text-blue-600 hover:bg-white transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSlider(slider._id)}
                      className="w-8 h-8 rounded-full bg-white/90 text-gray-700 shadow-sm flex items-center justify-center hover:text-red-600 hover:bg-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 bg-white">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${slider.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium text-gray-700">{slider.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {slider.link && (
                      <a 
                        href={slider.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-medium text-blue-500 hover:underline truncate max-w-[100px]"
                        title={slider.link}
                      >
                        Link
                      </a>
                    )}
                    <button 
                      onClick={() => handleToggleActive(slider._id, slider.isActive)}
                      title={slider.isActive ? 'Deactivate Slider' : 'Activate Slider'}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {!slider.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 bg-white">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div>
            Showing {filteredSliders.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSliders.length)} of {filteredSliders.length} sliders
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1 focus:outline-none bg-white text-gray-700"
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            &lt;
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded ${
                  currentPage === pageNum 
                    ? 'bg-[#0c1a32] text-white' 
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit Slider</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={imageUploading}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imageUploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                
                {editFormData.imageUrl && (
                  <div className="mt-2 h-24 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    <img src={editFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                <input 
                  type="url" 
                  value={editFormData.link}
                  onChange={(e) => setEditFormData({...editFormData, link: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={editFormData.isActive}
                  onChange={(e) => setEditFormData({...editFormData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={editLoading}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors ${
                    editLoading ? 'bg-gray-400' : 'bg-[#0c1a32] hover:bg-[#152744]'
                  }`}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Add New Slider</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  value={addFormData.title}
                  onChange={(e) => setAddFormData({...addFormData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={imageUploading}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required={!addFormData.imageUrl}
                />
                {imageUploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                
                {addFormData.imageUrl && (
                  <div className="mt-2 h-24 bg-gray-100 rounded overflow-hidden border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    <img src={addFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = 'Invalid Image'; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                <input 
                  type="url" 
                  value={addFormData.link}
                  onChange={(e) => setAddFormData({...addFormData, link: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={addFormData.isActive}
                  onChange={(e) => setAddFormData({...addFormData, isActive: e.target.value === 'true'})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addLoading}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors ${
                    addLoading ? 'bg-gray-400' : 'bg-[#0c1a32] hover:bg-[#152744]'
                  }`}
                >
                  {addLoading ? 'Creating...' : 'Create Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
