import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Search, Navigation, AlertCircle, RefreshCw, Train as TrainIcon, Sparkles, LayoutTemplate } from 'lucide-react';
import { getLiveTrainStatus } from '../services/api';

export default function Schedule() {
    const [trainNumber, setTrainNumber] = useState('');
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (trainNumber.length !== 5) {
            setError('Please enter a valid 5-digit Train Number.');
            return;
        }

        setLoading(true);
        setError('');
        setLiveData(null);

        try {
            const response = await getLiveTrainStatus(trainNumber);
            setLiveData(response.data);
        } catch (err) {
            setError('Train not found or data currently unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center py-16 px-4 animate-in fade-in slide-in-from-bottom-4">

            {/* Header Area */}
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-[4px] border-white shadow-blue-100 mx-auto">
                    <Navigation className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Live Train Status</h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">Track your train in real-time. Enter the 5-digit train number for instant live running status and expected arrival times.</p>
            </div>

            {/* Search Input */}
            <div className="w-full max-w-2xl relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-slate-200 mb-8 z-10 transition-transform hover:-translate-y-1">
                <Search className="w-6 h-6 text-slate-400 ml-4 pointer-events-none" />
                <input
                    type="text"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 5-digit Train No. (e.g. 12951)"
                    className="flex-1 px-4 py-4 text-xl font-bold font-mono tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal outline-none bg-transparent"
                    maxLength={5}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || trainNumber.length !== 5}
                    className={`font-bold py-4 px-8 rounded-xl transition-all shadow-md active:scale-95 text-white ${trainNumber.length === 5 ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                    {loading ? 'Searching...' : 'Track Train'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-8 w-full max-w-2xl bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center animate-in zoom-in-95 duration-300">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium text-sm">{error}</span>
                </div>
            )}

            {/* Loading Spinner */}
            {loading && !error && (
                <div className="my-10 animate-spin">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            )}

            {/* Live Data Display */}
            {liveData && !loading && !error && (
                <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500 relative">

                    {/* Top Status Banner */}
                    <div className="bg-[#0B132B] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                                <span className="bg-white/10 border border-white/20 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md inline-block mb-2 shadow-sm backdrop-blur-sm">
                                    {liveData.trainNumber}
                                </span>
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center">{liveData.trainName} <span className="opacity-75 font-normal ml-2">({liveData.trainNumber})</span></h2>
                                    <p className="text-slate-300 text-sm font-medium mt-1">{liveData.source.split(' (')[0]} to {liveData.destination.split(' (')[0]}</p>
                                </div>
                            </div>

                            <div className="text-left md:text-right w-full md:w-auto">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 items-center flex md:justify-end">
                                    <RefreshCw className="w-3 h-3 mr-1" /> Last Updated: {liveData.lastUpdated}
                                </p>
                                <div className="inline-flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${liveData.delayMinutes > 0 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                                        {liveData.delayMinutes > 0 ? `Delayed by ${liveData.delayMinutes} mins` : 'On Time'}
                                    </span>
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                        {liveData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Insight & AI Prediction Block */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-blue-100 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-blue-100">
                        <div className="flex-1 p-5 flex items-center justify-center">
                            <MapPin className="w-5 h-5 mr-3 text-blue-600 fill-blue-600/20" />
                            <p className="text-blue-900 font-bold text-[15px] tracking-wide">
                                Currently: <span className="text-blue-600 ml-1">{liveData.currentStation}</span>
                            </p>
                        </div>
                        <div className="flex-[1.5] p-5 flex items-start sm:items-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[50px] opacity-10 -mr-10 -mt-10 group-hover:opacity-20 transition-opacity"></div>
                            <Sparkles className="w-6 h-6 mr-3 text-indigo-500 flex-shrink-0 animate-pulse" />
                            <div>
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-0.5">RailMax AI Insight</p>
                                <p className="text-indigo-900 font-medium text-sm leading-tight max-w-md">
                                    {liveData.aiInsight}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Stations */}
                    <div className="p-8 relative">
                        <div className="absolute left-[39px] md:left-[51px] top-10 bottom-10 w-1 bg-slate-100 rounded-full"></div>

                        <div className="space-y-8">
                            {liveData.stations.map((station, idx) => (
                                <div key={idx} className="relative flex items-start group">
                                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center flex-shrink-0 z-10 transition-colors bg-white mt-1 ${station.status === 'Departed' ? 'border-green-500 text-green-500' : 'border-slate-300 text-slate-300'}`}>
                                        {station.status === 'Departed' ? <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div> : null}
                                    </div>

                                    <div className="ml-6 flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{station.name}</h4>
                                                <div className="flex items-center space-x-3 mt-1.5">
                                                    <p className={`text-xs font-black uppercase tracking-wider ${station.status === 'Departed' ? 'text-green-600' : 'text-slate-500'}`}>
                                                        {station.status}
                                                    </p>
                                                    {station.platform && (
                                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center">
                                                            <LayoutTemplate className="w-3 h-3 mr-1" /> PF-{station.platform}
                                                        </span>
                                                    )}
                                                    {station.halt && station.halt !== '-' && (
                                                        <span className="text-[10px] font-bold text-slate-400 flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" /> {station.halt} Halt
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:mt-0 sm:text-right flex sm:block items-center space-x-4 sm:space-x-0">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Scheduled</p>
                                                    <p className="font-mono text-slate-600">{station.time}</p>
                                                </div>
                                                <div className="sm:mt-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Actual / ETA</p>
                                                    <p className={`font-mono font-bold ${station.status === 'Expected' && liveData.delayMinutes > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                                        {station.actualTime}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Generic placeholder stats (Hidden when searching/viewing data) */}
            {!liveData && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-20 w-full text-center">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                        <p className="text-3xl font-black text-slate-800">14,300+</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Active Trains</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                        <p className="text-3xl font-black text-slate-800">&lt; 1s</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Sync Latency</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                        <p className="text-3xl font-black text-slate-800">99.9%</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Data Accuracy</p>
                    </div>
                </div>
            )}
        </div>
    );
}
