import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Train, User, LogOut, ChevronDown, Wallet } from 'lucide-react';

export const WALLET_INITIAL = 50000;

/**
 * Derives a stable wallet key from a user object.
 * Uses id → email → 'guest' as fallback chain so it always works
 * regardless of what fields the API returns.
 */
export function getWalletKey(user) {
    const uid = user?.id ?? user?.userId ?? user?.user_id ?? user?.email ?? 'guest';
    return `rwallet_${uid}`;
}

/**
 * Reads the wallet balance for the given user object.
 * Returns null if no user or wallet not yet seeded.
 */
export function getWalletBalance(user) {
    if (!user) return null;
    const stored = localStorage.getItem(getWalletKey(user));
    return stored !== null ? parseInt(stored, 10) : null;
}

/**
 * Seeds ₹50,000 for a user only if not already set.
 * Safe to call on every login/mount — will NOT overwrite an existing balance.
 */
export function initWalletIfNeeded(user) {
    if (!user) return;
    const key = getWalletKey(user);
    if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, WALLET_INITIAL);
    }
}

export function deductWallet(user, amount) {
    if (!user) return null;
    const balance = getWalletBalance(user) ?? 0;
    const newBalance = balance - amount;
    localStorage.setItem(getWalletKey(user), newBalance);
    window.dispatchEvent(new Event('walletUpdate'));
    return newBalance;
}

export default function Navbar() {
    const location = useLocation();
    const path = location.pathname;
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            setUser(parsedUser);
            if (parsedUser) {
                initWalletIfNeeded(parsedUser);
                setBalance(getWalletBalance(parsedUser));
            } else {
                setBalance(null);
            }
        };
        const updateWallet = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const u = JSON.parse(storedUser);
                setBalance(getWalletBalance(u));
            }
        };

        checkUser();
        window.addEventListener('authChange', checkUser);
        window.addEventListener('walletUpdate', updateWallet);
        return () => {
            window.removeEventListener('authChange', checkUser);
            window.removeEventListener('walletUpdate', updateWallet);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setBalance(null);
        window.dispatchEvent(new Event('authChange'));
        setShowDropdown(false);
    };

    const getLinkClass = (currentPath) => {
        if (path === currentPath) {
            return "text-white relative after:content-[''] after:absolute after:-bottom-[21px] after:left-0 after:w-full after:h-[3px] after:bg-blue-500 after:rounded-t-md transition-colors";
        }
        return "hover:text-white transition-colors text-slate-300";
    };

    const formattedBalance = balance !== null ? `₹${balance.toLocaleString('en-IN')}` : '';
    const isLow = balance !== null && balance < 1000;

    return (
        <nav className="bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 text-white px-8 py-4 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3 cursor-pointer group">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Train className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">RailConnect</span>
                </Link>

                <div className="hidden lg:flex space-x-12 text-[15px] font-semibold">
                    <Link to="/" className={getLinkClass('/')}>Home</Link>
                    <Link to="/schedule" className={getLinkClass('/schedule')}>Schedule</Link>
                    <Link to="/bookings" className={getLinkClass('/bookings')}>Bookings</Link>
                    <Link to="/pnr-status" className={getLinkClass('/pnr-status')}>PNR Status</Link>
                </div>

                <div className="flex items-center space-x-3">
                    {/* RWallet Badge — only visible when logged in */}
                    {user && balance !== null && (
                        <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-sm font-bold transition-all ${
                            isLow
                            ? 'bg-red-500/10 border-red-500/40 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                            <Wallet className="w-3.5 h-3.5" />
                            <span>{formattedBalance}</span>
                        </div>
                    )}

                    {user ? (
                        <div className="relative">
                            <div
                                className="flex items-center space-x-3 cursor-pointer group bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors border border-slate-700"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-md">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-sm hidden sm:block">{user.name.split(' ')[0]}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </div>

                            {showDropdown && (
                                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl shadow-slate-900/20 border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        <p className={`text-xs font-bold mt-1 ${isLow ? 'text-red-500' : 'text-emerald-600'}`}>
                                            RWallet: {formattedBalance}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link to="/bookings" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium">
                                            <User className="w-4 h-4 mr-2" /> My Profile
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors">
                                            <LogOut className="w-4 h-4 mr-2" /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex space-x-4 md:space-x-6 items-center">
                            <Link to="/login" className="text-[15px] font-semibold text-slate-300 hover:text-white transition-colors">Login</Link>
                            <Link to="/register" className="bg-white hover:bg-slate-100 text-[#0B132B] px-6 py-2.5 rounded-lg text-[15px] font-bold shadow-md transform hover:-translate-y-0.5 transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
