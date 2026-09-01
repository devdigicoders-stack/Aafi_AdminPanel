import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Info, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${baseUrl}/notifications`);
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.data);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n._id !== id));
        toast.success('Notification deleted');
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      toast.error('Network error while deleting');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Notification sent successfully!');
        setNotifications([data.data, ...notifications]);
        setIsModalOpen(false);
        setFormData({ title: '', message: '', type: 'info' });
      } else {
        toast.error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'info': return <Info className="text-blue-500" size={24} />;
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'error': return <AlertCircle className="text-red-500" size={24} />;
      default: return <Bell className="text-gray-500" size={24} />;
    }
  };

  const getBgForType = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-50 border-blue-100';
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-yellow-50 border-yellow-100';
      case 'error': return 'bg-red-50 border-red-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="w-full h-full flex flex-col py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0c1a32] flex items-center gap-3">
            <Bell className="text-blue-600" size={26} />
            Notifications
          </h2>
          <p className="text-gray-500 text-sm mt-1">Send and manage global notifications for users.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Send Notification
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col p-6">
        {loading ? (
          <div className="flex-1 flex justify-center items-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-5 rounded-xl border flex items-start justify-between gap-4 transition-all hover:shadow-md ${getBgForType(notif.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                    {getIconForType(notif.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{notif.title}</h4>
                    <p className="text-gray-600 mt-1">{notif.message}</p>
                    <span className="text-xs text-gray-400 font-medium mt-3 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notif._id)}
                  className="text-red-400 hover:text-red-600 bg-white hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Delete Notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Bell className="text-blue-600" size={20} />
                Send New Notification
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
                    placeholder="e.g. System Maintenance Update"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message Content</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all resize-none"
                    placeholder="Type the notification details here..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['info', 'success', 'warning', 'error'].map(type => (
                      <label 
                        key={type} 
                        className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                          formData.type === type 
                            ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="sr-only"
                        />
                        <span className="capitalize text-sm font-medium text-gray-700 block">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Bell size={16} />
                  )}
                  {saving ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
