import { useState } from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Lock, ScanLine } from 'lucide-react';
import { bookTicket } from '../services/api';

export default function PaymentSimulator({ train, seat, onSuccess, onBack }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [method, setMethod] = useState('UPI'); // UPI, CARD

    const handlePay = async () => {
        setIsProcessing(true);
        try {
            const response = await bookTicket({
                userId: 1,
                scheduleId: train.id,
                seatNumber: seat.label,
                berthPreference: seat.berth,
                trainName: train.name,
                trainNumber: train.number
            });
            setIsProcessing(false);
            onSuccess(response.data);
        } catch (err) {
            setIsProcessing(false);
            onSuccess(); // fallback
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-6 flex flex-col md:flex-row justify-between items-center text-white px-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center z-10 w-full mb-4 md:mb-0">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-4 z-10">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center">
                            Secure Checkout <ShieldCheck className="ml-2 w-5 h-5 text-green-400" />
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 flex items-center">
                            <Lock className="w-3 h-3 mr-1" /> End-to-end encrypted session
                        </p>
                    </div>
                </div>
                <div className="text-right z-10 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 backdrop-blur-sm self-end md:self-auto">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Amount to Pay</p>
                    <p className="text-2xl font-black text-white">{seat.price}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Payment Methods */}
                <div className="md:w-1/3 bg-slate-50 border-r border-gray-200 flex flex-col">
                    <button
                        onClick={() => setMethod('UPI')}
                        className={`p-6 border-b border-gray-200 flex items-center transition-all ${method === 'UPI' ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'hover:bg-gray-100 border-l-4 border-l-transparent text-gray-500'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${method === 'UPI' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400'}`}>
                            <ScanLine className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className={`font-bold ${method === 'UPI' ? 'text-indigo-900' : ''}`}>UPI <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fastest</span></p>
                            <p className="text-xs mt-1 opacity-80">Google Pay, PhonePe, Paytm</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setMethod('CARD')}
                        className={`p-6 border-b border-gray-200 flex items-center transition-all ${method === 'CARD' ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'hover:bg-gray-100 border-l-4 border-l-transparent text-gray-500'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${method === 'CARD' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400'}`}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className={`font-bold ${method === 'CARD' ? 'text-indigo-900' : ''}`}>Card/NetBanking</p>
                            <p className="text-xs mt-1 opacity-80">Visa, Mastercard, RuPay</p>
                        </div>
                    </button>
                </div>

                {/* Payment Main Area */}
                <div className="flex-1 p-8 sm:p-12 relative min-h-[400px] flex items-center justify-center">
                    {isProcessing ? (
                        <div className="text-center w-full max-w-sm mx-auto animate-in zoom-in duration-300">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                    <Zap className="w-8 h-8 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
                            <p className="text-gray-500 text-sm">Please do not press back or refresh.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto">
                            {method === 'UPI' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-center space-x-4 mb-8">
                                        {['GPay', 'PhonePe', 'Paytm'].map(app => (
                                            <div key={app} className="w-16 h-16 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center font-bold text-xs text-gray-600 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all">
                                                {app}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400 font-medium">OR ENTER UPI ID</span></div>
                                    </div>

                                    <input type="text" placeholder="example@upi" className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-center font-mono text-lg transition-all outline-none" />

                                    <button
                                        onClick={handlePay}
                                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-xl shadow-gray-900/20 active:scale-95 transition-all flex justify-center items-center"
                                    >
                                        Pay {seat.price} Securely
                                    </button>
                                </div>
                            )}

                            {method === 'CARD' && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <input type="text" placeholder="Card Number" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 font-mono tracking-widest outline-none transition-all" />
                                    <div className="flex space-x-4">
                                        <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 text-center outline-none transition-all" />
                                        <input type="password" placeholder="CVV" className="w-1/2 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 text-center outline-none transition-all" />
                                    </div>
                                    <input type="text" placeholder="Name on Card" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-all mb-4" />

                                    <button
                                        onClick={handlePay}
                                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-xl shadow-gray-900/20 active:scale-95 transition-all mt-6 flex justify-center items-center"
                                    >
                                        Pay {seat.price} Securely <Lock className="ml-2 w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
