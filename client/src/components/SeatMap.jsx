import { useState } from 'react';
import { ArrowLeft, User, Check, Info, Clock, AlertCircle, CheckCircle, HelpCircle, Ticket } from 'lucide-react';

export default function SeatMap({ train, onSeatSelected, onBack }) {
    // Mock detailed seating data format
    // 1A/2A/3A/SL configuration. We will show a simplified Sleeper/3A coach layout (72 seats)
    const rows = Array.from({ length: 9 }, (_, i) => i + 1);
    const [selectedSeat, setSelectedSeat] = useState(null);

    // Randomize some booked seats
    const [bookedSeats] = useState(() => {
        const booked = new Set();
        const count = 30 + Math.floor(Math.random() * 20);
        for (let i = 0; i < count; i++) {
            booked.add(1 + Math.floor(Math.random() * 72));
        }
        return booked;
    });

    const getBerthType = (number) => {
        const rm = number % 8;
        if (rm === 1 || rm === 4) return 'LOWER';
        if (rm === 2 || rm === 5) return 'MIDDLE';
        if (rm === 3 || rm === 6) return 'UPPER';
        if (rm === 7) return 'SIDE LOWER';
        if (rm === 0) return 'SIDE UPPER';
        return '';
    };

    const handleSeatClick = (number) => {
        if (bookedSeats.has(number)) return;
        setSelectedSeat({
            number,
            label: `S5-${number}`,
            berth: getBerthType(number),
            price: train.fare
        });
    };

    const getSeatClass = (number) => {
        if (bookedSeats.has(number)) return 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300';
        if (selectedSeat?.number === number) return 'bg-indigo-600 text-white shadow-lg border-indigo-700 scale-110 z-10';
        return 'bg-white text-indigo-900 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all hover:scale-105 shadow-sm';
    };

    const renderSeat = (number) => (
        <div
            key={number}
            onClick={() => handleSeatClick(number)}
            className={`relative w-12 h-16 rounded-lg border-2 flex flex-col items-center justify-center font-bold text-sm select-none ${getSeatClass(number)}`}
        >
            <span>{number}</span>
            <span className="text-[10px] opacity-70 mt-1">{getBerthType(number).split(' ').map(w => w[0]).join('')}</span>
            {selectedSeat?.number === number && <Check className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm" />}
        </div>
    );

    const getProbColor = (prob) => {
        switch (prob) {
            case 'High': return { bg: 'bg-green-50 border-green-300', text: 'text-green-700', badge: 'bg-green-100 text-green-800' };
            case 'Medium': return { bg: 'bg-orange-50 border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' };
            case 'Low': return { bg: 'bg-red-50 border-red-300', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
            default: return { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' };
        }
    };

    const getProbIcon = (prob) => {
        switch (prob) {
            case 'High': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Medium': return <HelpCircle className="w-5 h-5 text-orange-500" />;
            case 'Low': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    // ── Waitlist View ──────────────────────────────────────────────────────────
    if (train.status === 'WL') {
        const colors = getProbColor(train.probability);
        const wlSeat = {
            number: null,
            label: `WL ${train.wlPos}`,
            berth: 'WAITLIST',
            price: train.fare
        };

        return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-300 border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 flex items-center text-white sticky top-0 z-20 shadow-md">
                    <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors mr-4 focus:ring-2 focus:ring-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black">{train.name} <span className="opacity-75 font-normal ml-2">({train.number})</span></h2>
                        <p className="text-orange-100 font-medium">Waitlist Booking — No seats available right now</p>
                    </div>
                </div>

                <div className="p-8 max-w-2xl mx-auto">

                    {/* WL Position Card */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center mb-6 shadow-sm">
                        <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3">Your Waitlist Position</p>
                        <p className="text-7xl font-black text-orange-600 mb-2">WL {train.wlPos}</p>
                        <p className="text-orange-500 font-medium text-sm">You will be assigned a seat if a confirmed passenger cancels.</p>
                    </div>

                    {/* AI Confirmation Probability */}
                    <div className={`rounded-2xl border-2 p-6 mb-6 flex items-start space-x-4 ${colors.bg}`}>
                        <div className="mt-0.5 flex-shrink-0">{getProbIcon(train.probability)}</div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">AI Confirmation Prediction</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{train.probability} Probability</span>
                            </div>
                            <p className={`font-medium text-sm leading-snug ${colors.text}`}>
                                {train.probability === 'High' && 'Strong chance of confirmation based on historical cancellation patterns for this route and date.'}
                                {train.probability === 'Medium' && 'Moderate chance of confirmation. Monitor your PNR regularly — cancellations often happen 48h before departure.'}
                                {train.probability === 'Low' && 'Low chance of confirmation. Consider booking an alternate train or a different travel date.'}
                            </p>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start text-sm text-blue-800 mb-8">
                        <Info className="w-5 h-5 flex-shrink-0 mr-2 mt-0.5 text-blue-500" />
                        <p>Seat assignment happens automatically when your waitlist is confirmed. You cannot choose a specific seat or berth preference on waitlist booking.</p>
                    </div>

                    {/* Journey Summary */}
                    <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
                        <div className="flex justify-between font-black text-lg mb-3 text-indigo-900">
                            <span>{train.from.split(' (')[0]}</span>
                            <span className="text-indigo-400">→</span>
                            <span>{train.to.split(' (')[0]}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-indigo-200 pt-3">
                            <span className="text-indigo-600 font-medium">Departure</span>
                            <span className="font-bold">{train.dep}</span>
                        </div>
                    </div>

                    {/* Fare + CTA */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold uppercase tracking-wide text-sm">Total Fare</span>
                        <span className="text-3xl font-black text-orange-600">{train.fare}</span>
                    </div>
                    <button
                        onClick={() => onSeatSelected(wlSeat)}
                        className="w-full py-4 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all active:scale-[0.98] flex justify-center items-center space-x-2"
                    >
                        <Ticket className="w-5 h-5" />
                        <span>Join Waitlist & Book Ticket</span>
                    </button>
                </div>
            </div>
        );
    }

    // ── RAC View ───────────────────────────────────────────────────────────────
    if (train.status === 'RAC') {
        const colors = getProbColor(train.probability);
        const racSeat = {
            number: null,
            label: `RAC ${train.racPos}`,
            berth: 'SIDE LOWER (SHARED)',
            price: train.fare
        };

        return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-300 border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 flex items-center text-white sticky top-0 z-20 shadow-md">
                    <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors mr-4 focus:ring-2 focus:ring-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black">{train.name} <span className="opacity-75 font-normal ml-2">({train.number})</span></h2>
                        <p className="text-violet-200 font-medium">RAC Booking — Guaranteed Boarding, Shared Berth</p>
                    </div>
                </div>

                <div className="p-8 max-w-2xl mx-auto">

                    {/* RAC Position Card */}
                    <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-8 text-center mb-6 shadow-sm">
                        <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-3">Your RAC Position</p>
                        <p className="text-7xl font-black text-violet-600 mb-2">RAC {train.racPos}</p>
                        <p className="text-violet-500 font-medium text-sm">You are guaranteed to board the train and share a Side Lower berth.</p>
                    </div>

                    {/* What is RAC? */}
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 mb-6 space-y-3">
                        <p className="text-xs font-black text-violet-500 uppercase tracking-widest">How RAC Works</p>
                        <div className="flex items-start space-x-3 text-sm text-violet-900">
                            <span className="w-6 h-6 rounded-full bg-violet-200 text-violet-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                            <p>You board the train and are seated on a <strong>Side Lower berth</strong>, shared with one other RAC passenger.</p>
                        </div>
                        <div className="flex items-start space-x-3 text-sm text-violet-900">
                            <span className="w-6 h-6 rounded-full bg-violet-200 text-violet-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                            <p>As confirmed passengers cancel, RAC is upgraded — you get a <strong>full berth automatically</strong>.</p>
                        </div>
                        <div className="flex items-start space-x-3 text-sm text-violet-900">
                            <span className="w-6 h-6 rounded-full bg-violet-200 text-violet-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                            <p>Unlike WL, <strong>RAC boarding is guaranteed</strong>. You will not be denied entry to the train.</p>
                        </div>
                    </div>

                    {/* AI Confirmation Probability */}
                    <div className={`rounded-2xl border-2 p-6 mb-6 flex items-start space-x-4 ${colors.bg}`}>
                        <div className="mt-0.5 flex-shrink-0">{getProbIcon(train.probability)}</div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">AI Full-Berth Prediction</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{train.probability} Probability</span>
                            </div>
                            <p className={`font-medium text-sm leading-snug ${colors.text}`}>
                                {train.probability === 'High' && 'Strong chance of upgrading to a full confirmed berth based on cancellation trends.'}
                                {train.probability === 'Medium' && 'Moderate chance of full-berth upgrade. Cancellations usually happen 48h before departure.'}
                                {train.probability === 'Low' && 'Lower chance of full-berth upgrade. You may share the berth for the entire journey.'}
                            </p>
                        </div>
                    </div>

                    {/* Journey Summary */}
                    <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
                        <div className="flex justify-between font-black text-lg mb-3 text-indigo-900">
                            <span>{train.from.split(' (')[0]}</span>
                            <span className="text-indigo-400">→</span>
                            <span>{train.to.split(' (')[0]}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-indigo-200 pt-3">
                            <span className="text-indigo-600 font-medium">Departure</span>
                            <span className="font-bold">{train.dep}</span>
                        </div>
                    </div>

                    {/* Fare + CTA */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold uppercase tracking-wide text-sm">Total Fare</span>
                        <span className="text-3xl font-black text-violet-600">{train.fare}</span>
                    </div>
                    <button
                        onClick={() => onSeatSelected(racSeat)}
                        className="w-full py-4 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white transition-all active:scale-[0.98] flex justify-center items-center space-x-2"
                    >
                        <Ticket className="w-5 h-5" />
                        <span>Confirm RAC Booking</span>
                    </button>
                </div>
            </div>
        );
    }

    // ── Regular Seat Map (AVAILABLE trains) ────────────────────────────────────
    return (

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-300 border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 flex items-center text-white sticky top-0 z-20 shadow-md">
                <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors mr-4 focus:ring-2 focus:ring-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-2xl font-black">{train.name} <span className="opacity-75 font-normal ml-2">({train.number})</span></h2>
                    <p className="text-indigo-100 font-medium">Select your preferred seat in Coach S5</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch">
                {/* Left Side - Interactive Seat Map */}
                <div className="w-full lg:flex-1 h-[450px] lg:h-[650px] overflow-y-auto p-4 md:p-8 bg-slate-50 relative hide-scrollbar">

                    <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-gray-200 mb-8 flex justify-center space-x-6 z-10">
                        <div className="flex items-center"><div className="w-4 h-4 bg-white border-2 border-indigo-300 rounded mr-2 shadow-sm"></div> <span className="text-sm font-medium">Available</span></div>
                        <div className="flex items-center"><div className="w-4 h-4 bg-indigo-600 rounded mr-2 shadow-inner"></div> <span className="text-sm font-medium text-indigo-700">Selected</span></div>
                        <div className="flex items-center"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded mr-2"></div> <span className="text-sm text-gray-500">Booked</span></div>
                    </div>

                    <div className="max-w-md mx-auto space-y-12">
                        {rows.map((row) => {
                            const base = (row - 1) * 8;
                            return (
                                <div key={row} className="relative border-4 border-gray-300 rounded-2xl p-6 bg-white shadow-md">
                                    {/* Window lines */}
                                    <div className="absolute top-2 left-0 right-0 h-1 bg-gray-200 rounded-full mx-4"></div>
                                    <div className="absolute bottom-2 left-0 right-0 h-1 bg-gray-200 rounded-full mx-4"></div>

                                    <span className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-gray-100 text-gray-500 font-bold px-2 py-1 rounded-full text-xs shadow-inner">CMP {row}</span>

                                    <div className="flex justify-between items-center z-10 relative">
                                        {/* Left side (Main berths) */}
                                        <div className="space-y-3">
                                            <div className="flex space-x-2">
                                                {renderSeat(base + 1)} {/* Lower */}
                                                {renderSeat(base + 2)} {/* Middle */}
                                                {renderSeat(base + 3)} {/* Upper */}
                                            </div>
                                            <div className="h-6 flex items-center justify-center">
                                                <div className="w-full h-px bg-dashed border-t-2 border-dashed border-gray-200"></div>
                                            </div>
                                            <div className="flex space-x-2">
                                                {renderSeat(base + 4)} {/* Lower */}
                                                {renderSeat(base + 5)} {/* Middle */}
                                                {renderSeat(base + 6)} {/* Upper */}
                                            </div>
                                        </div>

                                        {/* Aisle Space */}
                                        <div className="flex-1 min-w-[30px] flex justify-center items-center">
                                            <div className="h-full w-2 bg-gray-100 rounded-full"></div>
                                        </div>

                                        {/* Right side (Side berths) */}
                                        <div className="space-y-8 flex flex-col justify-between">
                                            {renderSeat(base + 7)} {/* Side Lower */}
                                            {renderSeat(base + 8)} {/* Side Upper */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side - Summary */}
                <div className="w-full lg:w-96 h-auto lg:h-[650px] bg-white border-t lg:border-t-0 lg:border-l border-gray-100 shadow-[inset_10px_0_20px_-15px_rgba(0,0,0,0.1)] p-6 md:p-8 flex flex-col justify-between z-10 shrink-0 overflow-y-auto">
                    <div>
                        <h3 className="text-indigo-900 font-extrabold text-xl mb-6 flex items-center border-b pb-4">
                            <User className="mr-2 text-indigo-500" /> Journey Summary
                        </h3>

                        <div className="bg-indigo-50 rounded-2xl p-5 mb-6 shadow-inner border border-indigo-100">
                            <div className="flex justify-between text-sm text-indigo-800 font-medium mb-2">
                                <span>From:</span> <span>To:</span>
                            </div>
                            <div className="flex justify-between font-black text-lg mb-4 text-indigo-900">
                                <span>{train.from.split(' (')[0]}</span> <span className="text-indigo-400">→</span> <span>{train.to.split(' (')[0]}</span>
                            </div>

                            <div className="flex justify-between text-sm pt-4 border-t border-indigo-200">
                                <span className="text-indigo-600 font-medium">Departure</span>
                                <span className="font-bold">{train.dep}</span>
                            </div>
                        </div>

                        {selectedSeat ? (
                            <div className="bg-green-50 rounded-2xl p-6 border border-green-200 transform transition-all duration-300 shadow-md">
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Seat Selected</span>
                                <div className="mt-4 flex justify-between items-end">
                                    <div>
                                        <p className="text-3xl font-black text-green-700">{selectedSeat.label}</p>
                                        <p className="text-green-600 font-medium">Coach S5, {selectedSeat.berth}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                                <p className="text-gray-500 font-medium">Tap on any available seat from the map to select it.</p>
                            </div>
                        )}

                        <div className="mt-8 bg-blue-50/50 p-4 rounded-xl flex items-start text-sm text-blue-800">
                            <Info className="w-5 h-5 flex-shrink-0 mr-2 mt-0.5" />
                            <p>Proceed to instantly generate your mock E-Ticket for this journey.</p>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <div className="flex justify-between mb-6">
                            <span className="text-gray-500 font-bold uppercase tracking-wide text-sm">Total Fare</span>
                            <span className="text-3xl font-black text-indigo-700">{selectedSeat ? selectedSeat.price : '₹0'}</span>
                        </div>
                        <button
                            disabled={!selectedSeat}
                            onClick={() => onSeatSelected(selectedSeat)}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl mb-4 transition-all duration-300 flex justify-center items-center group ${selectedSeat ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            Generate Dummy Ticket
                            {selectedSeat && <ArrowLeft className="ml-2 w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


