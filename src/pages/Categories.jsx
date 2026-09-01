import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, X, Eye, EyeOff, Image as ImageIcon 
} from 'lucide-react';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: '', imageUrl: '', description: '', isActive: true });
  const [addLoading, setAddLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/categories/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch categories');
        toast.error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setCategories(categories.map(cat => 
          cat._id === id ? { ...cat, isActive: !currentStatus } : cat
        ));
        toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat._id !== id));
        toast.success('Category deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const openEditModal = (category) => {
    setEditFormData({
      _id: category._id,
      name: category.name || '',
      imageUrl: category.imageUrl || '',
      description: category.description || '',
      isActive: category.isActive
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
        const hostUrl = baseUrl.replace('/api', '');
        const fullImageUrl = data.url.startsWith('http') ? data.url : `${hostUrl}${data.url}`;
        
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
      const response = await fetch(`${baseUrl}/categories/${editFormData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          imageUrl: editFormData.imageUrl,
          description: editFormData.description,
          isActive: editFormData.isActive
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCategories(categories.map(cat => 
          cat._id === editFormData._id ? data.data : cat
        ));
        toast.success('Category updated successfully');
        setIsEditModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch (err) {
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
      const response = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addFormData)
      });

      const data = await response.json();

      if (response.ok) {
        setCategories([data.data, ...categories]);
        toast.success('Category added successfully');
        setIsAddModalOpen(false);
        setAddFormData({ name: '', imageUrl: '', description: '', isActive: true });
      } else {
        toast.error(data.message || 'Failed to add category');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setAddLoading(false);
    }
  };

  // Search logic
  const filteredCategories = categories.filter(cat => 
    (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Header & Toolbar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Manage app categories</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0c1a32] hover:bg-[#152744] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap shadow-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Loading categories...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedCategories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col">
                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                  />
                  
                  {/* Overlay Gradient for Title */}
                  <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent">
                    <h3 className="text-white font-medium truncate text-base drop-shadow-sm">{category.name}</h3>
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={() => openEditModal(category)}
                      className="w-8 h-8 rounded-full bg-white/90 text-gray-700 shadow-sm flex items-center justify-center hover:text-blue-600 hover:bg-white transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category._id)}
                      className="w-8 h-8 rounded-full bg-white/90 text-gray-700 shadow-sm flex items-center justify-center hover:text-red-600 hover:bg-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-4 py-3 flex flex-col border-t border-gray-50 bg-white">
                  {category.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2" title={category.description}>
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm font-medium text-gray-700">{category.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleToggleActive(category._id, category.isActive)}
                      title={category.isActive ? 'Deactivate Category' : 'Activate Category'}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {!category.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && !error && filteredCategories.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
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
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
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

      {/* Edit Category Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !editLoading && setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Edit Category</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                disabled={editLoading}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
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
                      <img src={editFormData.imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea 
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={editFormData.isActive.toString()}
                    onChange={(e) => setEditFormData({...editFormData, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={editLoading || imageUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0c1a32] rounded-lg hover:bg-[#152744] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : null}
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !addLoading && setIsAddModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Add New Category</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                disabled={addLoading}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
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
                      <img src={addFormData.imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = 'Invalid Image'; }} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea 
                    value={addFormData.description}
                    onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={addFormData.isActive.toString()}
                    onChange={(e) => setAddFormData({...addFormData, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={addLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addLoading || imageUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0c1a32] rounded-lg hover:bg-[#152744] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {addLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : null}
                  {addLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
