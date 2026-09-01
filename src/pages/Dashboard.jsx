import React, { useState, useEffect } from 'react';
import { Users, PackageCheck, ClipboardList, LayoutGrid, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${baseUrl}/admin/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatsData(data.data);
        } else {
          toast.error('Failed to fetch dashboard stats');
        }
      } catch (err) {
        console.error(err);
        toast.error('Network Error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [baseUrl]);

  if (loading) {
    return <div className="flex justify-center items-center h-full text-gray-500">Loading Dashboard...</div>;
  }

  if (!statsData) return null;

  const { counts, recentActivity } = statsData;

  const stats = [
    { label: 'Total Users', value: counts.users, icon: <Users size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Total Products', value: counts.products.total, icon: <PackageCheck size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Total Requests', value: counts.requests, icon: <ClipboardList size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Total Categories', value: counts.categories, icon: <LayoutGrid size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
  ];

  // Data for Charts
  const pieData = [
    { name: 'Active', value: counts.products.active, color: '#22c55e' },
    { name: 'Pending', value: counts.products.pending, color: '#eab308' }
  ];

  const barData = [
    { name: 'Users', count: counts.users },
    { name: 'Products', count: counts.products.total },
    { name: 'Categories', count: counts.categories },
    { name: 'Requests', count: counts.requests }
  ];

  return (
    <div className="w-full space-y-6 py-2">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0c1a32]">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Here is the latest data for your platform.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-full ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart (Platform Overview) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-6">Platform Overview</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Product Status) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Product Status</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="mt-6 space-y-3 px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-600 font-medium">Active / Approved</span>
              </div>
              <span className="font-bold text-gray-800">{counts.products.active}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-gray-600 font-medium">Pending</span>
              </div>
              <span className="font-bold text-gray-800">{counts.products.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recently Added Products</h3>
          </div>
          {recentActivity.products.length === 0 ? (
            <p className="text-gray-500 text-sm">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="pb-3 font-medium">Product Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.products.map(product => (
                    <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{product.name}</td>
                      <td className="py-3 text-gray-600">{product.category?.name || 'N/A'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${product.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Recent Requests</h3>
          {recentActivity.requests.length === 0 ? (
            <p className="text-gray-500 text-sm">No requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="pb-3 font-medium">Requester</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.requests.map(req => (
                    <tr key={req._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{req.user?.name || req.name}</td>
                      <td className="py-3 text-gray-600 capitalize">{req.title || 'No Title'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${req.status === 'resolved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
