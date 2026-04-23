import React, { useState, useEffect } from 'react';
import { Ticket, Train, ArrowRight, Calendar, MapPin, Download, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Fetch from localStorage
        const storedBookings = localStorage.getItem('my_bookings');
        if (storedBookings) {
            setBookings(JSON.parse(storedBookings));
        }
    }, []);

    if (bookings.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center py-20 px-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-[4px] border-white shadow-indigo-100">
                    <Ticket className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4 text-center">My Bookings</h1>

                <div className="bg-white max-w-3xl w-full p-12 mt-8 text-center rounded-[32px] border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Train className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">No active bookings</h4>
                    <p className="text-slate-500 text-lg max-w-md mb-8">You haven't booked any train tickets yet using RailConnect. Let's plan your next adventure!</p>
                    <Link to="/">
                        <button className="bg-slate-900 hover:bg-black text-white font-bold py-4 px-10 rounded-xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all text-lg flex items-center">
                            Book a Ticket <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center space-x-4 mb-10">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Ticket className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">My Bookings</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and view your upcoming and past journeys.</p>
                </div>
            </div>

            <div className="space-y-6">
                {bookings.map((ticket, index) => {
                    const s = ticket.status || '';
                    const isConfirmed = s === 'CONFIRMED' || s === 'CHART PREPARED';
                    const isWL = s.startsWith('WL');
                    const isRAC = s.startsWith('RAC');

                    const statusColor = isConfirmed
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                        : isWL
                        ? 'text-orange-600 bg-orange-50 border-orange-200'
                        : isRAC
                        ? 'text-violet-600 bg-violet-50 border-violet-200'
                        : 'text-slate-600 bg-slate-50 border-slate-200';

                    const accentColor = isConfirmed
                        ? 'bg-emerald-500'
                        : isWL
                        ? 'bg-orange-500'
                        : isRAC
                        ? 'bg-violet-500'
                        : 'bg-indigo-500';

                    return (
                        <div key={index} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 relative overflow-hidden group">
                            {/* Decorative Edge Glow */}
                            <div className={`absolute top-0 left-0 w-2 h-full ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                            <div className="flex flex-col xl:flex-row justify-between w-full">

                                {/* Left Section - Train & Route */}
                                <div className="xl:w-[40%] pr-4 border-b xl:border-b-0 xl:border-r border-slate-100 pb-6 xl:pb-0 mb-6 xl:mb-0">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-slate-100 text-slate-600 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-slate-200">
                                                {ticket.trainNumber}
                                            </span>
                                        </div>
                                        <span className={`font-bold px-3 py-1 rounded-md text-xs border uppercase tracking-wider ${statusColor}`}>
                                            {ticket.status}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{ticket.trainName}</h3>
                                    <p className="text-sm font-semibold text-slate-500 flex items-center mb-6">
                                        <Calendar className="w-3.5 h-3.5 mr-1" /> Journey: {ticket.date}
                                    </p>

                                    {/* Route graphic */}
                                    <div className="relative">
                                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                                        <div className="flex items-start mb-4 relative z-10">
                                            <div className="w-4 h-4 rounded-full border-[3px] border-indigo-500 bg-white mr-3 mt-0.5"></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ticket.from?.split(' (')[0] || 'Source'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start relative z-10">
                                            <div className="w-4 h-4 rounded-full border-[3px] border-slate-300 bg-white mr-3 mt-0.5"></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ticket.to?.split(' (')[0] || 'Destination'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Section - Passenger & Seat Details */}
                                <div className="xl:w-[35%] xl:px-8 border-b xl:border-b-0 xl:border-r border-slate-100 pb-6 xl:pb-0 mb-6 xl:mb-0 flex flex-col justify-center">
                                    <div className="grid grid-cols-2 gap-y-6">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">PNR No.</p>
                                            <p className="text-xl font-mono font-black text-indigo-600">{ticket.pnr}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seat & Berth</p>
                                            <p className="font-bold text-slate-800 text-lg">{ticket.seatNumber} <span className="text-slate-400 text-sm font-medium">({ticket.berthPreference})</span></p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passenger</p>
                                            <div className="flex items-center text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] mr-2 flex-shrink-0">
                                                    {(ticket.passenger?.name || 'G').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="truncate">{ticket.passenger?.name || 'Guest User'} <span className="text-slate-400 text-sm">({ticket.passenger?.gender ? ticket.passenger.gender.charAt(0) : 'U'}, {ticket.passenger?.age || '--'})</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Actions */}
                                <div className="xl:w-[25%] xl:pl-6 flex flex-row xl:flex-col justify-between items-center xl:items-end">
                                    <p className="text-sm font-bold text-slate-400">Booked: {ticket.bookingDate}</p>

                                    <div className="flex flex-col space-y-3 w-full sm:w-auto xl:w-full mt-4 xl:mt-0">
                                        <button className="flex items-center justify-center p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors border border-slate-200 w-full active:scale-95">
                                            <Download className="w-4 h-4 mr-2" /> E-Ticket
                                        </button>
                                        <Link to="/pnr-status" className="flex items-center justify-center p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm transition-colors border border-indigo-100 w-full active:scale-95 group/btn">
                                            Check Status <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 text-center pb-8">
                <Link to="/">
                    <button className="bg-white border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 font-bold py-4 px-10 rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all text-lg flex items-center mx-auto">
                        Plan Another Trip <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
