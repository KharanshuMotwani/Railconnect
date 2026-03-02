import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PassengerForm({ onSubmit, onBack, seat }) {
    const [passenger, setPassenger] = useState({
        name: '',
        age: '',
        gender: 'Male',
        nationality: 'Indian'
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setPassenger(prev => ({ ...prev, name: parsed.name })); // Auto-fill
        }
    }, []);

    const handleChange = (e) => setPassenger({ ...passenger, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(passenger);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-3xl mx-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-[#0B132B] p-6 flex items-center justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center z-10 relative">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-3 active:scale-95">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center">
                            Passenger Details
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Seat {seat?.label} ({seat?.berth} Berth)
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-10">
                {!user && (
                    <div className="mb-6 bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm font-bold flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-3 flex-shrink-0 text-amber-500" />
                        You are booking as a Guest. Log in to access past bookings and faster checkouts.
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6 relative">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 relative group md:col-span-2">
                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Passenger Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={passenger.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                    placeholder="Name as per Government ID"
                                />
                            </div>
                        </div>

                        <div className="space-y-1 relative group">
                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Age</label>
                            <input
                                type="number"
                                name="age"
                                required
                                min="1" max="110"
                                value={passenger.age}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                placeholder="Age in years"
                            />
                        </div>

                        <div className="space-y-1 relative group">
                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                            <select
                                name="gender"
                                value={passenger.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 appearance-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center"
                        >
                            Proceed to Payment <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
