import { useState, useEffect, useRef } from 'react';
import { Search, Train, Calendar, MapPin, AlertCircle, CheckCircle, ChevronDown, ChevronRight, ArrowRightLeft, Clock, Zap, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SeatMap from '../components/SeatMap';
import PassengerForm from '../components/PassengerForm';
import SmartAvailability from '../components/SmartAvailability';
import PaymentSimulator from '../components/PaymentSimulator';

import { searchTrains } from '../services/api';

const popularStations = [
    'New Delhi (NDLS)', 'Mumbai Central (MMCT)', 'Chennai Central (MAS)',
    'Kolkata Howrah (HWH)', 'Bangalore (SBC)', 'Hyderabad (HYD)',
    'Pune Junction (PUNE)', 'Bhopal (BPL)', 'Varanasi (BSB)', 'Ahmedabad (ADI)'
];

export default function Home() {
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [date, setDate] = useState('');
    const [filteredTrains, setFilteredTrains] = useState([]);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [bookingStep, setBookingStep] = useState(0); // 0=Search, 1=Seat, 2=Passenger, 3=Payment, 4=Success
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [passengerData, setPassengerData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [ticketType, setTicketType] = useState('reserved');

    // Dropdown states
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false); // Added this based on the context
    const [generatedTicket, setGeneratedTicket] = useState(null);

    const resultsRef = useRef(null);
    const fromRef = useRef(null);
    const toRef = useRef(null);
    const ticketRef = useRef(null); // Ref for PDF capture

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (fromRef.current && !fromRef.current.contains(event.target)) setShowFromDropdown(false);
            if (toRef.current && !toRef.current.contains(event.target)) setShowToDropdown(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setIsSearching(true);

        // Using setTimeout as a debounce for our generic search terms
        const delay = setTimeout(async () => {
            try {
                // Here we trigger the simulated API fetch Request to /api/v1/trains/search
                const response = await searchTrains(searchFrom, searchTo, date);
                setFilteredTrains(response.data);
            } catch (err) {
                console.error("API Call error", err);
                setFilteredTrains([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delay);
    }, [searchFrom, searchTo, date]);

    const handleBook = (train) => {
        setSelectedTrain(train);
        setBookingStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSeatSelected = (seat) => {
        setSelectedSeat(seat);

        // Auto-fetch user details for the ticket if logged in
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { name: 'Guest User' };

        // Bypass forms and generate dummy ticket immediately
        const ticketResponse = {
            pnr: `8492${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'CONFIRMED',
            seatNumber: seat.label,
            berthPreference: seat.berth,
            trainName: selectedTrain.name,
            trainNumber: selectedTrain.number
        };

        const fullTicket = {
            ...ticketResponse,
            passenger: { name: user.name, age: 'N/A', gender: 'N/A' },
            date: date || new Date().toISOString().split('T')[0],
            bookingDate: new Date().toLocaleDateString()
        };

        setGeneratedTicket(fullTicket);

        const existingBookings = JSON.parse(localStorage.getItem('my_bookings') || '[]');
        localStorage.setItem('my_bookings', JSON.stringify([fullTicket, ...existingBookings]));

        setBookingStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePassengerSubmit = (data) => {
        setPassengerData(data);
        setBookingStep(3); // Move to payment
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePaymentSuccess = (ticketResponse) => {
        // We can weave the passenger data in before showing success if necessary
        const fullTicket = {
            ...ticketResponse,
            passenger: passengerData,
            date: date || new Date().toISOString().split('T')[0],
            bookingDate: new Date().toLocaleDateString()
        };

        setGeneratedTicket(fullTicket);

        // Persist ticket to user history
        const existingBookings = JSON.parse(localStorage.getItem('my_bookings') || '[]');
        localStorage.setItem('my_bookings', JSON.stringify([fullTicket, ...existingBookings]));

        setBookingStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetAll = () => {
        setSelectedTrain(null);
        setSelectedSeat(null);
        setPassengerData(null);
        setBookingStep(0);
        setGeneratedTicket(null);
    };

    const swapStations = () => {
        const temp = searchFrom;
        setSearchFrom(searchTo);
        setSearchTo(temp);
    };

    const handleDownloadPDF = async () => {
        if (!ticketRef.current || !generatedTicket) return;

        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2, // High resolution
                backgroundColor: '#f8fafc',
                windowWidth: 800 // Ensure layout isn't squashed on mobile capture
            });
            const imgData = canvas.toDataURL('image/png');

            // A4 size parameters
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Add branding header
            pdf.setFillColor(11, 19, 43); // #0B132B
            pdf.rect(0, 0, pdfWidth, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RailMax Official E-Ticket', 10, 13);

            // Drop captured image below header
            pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);

            pdf.save(`RailMax_Ticket_${generatedTicket.pnr}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const scrollToResults = () => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const renderStationDropdown = (value, setValue, setShow) => {
        const filtered = popularStations.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value);
        if (filtered.length === 0) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                <div className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 sticky top-0">Popular Stations</div>
                {filtered.map(station => (
                    <div
                        key={station}
                        onClick={() => { setValue(station); setShow(false); }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors border-b border-slate-50 last:border-0"
                    >
                        <MapPin className="w-4 h-4 text-slate-400 mr-3" />
                        <span className="text-slate-700 font-medium">{station}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="flex-1 w-full relative">
            {bookingStep === 0 && (
                <div className="animate-in fade-in duration-500">

                    {/* Hero Section */}
                    <div className="relative min-h-[550px] md:min-h-[680px] flex items-center bg-[#0B132B] overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/80 to-transparent z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1541427468627-2b4ce2393d25?q=80&w=2070&auto=format&fit=crop"
                                alt="Train background"
                                className="w-full h-full object-cover opacity-60 scale-105 transform hover:scale-100 transition-transform duration-[20s]"
                            />
                        </div>

                        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 grid lg:grid-cols-12 gap-12 items-center py-12 md:py-20 lg:pt-0">

                            {/* Hero Text */}
                            <div className="space-y-6 lg:col-span-7">
                                <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm animate-in slide-in-from-bottom-4">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-300 text-sm font-semibold tracking-wide uppercase">Next-Gen Booking Engine</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-black text-white leading-[1.1] tracking-tight">
                                    Seamless & Secure <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Railway Ticket Booking</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-light">
                                    Book Reserved and Unreserved (Local) tickets instantly. Experience the fastest checkout in India with smart AI seat prediction.
                                </p>

                                <div className="flex items-center space-x-6 pt-4 text-slate-400 text-sm font-medium">
                                    <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Instant PNR</div>
                                    <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Zero Convenience Fee</div>
                                </div>
                            </div>

                            {/* Floating Search Card */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl p-7 md:p-9 w-full lg:col-span-5 transform transition-all border border-white/20 relative z-30">

                                {/* Toggle */}
                                <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-8 shadow-inner border border-slate-200/50 relative overflow-hidden">
                                    <div
                                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-600 rounded-xl shadow-md transition-transform duration-300 ease-out ${ticketType === 'unreserved' ? 'translate-x-full' : 'translate-x-0'}`}
                                    ></div>
                                    <button
                                        onClick={() => setTicketType('reserved')}
                                        className={`flex-1 py-3 rounded-xl text-[15px] font-bold transition-colors relative z-10 ${ticketType === 'reserved' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Reserved
                                    </button>
                                    <button
                                        onClick={() => setTicketType('unreserved')}
                                        className={`flex-1 py-3 rounded-xl text-[15px] font-bold transition-colors relative z-10 ${ticketType === 'unreserved' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Unreserved
                                    </button>
                                </div>

                                {/* Search Form */}
                                <div className="space-y-4 relative">

                                    {/* Swap Button */}
                                    <button
                                        onClick={swapStations}
                                        className="absolute right-8 top-[3.7rem] z-20 bg-white p-2.5 rounded-full shadow-lg border border-slate-100 text-blue-600 hover:scale-110 hover:rotate-180 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </button>

                                    <div className="space-y-1" ref={fromRef}>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 group-focus-within:border-blue-500 transition-colors"></div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="From Station"
                                                value={searchFrom}
                                                onFocus={() => setShowFromDropdown(true)}
                                                onChange={(e) => setSearchFrom(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-bold text-lg text-slate-800"
                                            />
                                        </div>
                                        {showFromDropdown && renderStationDropdown(searchFrom, setSearchFrom, setShowFromDropdown)}
                                    </div>

                                    <div className="space-y-1" ref={toRef}>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="To Station"
                                                value={searchTo}
                                                onFocus={() => setShowToDropdown(true)}
                                                onChange={(e) => setSearchTo(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 font-bold text-lg text-slate-800"
                                            />
                                        </div>
                                        {showToDropdown && renderStationDropdown(searchTo, setSearchTo, setShowToDropdown)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1.5 relative group">
                                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Journey Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold text-[15px] cursor-pointer"
                                                />
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-blue-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 relative group">
                                            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Class</label>
                                            <div className="relative">
                                                <select className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold text-[15px] cursor-pointer appearance-none">
                                                    <option>All Classes</option>
                                                    <option>AC First (1A)</option>
                                                    <option>AC 2 Tier (2A)</option>
                                                    <option>AC 3 Tier (3A)</option>
                                                    <option>Sleeper (SL)</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-blue-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={scrollToResults}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all active:scale-[0.98] mt-6 flex justify-center items-center group overflow-hidden relative"
                                    >
                                        <span className="relative z-10 flex items-center text-lg">
                                            Search Trains <ArrowRightLeft className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Results Section */}
                    <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 border-b border-slate-200 pb-6">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                                    Search Results
                                </h3>
                                <p className="text-slate-500 mt-2 font-medium flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-blue-500" /> Showing {filteredTrains.length} active trains for this route
                                </p>
                            </div>
                            {isSearching ? (
                                <div className="flex items-center space-x-2 text-blue-500 mt-4 md:mt-0 px-4 py-2 bg-blue-50 rounded-lg">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="font-bold text-sm">Crunching live data...</span>
                                </div>
                            ) : (
                                <div className="mt-4 md:mt-0 text-sm font-semibold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-100 rounded-lg">
                                    Last Updated: Just Now
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {filteredTrains.length > 0 ? filteredTrains.map((train) => (
                                <div key={train.id} className="bg-white rounded-[24px] shadow-sm hover:shadow-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 group overflow-hidden">
                                    <div className="p-6 md:p-8 flex flex-col xl:flex-row justify-between items-center relative">

                                        {/* Left: Train Info */}
                                        <div className="xl:w-[30%] mb-6 xl:mb-0 w-full">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="bg-slate-100 text-slate-600 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-slate-200">
                                                    {train.number}
                                                </span>
                                                {train.tags && train.tags.map(tag => (
                                                    <span key={tag} className="flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                                        <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{train.name}</h4>
                                            <div className="flex items-center text-slate-500 text-sm mt-2 font-medium">
                                                Runs on: <span className="text-green-600 font-bold ml-1">M T W T F S S</span>
                                            </div>
                                        </div>

                                        {/* Middle: Timing Timeline */}
                                        <div className="xl:flex-1 flex justify-center items-center px-4 mb-8 xl:mb-0 w-full max-w-2xl">
                                            <div className="text-right w-32 shrink-0">
                                                <p className="font-black text-2xl text-slate-900">{train.dep}</p>
                                                <p className="text-sm text-slate-500 font-medium truncate mt-1">{train.from.split(' (')[0]}</p>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center px-6 relative">
                                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 mb-2 z-10 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" /> {train.duration}
                                                </span>
                                                <div className="w-full relative flex items-center justify-center h-2">
                                                    <div className="absolute inset-0 border-t-[2px] border-dashed border-slate-300 top-1/2"></div>
                                                    {/* Train icon matching progress */}
                                                    <Train className="w-5 h-5 text-slate-300 absolute bg-white px-0.5 group-hover:text-blue-500 group-hover:translate-x-12 transition-all duration-1000 ease-in-out" />
                                                </div>
                                            </div>

                                            <div className="text-left w-32 shrink-0">
                                                <p className="font-black text-2xl text-slate-900">{train.arr}</p>
                                                <p className="text-sm text-slate-500 font-medium truncate mt-1">{train.to.split(' (')[0]}</p>
                                            </div>
                                        </div>

                                        {/* Right: Booking Block */}
                                        <div className="xl:w-[25%] flex flex-col sm:flex-row xl:flex-col justify-between sm:justify-end items-center sm:space-x-6 xl:space-x-0 xl:items-end w-full border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-8">
                                            <div className="text-left sm:text-right mb-4 sm:mb-0 xl:mb-4 flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto space-x-4 sm:space-x-0">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest xl:mb-1 hidden sm:block">Starting from</p>
                                                    <p className="text-3xl font-black text-slate-900">{train.fare}</p>
                                                </div>
                                                <div className="sm:mt-2">
                                                    <SmartAvailability status={train.status} wlPos={train.wlPos} probability={train.probability} seats={train.seats} />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBook(train)}
                                                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center shadow-lg ${train.status === 'AVAILABLE' ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/25' : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-orange-500/25'}`}
                                            >
                                                Book Now <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )) : (
                                <div className="bg-white p-20 text-center rounded-[32px] border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <AlertCircle className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-800 mb-2">No Trains Found</h4>
                                    <p className="text-slate-500 text-lg max-w-md">We couldn't find any trains running between these stations on the selected date.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Other Steps */}
            <div className="animate-in fade-in duration-300">
                {bookingStep === 1 && (
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <SeatMap train={selectedTrain} onSeatSelected={handleSeatSelected} onBack={() => setBookingStep(0)} />
                    </div>
                )}

                {bookingStep === 2 && (
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <PassengerForm onSubmit={handlePassengerSubmit} onBack={() => setBookingStep(1)} seat={selectedSeat} />
                    </div>
                )}

                {bookingStep === 3 && (
                    <div className="px-4 py-8 min-h-[60vh] flex items-center">
                        <div className="w-full">
                            <PaymentSimulator train={selectedTrain} seat={selectedSeat} passenger={passengerData} onSuccess={handlePaymentSuccess} onBack={() => setBookingStep(2)} />
                        </div>
                    </div>
                )}

                {bookingStep === 4 && (
                    <div className="max-w-2xl mx-auto mt-20 mb-32 bg-white rounded-[32px] p-12 shadow-2xl shadow-green-500/10 border border-green-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full blur-[100px] opacity-20 -mr-10 -mt-10"></div>
                        <div className="relative z-10 text-center items-center flex flex-col">
                            <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border-[8px] border-white shadow-xl shadow-green-100">
                                <CheckCircle className="w-14 h-14" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Booking Confirmed!</h2>
                            <p className="text-slate-500 mb-10 text-lg font-medium">Your e-ticket has been generated successfully.</p>

                            <div ref={ticketRef} className="bg-gradient-to-br from-slate-50 to-slate-100 w-full rounded-2xl p-8 text-left mb-10 border border-slate-200 shadow-sm relative">
                                {/* Ticket notches */}
                                <div className="absolute -left-4 top-1/2 w-8 h-8 bg-white rounded-full border-r border-slate-200"></div>
                                <div className="absolute -right-4 top-1/2 w-8 h-8 bg-white rounded-full border-l border-slate-200"></div>
                                <div className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-slate-300"></div>

                                <div className="flex justify-between items-start mb-8 z-10 relative">
                                    <div>
                                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">PNR Number</p>
                                        <p className="text-3xl font-mono font-black text-blue-600 tracking-wider">{generatedTicket?.pnr || `8492${Math.floor(Math.random() * 100000)}`}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className={`text-xl font-bold bg-green-100 px-3 py-1 rounded-lg inline-block text-green-600`}>
                                            {generatedTicket?.status || 'CONFIRMED'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 z-10 relative flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center text-slate-800 mb-2">
                                            <Train className="w-5 h-5 mr-2 text-slate-400" />
                                            <p className="font-bold text-lg">{generatedTicket?.trainName || selectedTrain.name} <span className="text-slate-500 font-medium">({generatedTicket?.trainNumber || selectedTrain.number})</span></p>
                                        </div>
                                        <p className="text-slate-600 font-semibold text-[15px] mb-2">{selectedTrain.from.split(' (')[0]} <ArrowRightLeft className="inline w-3 h-3 mx-1 text-slate-400" /> {selectedTrain.to.split(' (')[0]}</p>

                                        {/* Added Passenger Details Output */}
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Passenger Info</p>
                                        <p className="text-slate-800 font-medium">{generatedTicket?.passenger?.name || 'Guest User'}, {generatedTicket?.passenger?.age || 'N/A'} yrs, {generatedTicket?.passenger?.gender || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seat / Berth</p>
                                        <p className="text-2xl font-black text-slate-800">{generatedTicket?.seatNumber || selectedSeat.label} <span className="text-lg text-slate-400 font-medium tracking-normal">({generatedTicket?.berthPreference || selectedSeat.berth})</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-4 rounded-xl font-bold transition-all flex items-center justify-center group"
                                >
                                    Download PDF
                                </button>
                                <button
                                    onClick={resetAll}
                                    className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all font-lg"
                                >
                                    Book Another
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
