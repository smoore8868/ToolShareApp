import React, { useState } from 'react';
import { Wrench, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import type { User } from '../types';
import { store } from '../services/mockStore';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      const user = store.register(email, name);
      onLogin(user);
    } else {
      const user = store.login(email);
      if (user) {
        onLogin(user);
      } else {
        setError('User not found. Please create an account.');
      }
    }
  };

  const handleSocialLogin = () => {
    // Simulate social login success
    const user = store.login('alex@example.com');
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-white p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Wrench className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-1">ToolShare</h1>
          <p className="text-black/80">Inventory, Share, Borrow.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-text-black mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-black" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-black mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-black" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-black mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-black" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-black font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-black flex-1"></div>
            <span className="text-black text-sm">or continue with</span>
            <div className="h-px bg-black flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
  <button 
    type="button"
    onClick={handleSocialLogin}
    className="flex items-center justify-center gap-2 py-2.5 border border-black rounded-xl bg-black text-white font-medium transition-none"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C.77 9.84 0 12 0 12s.77 2.16 2.18 4.95l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    Google
  </button>

  <button 
    type="button"
    onClick={handleSocialLogin}
    className="flex items-center justify-center gap-2 py-2.5 border border-black rounded-xl bg-white text-black font-medium transition-none"
  >
    <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 
      20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 
      36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 
      90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 
      24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 
      69.5-34.3z"/>
    </svg>
    Apple
  </button>
</div>


          <div className="mt-8 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
