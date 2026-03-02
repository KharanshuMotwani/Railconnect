import { Train } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center space-x-2 mb-4 opacity-50">
                        <Train className="w-6 h-6 text-white" />
                        <span className="text-2xl font-black tracking-tight text-white">RailConnect</span>
                    </div>
                    <p className="text-sm max-w-sm">The most seamless and reliable way to book your train tickets across India. Powered by next-gen APIs and modern UX.</p>
                </div>
                <div>
                    <h5 className="text-white font-bold mb-4">Quick Links</h5>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition-colors">Search Trains</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Check PNR Status</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Live Train Status</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-white font-bold mb-4">Legal</h5>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Cancellation Rules</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
