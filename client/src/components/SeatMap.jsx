import { useState } from 'react';
import { ArrowLeft, User, Check, Info } from 'lucide-react';

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
