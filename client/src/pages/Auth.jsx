import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Train, CheckCircle } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import { initWalletIfNeeded } from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    // Default to 'register' if passed, else 'login'
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                const res = await loginUser(formData.email, formData.password);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                initWalletIfNeeded(res.data.user.id);
                window.dispatchEvent(new Event('authChange'));
                setSuccess(`Welcome back, ${res.data.user.name}!`);
                setTimeout(() => navigate('/'), 1500);
            } else {
                const res = await registerUser(formData.name, formData.email, formData.password);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                initWalletIfNeeded(res.data.user.id);
                window.dispatchEvent(new Event('authChange'));
                setSuccess(`Account created successfully! Welcome, ${res.data.user.name}.`);
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 transform rotate-45 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-blue-500/30 inline-flex mb-6 transform hover:scale-110 transition-transform">
                        <Train className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="mt-3 text-slate-500 text-lg">
                        {isLogin ? 'Sign in to access your bookings and smart AI predictions.' : 'Join the most seamless railway booking network in India.'}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-bold flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm font-bold flex items-center">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            {success}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="space-y-1 relative group">
                                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required={!isLogin}
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 relative group">
                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1 relative group">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                                {isLogin && <a href="#" className="text-[12px] font-bold text-blue-600 hover:text-blue-700">Forgot?</a>}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center ${loading || success ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/25 group'}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-slate-500 font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccess('');
                                setFormData({ name: '', email: '', password: '' });
                                navigate(isLogin ? '/register' : '/login');
                            }}
                            className="ml-2 text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all"
                        >
                            {isLogin ? 'Register now' : 'Sign in here'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
