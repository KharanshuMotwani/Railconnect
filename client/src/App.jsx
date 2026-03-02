import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Bookings from './pages/Bookings';
import PNRStatus from './pages/PNRStatus';
import Auth from './pages/Auth';

export default function App() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">
            <Navbar />

            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/pnr-status" element={<PNRStatus />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/register" element={<Auth />} />
                </Routes>
            </div>

            <Footer />
        </div>
    );
}
