import React, { useState, useEffect } from 'react';
import { 
  Search, Edit, Trash2, X, Eye, EyeOff, Package, Image as ImageIcon, Plus 
} from 'lucide-react';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: '', category: '', imageUrl: '', description: '', isActive: true, status: 'approved' });
  const [addLoading, setAddLoading] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/products/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch products');
        toast.error(data.message || 'Failed to fetch products');
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
      const response = await fetch(`${baseUrl}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setProducts(products.map(prod => 
          prod._id === id ? { ...prod, isActive: !currentStatus } : prod
        ));
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(prod => prod._id !== id));
        toast.success('Product deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const openEditModal = (product) => {
    setEditFormData({
      _id: product._id,
      name: product.name,
      category: product.category?._id || '',
      imageUrl: product.imageUrl,
      description: product.description,
      status: product.status,
      isActive: product.isActive
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addFormData)
      });

      const data = await response.json();

      if (response.ok) {
        const selectedCat = categories.find(c => c._id === addFormData.category);
        const newProduct = {
          ...data.data,
          category: selectedCat ? { _id: selectedCat._id, name: selectedCat.name } : data.data.category
        };
        
        setProducts([newProduct, ...products]);
        toast.success('Product added successfully');
        setIsAddModalOpen(false);
        setAddFormData({ name: '', category: '', imageUrl: '', description: '', isActive: true, status: 'approved' });
      } else {
        toast.error(data.message || 'Failed to add product');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/products/${editFormData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          category: editFormData.category,
          imageUrl: editFormData.imageUrl,
          description: editFormData.description,
          status: editFormData.status,
          isActive: editFormData.isActive
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Find the full category object to update state correctly
        const selectedCat = categories.find(c => c._id === editFormData.category);
        
        setProducts(products.map(prod => 
          prod._id === editFormData._id ? { 
            ...data.data, 
            category: selectedCat ? { _id: selectedCat._id, name: selectedCat.name } : prod.category,
            user: prod.user // Keep the original populated user data
          } : prod
        ));
        toast.success('Product updated successfully');
        setIsEditModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to update product');
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
        return <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-yellow-100 text-yellow-700 uppercase border border-yellow-200">Pending</span>;
      case 'approved':
        return <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-green-100 text-green-700 uppercase border border-green-200">Approved</span>;
      case 'rejected':
        return <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-red-100 text-red-700 uppercase border border-red-200">Rejected</span>;
      default:
        return null;
    }
  };

  // Filter & Search logic
  const filteredProducts = products.filter(prod => {
    const searchMatch = 
      (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const statusMatch = statusFilter === 'all' || prod.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Header & Toolbar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage user submitted products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search products, users..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0c1a32] hover:bg-[#152744] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap shadow-sm"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Package size={48} className="mb-4 opacity-50" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col relative">
                
                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3 z-10 shadow-sm">
                  {getStatusBadge(product.status)}
                </div>

                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                  />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="w-8 h-8 rounded-full bg-white/95 text-gray-700 shadow flex items-center justify-center hover:text-blue-600 hover:bg-white transition-colors"
                      title="Edit / Approve"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className="w-8 h-8 rounded-full bg-white/95 text-gray-700 shadow flex items-center justify-center hover:text-red-600 hover:bg-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base leading-tight mb-1 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1" title={product.description}>
                    {product.description}
                  </p>
                  
                  {/* Submitter Info */}
                  <div className="pt-3 border-t border-gray-100 mt-auto flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Submitted By</p>
                      <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                        {product.user?.name || 'Unknown User'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shadow-inner ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-gray-600">{product.isActive ? 'Publicly Visible' : 'Hidden'}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleToggleActive(product._id, product.isActive)}
                    title={product.isActive ? 'Hide Product' : 'Show Product'}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-all shadow-sm bg-white"
                  >
                    {!product.isActive ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-orange-500" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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
                <option value={24}>24</option>
                <option value={48}>48</option>
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

      {/* Edit Product Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !editLoading && setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Edit / Approve Product</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                disabled={editLoading}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                
                {/* Column 1 */}
                <div className="space-y-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select 
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
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
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Controls</h4>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Approval Status</label>
                      <select 
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm bg-white"
                      >
                        <option value="pending">🟡 Pending (Needs Review)</option>
                        <option value="approved">🟢 Approved (Ready for Public)</option>
                        <option value="rejected">🔴 Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Visibility (Active)</label>
                      <select 
                        value={editFormData.isActive.toString()}
                        onChange={(e) => setEditFormData({...editFormData, isActive: e.target.value === 'true'})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      >
                        <option value="true">Visible</option>
                        <option value="false">Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3 rounded-b-xl">
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
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c1a32] rounded-lg hover:bg-[#152744] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !addLoading && setIsAddModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Add New Product</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                disabled={addLoading}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                
                {/* Column 1 */}
                <div className="space-y-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select 
                      value={addFormData.category}
                      onChange={(e) => setAddFormData({...addFormData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
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
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      value={addFormData.description}
                      onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Controls</h4>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Approval Status</label>
                      <select 
                        value={addFormData.status}
                        onChange={(e) => setAddFormData({...addFormData, status: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm bg-white"
                      >
                        <option value="pending">🟡 Pending (Needs Review)</option>
                        <option value="approved">🟢 Approved (Ready for Public)</option>
                        <option value="rejected">🔴 Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Visibility (Active)</label>
                      <select 
                        value={addFormData.isActive.toString()}
                        onChange={(e) => setAddFormData({...addFormData, isActive: e.target.value === 'true'})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      >
                        <option value="true">Visible</option>
                        <option value="false">Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3 rounded-b-xl">
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
                  className="px-5 py-2 text-sm font-medium text-white bg-[#0c1a32] rounded-lg hover:bg-[#152744] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                >
                  {addLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : null}
                  {addLoading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
