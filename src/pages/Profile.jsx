import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Shield, Camera, Calendar, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminId, setAdminId] = useState(null);
  
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    createdAt: ''
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setAdminId(data.data._id);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          mobile: data.data.mobile || '',
          password: '',
          confirmPassword: '',
          createdAt: data.data.createdAt || new Date().toISOString()
        });
      } else {
        toast.error(data.message || 'Failed to fetch profile details');
      }
    } catch (err) {
      toast.error('Network error while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminId) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setSaving(true);
    
    // Prepare data, excluding empty password
    const payload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
    };
    if (formData.password.trim()) {
      payload.password = formData.password;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/admin/users/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear password fields
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Network error during update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading profile data...</div>;
  }

  // Format date like "20 May 2024"
  const joinDate = new Date(formData.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // Get initials for Avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full h-full flex flex-col py-2">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0c1a32] flex items-center gap-3">
          <Shield className="text-blue-600" size={26} />
          Admin Profile Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information and security details.</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        
        {/* Dark Banner Area */}
        <div className="bg-gradient-to-r from-[#0c1a32] via-[#152e5a] to-[#1e3a8a] px-10 py-10 relative overflow-hidden">
          {/* Decorative Pattern / Waves */}
          <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
            <svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 200 Q 150 100 300 150 T 600 50 L 600 0 L 0 0 Z" fill="#ffffff" opacity="0.1"/>
              <path d="M0 200 Q 200 50 400 120 T 600 20 L 600 0 L 0 0 Z" fill="#ffffff" opacity="0.1"/>
            </svg>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-100 border-[3px] border-[#0c1a32] shadow-lg flex items-center justify-center text-3xl font-bold text-[#0c1a32]">
                {getInitials(formData.name)}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md text-gray-700 hover:text-blue-600 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            
            {/* Admin Info */}
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-1.5">{formData.name || 'Super Admin'}</h3>
              <div className="flex flex-col gap-1.5">
                <span className="bg-blue-600/30 border border-blue-400/30 text-blue-100 text-xs px-3 py-1 rounded-md font-medium inline-flex items-center w-max">
                  Administrator
                </span>
                <span className="text-gray-300 text-xs flex items-center gap-1.5 mt-1">
                  <Calendar size={12} /> Joined on {joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Area */}
        <form onSubmit={handleSubmit} className="p-10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
            
            {/* Left Column: Personal Information */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Security */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6">Security</h3>
              
              <div className="bg-blue-50/40 rounded-xl p-6 border border-blue-50">
                <h4 className="text-sm font-bold text-gray-800 mb-1">Change Password</h4>
                <p className="text-xs text-gray-500 mb-6">Leave these fields blank if you do not wish to change your password.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                        placeholder="Enter new password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-700"
                        placeholder="Confirm new password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="mt-10 pt-6 flex justify-end border-t border-gray-50 mt-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0c1a32] hover:bg-[#152744] text-white rounded-lg text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
