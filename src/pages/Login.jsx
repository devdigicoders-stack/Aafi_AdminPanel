import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate 10 digit mobile number
    if (!/^\d{10}$/.test(mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Prevent non-admin users from logging in
        if (data.data && data.data.role !== 'admin') {
          const errorMsg = 'Access Denied: Invalid credentials or not an Admin.';
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        // Backend returns data inside data.data
        if (data.data && data.data.token) {
          localStorage.setItem('adminToken', data.data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.data));
        }
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        const errorMsg = data.message || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError('Network error. Is the backend server running?');
      toast.error('Network error. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[40%] bg-[#0c1a32] text-white flex-col items-center justify-center p-8 shadow-2xl relative z-10">
        <div className="mb-6 flex flex-col items-center">
          {/* Logo using public/logo.png */}
          <div className="mb-8 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-72 object-contain drop-shadow-2xl" onError={(e) => {
              // Fallback if logo.png is missing
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-7xl font-bold">a</span>';
            }}/>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <h2 className="text-2xl font-medium mb-3">Welcome Back!</h2>
          <p className="text-base text-gray-400 max-w-sm">
            Please login to your account to continue
          </p>
        </div>
      </div>

      {/* Right Content - Login Form */}
      <div className="w-full md:w-[60%] flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white shadow-2xl p-8 sm:p-12 border border-gray-100 rounded-none">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-sm text-gray-500">Enter your credentials to access admin panel</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setMobile(val);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                required
                maxLength="10"
                minLength="10"
                pattern="\d{10}"
                title="Mobile number must be exactly 10 digits"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#0c1a32] hover:bg-[#152744]'} text-white font-medium py-3 rounded-lg transition-colors shadow-md`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-sm text-gray-400">
          © 2026 Admin Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
}
