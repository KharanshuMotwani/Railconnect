import React, { useState } from 'react';
import { FileText, Search, Activity, Calendar, Train, AlertCircle } from 'lucide-react';
import { checkPNRStatus } from '../services/api';

export default function PNRStatus() {
    const [pnr, setPnr] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'found', 'error'
    const [statusData, setStatusData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleCheckStatus = async () => {
        if (pnr.length !== 10) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await checkPNRStatus(pnr);
            setStatusData(res.data);
            setStatus('found');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to fetch PNR status.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center py-20 px-4 animate-in fade-in slide-in-from-bottom-4">

            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-[4px] border-white shadow-emerald-100">
                <Activity className="w-10 h-10" />
            </div>

            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4 text-center">Check PNR Status</h1>
            <p className="text-lg text-slate-500 max-w-xl text-center mb-10">Get real-time booking confirmation updates dynamically predicted using RailMax AI.</p>

            <div className="w-full max-w-2xl relative bg-white rounded-[24px] shadow-xl flex flex-col p-4 border border-slate-200">
                <div className="flex items-center w-full relative">
                    <Search className="w-6 h-6 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                        type="text"
                        value={pnr}
                        onChange={(e) => setPnr(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit PNR Number"
                        className="w-full pl-14 pr-4 py-5 text-xl tracking-widest font-mono font-bold text-slate-800 placeholder:text-slate-300 outline-none rounded-xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all border border-transparent focus:border-emerald-200"
                        maxLength={10}
                    />
                </div>

                <button
                    onClick={handleCheckStatus}
                    disabled={pnr.length !== 10 || status === 'loading'}
                    className={`mt-4 w-full text-white font-bold text-lg py-4 rounded-xl transition-all shadow-md active:scale-[0.98] ${pnr.length === 10 ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25' : 'bg-slate-300 cursor-not-allowed hidden'}`}
                >
                    {status === 'loading' ? 'Fetching Details...' : 'Check Status'}
                </button>
            </div>

            {status === 'error' && (
                <div className="mt-8 w-full max-w-2xl bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center animate-in zoom-in-95 duration-300">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium text-sm">{errorMsg}</span>
                </div>
            )}

            {status === 'loading' && (
                <div className="mt-16 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            )}

            {status === 'found' && statusData && (
                <div className="mt-12 bg-white rounded-3xl p-8 max-w-2xl w-full border-t-8 border-t-emerald-500 shadow-xl border-x border-b border-slate-200 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-10 -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">PNR NUMBER</p>
                                <p className="text-2xl font-mono font-black text-slate-900 tracking-widest">{statusData.pnr}</p>
                            </div>
                            <div className="text-right">
                                <span className={`font-bold px-3 py-1 rounded-md text-sm border ${statusData.status === 'CHART PREPARED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                    {statusData.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center text-slate-800 mb-2">
                            <Train className="w-5 h-5 mr-2 text-slate-400" />
                            <p className="font-bold text-lg">{statusData.trainName} <span className="text-slate-500 font-medium">({statusData.trainNumber})</span></p>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase mb-6 ml-7">Class: {statusData.bookingClass}</p>

                        <hr className="my-6 border-slate-100" />

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-sm font-bold text-slate-500">{statusData.source.split(' (')[0]}</p>
                                <p className="text-xl font-black text-slate-800">{statusData.departureTime}</p>
                            </div>
                            <div className="flex-1 flex justify-center px-4">
                                <div className="h-px bg-slate-300 w-full relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold text-slate-400"><Calendar className="w-3 h-3 inline mr-1" />{statusData.date}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-500">{statusData.destination.split(' (')[0]}</p>
                                <p className="text-xl font-black text-slate-800">{statusData.arrivalTime}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100 shadow-inner">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passenger Info</p>
                                <p className="font-bold text-slate-800">{statusData.passengers} Adult</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
                                <p className={`font-black text-lg tracking-tight ${statusData.status === 'CHART PREPARED' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {statusData.passengerStatus}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
