import { useState, useEffect, useRef } from 'react';
import { Search, Train, Calendar, MapPin, AlertCircle, CheckCircle, ChevronDown, ChevronRight, ArrowRightLeft, Clock, Zap, Star, Wallet } from 'lucide-react';
import { deductWallet, getWalletBalance } from '../components/Navbar';
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

    // Allow booking from today up to 60 days in advance (2 months max)
    // Uses local date parts (not toISOString which is UTC) to correctly
    // reflect the user's timezone (e.g. IST = UTC+5:30)
    const toLocalDateStr = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const today = toLocalDateStr(new Date());
    const maxDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 60);
        return toLocalDateStr(d);
    })();
    const [filteredTrains, setFilteredTrains] = useState([]);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [bookingStep, setBookingStep] = useState(0); // 0=Search, 1=Seat, 2=Passenger, 3=Payment, 4=Success
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [passengerData, setPassengerData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);


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

    // Guard: if selected date is before today, reset to today
    const handleDateChange = (e) => {
        const selected = e.target.value;
        if (selected && selected < today) {
            setDate(today);
        } else if (selected && selected > maxDate) {
            setDate(maxDate);
        } else {
            setDate(selected);
        }
    };

    useEffect(() => {
        // Double-check: skip search entirely if date is in the past
        if (date && date < today) {
            setDate(today);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const delay = setTimeout(async () => {
            try {
                const response = await searchTrains(searchFrom, searchTo, date);
                setFilteredTrains(response.data);
            } catch (err) {
                console.error("API Call error", err);
                setFilteredTrains([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [searchFrom, searchTo, date]);

    const handleBook = (train) => {
        setSelectedTrain(train);
        setBookingStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSeatSelected = (seat) => {
        setSelectedSeat(seat);

        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { name: 'Guest User' };

        // Parse fare from string like '₹2,850' → 2850
        const fareNum = parseInt((selectedTrain.fare || '₹0').replace(/[^0-9]/g, ''), 10) || 0;

        // Check RWallet balance
        const currentBalance = getWalletBalance();
        if (currentBalance < fareNum) {
            alert(`Insufficient RWallet balance!\n\nFare: ₹${fareNum.toLocaleString('en-IN')}\nYour balance: ₹${currentBalance.toLocaleString('en-IN')}\n\nPlease top up your RWallet to continue.`);
            return;
        }

        // Deduct fare from RWallet
        const newBalance = deductWallet(fareNum);

        // Determine ticket status
        let ticketStatus = 'CONFIRMED';
        if (selectedTrain.status === 'WL') ticketStatus = `WL ${selectedTrain.wlPos}`;
        if (selectedTrain.status === 'RAC') ticketStatus = `RAC ${selectedTrain.racPos}`;

        const ticketResponse = {
            pnr: `8492${Math.floor(100000 + Math.random() * 900000)}`,
            status: ticketStatus,
            seatNumber: seat.label,
            berthPreference: seat.berth,
            trainName: selectedTrain.name,
            trainNumber: selectedTrain.number,
            fare: selectedTrain.fare,
            walletDeducted: fareNum,
            walletBalance: newBalance,
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

    const handleDownloadPDF = () => {
        if (!generatedTicket) return;
        const from = selectedTrain?.from?.split(' (')[0] || 'N/A';
        const to   = selectedTrain?.to?.split(' (')[0]   || 'N/A';
        const paxName   = generatedTicket.passenger?.name   || 'Guest User';
        const paxAge    = generatedTicket.passenger?.age    || 'N/A';
        const paxGender = generatedTicket.passenger?.gender || 'N/A';

        const html = `<!DOCTYPE html><html><head><title>RailMax Ticket - ${generatedTicket.pnr}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background:#f1f5f9; display:flex; justify-content:center; align-items:flex-start; min-height:100vh; padding:30px; }
          .page { background:#fff; width:700px; border-radius:16px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.15); }
          .header { background:#0B132B; color:#fff; padding:24px 32px; display:flex; justify-content:space-between; align-items:center; }
          .header h1 { font-size:22px; font-weight:900; letter-spacing:-0.5px; }
          .header p { font-size:11px; color:#94a3b8; margin-top:4px; }
          .header .date { font-size:11px; color:#64748b; text-align:right; }
          .body { padding:32px; }
          .top-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid #e2e8f0; }
          .pnr-label { font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
          .pnr { font-size:30px; font-weight:900; color:#3b82f6; font-family:monospace; letter-spacing:2px; }
          .status { background:#dcfce7; color:#166534; font-size:11px; font-weight:800; padding:6px 16px; border-radius:999px; text-transform:uppercase; }
          .train-name { font-size:20px; font-weight:900; color:#1e293b; margin-bottom:4px; }
          .train-num { font-size:12px; color:#64748b; }
          .route { display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 24px; margin:20px 0; }
          .station { font-size:16px; font-weight:900; color:#1e293b; }
          .arrow { font-size:20px; color:#cbd5e1; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:20px 0; }
          .cell label { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:5px; }
          .cell span { font-size:13px; font-weight:800; color:#1e293b; }
          .divider { border:none; border-top:2px dashed #e2e8f0; margin:24px 0; }
          .pax-label { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
          .pax-name { font-size:15px; font-weight:800; color:#1e293b; }
          .footer { background:#0B132B; color:#64748b; text-align:center; padding:16px; font-size:11px; }
          @media print { body{padding:0;background:#fff;} .page{box-shadow:none;width:100%;border-radius:0;} }
        </style></head><body>
        <div class="page">
          <div class="header">
            <div><h1>RailMax</h1><p>Official E-Ticket — Computer Generated</p></div>
            <div class="date">${new Date().toLocaleString('en-IN')}</div>
          </div>
          <div class="body">
            <div class="top-row">
              <div><div class="pnr-label">PNR Number</div><div class="pnr">${generatedTicket.pnr}</div></div>
              <div class="status">${generatedTicket.status || 'CONFIRMED'}</div>
            </div>
            <div class="train-name">${generatedTicket.trainName}</div>
            <div class="train-num">Train No: ${generatedTicket.trainNumber}</div>
            <div class="route">
              <div class="station">${from}</div>
              <div class="arrow">→</div>
              <div class="station">${to}</div>
            </div>
            <div class="grid">
              <div class="cell"><label>Journey Date</label><span>${generatedTicket.date || 'N/A'}</span></div>
              <div class="cell"><label>Seat / Berth</label><span>${generatedTicket.seatNumber} (${generatedTicket.berthPreference})</span></div>
              <div class="cell"><label>Booking Date</label><span>${generatedTicket.bookingDate || 'N/A'}</span></div>
              <div class="cell"><label>Class</label><span>Sleeper (SL)</span></div>
            </div>
            <hr class="divider" />
            <div class="pax-label">Passenger Details</div>
            <div class="pax-name">${paxName} &nbsp;|&nbsp; Age: ${paxAge} &nbsp;|&nbsp; ${paxGender}</div>
          </div>
          <div class="footer">This is a computer-generated ticket. No signature required. &nbsp;|&nbsp; RailMax — Next-Gen Railway Booking</div>
        </div>
        <script>window.onload = () => { window.print(); }<\/script>
        </body></html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
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
                                                    onChange={handleDateChange}
                                                    min={today}
                                                    max={maxDate}
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
                                                    <SmartAvailability status={train.status} wlPos={train.wlPos} racPos={train.racPos} probability={train.probability} seats={train.seats} />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBook(train)}
                                                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center shadow-lg ${
                                                    train.status === 'AVAILABLE' ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/25'
                                                    : train.status === 'RAC' ? 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white shadow-violet-500/25'
                                                    : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-orange-500/25'
                                                }`}
                                            >
                                                {train.status === 'WL' ? 'Join Waitlist' : train.status === 'RAC' ? 'Book RAC' : 'Book Now'}
                                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

                                {/* RWallet deduction strip */}
                                {generatedTicket?.walletDeducted > 0 && (
                                    <div className="mt-6 pt-5 border-t border-dashed border-slate-300 flex items-center justify-between z-10 relative">
                                        <div className="flex items-center space-x-2 text-emerald-600">
                                            <Wallet className="w-4 h-4" />
                                            <span className="text-sm font-bold">Paid via RWallet</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-800">− {generatedTicket.fare}</p>
                                            <p className="text-xs text-slate-400 font-medium">Balance: ₹{generatedTicket.walletBalance?.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                )}
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
